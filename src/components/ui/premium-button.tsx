
import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-primary via-primary-hover to-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-border shadow-lg';
      case 'accent':
        return 'bg-gradient-to-r from-accent via-accent-hover to-accent text-accent-foreground hover:opacity-90 shadow-lg shadow-accent/25';
      case 'glass':
        return 'bg-card/60 backdrop-blur-md text-foreground hover:bg-card/80 border border-border shadow-lg';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm rounded-lg';
      case 'md':
        return 'px-6 py-3 text-base rounded-xl';
      case 'lg':
        return 'px-8 py-4 text-lg rounded-xl';
      case 'xl':
        return 'px-10 py-5 text-xl rounded-2xl';
    }
  };

  return (
    <button
      className={cn(
        'font-semibold transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-0.5 active:scale-95',
        getVariantClasses(),
        getSizeClasses(),
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
