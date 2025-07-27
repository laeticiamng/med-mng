import { useCallback } from 'react';

export const useAccessibilityAnnouncement = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Create a temporary element for screen reader announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const announceNavigation = useCallback((location: string) => {
    announce(`Navigation vers ${location}`, 'polite');
  }, [announce]);

  const announceAction = useCallback((action: string, result: 'success' | 'error') => {
    const message = result === 'success' 
      ? `${action} réalisé avec succès`
      : `Erreur lors de ${action}`;
    announce(message, 'assertive');
  }, [announce]);

  const announceLoading = useCallback((isLoading: boolean, context?: string) => {
    const message = isLoading 
      ? `Chargement ${context ? `de ${context}` : 'en cours'}`
      : `Chargement terminé`;
    announce(message, 'polite');
  }, [announce]);

  return {
    announce,
    announceNavigation,
    announceAction,
    announceLoading
  };
};