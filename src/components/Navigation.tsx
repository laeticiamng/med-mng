import React from 'react'
import { Music, BookOpen, Users, HelpCircle, Book, FileText, Star } from 'lucide-react'

type PageType = 'musique' | 'rang-a' | 'rang-b' | 'quiz' | 'scene' | 'bd' | 'roman'

interface NavigationProps {
  currentPage: PageType
  onPageChange: (page: PageType) => void
  isLoading?: boolean
}

const navItems = [
  { id: 'rang-a' as PageType, label: 'Rang A', icon: Star, description: 'Items EDN Rang A' },
  { id: 'rang-b' as PageType, label: 'Rang B', icon: BookOpen, description: 'Items EDN Rang B' },
  { id: 'musique' as PageType, label: 'Musique', icon: Music, description: 'Génération musicale IA' },
  { id: 'scene' as PageType, label: 'Scène', icon: Users, description: 'Scénarios cliniques' },
  { id: 'quiz' as PageType, label: 'Quiz', icon: HelpCircle, description: 'Évaluations' },
  { id: 'bd' as PageType, label: 'BD', icon: Book, description: 'Bandes dessinées' },
  { id: 'roman' as PageType, label: 'Roman', icon: FileText, description: 'Romans médicaux' },
]

export const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  onPageChange,
  isLoading = false 
}) => {
  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">MED-MNG</h1>
              <p className="text-xs text-gray-500">par EmotionsCare</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {navItems.map((item) => {
            const IconComponent = item.icon
            const isActive = currentPage === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => !isLoading && onPageChange(item.id)}
                disabled={isLoading}
                className={`
                  flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap
                  ${isActive 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                title={item.description}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
