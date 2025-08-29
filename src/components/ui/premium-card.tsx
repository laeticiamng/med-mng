import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass' | 'elevated' | 'glow';
  hover?: boolean;
  animation?: boolean;
  colorScheme?: 'primary' | 'accent' | 'success' | 'info' | 'warning' | 'destructive';
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
  animation = true,
  colorScheme = 'primary',
  ...props
}) => {
  const getVariantClasses = () => {
    const baseClasses = 'rounded-xl transition-all duration-300 ease-out';
    
    switch (variant) {
      case 'gradient':
        return `${baseClasses} bg-gradient-card border border-border/50 shadow-medium`;
      case 'glass':
        return `${baseClasses} bg-white/10 backdrop-blur-xl border border-white/20 shadow-large`;
      case 'elevated':
        return `${baseClasses} bg-card border border-border shadow-large`;
      case 'glow':
        return `${baseClasses} bg-gradient-card border border-${colorScheme}/20 shadow-${colorScheme}-glow`;
      default:
        return `${baseClasses} bg-card border border-border/50 shadow-soft`;
    }
  };

  const getHoverClasses = () => {
    if (!hover) return '';
    
    switch (variant) {
      case 'glow':
        return `hover:shadow-${colorScheme}-glow hover:scale-[1.02] hover:-translate-y-1 hover:border-${colorScheme}/40`;
      case 'glass':
        return 'hover:bg-white/20 hover:scale-[1.02] hover:-translate-y-1 hover:border-white/30';
      default:
        return 'hover:shadow-medium hover:scale-[1.02] hover:-translate-y-1 hover:border-primary/20';
    }
  };

  const cardContent = (
    <div 
      className={cn(
        getVariantClasses(),
        hover && getHoverClasses(),
        'will-change-transform gpu-accelerated',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );

  if (animation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
        whileTap={hover ? { scale: 0.98 } : undefined}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};