/**
 * Barrel exports pour les hooks du projet
 * Centralise l'accès aux hooks personnalisés
 */

// Core hooks
export { useLocalStorage } from './useLocalStorage';
export { useDebounce } from './useDebounce';
export { useMediaQuery } from './useMediaQuery';
export { useKeyboardShortcuts } from './useKeyboardShortcuts';

// Business logic hooks
export { useAuth } from './useAuth';
export { usePlayer } from './usePlayer';
export { useGeneration } from './useGeneration';
export { usePanicMonitor } from './usePanicMonitor';
// export { useItemsWithCompleteness } from './useItemsWithCompleteness';

// Error handling
export { useErrorHandler } from './unified/useErrorHandler';

// Performance hooks
export { useOptimizedRender } from './useOptimizedRender';
export { useIntersectionObserver } from './useIntersectionObserver';

// Music orchestration hooks
export { useMusicQueue } from './music/useMusicQueue';
export { useMusicJob } from './music/useMusicJob';

// EDN progression
export { useEdnProgressionData } from './edn/useEdnProgressionData';

// Unified content library
export { useContentLibrary } from './library/useContentLibrary';

// Analytics
export { useAnalyticsConsent } from './analytics/useAnalyticsConsent';
export { useAnalyticsDashboard } from './analytics/useAnalyticsDashboard';