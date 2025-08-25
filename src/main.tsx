import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UXToolbar } from '@/components/ux/UXToolbar';
import EdnComplete from './pages/EdnComplete';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const HomePage = () => (
  <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">MED-MNG</h1>
      <p className="text-xl text-muted-foreground">Plateforme d'apprentissage médical</p>
    </div>
  </div>
);

const App = () => {
  console.log('🚀 MED-MNG App loading...');
  
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <div className="min-h-screen">
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/edn" element={<EdnComplete />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </main>
              <UXToolbar />
            </div>
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
