/**
 * 🎯 FOCUS TRAP - MED-MNG v3.0
 * Piège de focus pour modales et menus accessibles
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from './AccessibilityProvider';

// ==========================================
// TYPES
// ==========================================

interface FocusTrapProps {
  children: React.ReactNode;
  active: boolean;
  restoreFocus?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  className?: string;
}

// ==========================================
// UTILITAIRES
// ==========================================

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
  'audio[controls]',
  'video[controls]',
  'summary',
  'iframe'
].join(',');

const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS))
    .filter((element) => {
      return element instanceof HTMLElement && 
             !element.hasAttribute('disabled') &&
             !element.getAttribute('aria-hidden') &&
             element.offsetParent !== null; // Visible
    }) as HTMLElement[];
};

// ==========================================
// COMPONENT
// ==========================================

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active,
  restoreFocus = true,
  initialFocus,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { announce, features } = useAccessibility();

  // Sauvegarder le focus précédent
  useEffect(() => {
    if (active) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [active]);

  // Gestion du piège de focus
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!active || !features.focusTrap || !containerRef.current) return;

    if (event.key === 'Tab') {
      const focusableElements = getFocusableElements(containerRef.current);
      
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      if (event.shiftKey) {
        // Tab + Shift (navigation arrière)
        if (activeElement === firstElement || !containerRef.current.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab seul (navigation avant)
        if (activeElement === lastElement || !containerRef.current.contains(activeElement)) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    // Échappement pour fermer
    if (event.key === 'Escape') {
      const escapeEvent = new CustomEvent('focustrap:escape', {
        bubbles: true,
        cancelable: true
      });
      containerRef.current?.dispatchEvent(escapeEvent);
    }
  }, [active, features.focusTrap]);

  // Gestion du focus initial
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    
    // Focus initial
    const setInitialFocus = () => {
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else {
        const focusableElements = getFocusableElements(container);
        const firstElement = focusableElements[0];
        
        if (firstElement) {
          firstElement.focus();
        } else {
          // Fallback sur le conteneur lui-même
          container.focus();
        }
      }
    };

    // Légère temporisation pour s'assurer que les éléments sont rendus
    const timeoutId = setTimeout(setInitialFocus, 10);
    
    return () => clearTimeout(timeoutId);
  }, [active, initialFocus]);

  // Écouteurs d'événements
  useEffect(() => {
    if (active && features.focusTrap) {
      document.addEventListener('keydown', handleKeyDown);
      announce('Zone de focus restreinte activée. Utilisez Tab pour naviguer, Échap pour sortir.');
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        
        // Restaurer le focus précédent
        if (restoreFocus && previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [active, features.focusTrap, handleKeyDown, announce, restoreFocus]);

  // Effet de nettoyage pour restaurer le focus
  useEffect(() => {
    return () => {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [restoreFocus]);

  return (
    <div
      ref={containerRef}
      className={`focus-trap ${active ? 'focus-trap--active' : ''} ${className}`}
      tabIndex={-1}
      data-focus-trap={active}
      role={active ? 'dialog' : undefined}
      aria-modal={active}
    >
      {children}
      
      <style>{`
        .focus-trap {
          outline: none;
        }
        
        .focus-trap--active {
          isolation: isolate;
        }
        
        /* Styles pour focus visible amélioré */
        .focus-trap--active *:focus {
          outline: 2px solid hsl(var(--ring));
          outline-offset: 2px;
          border-radius: var(--radius-sm);
        }
        
        /* Indicateurs de focus haute visibilité */
        [data-focus-indicators="high-visibility"] .focus-trap--active *:focus {
          outline: 4px solid hsl(var(--ring));
          outline-offset: 4px;
          box-shadow: 0 0 0 2px hsl(var(--background)), 
                      0 0 0 6px hsl(var(--ring));
        }
        
        /* Styles pour contraste élevé */
        .high-contrast .focus-trap--active *:focus {
          outline: 3px solid currentColor;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        
        @media (prefers-reduced-motion: reduce) {
          .focus-trap--active *:focus {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};