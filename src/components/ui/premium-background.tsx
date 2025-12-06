
import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'purple' | 'amber' | 'emerald';
  className?: string;
}

export const PremiumBackground: React.FC<PremiumBackgroundProps> = ({
  children,
  variant = 'default',
  className
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'blue':
        return 'from-background via-primary/5 to-primary/10';
      case 'purple':
        return 'from-background via-accent/5 to-accent/10';
      case 'amber':
        return 'from-background via-warning/5 to-warning/10';
      case 'emerald':
        return 'from-background via-success/5 to-success/10';
      default:
        return 'from-background via-primary/5 to-accent/5';
    }
  };

  return (
    <div className={cn(
      'min-h-screen relative overflow-hidden',
      `bg-gradient-to-br ${getVariantClasses()}`,
      className
    )}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-r from-accent/20 to-success/20 rounded-full blur-3xl animate-pulse-glow animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl animate-pulse-glow animation-delay-2000"></div>
      </div>
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-background/30 backdrop-blur-[0.5px]"></div>
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
