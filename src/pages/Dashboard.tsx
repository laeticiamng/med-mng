import React from 'react';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';

/**
 * Page Dashboard Principale - Vue d'ensemble complète de la plateforme
 */
const Dashboard: React.FC = () => {
  return (
    <LanguageProvider>
      <Helmet>
        <title>Dashboard - Plateforme Médicale MED-MNG</title>
        <meta name="description" content="Tableau de bord principal de la plateforme médicale avec monitoring, analytics et contrôles système en temps réel." />
        <meta name="keywords" content="dashboard, medical platform, monitoring, analytics, healthcare technology" />
        <link rel="canonical" href="/dashboard" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <DashboardOverview />
      </div>
    </LanguageProvider>
  );
};

export default Dashboard;