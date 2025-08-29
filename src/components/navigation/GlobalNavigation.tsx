import React from 'react';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { MobileBottomNav } from './MobileBottomNav';
import { PlatformNavbar } from './PlatformNavbar';

export const GlobalNavigation: React.FC = () => {
  const { isMobile } = useBreakpoints();

  return (
    <>
      {/* Navigation principale pour desktop et mobile */}
      <PlatformNavbar />
      
      {/* Navigation mobile en bas uniquement sur mobile */}
      {isMobile && <MobileBottomNav />}
    </>
  );
};