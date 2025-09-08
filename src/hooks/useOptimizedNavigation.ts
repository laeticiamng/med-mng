import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOptimizedAccessibility } from './useOptimizedAccessibility';
import { logger } from '@/utils/structuredLogger';

interface NavigationOptions {
  replace?: boolean;
  state?: any;
  announceNavigation?: boolean;
  preload?: boolean;
}

interface NavigationHistory {
  pathname: string;
  timestamp: number;
  title?: string;
}

export const useOptimizedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { announceToScreenReader, isScreenReader } = useOptimizedAccessibility();
  
  const navigationHistory = useRef<NavigationHistory[]>([]);
  const preloadedRoutes = useRef<Set<string>>(new Set());
  const pendingNavigation = useRef<string | null>(null);

  // Enregistrement de l'historique de navigation
  useEffect(() => {
    const currentNavigation: NavigationHistory = {
      pathname: location.pathname,
      timestamp: Date.now(),
      title: document.title
    };

    navigationHistory.current.push(currentNavigation);
    
    // Garder seulement les 50 dernières entrées
    if (navigationHistory.current.length > 50) {
      navigationHistory.current = navigationHistory.current.slice(-50);
    }

    logger.info('Navigation enregistrée', {
      component: 'OptimizedNavigation',
      metadata: { 
        pathname: location.pathname, 
        historyLength: navigationHistory.current.length 
      }
    });
  }, [location.pathname]);

  // Navigation optimisée
  const navigateTo = useCallback((
    path: string, 
    options: NavigationOptions = {}
  ) => {
    const { 
      replace = false, 
      state, 
      announceNavigation = true, 
      preload = false 
    } = options;

    // Éviter les navigations en double
    if (pendingNavigation.current === path) {
      logger.debug('Navigation en double évitée', {
        component: 'OptimizedNavigation',
        metadata: { path }
      });
      return;
    }

    pendingNavigation.current = path;

    // Préchargement si demandé
    if (preload && !preloadedRoutes.current.has(path)) {
      preloadRoute(path);
    }

    try {
      if (replace) {
        navigate(path, { replace: true, state });
      } else {
        navigate(path, { state });
      }

      // Annonce pour les lecteurs d'écran
      if (announceNavigation && isScreenReader) {
        const pageName = getPageNameFromPath(path);
        announceToScreenReader(`Navigation vers ${pageName}`, 'polite');
      }

      logger.info('Navigation effectuée', {
        component: 'OptimizedNavigation',
        metadata: { path, replace, fromPath: location.pathname }
      });

    } catch (error) {
      logger.error('Erreur lors de la navigation', {
        component: 'OptimizedNavigation',
        metadata: { path, fromPath: location.pathname }
      }, error as Error);
    } finally {
      // Reset du pending après un délai
      setTimeout(() => {
        pendingNavigation.current = null;
      }, 100);
    }
  }, [navigate, location.pathname, isScreenReader, announceToScreenReader]);

  // Préchargement de route
  const preloadRoute = useCallback((path: string) => {
    if (preloadedRoutes.current.has(path)) return;

    try {
      // Préchargement des ressources nécessaires
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = path;
      document.head.appendChild(link);
      
      preloadedRoutes.current.add(path);
      
      logger.debug('Route préchargée', {
        component: 'OptimizedNavigation',
        metadata: { path }
      });

      // Nettoyage après 5 minutes
      setTimeout(() => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      }, 5 * 60 * 1000);

    } catch (error) {
      logger.warn('Échec du préchargement de route', {
        component: 'OptimizedNavigation',
        metadata: { path }
      });
    }
  }, []);

  // Navigation avec retour en arrière optimisée
  const goBack = useCallback((fallbackPath: string = '/') => {
    const currentIndex = navigationHistory.current.findIndex(
      nav => nav.pathname === location.pathname
    );
    
    if (currentIndex > 0) {
      const previousNav = navigationHistory.current[currentIndex - 1];
      navigateTo(previousNav.pathname, { announceNavigation: true });
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo(fallbackPath);
    }

    logger.info('Navigation arrière', {
      component: 'OptimizedNavigation',
      metadata: { fromPath: location.pathname, fallbackPath }
    });
  }, [location.pathname, navigateTo]);

  // Navigation avec avance optimisée
  const goForward = useCallback(() => {
    const currentIndex = navigationHistory.current.findIndex(
      nav => nav.pathname === location.pathname
    );
    
    if (currentIndex < navigationHistory.current.length - 1) {
      const nextNav = navigationHistory.current[currentIndex + 1];
      navigateTo(nextNav.pathname, { announceNavigation: true });
    } else {
      window.history.forward();
    }

    logger.info('Navigation avant', {
      component: 'OptimizedNavigation',
      metadata: { fromPath: location.pathname }
    });
  }, [location.pathname, navigateTo]);

  // Utilitaire pour extraire le nom de la page
  const getPageNameFromPath = (path: string): string => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'Accueil';
    
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Navigation breadcrumb
  const getBreadcrumb = useCallback((): NavigationHistory[] => {
    return navigationHistory.current.slice(-5); // Dernières 5 pages
  }, []);

  // Vérification si on peut naviguer en arrière
  const canGoBack = useCallback((): boolean => {
    const currentIndex = navigationHistory.current.findIndex(
      nav => nav.pathname === location.pathname
    );
    return currentIndex > 0 || window.history.length > 1;
  }, [location.pathname]);

  // Vérification si on peut naviguer en avant
  const canGoForward = useCallback((): boolean => {
    const currentIndex = navigationHistory.current.findIndex(
      nav => nav.pathname === location.pathname
    );
    return currentIndex < navigationHistory.current.length - 1;
  }, [location.pathname]);

  // Navigation rapide vers des pages courantes
  const quickNavigate = {
    home: () => navigateTo('/'),
    dashboard: () => navigateTo('/dashboard'),
    profile: () => navigateTo('/profile'),
    settings: () => navigateTo('/settings'),
    help: () => navigateTo('/help')
  };

  return {
    // Navigation de base
    navigateTo,
    goBack,
    goForward,
    
    // Préchargement
    preloadRoute,
    
    // État de navigation
    currentPath: location.pathname,
    canGoBack: canGoBack(),
    canGoForward: canGoForward(),
    
    // Historique et breadcrumb
    navigationHistory: navigationHistory.current,
    getBreadcrumb,
    
    // Utilitaires
    getPageNameFromPath,
    quickNavigate,
    
    // État interne
    isNavigating: pendingNavigation.current !== null
  };
};