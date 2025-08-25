import React from 'react';
import { createRoot } from 'react-dom/client';

console.log('🔄 Step 1: Testing minimal React (no providers, no external components)');

const App = () => {
  return (
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
        <p style={{ fontSize: '1.2rem', color: '#ccc' }}>Step 1: Minimal React Test</p>
        <p style={{ fontSize: '1rem', color: '#999', marginTop: '2rem' }}>
          If you see this, React is working without TooltipProvider
        </p>
      </div>
    </div>
  );
};

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
