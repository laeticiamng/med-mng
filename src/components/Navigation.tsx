import type React from 'react'
import { Music, BookOpen, Users, HelpCircle, Book, FileText, Star, GraduationCap } from 'lucide-react'
import type { PageType } from '../App'

interface NavigationProps {
  currentPage: PageType
  onPageChange: (page: PageType) => void
}

const navItems = [
  { 
    id: 'rang-a' as PageType, 
    label: 'Rang A', 
    icon: Star, 
    description: 'Items EDN Rang A',
    badge: 'Avancé'
  },
  { 
    id: 'rang-b' as PageType, 
    label: 'Rang B', 
    icon: BookOpen, 
    description: 'Items EDN Rang B' 
  },
  { 
    id: 'musique' as PageType, 
    label: 'Musique', 
    icon: Music, 
    description: 'Génération musicale IA',
    badge: 'IA'
  },
  { 
    id: 'scene' as PageType, 
    label: 'Scène', 
    icon: Users, 
    description: 'Scénarios cliniques' 
  },
  { 
    id: 'quiz' as PageType, 
    label: 'Quiz', 
    icon: HelpCircle, 
    description: 'Évaluations' 
  },
  { 
    id: 'bd' as PageType, 
    label: 'BD', 
    icon: Book, 
    description: 'Bandes dessinées' 
  },
  { 
    id: 'roman' as PageType, 
    label: 'Roman', 
    icon: FileText, 
    description: 'Romans médicaux' 
  },
]

export const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  onPageChange 
}) => {
  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                MED-MNG
              </h1>
              <p className="text-xs text-gray-500">par EmotionsCare</p>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="text-sm text-gray-500">
              Apprentissage médical révolutionnaire
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
          {navItems.map((item) => {
            const IconComponent = item.icon
            const isActive = currentPage === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={item.description}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="bg-white/30 text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
