import { CertificateGenerator } from '@/components/gamification/CertificateGenerator';
import { GamificationPanel } from '@/components/gamification/GamificationPanel';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Award, Flame, Medal, Star, Target, Trophy, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

const Achievements: React.FC = () => {
  const navigate = useNavigate();
  const { _stats, loadStats } = useGamification();
  const { logActivity } = useActivityTracking();
  const [_challengesCompleted, setChallengesCompleted] = useState(0);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadStats(user.id);
        
        // Track achievements page view
        await logActivity({
          activity_type: 'study',
          count: 1,
          metadata: { action: 'achievements_view' }
        });
        
        // Count completed challenges based on achievements
        let completed = 0;
        if (_stats?.currentStreak && _stats.currentStreak >= 7) completed++;
        if (_stats?.weeklyGoalProgress && _stats.weeklyGoalProgress >= 100) completed++;
        if (_stats?.badges && _stats.badges.length >= 5) completed++;
        setChallengesCompleted(completed);
      }
    };
    init();
  }, [loadStats, logActivity, _stats?.currentStreak, _stats?.weeklyGoalProgress, _stats?.badges?.length]);

  return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Helmet>
        <title>Succès et Gamification - MED MNG</title>
        <meta name="description" content="Suivez votre progression, débloquez des succès et relevez des défis dans votre apprentissage médical." />
        <meta name="keywords" content="succès, badges, gamification, progression, apprentissage médical" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Trophy className="w-8 h-8 text-warning" />
                Succès & Progression
              </h1>
              <p className="text-muted-foreground mt-1">
                Suivez votre progression et débloquez des récompenses exclusives
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques réelles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/30">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-warning mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-foreground">{_stats?.badges?.length || 0}</h3>
              <p className="text-muted-foreground">Badges Obtenus</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-foreground">{_stats?.totalPoints?.toLocaleString() || 0}</h3>
              <p className="text-muted-foreground">Points XP</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 border-orange-500/30">
            <CardContent className="p-6 text-center">
              <Flame className="w-12 h-12 text-orange-500 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-foreground">{_stats?.currentStreak || 0}</h3>
              <p className="text-muted-foreground">Jours de Streak</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/30">
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-foreground">Niv. {_stats?.level || 1}</h3>
              <p className="text-muted-foreground">Niveau Actuel</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs pour les différentes sections */}
        <Tabs defaultValue="gamification" className="mb-8">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="gamification" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Progression</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Classement</span>
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-2">
              <Medal className="h-4 w-4" />
              <span className="hidden sm:inline">Certificats</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Défis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gamification">
            <GamificationPanel />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="certificates">
            <CertificateGenerator />
          </TabsContent>

          <TabsContent value="challenges">
            {/* Section motivation et défis */}
            <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
              <CardHeader>
                <CardTitle className="text-center">🎯 Continuez sur votre lancée !</CardTitle>
                <CardDescription className="text-center">
                  Vous êtes sur la bonne voie pour devenir un expert médical. 
                  Continuez à étudier et à relever des défis pour débloquer encore plus de récompenses !
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex justify-center gap-4">
                  <Button onClick={() => navigate(ROUTE_PATHS.ednComplete)}>
                    Continuer l'étude
                  </Button>
                  <Button variant="outline" onClick={() => navigate(ROUTE_PATHS.generator)}>
                    Générer une musique
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Achievements;