import React, { useEffect } from 'react';
import { SystemMonitor } from '@/components/system/SystemMonitor';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';
import { useActivityTracking } from '@/hooks/useActivityTracking';

/**
 * Page de Gestion Système - Monitoring et administration avancée
 */
const SystemManagement: React.FC = () => {
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { page: 'system_management', action: 'view' }
    });
  }, []);

  return (
    <LanguageProvider>
      <Helmet>
        <title>Gestion Système - Monitoring MED-MNG</title>
        <meta name="description" content="Interface de monitoring et gestion système avancée pour la plateforme médicale MED-MNG avec métriques en temps réel." />
        <meta name="keywords" content="system monitoring, server management, performance metrics, medical platform administration" />
        <link rel="canonical" href="/system-management" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <SystemMonitor />
      </div>
    </LanguageProvider>
  );
};

export default SystemManagement;