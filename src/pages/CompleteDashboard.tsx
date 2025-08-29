import React from 'react';
import { ImmersiveLayout } from '@/components/immersive/ImmersiveLayout';
import { GamefiedElements } from '@/components/immersive/GameFiedElements';
import { SmartNotifications } from '@/components/immersive/SmartNotifications';
import { AdaptiveInterface } from '@/components/immersive/AdaptiveInterface';
import { QuickAccessPanel } from '@/components/platform/QuickAccessPanel';
import { QuickNavigation } from '@/components/navigation/QuickNavigation';
import { PlatformStats } from '@/components/platform/PlatformStats';
import { ActivityFeed } from '@/components/platform/ActivityFeed';
import { FinalizedFeatures } from '@/components/immersive/FinalizedFeatures';
import { WelcomeBanner } from '@/components/immersive/WelcomeBanner';
import { EnhancedNavigation } from '@/components/immersive/EnhancedNavigation';
import { UserDashboardEnhanced } from '@/components/immersive/UserDashboardEnhanced';
import { SmartContentRecommendations } from '@/components/immersive/SmartContentRecommendations';
import { RealTimeCollaboration } from '@/components/immersive/RealTimeCollaboration';

const CompleteDashboard: React.FC = () => {
  return (
    <>
      {/* Enhanced Navigation Overlay */}
      <EnhancedNavigation />
      
      {/* Main Dashboard Content */}
      <UserDashboardEnhanced />
      
      {/* Additional Immersive Components */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Smart Content Recommendations */}
        <SmartContentRecommendations />
        
        {/* Real-time Collaboration */}
        <RealTimeCollaboration />
        
        {/* Legacy Components Integration */}
        <ImmersiveLayout showWelcome={false} showParticles={true}>
          <SmartNotifications />
          
          {/* Bannière de bienvenue personnalisée */}
          <WelcomeBanner userName="Étudiant MED" />
          
          {/* Navigation rapide */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Accès Rapide aux Fonctionnalités</h2>
            <QuickNavigation />
          </div>

          {/* Statistiques en temps réel */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Statistiques de la Plateforme</h2>
            <PlatformStats />
          </div>

          {/* Fonctionnalités finalisées */}
          <div className="mb-8">
            <FinalizedFeatures />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <GamefiedElements />
              <QuickAccessPanel />
            </div>
            <div className="space-y-8">
              <AdaptiveInterface />
              <ActivityFeed />
            </div>
          </div>
        </ImmersiveLayout>
      </div>
    </>
  );
};

export default CompleteDashboard;