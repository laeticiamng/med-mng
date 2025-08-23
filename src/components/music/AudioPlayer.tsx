import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Heart,
  Plus,
  MoreHorizontal,
  Download,
  Share
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AudioPlayerProps {
  song: {
    id: string
    title: string
    audio_url: string
    duration?: number
    meta?: any
  }
  className?: string
  showControls?: boolean
  autoPlay?: boolean
  onPlayStateChange?: (isPlaying: boolean) => void
  onEnded?: () => void
}

export function AudioPlayer({ 
  song, 
  className, 
  showControls = true,
  autoPlay = false,
  onPlayStateChange,
  onEnded
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      if (autoPlay) {
        handlePlay()
      }
    }
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      onPlayStateChange?.(false)
      onEnded?.()
      
      // Analytics
      console.log('🎵 Song completed:', song.title)
    }
    const handleError = (e: any) => {
      console.error('❌ Audio error:', e)
      setIsLoading(false)
      setIsPlaying(false)
      toast.error('Erreur de lecture', {
        description: 'Impossible de lire cette chanson'
      })
    }

    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [song.audio_url, autoPlay, onPlayStateChange, onEnded])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const handlePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
        onPlayStateChange?.(false)
      } else {
        setIsLoading(true)
        await audio.play()
        setIsPlaying(true)
        onPlayStateChange?.(true)
        
        // Analytics
        console.log('🎵 Song started:', song.title)
        toast.success('Lecture en cours', {
          description: song.title,
          duration: 2000
        })
      }
    } catch (error) {
      console.error('❌ Play error:', error)
      setIsLoading(false)
      toast.error('Erreur de lecture', {
        description: 'Vérifiez votre connexion internet'
      })
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progressBar = progressRef.current
    if (!audio || !progressBar) return

    // Use requestAnimationFrame to prevent forced reflow
    requestAnimationFrame(() => {
      const rect = progressBar.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const newTime = percent * duration
      
      audio.currentTime = newTime
      setCurrentTime(newTime)
    })
  }

  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0])
    setIsMuted(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleSkipBack = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10)
    }
  }

  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleLike = () => {
    setIsLiked(!isLiked)
    toast.success(isLiked ? 'Retiré des favoris' : 'Ajouté aux favoris', {
      description: song.title,
      duration: 2000
    })
  }

  const handleAddToPlaylist = () => {
    toast.info('Ajout à une playlist', {
      description: 'Sélectionnez une playlist'
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Lien copié', {
      description: 'Le lien a été copié dans le presse-papier'
    })
  }

  const handleDownloadAttempt = () => {
    toast.error('Téléchargement non autorisé', {
      description: 'Cette chanson est disponible en streaming uniquement'
    })
  }

  return (
    <Card className={cn("bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20", className)}>
      <CardContent className="p-6">
        {/* Audio element caché */}
        <audio
          ref={audioRef}
          src={song.audio_url}
          preload="metadata"
          style={{ display: 'none' }}
        />

        {/* Titre et métadonnées */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{song.title}</h3>
            {song.meta && (
              <p className="text-sm text-muted-foreground">
                {song.meta.item_code} • Génération IA
              </p>
            )}
          </div>
          <Badge variant="secondary" className="ml-2">
            {isLoading ? 'Chargement...' : formatTime(duration)}
          </Badge>
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div 
            ref={progressRef}
            className="w-full h-2 bg-secondary rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-primary rounded-full transition-all duration-150 group-hover:bg-primary/80"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Contrôles principaux */}
        {showControls && (
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSkipBack}
              disabled={isLoading}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button 
              variant="default"
              size="lg"
              onClick={handlePlay}
              disabled={isLoading}
              className="h-12 w-12 rounded-full"
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSkipForward}
              disabled={isLoading}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Contrôles secondaires */}
        <div className="flex items-center justify-between">
          {/* Volume */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.1}
              className="w-20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLike}
              className={cn(isLiked && "text-red-500")}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleAddToPlaylist}
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleShare}
            >
              <Share className="h-4 w-4" />
            </Button>

            {/* Faux bouton download pour montrer que c'est bloqué */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleDownloadAttempt}
              className="opacity-50 cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Warning streaming-only */}
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground">
            🔒 Streaming uniquement • Aucun téléchargement autorisé
          </p>
        </div>
      </CardContent>
    </Card>
  )
}