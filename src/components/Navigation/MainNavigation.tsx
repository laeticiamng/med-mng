import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Music,
  BookOpen,
  Users,
  HelpCircle,
  Book,
  FileText,
  Star
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  path: string
  icon: React.ReactNode
  description: string
  badge?: string
}

const navItems: NavItem[] = [
  {
    id: 'rang-a',
    label: 'Rang A',
    path: '/rang-a',
    icon: <Star className="w-5 h-5" />,
    description: 'Items de connaissance Rang A',
    badge: 'Avancé'
  },
  {
    id: 'rang-b',
    label: 'Rang B',
    path: '/rang-b',
    icon: <BookOpen className="w-5 h-5" />,
    description: 'Items de connaissance Rang B'
  },
  {
    id: 'musique',
    label: 'Musique',
    path: '/musique',
    icon: <Music className="w-5 h-5" />,
    description: 'Génération musicale avec IA'
  },
  {
    id: 'scene',
    label: 'Scène',
    path: '/scene',
    icon: <Users className="w-5 h-5" />,
    description: 'Scénarios cliniques interactifs'
  },
  {
    id: 'quiz',
    label: 'Quiz',
    path: '/quiz',
    icon: <HelpCircle className="w-5 h-5" />,
    description: 'Évaluations et tests'
  },
  {
    id: 'bd',
    label: 'BD',
    path: '/bd',
    icon: <Book className="w-5 h-5" />,
    description: 'Bandes dessinées éducatives'
  },
  {
    id: 'roman',
    label: 'Roman',
    path: '/roman',
    icon: <FileText className="w-5 h-5" />,
    description: 'Romans médicaux'
  }
]

export const MainNavigation: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        {/* Logo et titre */}
        <div className="nav-header">
          <div className="logo">
            <span className="logo-text">MED-MNG</span>
            <span className="logo-subtitle">par EmotionsCare</span>
          </div>
        </div>

        {/* Navigation principale */}
        <div className="nav-items">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              title={item.description}
            >
              <div className="nav-item-icon">{item.icon}</div>
              <div className="nav-item-content">
                <span className="nav-item-label">{item.label}</span>
                <span className="nav-item-description">{item.description}</span>
              </div>
              {item.badge && <span className="nav-item-badge">{item.badge}</span>}
            </button>
          ))}
        </div>

        {/* Indicateur de progression */}
        <div className="nav-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '60%' }} />
          </div>
          <span className="progress-text">Progression: 6/10 modules</span>
        </div>
      </div>
    </nav>
  )
}
