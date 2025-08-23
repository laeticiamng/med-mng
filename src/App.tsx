import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EdnComplete from './pages/EdnComplete';

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
        <BrowserRouter>
          <div className="min-h-screen">
            <main>
              <Routes>
                <Route path="/" element={<div className="min-h-screen flex items-center justify-center bg-white"><h1 className="text-4xl font-bold text-black">Test Page - Application MED-MNG</h1></div>} />
                <Route path="/edn" element={<EdnComplete />} />
                <Route path="/edn-complete" element={<Navigate to="/edn" replace />} />
                <Route path="*" element={<div>404 Not Found</div>} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;