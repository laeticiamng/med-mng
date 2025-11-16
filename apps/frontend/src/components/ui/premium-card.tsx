
import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass' | 'elevated';
  hover?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-card via-card/95 to-card/90 border border-border shadow-2xl';
      case 'glass':
        return 'bg-card/60 backdrop-blur-xl border border-border/50 shadow-2xl';
      case 'elevated':
        return 'bg-card border border-border shadow-2xl';
      default:
        return 'bg-card/80 backdrop-blur-sm border border-border shadow-xl';
    }
  };

  const hoverClasses = hover 
    ? 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1' 
    : '';

  return (
    <div 
      className={cn(
        'rounded-2xl transition-all duration-500 ease-out',
        getVariantClasses(),
        hoverClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
