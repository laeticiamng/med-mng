/**
 * 🔗 SKIP LINKS - MED-MNG v3.0
 * Liens de saut pour navigation rapide accessible
 */

import React from 'react';
import { useAccessibility } from './AccessibilityProvider';

// ==========================================
// TYPES
// ==========================================

interface SkipLink {
  id: string;
  label: string;
  target: string;
  shortcut?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export const SkipLinks: React.FC = () => {
  const { preferences, announce } = useAccessibility();

  const skipLinks: SkipLink[] = [
    {
      id: 'skip-to-main',
      label: 'Aller au contenu principal',
      target: '#main-content',
      shortcut: 'Alt+1'
    },
    {
      id: 'skip-to-nav',
      label: 'Aller à la navigation',
      target: '#main-navigation',
      shortcut: 'Alt+2'
    },
    {
      id: 'skip-to-search',
      label: 'Aller à la recherche',
      target: '#search',
      shortcut: 'Alt+3'
    },
    {
      id: 'skip-to-footer',
      label: 'Aller au pied de page',
      target: '#footer',
      shortcut: 'Alt+4'
    }
  ];

  const handleSkipClick = (link: SkipLink, event: React.MouseEvent) => {
    event.preventDefault();
    
    const target = document.querySelector(link.target) as HTMLElement;
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      announce(`Navigation vers ${link.label.toLowerCase()}`);
    }
  };

  return (
    <nav 
      aria-label="Liens de navigation rapide"
      className="skip-links"
    >
      <ul className="skip-links-list">
        {skipLinks.map((link) => (
          <li key={link.id}>
            <a
              href={link.target}
              className="skip-link"
              onClick={(e) => handleSkipClick(link, e)}
              onFocus={() => announce(`Lien de saut: ${link.label}`)}
            >
              {link.label}
              {link.shortcut && (
                <span className="skip-link-shortcut">
                  ({link.shortcut})
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
      
      <style>{`
        .skip-links {
          position: fixed;
          top: -100px;
          left: 0;
          right: 0;
          z-index: 1000;
          background: hsl(var(--background));
          border-bottom: 2px solid hsl(var(--primary));
          padding: 1rem;
          transform: translateY(-100%);
          transition: transform 0.3s ease;
        }
        
        .skip-links:focus-within {
          transform: translateY(0);
        }
        
        .skip-links-list {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .skip-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          text-decoration: none;
          border-radius: var(--radius);
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }
        
        .skip-link:hover,
        .skip-link:focus {
          background: hsl(var(--primary-hover));
          border-color: hsl(var(--ring));
          outline: none;
          box-shadow: 0 0 0 2px hsl(var(--ring));
        }
        
        .skip-link-shortcut {
          font-size: 0.75rem;
          opacity: 0.8;
          font-weight: normal;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .skip-links {
            transition: none;
          }
          .skip-link {
            transition: none;
          }
        }
        
        @media (max-width: 640px) {
          .skip-links-list {
            flex-direction: column;
          }
          
          .skip-link {
            justify-content: center;
          }
        }
      `}</style>
    </nav>
  );
};