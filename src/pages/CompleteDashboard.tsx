import React from 'react';
import { ImmersiveLayout } from '@/components/immersive/ImmersiveLayout';
import { GamefiedElements } from '@/components/immersive/GameFiedElements';
import { SmartNotifications } from '@/components/immersive/SmartNotifications';
import { AdaptiveInterface } from '@/components/immersive/AdaptiveInterface';
import { QuickAccessPanel } from '@/components/platform/QuickAccessPanel';

const CompleteDashboard: React.FC = () => {
  return (
    <ImmersiveLayout showWelcome={true} showParticles={true}>
      <SmartNotifications />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GamefiedElements />
          <div className="mt-8">
            <QuickAccessPanel />
          </div>
        </div>
        <div>
          <AdaptiveInterface />
        </div>
      </div>
    </ImmersiveLayout>
  );
};

export default CompleteDashboard;