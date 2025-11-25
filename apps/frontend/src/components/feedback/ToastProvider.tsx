import React, { createContext, useContext, useCallback } from 'react';
import { toast as originalToast } from '@/hooks/use-toast';
import { useAccessibility } from '@/components/ui/AccessibilityProvider';

interface ToastContextType {
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastFeedback = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastFeedback must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { announceToScreenReader } = useAccessibility();

  const showToast = useCallback((
    message: string,
    title: string,
    variant: 'default' | 'destructive'
  ) => {
    originalToast({
      title,
      description: message,
      variant
    });

    // Announce to screen readers
    announceToScreenReader(`${title}: ${message}`);
  }, [announceToScreenReader]);

  const showSuccess = useCallback((message: string, title = 'Succès') => {
    showToast(message, title, 'default');
  }, [showToast]);

  const showError = useCallback((message: string, title = 'Erreur') => {
    showToast(message, title, 'destructive');
  }, [showToast]);

  const showWarning = useCallback((message: string, title = 'Attention') => {
    showToast(message, title, 'default');
  }, [showToast]);

  const showInfo = useCallback((message: string, title = 'Information') => {
    showToast(message, title, 'default');
  }, [showToast]);

  return (
    <ToastContext.Provider value={{
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
    </ToastContext.Provider>
  );
};