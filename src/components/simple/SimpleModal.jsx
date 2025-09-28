import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Pure JS Modal component - plus simple que Radix UI
function SimpleModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className,
  showCloseButton = true,
  closeOnOverlay = true,
  size = 'default'
}) {
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      
      // Focus premier élément focusable
      setTimeout(() => {
        const focusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }, 100);
    } else {
      // Restaurer le focus
      previousFocus.current?.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={cn(
          "relative w-full mx-4 bg-background rounded-lg shadow-xl border max-h-[90vh] overflow-hidden",
          sizeClasses[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}

// Hook pour gérer l'état du modal
export function useModal(initialState = false) {
  let isOpen = initialState;
  let setState = null;

  // Simple state pour les modales
  const [state, setIsOpen] = useState(initialState);
  
  useState(() => {
    isOpen = state;
    setState = setIsOpen;
  });

  const open = () => setState(true);
  const close = () => setState(false);
  const toggle = () => setState(!isOpen);

  return {
    isOpen,
    open,
    close,
    toggle
  };
}

export default SimpleModal;