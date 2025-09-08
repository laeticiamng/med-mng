/**
 * 🚀 APPLICATION MED-MNG v2.0 - ARCHITECTURE OPTIMISÉE
 * Refactoring complet pour de meilleures performances et maintenabilité
 */

import React, { StrictMode, memo, useEffect } from 'react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// Production optimizer - Auto-initialisation
import '@/utils/productionOptimizer';
import '@/utils/premiumCleaner';
import '@/utils/consoleReplacer';

// Composants refactorisés
import AppProviders from '@/components/app/AppProviders';
import AppRoutes from '@/components/app/AppRoutes';

// Utilitaires optimisés
import { logger } from '@/lib/logger';
import { useRenderMonitor } from '@/hooks/usePerformanceOptimizer';

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
  const { logPerformance } = useRenderMonitor('App');

  useEffect(() => {
    logger.info('app', '🚀 MED-MNG Application v3.0 initialized with performance optimizations');
    logPerformance('App startup completed');
  }, [logPerformance]);

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