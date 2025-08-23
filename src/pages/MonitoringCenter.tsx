import React from 'react';
import { UnifiedMonitoringDashboard } from '@/components/monitoring/UnifiedMonitoringDashboard';
import { useResponsiveSpacing } from '@/hooks/useBreakpoints';

const MonitoringCenter = () => {
  const spacing = useResponsiveSpacing();
  
  return (
    <div className="min-h-screen bg-background">
      <div className={`container mx-auto ${spacing.container}`}>
        <UnifiedMonitoringDashboard />
      </div>
    </div>
  );
};

export default MonitoringCenter;