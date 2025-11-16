import React from 'react';
import { MedMngNavigation } from './MedMngNavigation';
import { MobileBottomNav } from './MobileBottomNav';

interface MedMngLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MedMngLayout: React.FC<MedMngLayoutProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <MedMngNavigation />
      
      {/* Main Content */}
      <main id="main-content" className={`flex-1 pb-20 md:pb-0 ${className}`} role="main" tabIndex={-1}>
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};