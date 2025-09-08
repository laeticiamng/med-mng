import { GlobalOverflowWrapper } from "@/components/layout/GlobalOverflowWrapper";
import React, { Suspense, lazy, memo, StrictMode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GlobalErrorBoundary from "@/components/error/GlobalErrorBoundary";

// ⚡ MED-MNG CORE - Architecture Premium Unifiée
const UnifiedMedMngDashboard = lazy(() => import("./core/med-mng/components/UnifiedMedMngDashboard").then(module => ({ default: module.UnifiedMedMngDashboard })));

// ⚡ LOADING FALLBACK Premium
const PageLoadingFallback = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
    <div className="text-center bg-card/80 backdrop-blur-sm rounded-2xl p-8 border border-border">
      <div className="relative mb-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary mx-auto"></div>
        <div className="absolute inset-0 animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mx-auto blur-sm"></div>
        </div>
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">MED-MNG Premium</h2>
      <p className="text-muted-foreground text-sm">Architecture unifiée - Chargement optimisé...</p>
    </div>
  </div>
));

// ⚡ QueryClient optimisé pour performances maximales
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 15 * 60 * 1000, // 15 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <StrictMode>
        <HelmetProvider>
          <TooltipProvider>
            <GlobalOverflowWrapper className="min-h-screen">
              <BrowserRouter>
                <div id="app-root" className="min-h-screen flex flex-col">
                  <GlobalErrorBoundary>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <Routes>
                        {/* ⚡ MED-MNG PREMIUM ROUTES */}
                        <Route path="/" element={<UnifiedMedMngDashboard />} />
                        <Route path="/med-mng/*" element={<UnifiedMedMngDashboard />} />
                        <Route path="/dashboard" element={<UnifiedMedMngDashboard />} />
                        
                        {/* ⚡ REDIRECTIONS */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </GlobalErrorBoundary>
                </div>
              </BrowserRouter>
            </GlobalOverflowWrapper>
          </TooltipProvider>
          <Toaster />
          <Sonner />
        </HelmetProvider>
      </StrictMode>
    </QueryClientProvider>
  );
};

export default App;