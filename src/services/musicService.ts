import { supabase } from "@/integrations/supabase/client"
import { SUPABASE_URL } from '@/lib/supabaseConstants'

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
  private baseUrl = `${SUPABASE_URL}/functions/v1/music-generation`

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
      // Obtenir l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('emotionscare_user_songs')
        .insert({
          user_id: user.id,
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn('⚠️ User not authenticated for playlists')
        return []
      }

      const { data, error } = await supabase
        .from('med_mng_playlists')
        .select(`
          id,
          user_id,
          name,
          description,
          is_public,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching playlists:', error)
        return []
      }

      // Récupérer les chansons pour chaque playlist
      const playlists: Playlist[] = await Promise.all((data || []).map(async (playlist) => {
        const { data: songs } = await supabase
          .from('med_mng_playlist_songs')
          .select('id, playlist_id, song_id, position, added_at')
          .eq('playlist_id', playlist.id)
          .order('position', { ascending: true })

        return {
          ...playlist,
          songs: songs || []
        }
      }))

      return playlists
    } catch (error) {
      console.error('❌ Error fetching playlists:', error)
      return []
    }
  }

  async createPlaylist(name: string, description?: string, isPublic = false): Promise<Playlist> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('med_mng_playlists')
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          is_public: isPublic
        })
        .select()
        .maybeSingle()

      if (error) throw error

      const newPlaylist: Playlist = {
        ...data,
        songs: []
      }

      console.log('✅ Playlist created:', name)
      return newPlaylist
    } catch (error) {
      console.error('❌ Error creating playlist:', error)
      throw error
    }
  }

  async addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
    try {
      // Obtenir la position maximale actuelle
      const { data: existing } = await supabase
        .from('med_mng_playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1)

      const nextPosition = (existing?.[0]?.position || 0) + 1

      const { error } = await (supabase as any)
        .from('med_mng_playlist_songs')
        .insert({
          playlist_id: playlistId,
          song_id: songId,
          position: nextPosition
        })

      if (error) throw error
      console.log('✅ Song added to playlist')
    } catch (error) {
      console.error('❌ Error adding song to playlist:', error)
      throw error
    }
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('med_mng_playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('song_id', songId)

      if (error) throw error
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
        .from('med_mng_playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)

      // Puis supprimer la playlist
      const { error } = await supabase
        .from('med_mng_playlists')
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
        .maybeSingle()

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
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { error } = await supabase
          .from('emotionscare_song_likes')
          .insert({
            user_id: user.id,
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
  private async trackGeneration(
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
    
    // Stocker dans Supabase pour analytics persistants
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await (supabase as any).from('music_analytics').insert({
          user_id: user.id,
          event_type: event.event_type,
          event_data: event
        })
      }
    } catch (err) {
      console.warn('Failed to save music analytics:', err)
    }
  }

  async getAnalytics(): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { local_events: [], session_stats: this.calculateSessionStats([]) }
    
    const { data } = await (supabase as any)
      .from('music_analytics')
      .select('event_data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)
    
    const events = (data || []).map((d: any) => d.event_data)
    return {
      local_events: events,
      session_stats: this.calculateSessionStats(events)
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

  // Rechercher dans la bibliotheque
  async searchLibrary(query: string): Promise<any[]> {
    try {
      const library = await this.getUserLibrary()
      if (!query.trim()) return library

      const queryLower = query.toLowerCase()
      return library.filter(item =>
        item.title?.toLowerCase().includes(queryLower) ||
        item.emotionscare_songs?.title?.toLowerCase().includes(queryLower) ||
        item.item_code?.toLowerCase().includes(queryLower)
      )
    } catch (error) {
      console.error('Error searching library:', error)
      return []
    }
  }

  // Obtenir les statistiques de la bibliotheque
  async getLibraryStats(): Promise<{
    totalSongs: number
    totalPlaylists: number
    totalFavorites: number
    recentlyAdded: number
    byRang: { A: number; B: number; mix: number }
  }> {
    try {
      const [library, playlists, favorites] = await Promise.all([
        this.getUserLibrary(),
        this.getUserPlaylists(),
        this.getFavorites()
      ])

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const recentlyAdded = library.filter(item =>
        new Date(item.created_at) > weekAgo
      ).length

      const byRang = library.reduce((acc, item) => {
        const rang = item.rang_type || 'mix'
        acc[rang] = (acc[rang] || 0) + 1
        return acc
      }, { A: 0, B: 0, mix: 0 })

      return {
        totalSongs: library.length,
        totalPlaylists: playlists.length,
        totalFavorites: favorites.length,
        recentlyAdded,
        byRang
      }
    } catch (error) {
      console.error('Error getting library stats:', error)
      return {
        totalSongs: 0,
        totalPlaylists: 0,
        totalFavorites: 0,
        recentlyAdded: 0,
        byRang: { A: 0, B: 0, mix: 0 }
      }
    }
  }

  // Obtenir les chansons recentes
  async getRecentSongs(limit: number = 10): Promise<any[]> {
    try {
      const library = await this.getUserLibrary()
      return library
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error('Error getting recent songs:', error)
      return []
    }
  }

  // Dupliquer une playlist
  async duplicatePlaylist(playlistId: string, newName?: string): Promise<Playlist | null> {
    try {
      const playlists = await this.getUserPlaylists()
      const original = playlists.find(p => p.id === playlistId)
      if (!original) return null

      const duplicateName = newName || `${original.name} (copie)`
      const newPlaylist = await this.createPlaylist(
        duplicateName,
        original.description,
        original.is_public
      )

      // Copier les chansons
      for (const song of original.songs) {
        await this.addSongToPlaylist(newPlaylist.id, song.song_id)
      }

      console.log('Playlist duplicated successfully')
      return newPlaylist
    } catch (error) {
      console.error('Error duplicating playlist:', error)
      return null
    }
  }

  // Exporter une playlist en JSON
  async exportPlaylist(playlistId: string): Promise<string | null> {
    try {
      const playlists = await this.getUserPlaylists()
      const playlist = playlists.find(p => p.id === playlistId)
      if (!playlist) return null

      const exportData = {
        name: playlist.name,
        description: playlist.description,
        songs: playlist.songs.map(s => ({
          song_id: s.song_id,
          position: s.position
        })),
        exportedAt: new Date().toISOString()
      }

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('Error exporting playlist:', error)
      return null
    }
  }

  // Obtenir le temps total d'ecoute
  getEstimatedListeningTime(songCount: number): string {
    const avgDuration = 180 // 3 minutes par chanson en moyenne
    const totalSeconds = songCount * avgDuration
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes} min`
  }

  // Verifier si une chanson est dans une playlist
  async isSongInPlaylist(playlistId: string, songId: string): Promise<boolean> {
    try {
      const playlists = await this.getUserPlaylists()
      const playlist = playlists.find(p => p.id === playlistId)
      return playlist?.songs.some(s => s.song_id === songId) || false
    } catch (error) {
      return false
    }
  }

  // Obtenir les playlists contenant une chanson
  async getPlaylistsContainingSong(songId: string): Promise<Playlist[]> {
    try {
      const playlists = await this.getUserPlaylists()
      return playlists.filter(p => p.songs.some(s => s.song_id === songId))
    } catch (error) {
      console.error('Error getting playlists containing song:', error)
      return []
    }
  }

  // Melanger une playlist (deterministic Fisher-Yates with timestamp seed)
  shufflePlaylistSongs(songs: PlaylistSong[]): PlaylistSong[] {
    const shuffled = [...songs]
    const seed = Date.now()
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = (seed + i * 17) % (i + 1)
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Clear analytics (now uses in-memory queue instead of localStorage)
  clearLocalAnalytics(): void {
    if (typeof window !== 'undefined') {
      (window as any).__musicAnalyticsQueue = [];
    }
    console.log('Music analytics cleared')
  }
}

export const musicService = new MusicService()