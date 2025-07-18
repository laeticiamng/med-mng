import { useState } from "react"
import { Navigation } from './components/Navigation'
import { MusicGenerator } from './components/MusicGenerator'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoadingSpinner } from './components/LoadingStates'

type PageType = 'musique' | 'rang-a' | 'rang-b' | 'quiz' | 'scene' | 'bd' | 'roman'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('musique')
  const [isLoading] = useState(false)

  const renderPage = () => {
    switch (currentPage) {
      case 'musique':
        return <MusicGenerator />
      case 'rang-a':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Rang A - EDN</h2>
            <p className="text-gray-600">Items de connaissance Rang A en développement</p>
          </div>
        )
      case 'rang-b':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Rang B</h2>
            <p className="text-gray-600">Items de connaissance Rang B en développement</p>
          </div>
        )
      case 'quiz':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Médical</h2>
            <p className="text-gray-600">Évaluations interactives en développement</p>
          </div>
        )
      case 'scene':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Scénarios Cliniques</h2>
            <p className="text-gray-600">Simulations de cas cliniques en développement</p>
          </div>
        )
      case 'bd':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Bandes Dessinées</h2>
            <p className="text-gray-600">BD éducatives en développement</p>
          </div>
        )
      case 'roman':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Romans Médicaux</h2>
            <p className="text-gray-600">Histoires médicales en développement</p>
          </div>
        )
      default:
        return <MusicGenerator />
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navigation 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
          isLoading={isLoading}
        />
        
        <main className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            renderPage()
          )}
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App
