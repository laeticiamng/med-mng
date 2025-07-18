/// <reference types="vite/client" />
// Service API simplifié pour Lovable
class ApiService {
  private baseURL: string

  constructor() {
    // Utiliser les variables d'environnement Vite
    this.baseURL = import.meta.env.VITE_SUPABASE_URL || ''
  }

  async generateSong(params: {
    prompt: string
    style: string
    duration: string
    title?: string
  }) {
    try {
      const response = await fetch(`${this.baseURL}/functions/v1/generate-song`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getSongStatus(songId: string) {
    try {
      const response = await fetch(`${this.baseURL}/functions/v1/songs/${songId}`)
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
}

export const apiService = new ApiService()
