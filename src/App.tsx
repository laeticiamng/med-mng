import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";

// ⚡ PAGES LAZY LOADED pour performances optimales
const Index = lazy(() => import("./pages/Index"));
const Generator = lazy(() => import("./pages/Generator"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Library = lazy(() => import("./pages/Library"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Help = lazy(() => import("./pages/Help"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Simple loading fallback
const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200/30 border-t-purple-400 mx-auto mb-6"></div>
      <p className="text-white font-medium text-lg mb-2">Chargement MED-MNG</p>
      <p className="text-gray-300 text-sm">Préparation de votre environnement d'apprentissage...</p>
    </div>
  </div>
);

const App = () => {
  console.log('App component rendering...');
  
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/generator" element={<Generator />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/library-new" element={<Library />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/help" element={<Help />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
};

export default App;