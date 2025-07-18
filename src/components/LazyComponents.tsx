import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export const MusicGeneratorPage = lazy(() =>
  import('../pages/MusicGeneratorPage').then(module => ({
    default: module.MusicGeneratorPage
  }))
)

export const QuizPage = lazy(() =>
  import('../pages/QuizPage').then(module => ({
    default: module.QuizPage
  }))
)

export const ScenePage = lazy(() =>
  import('../pages/ScenePage').then(module => ({
    default: module.ScenePage
  }))
)

export const BDPage = lazy(() =>
  import('../pages/BDPage').then(module => ({
    default: module.BDPage
  }))
)

export const RomanPage = lazy(() =>
  import('../pages/RomanPage').then(module => ({
    default: module.RomanPage
  }))
)

interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback
}) => (
  <Suspense
    fallback={
      fallback || (
        <div className="lazy-loading">
          <LoadingSpinner size="large" />
          <p>Chargement du module...</p>
        </div>
      )
    }
  >
    {children}
  </Suspense>
)

export const usePreloadComponent = (componentLoader: () => Promise<any>) => {
  const preload = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection.effectiveType === '4g' || connection.downlink > 1.5) {
        componentLoader()
      }
    } else {
      componentLoader()
    }
  }

  return { preload }
}
