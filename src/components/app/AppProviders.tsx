/**
 * 🚀 PROVIDERS D'APPLICATION OPTIMISÉS - MED-MNG v2.0
 * Refactoring des providers pour de meilleures performances
 */

import React, { memo, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";

// Context providers
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import { UXToastProvider } from "@/components/feedback/UXToastProvider";
import { ViewportProvider } from "@/components/responsive/ViewportProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { AuthProvider } from "@/components/med-mng/AuthProvider";
import { UndoRedoProvider } from '@/components/ux/UndoRedoProvider';

// Layout components
import { GlobalOverflowWrapper } from "@/components/layout/GlobalOverflowWrapper";
import NavigatorBridge from "@/lib/NavigatorBridge";

// Utilities
import { logger } from '@/lib/logger';

// ==========================================
// CONFIGURATION QUERY CLIENT OPTIMISÉE
// ==========================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Ne pas retry pour les erreurs 4xx
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2; // Maximum 2 retries
      },
      staleTime: 15 * 60 * 1000, // 15 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes  
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // Pas de retry automatique pour les mutations
    },
  },
  logger: {
    log: (message, ...args) => logger.debug('api', message, args),
    warn: (message, ...args) => logger.warn('api', message, args),
    error: (message, ...args) => logger.error('api', message, args),
  },
});

// ==========================================
// PROVIDERS INDIVIDUELS MEMOIZÉS  
// ==========================================

const QueryProvider = memo(({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
));

const HelmetProviderWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    {children}
  </HelmetProvider>
));

const TooltipProviderWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <TooltipProvider delayDuration={300}>
    {children}
  </TooltipProvider>
));

const RouterProvider = memo(({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <NavigatorBridge />
    {children}
  </BrowserRouter>
));

// ==========================================
// COMPOSANT PRINCIPAL DES PROVIDERS
// ==========================================

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders = memo(({ children }: AppProvidersProps) => {
  logger.performance('AppProviders rendering');

  return (
    <QueryProvider>
      <HelmetProviderWrapper>
        <TooltipProviderWrapper>
          <AccessibilityProvider>
            <ViewportProvider>
              <LanguageProvider>
                <GlobalAudioProvider>
                  <AuthProvider>
                    <ToastProvider>
                      <UndoRedoProvider>
                        <GlobalOverflowWrapper className="min-h-screen">
                          <RouterProvider>
                            <UXToastProvider>
                              <Suspense fallback={<AppLoadingFallback />}>
                                {children}
                              </Suspense>
                            </UXToastProvider>
                          </RouterProvider>
                        </GlobalOverflowWrapper>
                      </UndoRedoProvider>
                    </ToastProvider>
                  </AuthProvider>
                </GlobalAudioProvider>
              </LanguageProvider>
            </ViewportProvider>
          </AccessibilityProvider>
        </TooltipProviderWrapper>
      </HelmetProviderWrapper>
    </QueryProvider>
  );
});

AppProviders.displayName = 'AppProviders';

// ==========================================
// LOADING FALLBACK OPTIMISÉ
// ==========================================

const AppLoadingFallback = memo(() => {
  logger.performance('AppLoadingFallback rendered');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center bg-card/80 backdrop-blur-sm rounded-2xl p-8 border border-border gpu-accelerated">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary mx-auto mb-6 will-change-transform"></div>
          <div className="absolute inset-0 animate-pulse">
            <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mx-auto blur-sm gpu-accelerated"></div>
          </div>
        </div>
        <p className="text-foreground font-medium text-lg mb-2">Chargement MED-MNG</p>
        <p className="text-muted-foreground text-sm">Préparation de votre environnement d'apprentissage...</p>
      </div>
    </div>
  );
});

AppLoadingFallback.displayName = 'AppLoadingFallback';

export { AppProviders, queryClient };
export default AppProviders;