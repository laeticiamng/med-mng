import { useState } from 'react'
import { Navigation } from './components/Navigation'
import { MusicGenerator } from './components/MusicGenerator'
import { RangAPage } from './components/RangAPage'
import { RangBPage } from './components/RangBPage'
import { ErrorBoundary } from './components/ErrorBoundary'

export type PageType = 'musique' | 'rang-a' | 'rang-b' | 'quiz' | 'scene' | 'bd' | 'roman'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('musique')

  const renderPage = () => {
    switch (currentPage) {
      case 'musique':
        return <MusicGenerator />
      case 'rang-a':
        return <RangAPage />
      case 'rang-b':
        return <RangBPage />
      case 'quiz':
        return (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Médical</h2>
            <p className="text-gray-600 text-lg">Évaluations interactives - En développement</p>
          </div>
        )
      case 'scene':
        return (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Scénarios Cliniques</h2>
            <p className="text-gray-600 text-lg">Simulations de cas cliniques - En développement</p>
          </div>
        )
      case 'bd':
        return (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Bandes Dessinées</h2>
            <p className="text-gray-600 text-lg">BD éducatives médicales - En développement</p>
          </div>
        )
      case 'roman':
        return (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Romans Médicaux</h2>
            <p className="text-gray-600 text-lg">Histoires médicales immersives - En développement</p>
          </div>
        )
      default:
        return <MusicGenerator />
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Navigation 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
        />
        
        <main className="container mx-auto px-4 py-8 animate-fade-in">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="container mx-auto px-4 py-6 text-center text-gray-500">
            <p>&copy; 2024 MED-MNG par EmotionsCare - Révolutionnez votre apprentissage médical</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}

export default App
