/**
 * 🚀 MED-MNG v4.0 PREMIUM - APPLICATION PRINCIPALE
 * Architecture premium de classe mondiale pour plateformes médicales
 */

import React, { Suspense, StrictMode } from 'react';
import { Helmet } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import { PremiumAppProviders } from '@/components/app/PremiumAppProviders';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { PremiumErrorFallback } from '@/components/error/PremiumErrorFallback';
import { PremiumLoadingFallback } from '@/components/loading/PremiumLoadingFallback';
import { logger } from '@/lib/logger';

// ==========================================
// GLOBAL ERROR HANDLER PREMIUM
// ==========================================

const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
  logger.error('app', 'Application error caught by boundary', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack
  });
  
  // En production, envoyer à un service de monitoring
  if (import.meta.env.PROD) {
    // Ici on pourrait intégrer Sentry, LogRocket, etc.
    console.error('Production error:', error);
  }
};

// ==========================================
// APPLICATION PREMIUM
// ==========================================

const PremiumApp: React.FC = () => {
  return (
    <StrictMode>
      <Helmet
        titleTemplate="%s | MED-MNG v4.0 Premium"
        defaultTitle="MED-MNG v4.0 Premium - Plateforme Médicale Avancée"
      >
        <html lang="fr" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="description" content="MED-MNG v4.0 Premium - La plateforme médicale la plus avancée au monde. Interface premium, sécurité maximale, accessibilité totale." />
        <meta name="keywords" content="médical, premium, santé, plateforme, sécurisé, accessible, professionnel" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="MED-MNG v4.0 Premium - Plateforme Médicale Avancée" />
        <meta property="og:description" content="La plateforme médicale la plus avancée au monde" />
        <meta property="og:site_name" content="MED-MNG Premium" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MED-MNG v4.0 Premium" />
        <meta name="twitter:description" content="Plateforme médicale premium de classe mondiale" />
        
        {/* Apple */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MED-MNG Premium" />
        
        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preconnect pour les performances */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Préchargement des ressources critiques */}
        <link rel="modulepreload" href="/src/main.tsx" />
      </Helmet>

      <ErrorBoundary
        FallbackComponent={PremiumErrorFallback}
        onError={handleGlobalError}
        onReset={() => window.location.reload()}
      >
        <PremiumAppProviders>
          <Suspense fallback={<PremiumLoadingFallback />}>
            <PremiumLayout>
              <div>MED-MNG v4.0 Premium is loading...</div>
            </PremiumLayout>
          </Suspense>
        </PremiumAppProviders>
      </ErrorBoundary>
    </StrictMode>
  );
};

export default PremiumApp;