
import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import Index from "./pages/Index";

const queryClient = new QueryClient();

// Test avec GlobalAudioProvider
const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <GlobalAudioProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
          </Routes>
        </BrowserRouter>
      </GlobalAudioProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
