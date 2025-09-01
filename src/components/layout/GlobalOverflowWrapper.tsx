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
      // TOUS les éléments sans exception - FORCE BRUTE
      document.querySelectorAll('*').forEach(el => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.tagName !== 'SVG' && htmlEl.tagName !== 'PATH') {
          htmlEl.style.maxWidth = '100%';
          htmlEl.style.wordWrap = 'break-word';
          htmlEl.style.overflowWrap = 'break-word';
          htmlEl.style.overflowX = 'hidden';
          htmlEl.style.wordBreak = 'break-word';
          htmlEl.style.contain = 'layout style';
        }
      });
      
      // TOUS les éléments textuels sans exception
      document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, section, article, header, footer, nav, aside').forEach(el => {
        const htmlEl = el as HTMLElement;
        el.classList.add('text-container', 'break-words-force', 'overflow-safe', 'emergency-no-overflow');
        htmlEl.style.maxWidth = '100%';
        htmlEl.style.wordWrap = 'break-word';
        htmlEl.style.overflowWrap = 'break-word';
        htmlEl.style.overflowX = 'hidden';
        htmlEl.style.wordBreak = 'break-all';
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
    
    // Observer les changements du DOM
    const observer = new MutationObserver((mutations) => {
      let shouldApplyFixes = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldApplyFixes = true;
        }
      });
      
      if (shouldApplyFixes) {
        setTimeout(applyOverflowFixes, 100);
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