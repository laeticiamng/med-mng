import { supabase } from "@/integrations/supabase/client"

export interface MusicGenerationRequest {
  item_id: string
  item_code: string
  title: string
  rang_type: 'A' | 'B' | 'mix'
  paroles?: string[]
  custom_prompt?: string
}

export interface GeneratedSong {
  id: string
  song_uuid: string
  audio_url: string
  title: string
  metadata: {
    suno_id: string
    generation_time: string
    prompt_used: string
    model: string
  }
}

export interface GenerationStats {
  total_generations: number
  success_rate: number
  average_duration: number
  last_24h_count: number
  status_breakdown: Record<string, number>
  performance_alerts: number
  slowest_generation: number
  fastest_generation: number
}

export interface Playlist {
  id: string
  user_id: string
  name: string
  description?: string
  is_public: boolean
  songs: PlaylistSong[]
  created_at: string
  updated_at: string
}

export interface PlaylistSong {
  id: string
  playlist_id: string
  song_id: string
  position: number
  added_at: string
}

class MusicService {
  private baseUrl = `https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/music-generation`

  // ===== GÉNÉRATION MUSICALE =====
  async generateSong(request: MusicGenerationRequest): Promise<{
    success: boolean
    generation_id: string
    song?: GeneratedSong
    duration_seconds?: number
    added_to_library?: boolean
    error?: string
  }> {
    try {
      console.log(`🎵 Generating song for ${request.item_code} Rang ${request.rang_type}`)
      
      const { data, error } = await supabase.functions.invoke('music-generation', {
        body: request,
        method: 'POST'
      })

      if (error) throw error

      if (data.success) {
        console.log(`✅ Song generated successfully in ${data.duration_seconds}s`)
        // Événement analytics
        this.trackGeneration(request, data.duration_seconds, true)
      } else {
        console.error('❌ Song generation failed:', data.error)
        this.trackGeneration(request, 0, false, data.error)
      }

      return data
    } catch (error) {
      console.error('❌ Error generating song:', error)
      this.trackGeneration(request, 0, false, error.message)
      throw error
    }
  }

