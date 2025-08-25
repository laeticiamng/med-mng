import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

console.log('🔄 Step 6: Testing corrected UXToolbar');

const TestPage = () => {
  // Test direct import of UXToolbar
  let toolbarComponent;
  try {
    const { UXToolbar } = require('@/components/ux/UXToolbar');
    console.log('✅ UXToolbar imported successfully');
    toolbarComponent = <UXToolbar />;
  } catch (error) {
    console.error('❌ UXToolbar import failed:', error);
    toolbarComponent = (
      <div style={{color: 'red', padding: '1rem', border: '1px solid red'}}>
        UXToolbar import failed: {error.message}
      </div>
    );
  }

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
        <p style={{ fontSize: '1.2rem', color: '#ccc' }}>Step 6: Testing corrected UXToolbar</p>
      </div>
      
      <div style={{ padding: '1rem', border: '1px solid #444', borderRadius: '0.5rem' }}>
        {toolbarComponent}
      </div>
      
      <p style={{ fontSize: '1rem', color: '#999' }}>
        If UXToolbar appears, the problem is solved!
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
