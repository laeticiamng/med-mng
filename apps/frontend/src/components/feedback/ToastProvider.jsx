import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast as sonnerToast } from 'sonner';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, options = {}) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 3000,
      ...options
    };

    setToasts(prev => [...prev, newToast]);
    
    // Use sonner for actual display
    sonnerToast[newToast.type](message, {
      duration: newToast.duration,
      ...options
    });

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, newToast.duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showSuccess = useCallback((message, options) => 
    showToast(message, { ...options, type: 'success' }), [showToast]);
  
  const showError = useCallback((message, options) => 
    showToast(message, { ...options, type: 'error' }), [showToast]);
  
  const showWarning = useCallback((message, options) => 
    showToast(message, { ...options, type: 'warning' }), [showToast]);
  
  const showInfo = useCallback((message, options) => 
    showToast(message, { ...options, type: 'info' }), [showToast]);

  return (
    <ToastContext.Provider value={{
      toasts,
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      removeToast
    }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastProvider = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastProvider must be used within ToastProvider');
  }
  return context;
};