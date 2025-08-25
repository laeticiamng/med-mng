import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

console.log('🔄 Step 4: Testing actual Tooltip usage');

const TestPage = () => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    flexDirection: 'column',
    gap: '2rem'
  }}>
    <div>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>MED-MNG</h1>
      <p style={{ fontSize: '1.2rem', color: '#ccc' }}>Step 4: Testing actual Tooltip</p>
    </div>
    
    <Tooltip>
      <TooltipTrigger asChild>
        <button style={{
          backgroundColor: '#6366f1',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer'
        }}>
          Hover me for tooltip
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This tooltip works!</p>
      </TooltipContent>
    </Tooltip>
    
    <p style={{ fontSize: '1rem', color: '#999' }}>
      If you see this and can hover the button, Tooltip is fully working
    </p>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<TestPage />} />
          <Route path="*" element={<TestPage />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
};

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
