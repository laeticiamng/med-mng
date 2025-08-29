import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'glass' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  glow?: boolean;
  animation?: boolean;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  loading = false,
  icon,
  iconPosition = 'left',
  glow = false,
  animation = true,
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    const baseClasses = 'font-semibold transition-all duration-300 ease-out focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-gradient-primary text-primary-foreground hover:shadow-medium focus:ring-primary/20 ${glow ? 'shadow-glow hover:shadow-large' : ''}`;
      case 'secondary':
        return `${baseClasses} bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-border focus:ring-secondary/20`;
      case 'accent':
        return `${baseClasses} bg-gradient-accent text-accent-foreground hover:shadow-medium focus:ring-accent/20 ${glow ? 'shadow-accent-glow hover:shadow-large' : ''}`;
      case 'glass':
        return `${baseClasses} bg-white/10 backdrop-blur-md text-foreground hover:bg-white/20 border border-white/20 focus:ring-primary/20`;
      case 'outline':
        return `${baseClasses} border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-primary/20`;
      case 'ghost':
        return `${baseClasses} text-foreground hover:bg-muted focus:ring-muted/20`;
      case 'destructive':
        return `${baseClasses} bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive/20`;
      default:
        return baseClasses;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm rounded-lg min-h-[36px]';
      case 'md':
        return 'px-6 py-3 text-base rounded-xl min-h-[44px]';
      case 'lg':
        return 'px-8 py-4 text-lg rounded-xl min-h-[52px]';
      case 'xl':
        return 'px-10 py-5 text-xl rounded-2xl min-h-[60px]';
      default:
        return 'px-6 py-3 text-base rounded-xl min-h-[44px]';
    }
  };

  const getHoverClasses = () => {
    if (disabled || loading) return '';
    return 'hover:scale-105 hover:-translate-y-0.5 active:scale-95';
  };

  const buttonContent = (
    <button
      className={cn(
        'relative flex items-center justify-center gap-2 will-change-transform',
        getVariantClasses(),
        getSizeClasses(),
        getHoverClasses(),
        'touch-target',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      
      <span className={cn('flex-1', loading && 'opacity-70')}>
        {children}
      </span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );

  if (animation && !disabled && !loading) {
    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05, y: -2 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {buttonContent}
      </motion.div>
    );
  }

  return buttonContent;
};