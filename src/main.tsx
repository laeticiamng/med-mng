import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

console.log('🔄 Step 2: Testing React + React Router (no TooltipProvider)');

const TestPage = () => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center'
  }}>
    <div>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>MED-MNG</h1>
      <p style={{ fontSize: '1.2rem', color: '#ccc' }}>Step 2: React + Router Test</p>
      <p style={{ fontSize: '1rem', color: '#999', marginTop: '2rem' }}>
        If you see this, React + Router work without TooltipProvider
      </p>
    </div>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestPage />} />
        <Route path="*" element={<TestPage />} />
      </Routes>
    </BrowserRouter>
  );
};

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
