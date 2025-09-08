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
import { AppRoutes } from '@/components/routes/AppRoutes';
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
              <AppRoutes />
            </PremiumLayout>
          </Suspense>
        </PremiumAppProviders>
      </ErrorBoundary>
    </StrictMode>
  );
};

export default PremiumApp;