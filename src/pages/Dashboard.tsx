import React, { useEffect, useState } from 'react';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';
import { useGamification } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Star, Trophy, Zap } from 'lucide-react';

/**
 * Page Dashboard Principale - Vue d'ensemble complète de la plateforme
 */
const Dashboard: React.FC = () => {
  const { stats, loadStats } = useGamification();
  const { logActivity } = useActivityTracking();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
        
        // Log dashboard view
        await logActivity({
          activity_type: 'study',
          count: 1,
          metadata: { action: 'dashboard_view' }
        });
      }
    };
    init();
  }, [loadStats, logActivity]);

  return (
    <LanguageProvider>
      <Helmet>
        <title>Dashboard - Plateforme Médicale MED-MNG</title>
        <meta name="description" content="Tableau de bord principal de la plateforme médicale avec monitoring, analytics et contrôles système en temps réel." />
        <meta name="keywords" content="dashboard, medical platform, monitoring, analytics, healthcare technology" />
        <link rel="canonical" href="/dashboard" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Enhanced Gamification header for logged-in users */}
        {user && stats && (
          <div className="container mx-auto px-4 pt-6">
            <Card className="bg-gradient-to-r from-primary/5 via-warning/5 to-accent/5 border-primary/20 mb-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-warning" />
                      <div>
                        <span className="text-lg font-bold">{stats.currentStreak}</span>
                        <span className="text-xs text-muted-foreground ml-1">jours</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-lg font-bold">Niv. {stats.level}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-accent-foreground" />
                      <div>
                        <span className="text-lg font-bold">{stats.totalPoints.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground ml-1">XP</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-success" />
                      <div>
                        <span className="text-lg font-bold">{stats.badges.length}</span>
                        <span className="text-xs text-muted-foreground ml-1">badges</span>
                      </div>
                    </div>
                  </div>
                  {stats.badges.length > 0 && (
                    <div className="flex gap-1">
                      {stats.badges.slice(-3).map((badge) => (
                        <Badge key={badge.id} variant="outline" className="text-lg">
                          {badge.icon}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <DashboardOverview />
      </div>
    </LanguageProvider>
  );
};

export default Dashboard;
