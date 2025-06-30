
import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass' | 'elevated';
  hover?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-white via-white/95 to-white/90 border border-white/20 shadow-2xl shadow-black/5';
      case 'glass':
        return 'bg-white/60 backdrop-blur-xl border border-white/30 shadow-2xl shadow-black/10';
      case 'elevated':
        return 'bg-white border border-gray-100/50 shadow-2xl shadow-black/5';
      default:
        return 'bg-white/80 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5';
    }
  };

  const hoverClasses = hover 
    ? 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1' 
    : '';

  return (
    <div className={cn(
      'rounded-2xl transition-all duration-500 ease-out',
      getVariantClasses(),
      hoverClasses,
      className
    )}>
      {children}
    </div>
  );
};
