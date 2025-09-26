import React, { memo, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { MusicGenerationProvider } from './MusicGenerationProvider';
import { StudySessionProvider } from './StudySessionProviderSimplified';
import { NotificationProvider } from './NotificationProvider';
import { FavoritesSidebar } from './FavoritesSidebar';
import { SearchResults } from './SearchResults';
import { NotificationCenter } from './NotificationCenter';
import { PWAInstallPrompt, OfflineStatus, NotificationManager } from './PWAFeatures';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ProfilePage } from './ProfilePage';
import { HelpPage } from './HelpPage';

// Pages MED-MNG avec chargement optimisé
const Dashboard = React.lazy(() => import('../../pages/med-mng/Dashboard'));
const Create = React.lazy(() => import('../../pages/med-mng/Create'));
const Library = React.lazy(() => import('../../pages/med-mng/Library'));
const Player = React.lazy(() => import('../../pages/med-mng/Player'));
const Settings = React.lazy(() => import('../../pages/med-mng/Settings'));
const Community = React.lazy(() => import('../../pages/med-mng/Community'));
const Playlists = React.lazy(() => import('../../pages/med-mng/Playlists'));
const PlaylistDetail = React.lazy(() => import('../../pages/med-mng/PlaylistDetail'));

// Composant de chargement optimisé pour MED-MNG
const MedMngLoadingFallback = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
    <Card className="p-8 max-w-md mx-auto shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <CardContent className="space-y-6 text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary mx-auto"></div>
          <div className="absolute inset-0 animate-pulse">
            <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mx-auto blur-sm"></div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Chargement MED-MNG
          </h2>
          <p className="text-muted-foreground text-sm">
            Préparation de votre environnement médical...
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
));

// Composant d'erreur pour MED-MNG
const MedMngErrorFallback = memo(({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void; }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-red-900">
    <Card className="p-8 max-w-md mx-auto shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <CardContent className="space-y-6 text-center">
        <div className="text-red-500 dark:text-red-400">
          <AlertCircle size={48} className="mx-auto mb-4" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Erreur MED-MNG
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Une erreur s'est produite lors du chargement
          </p>
          <details className="text-xs text-left bg-gray-100 dark:bg-gray-700 p-3 rounded-md mb-4">
            <summary className="cursor-pointer font-medium mb-2">Détails techniques</summary>
            <pre className="whitespace-pre-wrap text-xs">{error.message}</pre>
          </details>
        </div>
        <Button 
          onClick={resetErrorBoundary}
          className="w-full"
          variant="default"
        >
          <RefreshCw size={16} className="mr-2" />
          Réessayer
        </Button>
      </CardContent>
    </Card>
  </div>
));

// Layout principal optimisé
const OptimizedLayout: React.FC<{ children: React.ReactNode }> = memo(({ children }) => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>MED-MNG - Plateforme Médicale Optimisée</title>
      <meta name="description" content="Plateforme d'apprentissage médical avec IA, génération musicale et contenus EDN optimisés" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#2563eb" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    </Helmet>
    
    <div className="flex min-h-screen">
      {/* Sidebar des favoris */}
      <aside className="hidden lg:block w-80 border-r border-border bg-card/50 space-y-4 p-4">
        <FavoritesSidebar />
        <div className="space-y-4">
          <OfflineStatus />
          <NotificationManager />
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 flex flex-col">
        {/* Barre de recherche et notifications */}
        <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center justify-between p-4">
            <SearchResults />
            <NotificationCenter />
          </div>
        </header>

        {/* Zone de contenu */}
        <div className="flex-1 p-6">
          <PWAInstallPrompt 
            onInstall={() => console.log('PWA installed')} 
            className="mb-4" 
          />
          {children}
        </div>
      </main>
    </div>
  </div>
));

// Application MED-MNG optimisée
export const OptimizedMedMngApp: React.FC = memo(() => {
  return (
    <ErrorBoundary FallbackComponent={MedMngErrorFallback}>
      <AuthProvider>
        <MusicGenerationProvider>
          <StudySessionProvider>
            <NotificationProvider>
              <OptimizedLayout>
                <Suspense fallback={<MedMngLoadingFallback />}>
                  <Routes>
                    {/* Route par défaut */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Pages principales */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/analytics" element={<AnalyticsDashboard />} />
                    
                    {/* Playlists */}
                    <Route path="/playlists" element={<Playlists />} />
                    <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
                    
                    {/* Player */}
                    <Route path="/player/:trackId" element={<Player />} />
                    
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </OptimizedLayout>
            </NotificationProvider>
          </StudySessionProvider>
        </MusicGenerationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
});

OptimizedMedMngApp.displayName = 'OptimizedMedMngApp';

export default OptimizedMedMngApp;