import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  path: string
  isActive?: boolean
}

export const Breadcrumb: React.FC = () => {
  const location = useLocation()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Accueil', path: '/' }
    ]

    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`

      const labelMap: Record<string, string> = {
        'rang-a': 'Rang A',
        'rang-b': 'Rang B',
        'musique': 'Musique',
        'scene': 'Scène',
        'quiz': 'Quiz',
        'bd': 'Bande Dessinée',
        'roman': 'Roman',
        'edn-complete': 'EDN Complet'
      }

      breadcrumbs.push({
        label: labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath,
        isActive: index === pathSegments.length - 1
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((item, index) => (
          <li key={item.path} className="breadcrumb-item">
            {index === 0 && <Home className="w-4 h-4" />}

            {item.isActive ? (
              <span className="breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link to={item.path} className="breadcrumb-link">
                {item.label}
              </Link>
            )}

            {index < breadcrumbs.length - 1 && (
              <ChevronRight className="breadcrumb-separator w-4 h-4" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
