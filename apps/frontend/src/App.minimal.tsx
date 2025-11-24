import logger from '@/lib/logger';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
  logger.debug('🚀 App rendering...');
  
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen">
            <main>
              <Routes>
                <Route path="/" element={<div>Test Page</div>} />
                <Route path="/edn-complete" element={<EdnComplete />} />
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