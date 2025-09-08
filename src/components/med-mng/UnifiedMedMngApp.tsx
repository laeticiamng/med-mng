import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { GlobalMedMngLayout } from './GlobalMedMngLayout';
import { ComprehensiveDashboard } from './ComprehensiveDashboard';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
import { initializePWA } from './AdvancedPWAFeatures';
import { logger } from '@/utils/logger';
import { useUnifiedErrorHandling } from '@/hooks/useUnifiedErrorHandling';

// Lazy loaded pages for performance
const Dashboard = React.lazy(() => import('../../pages/med-mng/Dashboard'));
const Create = React.lazy(() => import('../../pages/med-mng/Create'));
const Library = React.lazy(() => import('../../pages/med-mng/Library'));
const Player = React.lazy(() => import('../../pages/med-mng/Player'));
const Settings = React.lazy(() => import('../../pages/med-mng/Settings'));
const Community = React.lazy(() => import('../../pages/med-mng/Community'));
const Playlists = React.lazy(() => import('../../pages/med-mng/Playlists'));
const PlaylistDetail = React.lazy(() => import('../../pages/med-mng/PlaylistDetail'));
const Analytics = React.lazy(() => import('../../pages/med-mng/Analytics'));
const Profile = React.lazy(() => import('../../pages/med-mng/Profile'));

// Enhanced loading component
const UnifiedLoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
    <div className="text-center space-y-4 p-8">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary mx-auto"></div>
        <div className="absolute inset-0 animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mx-auto blur-sm"></div>
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">
          Chargement MED-MNG
        </h2>
        <p className="text-muted-foreground text-sm">
          Préparation de votre environnement médical optimisé...
        </p>
      </div>
    </div>
  </div>
);

export const UnifiedMedMngApp: React.FC = () => {
  const { handleError } = useUnifiedErrorHandling();

  // Initialize PWA features
  React.useEffect(() => {
    try {
      initializePWA();
      logger.info('PWA features initialized', 'UnifiedMedMngApp');
    } catch (error) {
      handleError(error, {
        context: 'PWA initialization',
        showToast: false, // Don't show toast for PWA init errors
        logToSentry: true,
      });
    }
  }, [handleError]);

  // Log app initialization
  React.useEffect(() => {
    logger.info('Unified MED-MNG App initialized', 'UnifiedMedMngApp', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }, []);

  return (
    <EnhancedErrorBoundary>
      <Helmet>
        <title>MED-MNG - Plateforme Médicale Intelligente</title>
        <meta 
          name="description" 
          content="Plateforme d'apprentissage médical révolutionnaire avec IA générative, contenus musicaux personnalisés et outils d'étude optimisés pour l'EDN 2025." 
        />
        <meta name="keywords" content="EDN, médecine, apprentissage, IA, musique, étude, formation médicale" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MED-MNG" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Icons */}
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        
        {/* Preconnect to external services */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "MED-MNG",
            "alternateName": "Medical Music Next Generation",
            "description": "Plateforme d'apprentissage médical avec intelligence artificielle",
            "url": "https://med-mng.com",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web, iOS, Android",
            "offers": {
              "@type": "Offer",
              "category": "Educational",
              "price": "0",
              "priceCurrency": "EUR"
            },
            "author": {
              "@type": "Organization",
              "name": "MED-MNG Team"
            },
            "audience": {
              "@type": "Audience",
              "audienceType": "Medical Students"
            }
          })}
        </script>
      </Helmet>
      
      <GlobalMedMngLayout>
        <Suspense fallback={<UnifiedLoadingFallback />}>
          <Routes>
            {/* Default route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Main pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/comprehensive" element={<ComprehensiveDashboard />} />
            <Route path="/create" element={<Create />} />
            <Route path="/library" element={<Library />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Playlists */}
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
            
            {/* Player */}
            <Route path="/player/:trackId" element={<Player />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </GlobalMedMngLayout>
    </EnhancedErrorBoundary>
  );
};

export default UnifiedMedMngApp;