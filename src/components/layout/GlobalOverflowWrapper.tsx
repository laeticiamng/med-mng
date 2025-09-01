import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface GlobalOverflowWrapperProps {
  children: React.ReactNode;
  className?: string;
  enableDebug?: boolean;
}

export const GlobalOverflowWrapper: React.FC<GlobalOverflowWrapperProps> = ({
  children,
  className,
  enableDebug = false,
}) => {
  
  // Application des correctifs globaux au montage - VERSION ULTRA-AGRESSIVE
  useEffect(() => {
    // Application des classes de sécurité à TOUS les éléments
    const applyOverflowFixes = () => {
      // TOUS les éléments sans exception - FORCE BRUTE MAXIMALE
      document.querySelectorAll('*').forEach(el => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.tagName !== 'SVG' && htmlEl.tagName !== 'PATH' && htmlEl.tagName !== 'CIRCLE') {
          htmlEl.style.maxWidth = '100%';
          htmlEl.style.wordWrap = 'break-word';
          htmlEl.style.overflowWrap = 'anywhere';
          htmlEl.style.overflowX = 'hidden';
          htmlEl.style.wordBreak = 'break-all';
          htmlEl.style.contain = 'layout style';
          htmlEl.style.lineBreak = 'anywhere';
          htmlEl.style.hyphens = 'auto';
          htmlEl.style.whiteSpace = 'pre-wrap';
          // Force sur les styles calculés
          if (htmlEl.offsetWidth > window.innerWidth) {
            htmlEl.style.width = '100%';
            htmlEl.style.maxWidth = '100vw';
          }
        }
      });
      
      // TOUS les éléments textuels - COUPURE ULTRA-AGRESSIVE
      document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, section, article, header, footer, nav, aside, a, button, label').forEach(el => {
        const htmlEl = el as HTMLElement;
        el.classList.add('text-container', 'break-words-force', 'overflow-safe', 'emergency-no-overflow', 'emergency-fix');
        htmlEl.style.maxWidth = '100%';
        htmlEl.style.wordWrap = 'break-word';
        htmlEl.style.overflowWrap = 'anywhere';
        htmlEl.style.overflowX = 'hidden';
        htmlEl.style.wordBreak = 'break-all';
        htmlEl.style.whiteSpace = 'pre-wrap';
        htmlEl.style.lineBreak = 'anywhere';
        htmlEl.style.hyphens = 'auto';
        // Force la largeur si débordement détecté
        if (htmlEl.scrollWidth > htmlEl.clientWidth) {
          htmlEl.style.width = 'auto';
          htmlEl.style.maxWidth = '95vw';
        }
      });
      
      // Boutons et éléments interactifs - PROTECTION RENFORCÉE
      document.querySelectorAll('button, [role="button"], a, input, textarea, select').forEach(el => {
        const htmlEl = el as HTMLElement;
        el.classList.add('overflow-safe', 'text-container', 'break-words-force');
        htmlEl.style.maxWidth = '100%';
        htmlEl.style.overflow = 'hidden';
        htmlEl.style.wordWrap = 'break-word';
      });
      
      // TOUS les conteneurs - VERROUILLAGE TOTAL
      document.querySelectorAll('[class*="bg-gradient"], .card, [class*="card"], [class*="container"], [class*="wrapper"]').forEach(el => {
        const htmlEl = el as HTMLElement;
        el.classList.add('overflow-safe');
        htmlEl.style.maxWidth = '100%';
        htmlEl.style.overflowX = 'hidden';
      });
      
      // Conteneurs flex et grid - AUCUNE FUITE
      document.querySelectorAll('[class*="flex"], [class*="grid"]').forEach(el => {
        const htmlEl = el as HTMLElement;
        el.classList.add('overflow-safe');
        htmlEl.style.maxWidth = '100%';
        htmlEl.style.overflowX = 'hidden';
        // Appliquer aux enfants aussi
        el.querySelectorAll('*').forEach(child => {
          const childHtmlEl = child as HTMLElement;
          childHtmlEl.style.maxWidth = '100%';
          childHtmlEl.style.wordWrap = 'break-word';
        });
      });
      
      // Éléments positionnés - SÉCURITÉ ABSOLUE
      document.querySelectorAll('[style*="transform"], [class*="absolute"], [class*="fixed"]').forEach(el => {
        const htmlEl = el as HTMLElement;
        el.classList.add('overflow-safe');
        htmlEl.style.maxWidth = 'calc(100vw - 2rem)';
      });
    };
    
    // Application initiale
    applyOverflowFixes();
    
      // Observer les changements du DOM avec intervention immédiate
      const observer = new MutationObserver((mutations) => {
        let shouldApplyFixes = false;
        
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            shouldApplyFixes = true;
            // Application immédiate sur les nouveaux éléments
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                if (el.tagName !== 'SVG' && el.tagName !== 'PATH') {
                  el.style.maxWidth = '100%';
                  el.style.overflowX = 'hidden';
                  el.style.wordBreak = 'break-all';
                  el.style.overflowWrap = 'anywhere';
                }
              }
            });
          }
        });
        
        if (shouldApplyFixes) {
          setTimeout(applyOverflowFixes, 10); // Application plus rapide
        }
      });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Mode debug pour identifier les problèmes
  useEffect(() => {
    if (enableDebug) {
      document.documentElement.classList.add('debug-overflow');
    } else {
      document.documentElement.classList.remove('debug-overflow');
    }
    
    return () => {
      document.documentElement.classList.remove('debug-overflow');
    };
  }, [enableDebug]);
  
  return (
    <div 
      className={cn(
        'overflow-safe',
        'w-full',
        'max-w-full',
        'min-h-screen',
        className
      )}
      style={{
        maxWidth: '100vw',
        overflowX: 'hidden',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
      }}
    >
      {children}
    </div>
  );
};