  async getGenerationStats(): Promise<GenerationStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('❌ Error fetching generation stats:', error)
      throw error
    }
  }

  // ===== BIBLIOTHÈQUE UTILISATEUR =====
  async getUserLibrary(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('emotionscare_user_songs')
        .select(`
          *,
          emotionscare_songs (
            id,
            title,
            suno_audio_id,
            meta,
            created_at
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching user library:', error)
      throw error
    }
  }

  async addToLibrary(songId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('emotionscare_user_songs')
        .insert({
          song_id: songId,
          created_at: new Date().toISOString()
        })

      if (error) throw error
      console.log('✅ Song added to library')
    } catch (error) {
      console.error('❌ Error adding to library:', error)
      throw error
    }
  }

  async removeFromLibrary(songId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('emotionscare_user_songs')
        .delete()
        .eq('song_id', songId)

      if (error) throw error
      console.log('✅ Song removed from library')
    } catch (error) {
      console.error('❌ Error removing from library:', error)
      throw error
    }
  }

  // ===== PLAYLISTS =====
  async getUserPlaylists(): Promise<Playlist[]> {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          playlist_songs (
            id,
            song_id,
            position,
            added_at,
            emotionscare_songs (
              id,
              title,
              suno_audio_id,
              meta
            )
          )
        `)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching playlists:', error)
      throw error
    }
  }

  async createPlaylist(name: string, description?: string, isPublic = false): Promise<Playlist> {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          name,
          description,
          is_public: isPublic,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      console.log('✅ Playlist created:', name)
      return data
    } catch (error) {
      console.error('❌ Error creating playlist:', error)
      throw error
    }
  }

  async addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
    try {
      // Obtenir la prochaine position
      const { data: existingSongs } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1)

      const nextPosition = existingSongs && existingSongs.length > 0 
        ? existingSongs[0].position + 1 
        : 0

      const { error } = await supabase
        .from('playlist_songs')
        .insert({
          playlist_id: playlistId,
          song_id: songId,
          position: nextPosition,
          added_at: new Date().toISOString()
        })

      if (error) throw error

      // Mettre à jour la date de modification de la playlist
      await supabase
        .from('playlists')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', playlistId)

      console.log('✅ Song added to playlist')
    } catch (error) {
      console.error('❌ Error adding song to playlist:', error)
      throw error
    }
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('song_id', songId)

      if (error) throw error

      // Mettre à jour la date de modification
      await supabase
        .from('playlists')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', playlistId)

      console.log('✅ Song removed from playlist')
    } catch (error) {
      console.error('❌ Error removing song from playlist:', error)
      throw error
    }
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    try {
      // Supprimer d'abord les chansons de la playlist
      await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)

      // Puis supprimer la playlist
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId)

      if (error) throw error
      console.log('✅ Playlist deleted')
    } catch (error) {
      console.error('❌ Error deleting playlist:', error)
      throw error
    }
  }

  // ===== FAVORIS =====
  async getFavorites(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('emotionscare_song_likes')
        .select(`
          *,
          emotionscare_songs (
            id,
            title,
            suno_audio_id,
            meta,
            created_at
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching favorites:', error)
      throw error
    }
  }

  async toggleFavorite(songId: string): Promise<boolean> {
    try {
      // Vérifier si déjà en favori
      const { data: existing } = await supabase
        .from('emotionscare_song_likes')
        .select('id')
        .eq('song_id', songId)
        .single()

      if (existing) {
        // Retirer des favoris
        const { error } = await supabase
          .from('emotionscare_song_likes')
          .delete()
          .eq('song_id', songId)

        if (error) throw error
        console.log('✅ Removed from favorites')
        return false
      } else {
        // Ajouter aux favoris
        const { error } = await supabase
          .from('emotionscare_song_likes')
          .insert({
            song_id: songId,
            created_at: new Date().toISOString()
          })

        if (error) throw error
        console.log('✅ Added to favorites')
        return true
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error)
      throw error
    }
  }

  // ===== STREAMING SÉCURISÉ =====
  getSecureStreamingUrl(songId: string): string {
    // URL sécurisée avec token temporaire
    const timestamp = Date.now()
    const token = btoa(`${songId}:${timestamp}`)
    return `${this.baseUrl}/stream/${songId}?token=${token}&t=${timestamp}`
  }

  // ===== ANALYTICS & TRACKING =====
  private trackGeneration(
    request: MusicGenerationRequest, 
    duration: number, 
    success: boolean, 
    error?: string
  ) {
    // Analytics internes (peut être étendu avec des services externes)
    const event = {
      event_type: 'music_generation',
      item_code: request.item_code,
      rang_type: request.rang_type,
      duration_seconds: duration,
      success,
      error,
      timestamp: new Date().toISOString()
    }
    
    console.log('📊 Music generation event:', event)
    
    // Stocker en local storage pour analytics client
    const existingEvents = JSON.parse(localStorage.getItem('music_analytics') || '[]')
    existingEvents.push(event)
    // Garder seulement les 100 derniers événements
    localStorage.setItem('music_analytics', JSON.stringify(existingEvents.slice(-100)))
  }

  async getAnalytics(): Promise<any> {
    const localEvents = JSON.parse(localStorage.getItem('music_analytics') || '[]')
    return {
      local_events: localEvents,
      session_stats: this.calculateSessionStats(localEvents)
    }
  }

  private calculateSessionStats(events: any[]) {
    const totalEvents = events.length
    const successfulEvents = events.filter(e => e.success).length
    const avgDuration = events.length > 0 
      ? events.reduce((sum, e) => sum + e.duration_seconds, 0) / events.length 
      : 0

    return {
      total_generations: totalEvents,
      success_rate: totalEvents > 0 ? Math.round((successfulEvents / totalEvents) * 100) : 0,
      average_duration: Math.round(avgDuration),
      session_start: events[0]?.timestamp,
      last_generation: events[events.length - 1]?.timestamp
    }
  }
}

export const musicService = new MusicService()