/**
 * 🏗️ COMBINED PROVIDERS
 * Architecture optimisée - Réduction de la complexité des providers imbriqués
 */

import logger from '@/lib/logger';
import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

// ⚡ STATE PROVIDERS
import { GlobalStateProvider } from '@/hooks/useGlobalState';
import { AuthProvider } from '@/components/med-mng/AuthProvider';

// 🎨 UI PROVIDERS
import { ViewportProvider } from '@/components/responsive/ViewportProvider';
import { NotificationProvider } from '@/contexts/NotificationContext';

// 🌐 BUSINESS PROVIDERS
import { LanguageProvider } from '@/contexts/LanguageContext';
import { GlobalAudioProvider } from '@/contexts/GlobalAudioContext';

interface CombinedProvidersProps {
  children: ReactNode;
}

// 🎯 OPTIMIZED QUERY CLIENT
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Smart retry logic
        if (error?.status === 401 || error?.status === 403) return false;
        if (error?.status >= 500) return failureCount < 2;
        return failureCount < 1;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Never retry mutations for client errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 1;
      },
    },
  },
});

// 🔧 STATE PROVIDERS LAYER
const StateProviders: React.FC<{ children: ReactNode }> = ({ children }) => (
  <GlobalStateProvider>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  </GlobalStateProvider>
);

// 🎨 UI PROVIDERS LAYER
const UIProviders: React.FC<{ children: ReactNode }> = ({ children }) => (
  <HelmetProvider>
    <ViewportProvider>
      <TooltipProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </TooltipProvider>
    </ViewportProvider>
  </HelmetProvider>
);

// 🏢 BUSINESS PROVIDERS LAYER
const BusinessProviders: React.FC<{ children: ReactNode }> = ({ children }) => (
  <AuthProvider>
    <LanguageProvider>
      <GlobalAudioProvider>
        {children}
      </GlobalAudioProvider>
    </LanguageProvider>
  </AuthProvider>
);

// 🌐 ROUTER PROVIDER (Separated for flexibility)
const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

// 🎯 MAIN COMBINED PROVIDER
export const CombinedProviders: React.FC<CombinedProvidersProps> = ({ children }) => {
  return (
    <StateProviders>
      <UIProviders>
        <BusinessProviders>
          <RouterProvider>
            {children}
          </RouterProvider>
        </BusinessProviders>
      </UIProviders>
    </StateProviders>
  );
};

// 🔧 PERFORMANCE MONITORING
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Monitor provider render times
  const originalConsoleTime = console.time;
  const originalConsoleTimeEnd = console.timeEnd;
  
  console.time = (label?: string) => {
    if (label?.includes('Provider')) {
      originalConsoleTime.call(console, `🏗️ ${label}`);
    } else {
      originalConsoleTime.call(console, label);
    }
  };
  
  console.timeEnd = (label?: string) => {
    if (label?.includes('Provider')) {
      originalConsoleTimeEnd.call(console, `🏗️ ${label}`);
    } else {
      originalConsoleTimeEnd.call(console, label);
    }
  };
}

// 🎭 PROVIDER HEALTH CHECK
export const checkProvidersHealth = (): Record<string, boolean> => {
  const health: Record<string, boolean> = {};
  
  try {
    // Check if all providers are properly initialized
    health.queryClient = !!queryClient;
    health.router = typeof window !== 'undefined' && !!window.location;
    health.helmet = typeof document !== 'undefined' && !!document.head;
    
    return health;
  } catch (error) {
    logger.error('🚨 Provider health check failed:', error);
    return health;
  }
};

// 🎯 EXPORT FOR MONITORING
export { queryClient };

export default CombinedProviders;