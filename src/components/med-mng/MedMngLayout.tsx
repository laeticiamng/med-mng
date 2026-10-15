import React, { useEffect } from 'react';
import { MedMngNavigation } from './MedMngNavigation';
import { MobileBottomNav } from './MobileBottomNav';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface MedMngLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MedMngLayout: React.FC<MedMngLayoutProps> = ({ 
  children, 
  className = "" 
}) => {
  const { logActivity } = useActivityTracking();

  // Track layout usage
  useEffect(() => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { type: 'app_session_start' }
    });
  }, [logActivity]);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <MedMngNavigation />
      
      {/* Main Content */}
      {/* div et non <main id="main-content"> : la page est déjà dans le <main
          id="main-content"> de App.tsx (deux landmarks imbriqués, id dupliqué). */}
      {/* La place de la barre mobile et du mini-lecteur est réservée une seule fois, en bas de
          l'application (App.tsx, MARGE_BASSE_APP) : plus de marge basse en dur ici, qui laissait le pied de
          page sous la barre et doublait la marge. */}
      <div className={`flex-1 ${className}`}>
        {children}
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};