import React, { useEffect } from 'react';
import { DataExportManager } from '@/components/backup/DataExportManager';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';
import { useActivityTracking } from '@/hooks/useActivityTracking';

/**
 * Page de Configuration Avancée de la Plateforme
 */
const PlatformSettings: React.FC = () => {
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_platform_settings' } });
  }, []);

  return (
    <LanguageProvider>
      <Helmet>
        <title>Configuration Plateforme - MED-MNG Settings</title>
        <meta name="description" content="Interface de configuration avancée et gestion des données de la plateforme médicale MED-MNG avec export et backup." />
        <meta name="keywords" content="platform settings, data export, backup, configuration, medical platform administration" />
        <link rel="canonical" href="/platform-settings" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <DataExportManager />
      </div>
    </LanguageProvider>
  );
};

export default PlatformSettings;