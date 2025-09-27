import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export const SkipToMain: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleFocus = () => setIsVisible(true);
  const handleBlur = () => setIsVisible(false);

  const skipToMain = () => {
    const mainElement = document.getElementById('main-content');
    if (mainElement) {
      mainElement.focus();
    }
  };

  return (
    <Button
      className={`fixed top-2 left-2 z-50 transition-transform duration-200 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } bg-primary text-primary-foreground`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={skipToMain}
      size="sm"
    >
      Aller au contenu principal
    </Button>
  );
};

export const FocusManager: React.FC = () => {
  useEffect(() => {
    let previouslyFocusedElement: HTMLElement | null = null;

    const handleModalOpen = () => {
      previouslyFocusedElement = document.activeElement as HTMLElement;
    };

    const handleModalClose = () => {
      if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const modal = document.querySelector('[role="dialog"]');
        if (modal) {
          const closeButton = modal.querySelector('[data-dismiss="modal"]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('modal:open', handleModalOpen);
    document.addEventListener('modal:close', handleModalClose);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('modal:open', handleModalOpen);
      document.removeEventListener('modal:close', handleModalClose);
    };
  }, []);

  return null;
};