import React from 'react';
import { cn } from '@/lib/utils';

interface TouchTargetWrapperProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
}

export const TouchTargetWrapper: React.FC<TouchTargetWrapperProps> = ({
  children,
  className,
  size = 'md',
  clickable = false
}) => {
  const sizeClasses = {
    sm: 'min-h-[40px] min-w-[40px]',
    md: 'min-h-[44px] min-w-[44px]',
    lg: 'min-h-[48px] min-w-[48px]'
  };

  return (
    <div
      className={cn(
        'touch-target flex items-center justify-center',
        sizeClasses[size],
        clickable && 'cursor-pointer hover:bg-muted/50 rounded-lg transition-colors',
        className
      )}
    >
      {children}
    </div>
  );
};