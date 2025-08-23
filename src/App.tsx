import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EdnComplete from './pages/EdnComplete';
import { SimpleAuthProvider } from './components/med-mng/SimpleAuthProvider';
import { SimpleLanguageProvider } from './contexts/SimpleLanguageContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  console.log('🚀 App rendering...');
  
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <SimpleLanguageProvider>
          <SimpleAuthProvider>
            <BrowserRouter>
              <div className="min-h-screen">
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/edn" element={<EdnComplete />} />
                    <Route path="/edn-complete" element={<Navigate to="/edn" replace />} />
                    <Route path="*" element={<div>404 Not Found</div>} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </SimpleAuthProvider>
        </SimpleLanguageProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;