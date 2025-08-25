import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

console.log('🔄 Step 5: Testing UXToolbar (suspect #1)');

// Import du premier suspect
let UXToolbar;
try {
  UXToolbar = require('@/components/ux/UXToolbar').default;
  console.log('✅ UXToolbar loaded successfully');
} catch (error) {
  console.log('❌ UXToolbar failed to load:', error);
  UXToolbar = () => <div style={{color: 'red'}}>UXToolbar failed to load</div>;
}

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
      <p style={{ fontSize: '1.2rem', color: '#ccc' }}>Step 5: Testing UXToolbar</p>
    </div>
    
    <div style={{ padding: '1rem', border: '1px solid #444', borderRadius: '0.5rem' }}>
      <UXToolbar />
    </div>
    
    <p style={{ fontSize: '1rem', color: '#999' }}>
      If you see this without errors, UXToolbar is not the culprit
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
