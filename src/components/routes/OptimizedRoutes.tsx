/**
 * 🚀 OPTIMIZED ROUTES - MED-MNG v3.0 PREMIUM
 * Système de routage optimisé et consolidé
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

// Lazy loading optimisé pour tous les composants
const HomePage = React.lazy(() => import('@/pages/Index'));
const Dashboard = React.lazy(() => import('@/components/premium/UltimateDashboard').then(module => ({ default: module.UltimateDashboard })));
const MedicalDataManager = React.lazy(() => import('@/components/medical/MedicalDataManager').then(module => ({ default: module.MedicalDataManager })));
const SystemOptimizer = React.lazy(() => import('@/components/optimization/SystemOptimizer').then(module => ({ default: module.SystemOptimizer })));
const DebugCleaner = React.lazy(() => import('@/components/cleanup/DebugCleaner').then(module => ({ default: module.DebugCleaner })));

// Pages MED-MNG consolidées
const MedMngLogin = React.lazy(() => import('@/pages/med-mng/Login').then(module => ({ default: module.Login })));
const MedMngPricing = React.lazy(() => import('@/pages/med-mng/Pricing').then(module => ({ default: module.Pricing })));
const MedMngLibrary = React.lazy(() => import('@/pages/med-mng/Library'));
const MedMngSettings = React.lazy(() => import('@/pages/med-mng/Settings'));

// Composant de protection des routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/med-mng/login" replace />;
};

// Loading fallback optimisé
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto animate-pulse">
        <span className="text-white font-bold">M</span>
      </div>
      <div className="text-lg font-medium text-foreground">Chargement MED-MNG...</div>
      <div className="w-32 h-1 bg-secondary rounded-full mx-auto overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-pink-500 to-purple-600 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export const OptimizedRoutes: React.FC = () => {
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Routes Publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/med-mng/login" element={<MedMngLogin />} />
        <Route path="/med-mng/pricing" element={<MedMngPricing />} />
        
        {/* Routes Protégées - Dashboard Premium */}
        <Route path="/med-mng/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Routes Protégées - Fonctionnalités */}
        <Route path="/med-mng/library" element={
          <ProtectedRoute>
            <MedMngLibrary />
          </ProtectedRoute>
        } />
        
        <Route path="/med-mng/settings" element={
          <ProtectedRoute>
            <MedMngSettings />
          </ProtectedRoute>
        } />
        
        <Route path="/med-mng/data" element={
          <ProtectedRoute>
            <MedicalDataManager />
          </ProtectedRoute>
        } />
        
        {/* Routes Admin - Optimisation */}
        <Route path="/admin/optimizer" element={
          <ProtectedRoute>
            <SystemOptimizer />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/cleaner" element={
          <ProtectedRoute>
            <DebugCleaner />
          </ProtectedRoute>
        } />
        
        {/* Redirections consolidées */}
        <Route path="/dashboard" element={<Navigate to="/med-mng/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/med-mng/login" replace />} />
        <Route path="/pricing" element={<Navigate to="/med-mng/pricing" replace />} />
        
        {/* Route 404 optimisée */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">404</h1>
              <p className="text-muted-foreground">Page non trouvée</p>
              <button 
                onClick={() => window.history.back()} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Retour
              </button>
            </div>
          </div>
        } />
      </Routes>
    </React.Suspense>
  );
};