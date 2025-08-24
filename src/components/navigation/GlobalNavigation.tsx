import React from 'react';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { MobileBottomNav } from './MobileBottomNav';

export const GlobalNavigation: React.FC = () => {
  const { isMobile } = useBreakpoints();

  // Sur mobile, afficher la navigation en bas
  if (isMobile) {
    return <MobileBottomNav />;
  }

  // Sur desktop, pas de navigation (pour l'instant)
  return null;
};