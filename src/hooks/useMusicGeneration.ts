import { useState, useCallback } from 'react'

interface GenerateParams {
  prompt: string
  style: string
  duration: string
  title?: string
}

interface Song {
  id: string
  title: string
  audio_url: string
  status: string
  style: string
  duration: string
}

export const useMusicGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [songData, setSongData] = useState<Song | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateMusic = useCallback(async (params: GenerateParams) => {
    setIsGenerating(true)
    setProgress(0)
    setSongData(null)
    setError(null)

    try {
      // Simulation d'appel API - Remplacer par vraie API Supabase
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération')
      }

      const { songId } = await response.json()

      // Simulation de polling - Remplacer par vraie logique
      const pollInterval = setInterval(async () => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10
          if (newProgress >= 100) {
            clearInterval(pollInterval)
            // Simuler une chanson générée
            setSongData({
              id: songId || 'demo',
              title: params.title || 'Musique générée',
              audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
              status: 'complete',
              style: params.style,
              duration: params.duration
            })
            setIsGenerating(false)
            return 100
          }
          return newProgress
        })
      }, 500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setIsGenerating(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isGenerating,
    progress,
    songData,
    error,
    generateMusic,
    clearError
  }
}
