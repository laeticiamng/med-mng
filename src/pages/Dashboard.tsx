import React, { useEffect, useState } from 'react';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';

/**
 * Page Dashboard Principale - Vue d'ensemble complète de la plateforme
 */
const Dashboard: React.FC = () => {
  const { stats } = useGamification();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  return (
    <LanguageProvider>
      <Helmet>
        <title>Dashboard - Plateforme Médicale MED-MNG</title>
        <meta name="description" content="Tableau de bord principal de la plateforme médicale avec monitoring, analytics et contrôles système en temps réel." />
        <meta name="keywords" content="dashboard, medical platform, monitoring, analytics, healthcare technology" />
        <link rel="canonical" href="/dashboard" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Gamification header for logged-in users */}
        {user && stats && (
          <div className="container mx-auto px-4 pt-6">
            <StreakDisplay stats={stats} compact />
          </div>
        )}
        <DashboardOverview />
      </div>
    </LanguageProvider>
  );
};

export default Dashboard;
