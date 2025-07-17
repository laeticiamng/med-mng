import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RouteHandler {
  pattern: URLPattern
  handler: (req: Request, match: URLPatternResult) => Promise<Response>
  methods: string[]
}

// Utility functions
const jsonResponse = (data: any, status = 200) => 
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })

const errorResponse = (message: string, status = 400) =>
  jsonResponse({ error: message }, status)

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: req.headers.get('Authorization')! }
    }
  })

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return errorResponse('Unauthorized', 401)
  }

  // Define routes
  const routes: RouteHandler[] = [
    // User Profile
    {
      pattern: new URLPattern({ pathname: '/profile' }),
      methods: ['GET', 'PUT'],
      handler: async (req) => {
        if (req.method === 'GET') {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert({ id: user.id })
              .select()
              .single()
            
            if (createError) return errorResponse(createError.message)
            return jsonResponse(newProfile)
          }
          
          if (error) return errorResponse(error.message)
          return jsonResponse(data)
        }
        
        if (req.method === 'PUT') {
          const body = await req.json()
          const { data, error } = await supabase
            .from('user_profiles')
            .update(body)
            .eq('id', user.id)
            .select()
            .single()
          
          if (error) return errorResponse(error.message)
          return jsonResponse(data)
        }
      }
    },

    // Learning Sessions
    {
      pattern: new URLPattern({ pathname: '/learning/sessions' }),
      methods: ['POST', 'GET'],
      handler: async (req) => {
        if (req.method === 'POST') {
          const { content_id, content_type, topic_id } = await req.json()
          
          const { data, error } = await supabase
            .from('learning_sessions')
            .insert({
              user_id: user.id,
              content_id,
              content_type,
              topic_id,
              started_at: new Date().toISOString()
            })
            .select()
            .single()
          
          if (error) return errorResponse(error.message)
          return jsonResponse(data, 201)
        }
        
        if (req.method === 'GET') {
          const { data, error } = await supabase
            .from('learning_sessions')
            .select('*, medical_topics(name, category)')
            .eq('user_id', user.id)
            .order('started_at', { ascending: false })
            .limit(20)
          
          if (error) return errorResponse(error.message)
          return jsonResponse(data)
        }
      }
    },

    // Complete Session
    {
      pattern: new URLPattern({ pathname: '/learning/sessions/:id/complete' }),
      methods: ['POST'],
      handler: async (req, match) => {
        const sessionId = match.pathname.groups.id
        const { score, notes, feedback } = await req.json()
        
        // Get session to calculate duration
        const { data: session, error: getError } = await supabase
          .from('learning_sessions')
          .select('started_at')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .single()
        
        if (getError) return errorResponse(getError.message)
        
        const duration = Math.floor(
          (new Date().getTime() - new Date(session.started_at).getTime()) / 1000
        )
        
        const { data, error } = await supabase
          .from('learning_sessions')
          .update({
            completed_at: new Date().toISOString(),
            duration_seconds: duration,
            score,
            notes,
            feedback
          })
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .select()
          .single()
        
        if (error) return errorResponse(error.message)
        
        // Update user stats
        await updateUserStats(supabase, user.id, duration)
        
        return jsonResponse(data)
      }
    },

    // Progress
    {
      pattern: new URLPattern({ pathname: '/learning/progress' }),
      methods: ['GET'],
      handler: async (req) => {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*, medical_topics(name, category, difficulty_level)')
          .eq('user_id', user.id)
          .order('mastery_level', { ascending: false })
        
        if (error) return errorResponse(error.message)
        return jsonResponse(data)
      }
    },

    // Topics
    {
      pattern: new URLPattern({ pathname: '/topics' }),
      methods: ['GET'],
      handler: async (req) => {
        const category = url.searchParams.get('category')
        const difficulty = url.searchParams.get('difficulty')
        
        let query = supabase
          .from('medical_topics')
          .select('*')
          .order('order_index')
        
        if (category) query = query.eq('category', category)
        if (difficulty) query = query.eq('difficulty_level', difficulty)
        
        const { data, error } = await query
        
        if (error) return errorResponse(error.message)
        return jsonResponse(data)
      }
    },

    // Quiz Questions
    {
      pattern: new URLPattern({ pathname: '/quiz/:topicId' }),
      methods: ['GET'],
      handler: async (req, match) => {
        const topicId = match.pathname.groups.topicId
        const limit = parseInt(url.searchParams.get('limit') || '10')
        
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('topic_id', topicId)
          .order('random()')
          .limit(limit)
        
        if (error) return errorResponse(error.message)
        return jsonResponse(data)
      }
    },

    // Submit Quiz Answer
    {
      pattern: new URLPattern({ pathname: '/quiz/answer' }),
      methods: ['POST'],
      handler: async (req) => {
        const { question_id, topic_id, is_correct } = await req.json()
        
        // Update progress
        const { error } = await supabase.rpc('update_quiz_progress', {
          p_user_id: user.id,
          p_topic_id: topic_id,
          p_is_correct: is_correct
        })
        
        if (error) return errorResponse(error.message)
        return jsonResponse({ success: true })
      }
    },

    // User Stats
    {
      pattern: new URLPattern({ pathname: '/stats' }),
      methods: ['GET'],
      handler: async (req) => {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('streak_days, total_study_time, points')
          .eq('id', user.id)
          .single()
        
        const { data: achievements } = await supabase
          .from('user_achievements')
          .select('*, achievements(name, icon_url, points)')
          .eq('user_id', user.id)
        
        const { data: recentSessions } = await supabase
          .from('learning_sessions')
          .select('started_at, duration_seconds, score')
          .eq('user_id', user.id)
          .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('started_at', { ascending: false })
        
        // Calculate weekly stats
        const weeklyMinutes = recentSessions?.reduce(
          (sum, session) => sum + (session.duration_seconds || 0) / 60, 0
        ) || 0
        
        const avgScore = recentSessions?.filter(s => s.score !== null).reduce(
          (sum, session, _, arr) => sum + session.score! / arr.length, 0
        ) || 0
        
        return jsonResponse({
          ...profile,
          achievements,
          weekly_minutes: Math.round(weeklyMinutes),
          average_score: Math.round(avgScore * 100) / 100,
          sessions_this_week: recentSessions?.length || 0
        })
      }
    },

    // Playlists
    {
      pattern: new URLPattern({ pathname: '/playlists' }),
      methods: ['GET', 'POST'],
      handler: async (req) => {
        if (req.method === 'GET') {
          const { data, error } = await supabase
            .from('playlists')
            .select('*, playlist_songs(count)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
          
          if (error) return errorResponse(error.message)
          return jsonResponse(data)
        }
        
        if (req.method === 'POST') {
          const body = await req.json()
          const { data, error } = await supabase
            .from('playlists')
            .insert({ ...body, user_id: user.id })
            .select()
            .single()
          
          if (error) return errorResponse(error.message)
          return jsonResponse(data, 201)
        }
      }
    },

    // Add to Playlist
    {
      pattern: new URLPattern({ pathname: '/playlists/:id/songs' }),
      methods: ['POST'],
      handler: async (req, match) => {
        const playlistId = match.pathname.groups.id
        const { song_id } = await req.json()
        
        // Get current max position
        const { data: maxPos } = await supabase
          .from('playlist_songs')
          .select('position')
          .eq('playlist_id', playlistId)
          .order('position', { ascending: false })
          .limit(1)
          .single()
        
        const position = (maxPos?.position || 0) + 1
        
        const { data, error } = await supabase
          .from('playlist_songs')
          .insert({ playlist_id: playlistId, song_id, position })
          .select()
          .single()
        
        if (error) return errorResponse(error.message)
        return jsonResponse(data, 201)
      }
    },

    // Recommendations
    {
      pattern: new URLPattern({ pathname: '/recommendations' }),
      methods: ['GET'],
      handler: async (req) => {
        // Get user's progress and preferences
        const { data: progress } = await supabase
          .from('user_progress')
          .select('topic_id, mastery_level')
          .eq('user_id', user.id)
          .order('last_reviewed', { ascending: true })
          .limit(5)
        
        // Get topics that need review or haven't been studied
        const { data: topics } = await supabase
          .from('medical_topics')
          .select('*')
          .order('random()')
          .limit(10)
        
        // Get popular songs in those topics
        const topicIds = topics?.map(t => t.id) || []
        const { data: songs } = await supabase
          .from('songs')
          .select('*, medical_topics(name)')
          .in('topic_id', topicIds)
          .eq('is_public', true)
          .order('play_count', { ascending: false })
          .limit(20)
        
        return jsonResponse({
          topics_to_review: progress,
          recommended_topics: topics,
          recommended_songs: songs
        })
      }
    }
  ]

  // Route matching
  for (const route of routes) {
    if (route.pattern.test(url) && route.methods.includes(req.method)) {
      const match = route.pattern.exec(url)!
      return await route.handler(req, match)
    }
  }

  return errorResponse('Route not found', 404)
})

// Helper function to update user stats
async function updateUserStats(supabase: any, userId: string, durationSeconds: number) {
  // Update total study time
  await supabase.rpc('increment_study_time', {
    p_user_id: userId,
    p_duration: Math.floor(durationSeconds / 60)
  })
  
  // Calculate and update streak
  const streak = await supabase.rpc('calculate_streak', { p_user_id: userId })
  
  await supabase
    .from('user_profiles')
    .update({ streak_days: streak })
    .eq('id', userId)
}
