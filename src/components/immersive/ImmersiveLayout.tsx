import React from 'react';
import { PremiumBackground } from './PremiumBackground';
import { ImmersiveHeader } from './ImmersiveHeader';

interface ImmersiveLayoutProps {
  children: React.ReactNode;
  variant?: 'medical' | 'music' | 'learning' | 'dashboard' | 'creative';
  intensity?: 'low' | 'medium' | 'high';
  header?: {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    badge?: { text: string; color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' };
    backTo?: string;
    actions?: React.ReactNode;
  };
}

export const ImmersiveLayout: React.FC<ImmersiveLayoutProps> = ({
  children,
  variant = 'medical',
  intensity = 'medium',
  header
}) => {
  return (
    <div className="min-h-screen relative">
      <PremiumBackground variant={variant} intensity={intensity} />
      
      {header && (
        <ImmersiveHeader
          title={header.title}
          subtitle={header.subtitle}
          icon={header.icon}
          badge={header.badge}
          backTo={header.backTo}
          actions={header.actions}
        />
      )}
      
      <main className={`relative z-10 ${header ? 'pt-0' : 'pt-8'}`}>
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};