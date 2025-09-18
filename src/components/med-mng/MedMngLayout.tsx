import React from 'react';
import { MedMngNavigation } from './MedMngNavigation';
import { MobileBottomNav } from './MobileBottomNav';
import { MusicGenerationStatusBar } from '@/components/music/MusicGenerationStatusBar';
import { MusicGenerationToastListener } from '@/components/music/MusicGenerationToastListener';

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
      <main className={`flex-1 pb-20 md:pb-0 ${className}`}>
        {children}
      </main>

      <MusicGenerationToastListener />
      <MusicGenerationStatusBar />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};