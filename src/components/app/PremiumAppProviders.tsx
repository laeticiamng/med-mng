/**
 * 🌟 PREMIUM APP PROVIDERS - MED-MNG v4.0
 * Providers unifiés et optimisés pour l'excellence premium
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider } from '@/components/ui/sidebar';
import { PremiumAccessibilityProvider } from '@/components/accessibility/PremiumAccessibilityProvider';
import { PremiumKeyboardProvider } from '@/components/keyboard/PremiumKeyboardProvider';
import { PremiumPerformanceProvider } from '@/components/performance/PremiumPerformanceProvider';
import { PremiumSEO } from '@/components/seo/PremiumSEO';
import { logger } from '@/lib/logger';

// ==========================================
// CONFIGURATION QUERY CLIENT PREMIUM
// ==========================================

const createPremiumQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30,   // 30 minutes (nouveau nom pour cacheTime)
        retry: (failureCount, error: any) => {
          // Logique de retry intelligente
          if (error?.status === 404) return false;
          if (error?.status >= 500) return failureCount < 3;
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
      },
      mutations: {
        retry: 1,
        onError: (error: any) => {
          logger.error('api', 'Mutation failed', { error });
        },
      },
    },
  });
};

// Instance unique du Query Client
const queryClient = createPremiumQueryClient();

// ==========================================
// INTERFACE DES PROVIDERS
// ==========================================

interface PremiumAppProvidersProps {
  children: React.ReactNode;
}

// ==========================================
// PROVIDERS PREMIUM
// ==========================================

export const PremiumAppProviders: React.FC<PremiumAppProvidersProps> = ({ children }) => {
  React.useEffect(() => {
    logger.info('app', '🌟 Premium App Providers initialized');
    
    // Configuration des variables CSS pour les performances
    document.documentElement.style.setProperty('--animation-duration', '0.3s');
    
    // Configuration du viewport pour mobile
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes');
    }
    
    // Configuration du thème initial
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (!localStorage.getItem('theme')) {
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
            storageKey="med-mng-theme"
          >
            <SidebarProvider defaultOpen={true}>
              <PremiumAccessibilityProvider>
                <PremiumKeyboardProvider>
                  <PremiumPerformanceProvider>
                    <TooltipProvider delayDuration={300}>
                      <PremiumSEO />
                      {children}
                      <Toaster />
                    </TooltipProvider>
                  </PremiumPerformanceProvider>
                </PremiumKeyboardProvider>
              </PremiumAccessibilityProvider>
            </SidebarProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
};