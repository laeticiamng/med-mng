import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { UnifiedMonitoringDashboard } from '@/components/monitoring/UnifiedMonitoringDashboard';

const MonitoringCenter = () => {
  // ✅ SÉCURITÉ: Vérification admin requise
  const { user } = useAuth();
  const { isAdmin, loadingMyRoles } = useUserRoles();

  if (!user) {
    return <Navigate to="/med-mng-login" replace />;
  }

  if (!loadingMyRoles && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <UnifiedMonitoringDashboard />
      </div>
    </div>
  );
};

export default MonitoringCenter;