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
  
  // Application des correctifs globaux au montage
  useEffect(() => {
    // Application des classes de sécurité à tous les éléments critiques
    const applyOverflowFixes = () => {
      // Titres et headers
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
        el.classList.add('text-container', 'break-words-force', 'overflow-safe');
      });
      
      // Éléments avec du texte
      document.querySelectorAll('p, span, div[class*="text-"]').forEach(el => {
        if (!el.classList.contains('text-container')) {
          el.classList.add('text-container', 'break-words-normal', 'overflow-safe');
        }
      });
      
      // Boutons et éléments interactifs
      document.querySelectorAll('button, [role="button"]').forEach(el => {
        el.classList.add('overflow-safe', 'text-container');
      });
      
      // Cartes et conteneurs avec gradients
      document.querySelectorAll('[class*="bg-gradient"], .card, [class*="card"]').forEach(el => {
        el.classList.add('overflow-safe');
      });
      
      // Conteneurs flex et grid
      document.querySelectorAll('[class*="flex"], [class*="grid"]').forEach(el => {
        el.classList.add('overflow-safe');
      });
      
      // Éléments avec transform ou position absolute
      document.querySelectorAll('[style*="transform"], [class*="absolute"]').forEach(el => {
        el.classList.add('overflow-safe');
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