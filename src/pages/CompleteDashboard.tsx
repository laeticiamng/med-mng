import React from 'react';
import { CompleteDashboardLayout } from '@/components/dashboard/CompleteDashboardLayout';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { GlobalNavigation } from '@/components/navigation/GlobalNavigation';
import { ImmersiveExperienceOrchestrator } from '@/components/immersive/ImmersiveExperienceOrchestrator';
import { Separator } from '@/components/ui/separator';

const CompleteDashboard: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Global Navigation */}
      <GlobalNavigation />
      
      {/* Immersive Experience Orchestrator */}
      <ImmersiveExperienceOrchestrator />
      
      {/* Unified Navigation Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Navigation Complète</h2>
          <p className="text-white/60">Accédez à toutes les fonctionnalités de la plateforme</p>
        </div>
        <Separator className="bg-white/10 mb-8" />
        <UnifiedNavigation />
      </div>
    </div>
  );
};

export default CompleteDashboard;