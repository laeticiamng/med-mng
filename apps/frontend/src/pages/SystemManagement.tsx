import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Navigate } from 'react-router-dom';
import { SystemMonitor } from '@/components/system/SystemMonitor';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';
import { useUserRoles } from '@/hooks/useUserRoles';

/**
 * Page de Gestion Système - Monitoring et administration avancée
 */
const SystemManagement: React.FC = () => {
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