interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

class ApiService {
  private baseURL: string
  private defaultTimeout = 30000 // 30 secondes

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout)

    try {
      console.log(`🌐 API Call: ${options.method || 'GET'} ${endpoint}`)

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ API Error: ${response.status} - ${errorText}`)

        // Messages d'erreur personnalisés
        let errorMessage = `Erreur ${response.status}`
        switch (response.status) {
          case 400:
            errorMessage = 'Données invalides'
            break
          case 401:
            errorMessage = 'Non autorisé - Veuillez vous reconnecter'
            break
          case 403:
            errorMessage = 'Accès interdit'
            break
          case 404:
            errorMessage = 'Ressource non trouvée'
            break
          case 429:
            errorMessage = 'Trop de requêtes - Veuillez patienter'
            break
          case 500:
            errorMessage = 'Erreur serveur - Veuillez réessayer'
            break
          default:
            errorMessage = `Erreur réseau (${response.status})`
        }

        return { success: false, error: errorMessage }
      }

      const data = await response.json()
      console.log(`✅ API Success: ${endpoint}`)

      return { success: true, data }
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error(`💥 API Exception:`, error)

      if (error.name === 'AbortError') {
        return { success: false, error: 'Timeout - La requête prend trop de temps' }
      }

      if (!navigator.onLine) {
        return { success: false, error: 'Pas de connexion internet' }
      }

      return {
        success: false,
        error: 'Erreur de connexion - Vérifiez votre réseau',
      }
    }
  }

  async generateSong(
    params: {
      prompt: string
      style: string
      duration: string
      title?: string
    },
    retries = 2,
  ): Promise<ApiResponse<{ songId: string; sunoId: string }>> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      console.log(`🎵 Génération musique - Tentative ${attempt + 1}/${retries + 1}`)

      const result = await this.makeRequest<{ songId: string; sunoId: string }>(
        '/api/songs',
        {
          method: 'POST',
          body: JSON.stringify(params),
        },
      )

      if (result.success || attempt === retries) {
        return result
      }

      const delay = Math.pow(2, attempt) * 1000
      console.log(`⏳ Retry dans ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    return { success: false, error: 'Échec après plusieurs tentatives' }
  }

  async getSongStatus(songId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/songs/${songId}`)
  }

  async getSongStream(songId: string): Promise<ApiResponse<{ audioUrl: string }>> {
    return this.makeRequest(`/api/songs/${songId}/stream`)
  }
}

export const apiService = new ApiService(process.env.NEXT_PUBLIC_API_URL || '')
