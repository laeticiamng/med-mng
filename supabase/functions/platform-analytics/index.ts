import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: user, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action, ...payload } = await req.json()

    switch (action) {
      case 'track_event':
        const { event_type, event_data, page_url } = payload
        
        // Insert analytics event
        const { error: insertError } = await supabaseClient
          .from('user_analytics')
          .insert({
            user_id: user.user.id,
            event_type,
            event_data: event_data || {},
            page_url,
            session_id: crypto.randomUUID()
          })

        if (insertError) throw insertError

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'get_analytics':
        const { data: analyticsData, error: analyticsError } = await supabaseClient
          .from('user_analytics')
          .select('*')
          .eq('user_id', user.user.id)
          .order('created_at', { ascending: false })
          .limit(100)

        if (analyticsError) throw analyticsError

        // Calculate metrics
        const eventTypes = analyticsData.reduce((acc, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1
          return acc
        }, {})

        const recentActivity = analyticsData.slice(0, 10)
        const totalEvents = analyticsData.length

        return new Response(JSON.stringify({
          total_events: totalEvents,
          event_types: eventTypes,
          recent_activity: recentActivity,
          analytics_data: analyticsData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'get_dashboard_stats':
        // Get comprehensive dashboard statistics
        const { data: profile } = await supabaseClient
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.user.id)
          .single()

        const { data: recentAnalytics } = await supabaseClient
          .from('user_analytics')
          .select('*')
          .eq('user_id', user.user.id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })

        const { data: notifications } = await supabaseClient
          .from('platform_notifications')
          .select('*')
          .eq('user_id', user.user.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(5)

        return new Response(JSON.stringify({
          profile,
          weekly_activity: recentAnalytics?.length || 0,
          unread_notifications: notifications?.length || 0,
          recent_events: recentAnalytics?.slice(0, 5) || [],
          notifications: notifications || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'update_profile':
        const { display_name, preferences, bio } = payload
        
        const { data: updatedProfile, error: updateError } = await supabaseClient
          .from('user_profiles')
          .upsert({
            user_id: user.user.id,
            display_name,
            preferences: preferences || {},
            bio,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (updateError) throw updateError

        return new Response(JSON.stringify({
          success: true,
          profile: updatedProfile
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'mark_notification_read':
        const { notification_id } = payload
        
        const { error: markReadError } = await supabaseClient
          .from('platform_notifications')
          .update({ is_read: true })
          .eq('id', notification_id)
          .eq('user_id', user.user.id)

        if (markReadError) throw markReadError

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      default:
        return new Response(JSON.stringify({ error: 'Action not supported' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

  } catch (error) {
    console.error('Platform Analytics Error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})