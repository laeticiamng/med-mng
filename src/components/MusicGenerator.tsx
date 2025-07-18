import { useState } from "react"
import { Play } from 'lucide-react'
import { AudioPlayer } from './AudioPlayer'
import { LoadingSpinner } from './LoadingStates'
import { useMusicGeneration } from '../hooks/useMusicGeneration'

export const MusicGenerator = () => {
  const [prompt, setPrompt] = useState('Paroles pour IC4 Rang A - Les droits du patient')
  const [style, setStyle] = useState('lofi-piano')
  const [duration, setDuration] = useState('4:00')
  
  const {
    isGenerating,
    progress,
    songData,
    error,
    generateMusic,
    clearError
  } = useMusicGeneration()

  const styles = [
    { value: 'lofi-piano', label: 'Lo-fi Piano Doux' },
    { value: 'pop-melodique', label: 'Pop Mélodique' },
    { value: 'jazz', label: 'Jazz Relaxant' },
    { value: 'rock', label: 'Rock Doux' },
    { value: 'folk', label: 'Folk Acoustique' }
  ]

  const durations = [
    { value: '2:00', label: '2 minutes' },
    { value: '4:00', label: '4 minutes' },
    { value: '6:00', label: '6 minutes' }
  ]

  const handleGenerate = () => {
    if (prompt.trim().length < 10) {
      alert('Le prompt doit contenir au moins 10 caractères')
      return
    }
    
    generateMusic({
      prompt: prompt.trim(),
      style,
      duration,
      title: `Musique ${style} - ${new Date().toLocaleDateString()}`
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          Génération Musicale IA
        </h1>
        <p className="text-gray-600 text-lg">
          Transformez vos contenus médicaux en musiques d'apprentissage
        </p>
      </div>

      {/* Formulaire de génération */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="space-y-6">
          {/* Prompt */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contenu médical à transformer
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décrivez le contenu médical que vous voulez transformer en musique..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {prompt.length}/500 caractères
            </div>
          </div>

          {/* Style et durée */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Style musical
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {styles.map(styleOption => (
                  <option key={styleOption.value} value={styleOption.value}>
                    {styleOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Durée
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {durations.map(durationOption => (
                  <option key={durationOption.value} value={durationOption.value}>
                    {durationOption.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bouton de génération */}
          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || prompt.trim().length < 10}
              className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="small" />
                  Génération en cours... {Math.round(progress)}%
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  Générer la musique
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Progression */}
      {isGenerating && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Progression</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              {progress < 30 ? 'Analyse du contenu...' :
               progress < 60 ? 'Génération musicale...' :
               progress < 90 ? 'Finalisation...' :
               'Presque terminé !'}
            </p>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-red-800 font-semibold mb-2">Erreur de génération</h3>
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
          <button
            onClick={handleGenerate}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Lecteur audio */}
      {songData?.audio_url && (
        <div className="slide-in">
          <AudioPlayer song={songData} />
        </div>
      )}
    </div>
  )
}
