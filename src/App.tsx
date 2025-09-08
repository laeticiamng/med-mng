import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { OptimizedMedMngApp } from "@/components/med-mng/OptimizedMedMngApp";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { StrictMode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <TooltipProvider>
            <AccessibilityProvider>
              <LanguageProvider>
                <Toaster />
                <BrowserRouter>
                  <OptimizedMedMngApp />
                </BrowserRouter>
              </LanguageProvider>
            </AccessibilityProvider>
          </TooltipProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </StrictMode>
  );
};

export default App;