/**
 * 🚀 MED-MNG v4.0 PREMIUM - APPLICATION PRINCIPALE
 * Architecture premium de classe mondiale pour plateformes médicales
 */

import React, { Suspense, StrictMode } from 'react';
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
      <ErrorBoundary
        FallbackComponent={PremiumErrorFallback}
        onError={handleGlobalError}
        onReset={() => window.location.reload()}
      >
        <PremiumAppProviders>
          <Suspense fallback={<PremiumLoadingFallback />}>
            <PremiumLayout>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  MED-MNG v4.0 Premium
                </h1>
                <p className="text-muted-foreground mt-2">
                  Plateforme médicale avancée - Chargement en cours...
                </p>
              </div>
            </PremiumLayout>
          </Suspense>
        </PremiumAppProviders>
      </ErrorBoundary>
    </StrictMode>
  );
};

export default PremiumApp;