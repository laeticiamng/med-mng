
import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { AuthProvider } from "./components/med-mng/AuthProvider";
import { DevModeIndicator } from "./components/dev/DevModeIndicator";
import Index from "./pages/Index";

const queryClient = new QueryClient();

// Test avec DevModeIndicator - probablement le vrai coupable
const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <GlobalAudioProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <DevModeIndicator />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </GlobalAudioProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
