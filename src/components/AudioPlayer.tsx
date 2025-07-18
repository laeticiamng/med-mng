import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-react'

interface Song {
  id: string
  title: string
  audio_url: string
  style?: string
  duration?: string
}

interface AudioPlayerProps {
  song: Song
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ song }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
      } else {
        await audio.play()
      }
      setIsPlaying(!isPlaying)
    } catch (error) {
      console.error('Erreur lecture audio:', error)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progressBar = e.currentTarget
    if (!audio || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration

    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (newVolume: number) => {
    const audio = audioRef.current
    if (!audio) return

    setVolume(newVolume)
    audio.volume = newVolume
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(song.audio_url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${song.title || 'musique'}.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur téléchargement:', error)
    }
  }

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={song.audio_url} preload="metadata" />
      
      {/* Informations */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">{song.title}</h3>
        <p className="text-white/80">{song.style} • {formatTime(duration)}</p>
      </div>

      {/* Contrôles principaux */}
      <div className="flex justify-center items-center space-x-6 mb-6">
        <button
          onClick={togglePlay}
          className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-200 hover:scale-105"
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </button>
      </div>

      {/* Barre de progression */}
      <div className="flex items-center space-x-4 mb-4">
        <span className="text-white/80 text-sm min-w-[40px]">
          {formatTime(currentTime)}
        </span>
        
        <div 
          className="flex-1 h-2 bg-white/20 rounded-full cursor-pointer relative"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-white rounded-full transition-all duration-100"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        <span className="text-white/80 text-sm min-w-[40px]">
          {formatTime(duration)}
        </span>
      </div>

      {/* Contrôles secondaires */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button onClick={toggleMute} className="text-white/80 hover:text-white">
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-1 bg-white/20 rounded-lg cursor-pointer"
          />
        </div>

        <button
          onClick={handleDownload}
          className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-200"
          title="Télécharger"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
