import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'minimal';
  className?: string;
}

export const PremiumLayout: React.FC<PremiumLayoutProps> = ({ 
  children, 
  variant = 'default',
  className 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-primary/5 via-background to-secondary/5';
      case 'minimal':
        return 'bg-background';
      default:
        return 'bg-gradient-to-br from-background via-muted/20 to-background';
    }
  };

  return (
    <div className={cn(
      'min-h-screen',
      getVariantStyles(),
      className
    )}>
      {children}
    </div>
  );
};