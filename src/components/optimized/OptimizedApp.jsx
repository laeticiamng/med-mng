import { memo, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SimpleProvider } from '@/components/providers/SimpleProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { usePerformanceMetrics } from '@/hooks/usePerformanceOptimization';

// Lazy loading optimisé pour toutes les pages principales
const HomePage = lazy(() => import('@/pages/HomePage'));
const PlatformPage = lazy(() => import('@/pages/PlatformPage'));
const FeaturesPage = lazy(() => import('@/pages/FeaturesPage'));
const GeneratorPage = lazy(() => import('@/pages/GeneratorPage'));
const MonitoringPage = lazy(() => import('@/pages/MonitoringPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const OptimizedDashboard = lazy(() => import('./OptimizedDashboard'));
const OptimizationPage = lazy(() => import('@/pages/OptimizationPage'));
const MentionsLegales = lazy(() => import('@/pages/MentionsLegales'));
const PolitiqueConfidentialite = lazy(() => import('@/pages/PolitiqueConfidentialite'));
const Conditions = lazy(() => import('@/pages/Conditions'));
const Support = lazy(() => import('@/pages/Support'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));

// Configuration QueryClient optimisée
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: false
    },
    mutations: {
      retry: 1
    }
  }
});

// Composant de chargement optimisé
const OptimizedLoadingFallback = memo(({ route = 'page' }) => (
  <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      <p className="text-muted-foreground animate-pulse">
        Chargement de {route}...
      </p>
    </div>
  </div>
));

// Gestionnaire d'erreur optimisé
const ErrorBoundary = memo(({ children, fallback }) => {
  return children;
});

// App optimisée avec surveillance des performances
const OptimizedApp = memo(() => {
  const { startMeasure, endMeasure } = usePerformanceMetrics();
  
  useEffect(() => {
    startMeasure('app-init');
    
    // Web Vitals et métriques personnalisées
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          console.log('Navigation timing:', entry);
        }
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint'] });
    } catch (e) {
      console.warn('Performance observer not supported');
    }
    
    endMeasure('app-init');
    
    return () => {
      try {
        observer.disconnect();
      } catch (e) {
        // Ignore
      }
    };
  }, [startMeasure, endMeasure]);

  // Préchargement des routes critiques
  useEffect(() => {
    const preloadCriticalRoutes = () => {
      import('@/pages/HomePage');
      import('@/pages/GeneratorPage');
      import('./OptimizedDashboard');
    };
    
    // Précharger après 2 secondes
    const timer = setTimeout(preloadCriticalRoutes, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={createQueryClient()}>
      <LanguageProvider>
        <SimpleProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
              <ErrorBoundary fallback={<div>Erreur de chargement</div>}>
                <Routes>
                  <Route 
                    path="/" 
                    element={
                      <Suspense fallback={<OptimizedLoadingFallback route="accueil" />}>
                        <HomePage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/platform" 
                    element={
                      <Suspense fallback={<OptimizedLoadingFallback route="plateforme" />}>
                        <PlatformPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/features" 
                    element={
                      <Suspense fallback={<OptimizedLoadingFallback route="fonctionnalités" />}>
                        <FeaturesPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/generator" 
                    element={
                      <Suspense fallback={<OptimizedLoadingFallback route="générateur" />}>
                        <GeneratorPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/monitoring" 
                    element={
                      <Suspense fallback={<OptimizedLoadingFallback route="monitoring" />}>
                        <MonitoringPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/analytics" 
                    element={
                      <Suspense fallback={<OptimizedLoadingFallback route="analytics" />}>
                        <AnalyticsPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <Suspense fallback={<OptimizedLoadingFallback route="tableau de bord" />}>
                        <OptimizedDashboard />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/optimization" 
                    element={
                      <Suspense fallback={<OptimizedLoadingFallback route="optimisation" />}>
                        <OptimizationPage />
                      </Suspense>
                    } 
                  />
                  
                  {/* Pages légales et utilitaires */}
                  <Route 
                    path="/mentions-legales" 
                    element={
                      <Suspense fallback={<OptimizedLoadingFallback route="mentions légales" />}>
                        <MentionsLegales />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/politique-confidentialite" 
                    element={
                      <Suspense fallback={<OptimizedLoadingFallback route="politique de confidentialité" />}>
                        <PolitiqueConfidentialite />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/conditions" 
                    element={
                      <Suspense fallback={<OptimizedLoadingFallback route="conditions d'utilisation" />}>
                        <Conditions />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/support" 
                    element={
                      <Suspense fallback={<OptimizedLoadingFallback route="support" />}>
                        <Support />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/notifications" 
                    element={
                      <Suspense fallback={<OptimizedLoadingFallback route="notifications" />}>
                        <Notifications />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/reset-password" 
                    element={
                      <Suspense fallback={<OptimizedLoadingFallback route="réinitialisation" />}>
                        <ResetPassword />
                      </Suspense>
                    } 
                  />
                  
                  {/* Route 404 */}
                  <Route 
                    path="*" 
                    element={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-4xl font-bold mb-4">404</h1>
                          <p className="text-muted-foreground mb-4">Page non trouvée</p>
                          <a 
                            href="/" 
                            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                          >
                            Retour à l'accueil
                          </a>
                        </div>
                      </div>
                    } 
                  />
                </Routes>
              </ErrorBoundary>
              
              {/* Composants globaux */}
              <LanguageSelector />
              <Toaster position="top-right" />
            </div>
          </Router>
        </SimpleProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
});

OptimizedApp.displayName = 'OptimizedApp';

export default OptimizedApp;