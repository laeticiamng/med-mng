import React from 'react';
import { PremiumNavigation } from '@/components/navigation/PremiumNavigation';
import { cn } from '@/lib/utils';

interface PremiumLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PremiumLayout: React.FC<PremiumLayoutProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className="min-h-screen bg-background">
      <PremiumNavigation />
      
      {/* Main Content Area */}
      <div className="lg:pl-80">
        <main 
          className={cn(
            "min-h-screen transition-all duration-300",
            className
          )}
        >
          {children}
        </main>
      </div>
      
      {/* Mobile Spacing for Bottom Nav */}
      <div className="h-16 lg:hidden" />
    </div>
  );
};