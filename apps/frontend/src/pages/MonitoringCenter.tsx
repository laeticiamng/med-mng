import React from 'react';
import { UnifiedMonitoringDashboard } from '@/components/monitoring/UnifiedMonitoringDashboard';

const MonitoringCenter = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <UnifiedMonitoringDashboard />
      </div>
    </div>
  );
};

export default MonitoringCenter;