import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const SkipLinks = () => {
  const skipToContent = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const skipToNavigation = () => {
    const navigation = document.getElementById('main-navigation');
    if (navigation) {
      navigation.focus();
      navigation.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="fixed top-4 left-4 z-[9999] flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "bg-background border-2 border-primary",
            "focus:not-sr-only focus:absolute focus:top-0 focus:left-0",
            "focus:z-[10000] focus:p-2"
          )}
          onClick={skipToContent}
          onFocus={(e) => e.target.classList.remove('sr-only')}
          onBlur={(e) => e.target.classList.add('sr-only')}
        >
          Aller au contenu principal
        </Button>
        
        <Button
          variant="secondary" 
          size="sm"
          className={cn(
            "bg-background border-2 border-primary",
            "focus:not-sr-only focus:absolute focus:top-0 focus:left-32",
            "focus:z-[10000] focus:p-2"
          )}
          onClick={skipToNavigation}
          onFocus={(e) => e.target.classList.remove('sr-only')}
          onBlur={(e) => e.target.classList.add('sr-only')}
        >
          Aller à la navigation
        </Button>
      </div>
    </div>
  );
};

export default SkipLinks;