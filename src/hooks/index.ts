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

// Error handling
export { useErrorHandler } from './unified/useErrorHandler';

// Performance hooks
export { useOptimizedRender } from './useOptimizedRender';
export { useIntersectionObserver } from './useIntersectionObserver';