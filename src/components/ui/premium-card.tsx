import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PremiumCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'glow' | 'gradient';
  colorScheme?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  variant = 'default',
  colorScheme,
  hover = false,
  className,
  onClick
}) => {
  return (
    <Card 
      className={cn(
        'transition-all duration-200',
        hover && 'hover:shadow-lg hover:scale-[1.02] cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Card>
  );
};