/**
 * 🚀 APPLICATION MED-MNG v2.0 - ARCHITECTURE OPTIMISÉE
 * Refactoring complet pour de meilleures performances et maintenabilité
 */

import React, { StrictMode, memo, useEffect } from 'react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// Composants refactorisés
import AppProviders from '@/components/app/AppProviders';
import AppRoutes from '@/components/app/AppRoutes';

// Utilitaires
import { logger } from '@/lib/logger';
import { usePerformanceMonitor } from '@/hooks/useOptimizedState';

// ==========================================
// COMPONENT KEYBOARD SHORTCUTS
// ==========================================

const AppKeyboardShortcuts = memo(() => {
  useKeyboardShortcuts(); // Appelé dans le contexte Router
  return null; // Ce composant fournit uniquement la fonctionnalité clavier
});

AppKeyboardShortcuts.displayName = 'AppKeyboardShortcuts';

// ==========================================
// APPLICATION PRINCIPALE
// ==========================================

const AppWithUX = memo(() => {
  const { logRender } = usePerformanceMonitor('App');

  useEffect(() => {
    logger.info('app', 'MED-MNG Application initialized');
  }, []);

  // Log chaque render pour le monitoring
  logRender();

  return (
    <AppProviders>
      <StrictMode>
        <AppKeyboardShortcuts />
        <AppRoutes className="overflow-safe" />
        <Sonner richColors closeButton />
      </StrictMode>
    </AppProviders>
  );
});

AppWithUX.displayName = 'AppWithUX';

// ==========================================
// EXPORT PRINCIPAL
// ==========================================

const App = AppWithUX;
export default App;