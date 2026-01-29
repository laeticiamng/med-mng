import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Flame, Star, Sparkles, Trophy, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

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

      <div className="min-h-screen relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/10 pointer-events-none -z-10" />
        
        {/* Floating orbs */}
        <motion.div 
          className="fixed top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none -z-10"
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="fixed bottom-20 right-10 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none -z-10"
          animate={{ x: [0, -40, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Enhanced Gamification header for logged-in users */}
        {user && stats && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 pt-6 relative z-10"
          >
            <Card className="bg-card/60 backdrop-blur-xl border-primary/20 mb-6 rounded-2xl shadow-soft">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Progression</span>
                  </div>
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
                        <Badge key={badge.id} variant="outline" className="text-lg backdrop-blur-sm">
                          {badge.icon}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        <div className="relative z-10">
          <DashboardOverview />
        </div>
      </div>
    </LanguageProvider>
  );
};

export default Dashboard;
