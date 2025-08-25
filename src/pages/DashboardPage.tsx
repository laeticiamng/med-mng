import React from 'react';
import { DashboardNavigation } from '@/components/navigation/DashboardNavigation';

export const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <DashboardNavigation />
      </div>
    </div>
  );
};