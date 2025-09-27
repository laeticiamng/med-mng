import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ComprehensiveAdminDashboard from './ComprehensiveAdminDashboard';
import SystemMonitoring from './SystemMonitoring';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

const AdminDashboardRouter: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <Card className="w-96">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user || !user.user_metadata?.role?.includes('admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Helmet>
          <title>Accès Refusé - MED-MNG Admin</title>
        </Helmet>
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès Administrateur Requis</h2>
            <p className="text-muted-foreground">
              Cette section est réservée aux administrateurs système.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<ComprehensiveAdminDashboard />} />
      <Route path="/monitoring" element={<SystemMonitoring />} />
      {/* Redirection pour les anciennes routes */}
      <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
      <Route path="/system" element={<Navigate to="/admin/monitoring" replace />} />
      {/* Route 404 pour admin */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminDashboardRouter;