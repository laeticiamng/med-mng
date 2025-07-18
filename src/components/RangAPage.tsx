import { Star, BookOpen, Music, Play, Clock, Award } from 'lucide-react'

export const RangAPage = () => {
  const items = [
    {
      id: 'IC2',
      title: 'IC-2: Les droits du patient',
      description: 'Comprendre les droits fondamentaux des patients et leur application pratique',
      status: 'complete',
      duration: '4:20',
      musicGenerated: true
    },
    {
      id: 'IC4',
      title: 'IC-4: Secret professionnel',
      description: 'Maîtriser les règles du secret médical et ses exceptions légales',
      status: 'in-progress',
      duration: '3:45',
      musicGenerated: false
    },
    {
      id: 'IC6',
      title: 'IC-6: Consentement éclairé',
      description: 'Processus et modalités du consentement libre et éclairé',
      status: 'pending',
      duration: '5:10',
      musicGenerated: false
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-600 bg-green-100'
      case 'in-progress': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete': return 'Terminé'
      case 'in-progress': return 'En cours'
      default: return 'À faire'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Items EDN Rang A
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Maîtrisez les connaissances essentielles du Rang A avec notre approche pédagogique révolutionnaire
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">24</div>
          <div className="text-sm text-gray-600">Items totaux</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">8</div>
          <div className="text-sm text-gray-600">Terminés</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">12</div>
          <div className="text-sm text-gray-600">En cours</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">33%</div>
          <div className="text-sm text-gray-600">Progression</div>
        </div>
      </div>

      {/* Liste des items */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <BookOpen className="w-6 h-6 mr-3 text-primary-600" />
          Items de connaissance
        </h2>

        <div className="grid gap-6">
          {items.map((item) => (
            <div key={item.id} className="card card-hover">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                      {item.id}
                    </span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {item.description}
                  </p>

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{item.duration}</span>
                    </div>
                    {item.musicGenerated && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Music className="w-4 h-4" />
                        <span>Musique disponible</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  <button className="btn-primary text-sm">
                    Étudier
                  </button>
                  {item.musicGenerated ? (
                    <button className="btn-secondary text-sm flex items-center">
                      <Play className="w-4 h-4 mr-1" />
                      Écouter
                    </button>
                  ) : (
                    <button className="btn-secondary text-sm flex items-center">
                      <Music className="w-4 h-4 mr-1" />
                      Générer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Prêt à révolutionner votre apprentissage ?
        </h3>
        <p className="text-gray-600 mb-4">
          Transformez tous vos items de connaissance en musiques mémorables
        </p>
        <button className="btn-primary">
          Générer toute la série musicale
        </button>
      </div>
    </div>
  )
}
