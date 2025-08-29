import React from 'react';
import { SuperDashboard as SuperDashboardComponent } from '@/components/dashboard/SuperDashboard';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';

const SuperDashboard: React.FC = () => {
  return (
    <ConsistentBackground variant="primary">
      <SuperDashboardComponent />
    </ConsistentBackground>
  );
};

export default SuperDashboard;