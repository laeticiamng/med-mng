import { useState } from 'react'
import { Play, Music, Wand2 } from 'lucide-react'

export const MusicGenerator = () => {
  const [prompt, setPrompt] = useState('Paroles pour IC4 Rang A - Les droits du patient')
  const [style, setStyle] = useState('lofi-piano')
  const [duration, setDuration] = useState('4:00')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedSong, setGeneratedSong] = useState<string | null>(null)

  const styles = [
    { value: 'lofi-piano', label: 'Lo-fi Piano Doux', emoji: '🎹' },
    { value: 'pop-melodique', label: 'Pop Mélodique', emoji: '🎵' },
    { value: 'jazz', label: 'Jazz Relaxant', emoji: '🎷' },
    { value: 'rock', label: 'Rock Doux', emoji: '🎸' },
    { value: 'folk', label: 'Folk Acoustique', emoji: '🪕' }
  ]

  const durations = [
    { value: '2:00', label: '2 minutes - Court' },
    { value: '4:00', label: '4 minutes - Standard' },
    { value: '6:00', label: '6 minutes - Étendu' }
  ]

  const handleGenerate = () => {
    if (prompt.trim().length < 10) {
      alert('Le prompt doit contenir au moins 10 caractères')
      return
    }
    
    setIsGenerating(true)
    setProgress(0)
    setGeneratedSong(null)

    // Simulation de génération
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15 + 5
        if (newProgress >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          setGeneratedSong('demo-song-url')
          return 100
        }
        return newProgress
      })
    }, 500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-3 rounded-full">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Génération Musicale IA
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Transformez vos contenus médicaux en musiques d'apprentissage personnalisées grâce à l'intelligence artificielle
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">1,247</div>
          <div className="text-sm text-gray-600">Musiques générées</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-secondary-600">98%</div>
          <div className="text-sm text-gray-600">Taux de satisfaction</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">4.8/5</div>
          <div className="text-sm text-gray-600">Note moyenne</div>
        </div>
      </div>

      {/* Formulaire de génération */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Wand2 className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Créer votre musique</h2>
        </div>

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
              className="form-input resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>Minimum 10 caractères</span>
              <span>{prompt.length}/500</span>
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
                className="form-select"
              >
                {styles.map(styleOption => (
                  <option key={styleOption.value} value={styleOption.value}>
                    {styleOption.emoji} {styleOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Durée souhaitée
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="form-select"
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
              className="btn-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto"
            >
              {isGenerating ? (
                <>
                  <div className="loading-spinner w-6 h-6" />
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
        <div className="card">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Progression de la génération</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              {progress < 20 ? '🔍 Analyse du contenu médical...' :
               progress < 40 ? '🎼 Composition des mélodies...' :
               progress < 60 ? '🎵 Génération des harmonies...' :
               progress < 80 ? '🎙️ Création des arrangements...' :
               progress < 95 ? '✨ Finalisation de la musique...' :
               '🎉 Génération terminée !'}
            </p>
          </div>
        </div>
      )}

      {/* Résultat */}
      {generatedSong && (
        <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Music className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              🎉 Musique générée avec succès !
            </h3>
            <p className="text-gray-600 mb-4">
              Votre contenu médical a été transformé en une magnifique composition musicale
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                <strong>Style :</strong> {styles.find(s => s.value === style)?.label} |{' '}
                <strong>Durée :</strong> {duration} |{' '}
                <strong>Qualité :</strong> HD
              </p>
              <div className="flex justify-center space-x-4">
                <button className="btn-primary">
                  <Play className="w-5 h-5 mr-2" />
                  Écouter
                </button>
                <button className="btn-secondary">
                  Télécharger MP3
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
