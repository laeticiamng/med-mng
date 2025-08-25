import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Test avec Index progressivement
const SimpleIndex = () => {
  console.log('SimpleIndex rendering...');
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
      <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h1 className="text-4xl font-bold mb-4">MED-MNG</h1>
        <p className="text-gray-300 mb-6">Plateforme d'apprentissage médical</p>
        <button 
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
          onClick={() => window.location.href = '/dashboard'}
        >
          Accéder au Dashboard
        </button>
      </div>
    </div>
  );
};

// Simple loading fallback
const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="text-white">Chargement...</div>
  </div>
);

const App = () => {
  console.log('App component rendering...');
  
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<SimpleIndex />} />
            <Route path="*" element={<SimpleIndex />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
};

export default App;