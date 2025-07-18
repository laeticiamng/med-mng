import { useState } from 'react'
import { useErrorHandler } from './useErrorHandler'
import { apiService } from '../services/ApiService'

export const useMusicGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [songData, setSongData] = useState<any>(null)
  const { error, setError, clearError, withErrorHandling } = useErrorHandler()

  const generateMusic = withErrorHandling(async (params: {
    prompt: string
    style: string
    duration: string
    title?: string
  }) => {
    setIsGenerating(true)
    setProgress(0)
    setSongData(null)

    const result = await apiService.generateSong(params)

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la génération')
    }

    await pollSongStatus(result.data!.songId)
  })

  const pollSongStatus = async (songId: string) => {
    const maxAttempts = 120
    let attempts = 0

    const poll = async (): Promise<void> => {
      if (attempts >= maxAttempts) {
        setIsGenerating(false)
        throw new Error('Timeout: La génération prend trop de temps')
      }

      attempts++
      setProgress(Math.min((attempts / maxAttempts) * 100, 95))

      const result = await apiService.getSongStatus(songId)

      if (!result.success) {
        setTimeout(poll, 5000)
        return
      }

      const song = result.data

      if (song.status === 'complete' && song.audio_url) {
        setIsGenerating(false)
        setProgress(100)
        setSongData(song)
      } else if (song.status === 'error') {
        setIsGenerating(false)
        throw new Error('Erreur lors de la génération musicale')
      } else {
        setTimeout(poll, 5000)
      }
    }

    poll()
  }

  const retryGeneration = () => {
    clearError()
    if (songData?.prompt) {
      generateMusic({
        prompt: songData.prompt,
        style: songData.style,
        duration: songData.duration,
        title: songData.title,
      })
    }
  }

  return {
    isGenerating,
    progress,
    songData,
    error,
    generateMusic,
    retryGeneration,
    clearError,
  }
}
