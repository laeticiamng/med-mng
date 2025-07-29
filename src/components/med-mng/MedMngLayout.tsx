import React from 'react';
import { MedMngNavigation } from './MedMngNavigation';
import { MobileBottomNav } from './MobileBottomNav';
import { DuplicateContentDetector } from './DuplicateContentDetector';
import { AccessibilityChecker } from '@/components/accessibility/AccessibilityChecker';
import { ViewportProvider } from '@/components/responsive/ViewportProvider';
import { ResponsiveLayout } from '@/components/responsive/ResponsiveLayout';
import { useAccessibility } from '@/components/ui/AccessibilityProvider';

interface MedMngLayoutProps {
  children: React.ReactNode;
  className?: string;
  showDuplicateDetector?: boolean;
  showAccessibilityChecker?: boolean;
}

export const MedMngLayout: React.FC<MedMngLayoutProps> = ({ 
  children, 
  className = "",
  showDuplicateDetector = false,
  showAccessibilityChecker = false
}) => {
  const { fontSize } = useAccessibility();

  return (
    <ViewportProvider>
      <div 
        className="min-h-screen bg-background flex flex-col"
        style={{ fontSize: `${fontSize}rem` }}
      >
        {/* Top Navigation */}
        <MedMngNavigation />
        
        {/* Main Content */}
        <main className={`flex-1 pb-20 md:pb-0 ${className}`}>
          {/* Outils de développement/admin */}
          {showDuplicateDetector && <DuplicateContentDetector />}
          {showAccessibilityChecker && <AccessibilityChecker />}
          
          {/* Contenu principal */}
          <ResponsiveLayout>
            {children}
          </ResponsiveLayout>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </ViewportProvider>
  );
};