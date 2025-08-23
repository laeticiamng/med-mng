/**
 * LAZY LOADING OPTIMISÉ DES ROUTES
 * =================================
 * Code splitting intelligent avec préchargement et gestion d'erreurs
 */

import { lazy, Suspense, ComponentType } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Composant de fallback pour les erreurs
const ErrorFallback = ({ error, resetErrorBoundary }: { 
  error: Error; 
  resetErrorBoundary: () => void; 
}) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Alert className="max-w-md">
      <AlertDescription className="space-y-4">
        <div>
          <h3 className="font-semibold">Erreur de chargement</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error.message || 'Une erreur est survenue lors du chargement de cette page.'}
          </p>
        </div>
        <Button onClick={resetErrorBoundary} size="sm" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </AlertDescription>
    </Alert>
  </div>
);

// Composant de loading optimisé
const LazyLoadingFallback = ({ pageName }: { pageName?: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <div>
        <h3 className="font-medium">Chargement{pageName ? ` de ${pageName}` : ''}...</h3>
        <p className="text-sm text-muted-foreground">Veuillez patienter</p>
      </div>
    </div>
  </div>
);

// Lazy loading avec préchargement intelligent
const createLazyComponent = (
  importFn: () => Promise<{ default: ComponentType }>,
  pageName?: string,
  preloadDeps?: (() => Promise<any>)[]
) => {
  return lazy(async () => {
    try {
      // Précharger les dépendances critiques en parallèle
      const promises = [importFn()];
      if (preloadDeps) {
        promises.push(...preloadDeps.map(dep => dep().catch(() => null)));
      }
      
      const [module] = await Promise.all(promises);
      return module;
    } catch (error) {
      console.error(`Erreur lors du chargement de ${pageName}:`, error);
      throw error;
    }
  });
};

// Routes avec préchargement des dépendances critiques
export const Generator = createLazyComponent(
  () => import('@/pages/Generator'),
  'Générateur Musical',
  [
    () => import('@/components/GeneratorMusicPlayer'),
    () => import('@/components/player/AdvancedMusicPlayer'),
  ]
);

export const MedMngLibrary = createLazyComponent(
  () => import('@/pages/MedMngLibrary'),
  'Bibliothèque Musicale'
);

export const MedMngPricing = createLazyComponent(
  () => import('@/pages/MedMngPricing'),
  'Tarification'
);

export const MedChat = createLazyComponent(
  () => import('@/pages/MedChat'),
  'Chat IA Médical',
  [
    () => import('@/components/ai/ContextualAIChat'),
  ]
);

export const EdnComplete = createLazyComponent(
  () => import('@/pages/EdnComplete'),
  'Interface EDN',
  [
    () => import('@/components/edn/EdnObjectifsExtraction'),
    () => import('@/components/edn/TableauRangA'),
  ]
);

export const EcosPage = createLazyComponent(
  () => import('@/pages/EcosPage'),
  'Examens ECOS'
);

export const MedMngLogin = createLazyComponent(
  () => import('@/pages/MedMngLogin'),
  'Connexion'
);

export const MedMngSignup = createLazyComponent(
  () => import('@/pages/MedMngSignup'),
  'Inscription'
);

// Wrapper avec Suspense et ErrorBoundary optimisés
interface LazyRouteProps {
  component: ComponentType;
  pageName?: string;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({ 
  component: Component, 
  pageName 
}) => (
  <ErrorBoundary 
    FallbackComponent={ErrorFallback}
    onReset={() => window.location.reload()}
  >
    <Suspense fallback={<LazyLoadingFallback pageName={pageName} />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
);

// Préchargement intelligent basé sur l'interaction utilisateur
export const preloadRoute = (routeName: keyof typeof lazyRoutes) => {
  const route = lazyRoutes[routeName];
  if (route) {
    // Précharger le composant sans l'instancier
    route._payload?._result || route._init?.();
  }
};

// Map des routes lazy
export const lazyRoutes = {
  Generator,
  MedMngLibrary,
  MedMngPricing,
  MedChat,
  EdnComplete,
  EcosPage,
  MedMngLogin,
  MedMngSignup
};

// Hook pour précharger les routes selon l'intention utilisateur
export const useRoutePreloader = () => {
  const preloadOnHover = (routeName: keyof typeof lazyRoutes) => {
    return {
      onMouseEnter: () => preloadRoute(routeName),
      onFocus: () => preloadRoute(routeName),
    };
  };
  
  return { preloadOnHover };
};