import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/hooks/useAccessibility';
import { logger } from '@/utils/logger';
import { Keyboard, Eye, Volume2, MousePointer } from 'lucide-react';

interface AccessibilityEnhancementsProps {
  children: React.ReactNode;
}

export const AccessibilityEnhancements: React.FC<AccessibilityEnhancementsProps> = ({ 
  children 
}) => {
  const { 
    preferences,
    updatePreference,
    announceToScreenReader 
  } = useAccessibility();

  // Initialize accessibility features
  useEffect(() => {
    logger.info('Accessibility enhancements initialized', 'AccessibilityEnhancements');
    
    // Check for user preferences
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersHighContrast) {
      updatePreference('highContrast', true);
    }
    
    if (prefersReducedMotion) {
      updatePreference('reduceMotion', true);
    }
  }, [updatePreference]);

  return (
    <div className="accessibility-enhanced">
      {/* Accessibility toolbar */}
      <div 
        className="fixed top-4 right-4 z-50 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg"
        role="toolbar"
        aria-label="Outils d'accessibilité"
      >
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updatePreference('highContrast', !preferences.highContrast)}
            aria-label="Activer le contraste élevé"
            title="Contraste élevé"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updatePreference('reduceMotion', !preferences.reduceMotion)}
            aria-label="Réduire les animations"
            title="Réduire les animations"
          >
            <MousePointer className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const synth = window.speechSynthesis;
              const utterance = new SpeechSynthesisUtterance(
                "MED-MNG - Plateforme médicale accessible"
              );
              utterance.lang = 'fr-FR';
              synth.speak(utterance);
            }}
            aria-label="Lecture audio de la page"
            title="Lecture audio"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const skipLink = document.querySelector('[data-skip-link]') as HTMLElement;
              if (skipLink) {
                skipLink.focus();
                announceToScreenReader('Navigation vers le contenu principal');
              }
            }}
            aria-label="Navigation au clavier"
            title="Navigation clavier"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Skip to main content link */}
      <a
        href="#main-content"
        data-skip-link
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
        onFocus={() => announceToScreenReader('Lien d\'accès rapide au contenu principal')}
      >
        Aller au contenu principal
      </a>

      {/* Main content with accessibility enhancements */}
      <div id="main-content" role="main">
        {children}
      </div>

      {/* Live region for screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="accessibility-announcements"
      />
    </div>
  );
};