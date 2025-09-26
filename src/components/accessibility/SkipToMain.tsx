import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SkipToMainProps {
  className?: string;
  targetId?: string;
}

export const SkipToMain: React.FC<SkipToMainProps> = ({ 
  className,
  targetId = 'main-content' 
}) => {
  const handleSkipToMain = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const mainContent = document.getElementById(targetId) || 
                       document.querySelector('main') || 
                       document.querySelector('[role="main"]');
    
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
      
      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = 'Navigation vers le contenu principal';
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  };

  return (
    <Button
      onClick={handleSkipToMain}
      className={cn(
        // Positioning - invisible until focused
        "fixed top-4 left-4 z-[9999]",
        "translate-y-[-100vh] focus:translate-y-0",
        "transition-transform duration-200",
        // Styling
        "bg-primary text-primary-foreground",
        "px-4 py-2 text-sm font-medium",
        "border border-primary-foreground/20",
        "shadow-lg",
        // Screen reader and keyboard
        "sr-only focus:not-sr-only",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      tabIndex={0}
    >
      Aller au contenu principal
    </Button>
  );
};

export default SkipToMain;