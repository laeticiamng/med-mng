import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UXToolbar } from '@/components/ux/UXToolbar';

console.log('🔄 Step 7: Testing UXToolbar with proper ES6 import');

const TestPage = () => {
  return (
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
        <p style={{ fontSize: '1.2rem', color: '#ccc' }}>Step 7: UXToolbar with ES6 import</p>
      </div>
      
      <div style={{ 
        padding: '1rem', 
        border: '1px solid #444', 
        borderRadius: '0.5rem',
        position: 'relative',
        width: '300px',
        height: '200px'
      }}>
        <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '1rem' }}>
          UXToolbar should appear in bottom-right corner:
        </p>
        <UXToolbar />
      </div>
      
      <p style={{ fontSize: '1rem', color: '#999' }}>
        If you see toolbar buttons, the problem is SOLVED! 🎉
      </p>
    </div>
  );
};

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
