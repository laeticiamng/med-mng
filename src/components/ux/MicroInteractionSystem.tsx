import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface MicroInteractionProps {
  children: React.ReactNode;
  type: 'hover-lift' | 'press-scale' | 'focus-glow' | 'ripple' | 'shake' | 'pulse' | 'bounce';
  disabled?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export const MicroInteraction: React.FC<MicroInteractionProps> = ({
  children,
  type,
  disabled = false,
  intensity = 'medium',
  className
}) => {
  const [isActive, setIsActive] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const elementRef = useRef<HTMLDivElement>(null);

  const intensityScale = {
    low: 0.5,
    medium: 1,
    high: 1.5
  };

  const scale = intensityScale[intensity];

  const getInteractionClasses = () => {
    if (disabled) return '';
    
    const baseClasses = 'transition-all duration-200 ease-out will-change-transform';
    
    switch (type) {
      case 'hover-lift':
        return cn(
          baseClasses,
          'hover:translate-y-[-2px] hover:shadow-lg',
          scale > 1 && 'hover:translate-y-[-4px] hover:shadow-xl',
          scale < 1 && 'hover:translate-y-[-1px] hover:shadow-md'
        );
        
      case 'press-scale':
        return cn(
          baseClasses,
          'active:scale-95 hover:scale-105',
          scale > 1 && 'active:scale-90 hover:scale-110',
          scale < 1 && 'active:scale-98 hover:scale-102'
        );
        
      case 'focus-glow':
        return cn(
          baseClasses,
          'focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
          scale > 1 && 'focus:ring-4 focus:ring-primary/70',
          scale < 1 && 'focus:ring-1 focus:ring-primary/30'
        );
        
      case 'shake':
        return cn(
          baseClasses,
          isActive && 'animate-pulse'
        );
        
      case 'pulse':
        return cn(
          baseClasses,
          'animate-pulse hover:animate-none'
        );
        
      case 'bounce':
        return cn(
          baseClasses,
          'hover:animate-bounce'
        );
        
      default:
        return baseClasses;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || type !== 'ripple') return;
    
    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { id, x, y }]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  };

  const triggerShake = () => {
    if (type === 'shake') {
      setIsActive(true);
      setTimeout(() => setIsActive(false), 500);
    }
  };

  // Auto-trigger shake on specific events (can be customized)
  useEffect(() => {
    const handleError = () => triggerShake();
    if (type === 'shake') {
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }
  }, [type]);

  return (
    <div
      ref={elementRef}
      className={cn(
        'relative overflow-hidden',
        getInteractionClasses(),
        className
      )}
      onMouseDown={handleMouseDown}
      style={{ 
        transform: isActive && type === 'shake' ? 
          `translateX(${Math.sin(Date.now() / 100) * 2 * scale}px)` : undefined
      }}
    >
      {children}
      
      {/* Ripple effects */}
      {type === 'ripple' && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-primary/30 animate-ping pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20 * scale,
            height: 20 * scale,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

// Specialized components for common use cases
export const InteractiveButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'destructive';
  className?: string;
}> = ({ children, onClick, disabled, variant = 'primary', className }) => {
  return (
    <MicroInteraction type="press-scale" disabled={disabled}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none',
          variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
          variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {children}
      </button>
    </MicroInteraction>
  );
};

export const InteractiveCard: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className }) => {
  return (
    <MicroInteraction type="hover-lift" intensity="medium">
      <div
        onClick={onClick}
        className={cn(
          'bg-card border border-border rounded-lg p-4 cursor-pointer',
          'hover:border-primary/20 transition-colors',
          className
        )}
      >
        {children}
      </div>
    </MicroInteraction>
  );
};

export const PulsingIcon: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <MicroInteraction type="pulse" intensity="low">
      <div className={cn('inline-flex', className)}>
        {children}
      </div>
    </MicroInteraction>
  );
};

export const RippleButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className }) => {
  return (
    <MicroInteraction type="ripple" intensity="medium">
      <button
        onClick={onClick}
        className={cn(
          'relative px-6 py-3 bg-primary text-primary-foreground rounded-lg',
          'hover:bg-primary/90 transition-colors focus:outline-none',
          className
        )}
      >
        {children}
      </button>
    </MicroInteraction>
  );
};