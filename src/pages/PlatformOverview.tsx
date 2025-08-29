import React from 'react';
import { MasterNavigationSystem } from '@/components/navigation/MasterNavigationSystem';
import { ComprehensivePlatformDashboard } from '@/components/platform/ComprehensivePlatformDashboard';
import { UniversalActivityTracker } from '@/components/platform/UniversalActivityTracker';
import { APIStatusDashboard } from '@/components/platform/APIStatusDashboard';

const PlatformOverview: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Système de navigation master */}
      <MasterNavigationSystem />
      
      {/* Dashboard complet de la plateforme */}
      <ComprehensivePlatformDashboard />
      
      {/* Suivi d'activité universel */}
      <div className="px-8 pb-8">
        <UniversalActivityTracker />
      </div>
      
      {/* État des APIs */}
      <div className="px-8 pb-8">
        <APIStatusDashboard />
      </div>
    </div>
  );
};

export default PlatformOverview;