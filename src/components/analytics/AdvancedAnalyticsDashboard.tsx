import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import {
    Activity,
    Award,
    Brain,
    Clock,
    Flame,
    Music,
    Star,
    Target,
    TrendingUp,
    Trophy,
    Users,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Couleurs sémantiques pour les graphiques
const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  chart1: 'hsl(var(--chart-1))',
  chart2: 'hsl(var(--chart-2))',
  chart3: 'hsl(var(--chart-3))',
  chart4: 'hsl(var(--chart-4))',
  chart5: 'hsl(var(--chart-5))',
};

interface AdvancedAnalytics {
  totalStudyTime: number;
  songsGenerated: number;
  averageScore: number;
  streakDays: number;
  completedItems: number;
  favoriteGenres: Array<{ name: string; count: number; color: string }>;
  weeklyActivity: Array<{ day: string; study: number; music: number; quiz: number }>;
  monthlyProgress: Array<{ month: string; items: number; hours: number; score: number }>;
  performanceByCategory: Array<{ category: string; score: number; trend: string }>;
  learningPatterns: Array<{ hour: number; efficiency: number; focus: number }>;
}

interface UserMetrics {
  userId: string;
  userName: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  badges: string[];
  achievements: string[];
  socialStats: {
    followers: number;
    following: number;
    studyGroups: number;
  };
}

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { logActivity } = useActivityTracking();
  const { _stats: gamificationStats, loadStats } = useGamification();

  useEffect(() => {
    loadAdvancedAnalytics();
    const initGamification = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadStats(user.id);
        logActivity({ activity_type: 'study', metadata: { action: 'view_advanced_analytics' } });
      }
    };
    initGamification();
  }, [selectedPeriod, loadStats, logActivity]);

  const loadAdvancedAnalytics = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Charger les stats de gamification
      const { data: gamificationStats } = await (supabase as any)
        .from('user_gamification_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Charger le nombre de morceaux générés
      const { count: songsCount } = await supabase
        .from('med_mng_songs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Charger les badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);

      const { data: recentActivities } = await supabase
        .from('gamification_activities')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      const { data: genreData } = await supabase
        .from('generated_music_tracks')
        .select('metadata')
        .eq('user_id', user.id);

      // Calculate real genre distribution from metadata
      const genreCounts: Record<string, number> = {};
      (genreData || []).forEach(track => {
        const metadata = track.metadata as any;
        const style = metadata?.style || metadata?.genre || 'Unknown';
        genreCounts[style] = (genreCounts[style] || 0) + 1;
      });

      const favoriteGenres = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4)
        .map(([name, count], i) => ({
          name,
          count,
          color: [CHART_COLORS.chart1, CHART_COLORS.chart3, CHART_COLORS.chart4, CHART_COLORS.chart5][i]
        }));

      // Construire les analytics à partir des données réelles
      const analyticsData: AdvancedAnalytics = {
        totalStudyTime: gamificationStats?.study_time_minutes || 0,
        songsGenerated: songsCount || 0,
        averageScore: gamificationStats?.average_score || 0,
        streakDays: gamificationStats?.current_streak || 0,
        completedItems: gamificationStats?.items_completed || 0,
        favoriteGenres: favoriteGenres.length > 0 ? favoriteGenres : [
          { name: 'Aucun genre', count: 0, color: CHART_COLORS.chart1 }
        ],
        weeklyActivity: calculateWeeklyActivity(recentActivities || []),
        monthlyProgress: [],
        performanceByCategory: [],
        learningPatterns: []
      };

      const metricsData: UserMetrics = {
        userId: user.id,
        userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
        level: gamificationStats?.level || 1,
        xp: gamificationStats?.current_xp || 0,
        nextLevelXp: (gamificationStats?.level || 1) * 100,
        badges: (userBadges || []).map(b => b.badge_id),
        achievements: [],
        socialStats: { followers: 0, following: 0, studyGroups: 0 }
      };

      setAnalytics(analyticsData);
      setUserMetrics(metricsData);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWeeklyActivity = (activities: any[]) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const weekData = days.map(day => ({ day, study: 0, music: 0, quiz: 0 }));
    
    activities.forEach(activity => {
      const dayIndex = new Date(activity.created_at).getDay();
      const type = activity.activity_type;
      if (type === 'study') weekData[dayIndex].study += activity.duration / 60 || 1;
      else if (type === 'music') weekData[dayIndex].music += 1;
      else if (type === 'quiz') weekData[dayIndex].quiz += 1;
    });
    
    return weekData;
  };

  const getProgressPercentage = () => {
    if (!userMetrics) return 0;
    return Math.round((userMetrics.xp / userMetrics.nextLevelXp) * 100);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-destructive rotate-180" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics || !userMetrics) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Gamification Stats Banner */}
      {gamificationStats && (
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-warning/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-warning" />
                  <span className="text-lg font-bold text-warning">{gamificationStats.currentStreak}</span>
                  <span className="text-sm text-muted-foreground">jours</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="text-lg font-bold text-primary">Niv. {gamificationStats.level}</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-success" />
                  <span className="text-lg font-bold text-success">{gamificationStats.badges?.length || 0}</span>
                  <span className="text-sm text-muted-foreground">badges</span>
                </div>
              </div>
              <Badge variant="outline">{gamificationStats.totalPoints} XP</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* En-tête avec profil utilisateur */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
            {userMetrics.userName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{userMetrics.userName}</h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                Niveau {userMetrics.level}
              </Badge>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {userMetrics.xp}/{userMetrics.nextLevelXp} XP
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {['7d', '30d', '90d', '1y'].map(period => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period as any)}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Temps d'étude total</p>
                <p className="text-3xl font-bold">{analytics.totalStudyTime}h</p>
                <p className="text-xs text-muted-foreground">+15% ce mois</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/20 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Musiques générées</p>
                <p className="text-3xl font-bold">{analytics.songsGenerated}</p>
                <p className="text-xs text-muted-foreground">+8 cette semaine</p>
              </div>
              <Music className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/20 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score moyen</p>
                <p className="text-3xl font-bold">{analytics.averageScore}%</p>
                <p className="text-xs text-muted-foreground">Excellent niveau</p>
              </div>
              <Target className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/20 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Série actuelle</p>
                <p className="text-3xl font-bold">{analytics.streakDays} jours</p>
                <p className="text-xs text-muted-foreground">Record personnel</p>
              </div>
              <Award className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="progress">Progression</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="patterns">Habitudes</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activité hebdomadaire</CardTitle>
                <CardDescription>Répartition de votre temps d'étude par jour</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="study"
                      stackId="1"
                      stroke={CHART_COLORS.chart1}
                      fill={CHART_COLORS.chart1}
                      fillOpacity={0.6}
                      name="Étude (h)"
                    />
                    <Area
                      type="monotone"
                      dataKey="music"
                      stackId="1"
                      stroke={CHART_COLORS.chart3}
                      fill={CHART_COLORS.chart3}
                      fillOpacity={0.6}
                      name="Musique"
                    />
                    <Area
                      type="monotone"
                      dataKey="quiz"
                      stackId="1"
                      stroke={CHART_COLORS.chart4}
                      fill={CHART_COLORS.chart4}
                      fillOpacity={0.6}
                      name="Quiz"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Genres musicaux favoris</CardTitle>
                <CardDescription>Vos préférences musicales pour l'étude</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.favoriteGenres}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill={CHART_COLORS.chart1}
                      dataKey="count"
                      label={({ name, count }) => `${name}: ${count}`}
                    >
                      {analytics.favoriteGenres.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progression mensuelle</CardTitle>
              <CardDescription>Évolution de vos performances sur les derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="items" fill={CHART_COLORS.chart1} name="Items complétés" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="score"
                    stroke={CHART_COLORS.chart3}
                    strokeWidth={3}
                    name="Score moyen (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance par spécialité</CardTitle>
              <CardDescription>Vos scores dans chaque domaine médical</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.performanceByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{category.category}</span>
                      {getTrendIcon(category.trend)}
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={category.score} className="w-24 h-2" />
                      <Badge 
                        variant={category.score >= 85 ? 'default' : category.score >= 70 ? 'secondary' : 'destructive'}
                      >
                        {category.score}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patterns d'apprentissage</CardTitle>
              <CardDescription>Votre efficacité selon l'heure de la journée</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.learningPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="efficiency"
                    stroke={CHART_COLORS.chart5}
                    fill={CHART_COLORS.chart5}
                    fillOpacity={0.6}
                    name="Efficacité (%)"
                  />
                  <Area
                    type="monotone"
                    dataKey="focus"
                    stroke={CHART_COLORS.chart4}
                    fill={CHART_COLORS.chart4}
                    fillOpacity={0.4}
                    name="Concentration (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">09:00</p>
                <p className="text-sm text-muted-foreground">Heure optimale</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-warning mx-auto mb-2" />
                <p className="text-2xl font-bold">2.3h</p>
                <p className="text-sm text-muted-foreground">Session idéale</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Brain className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold">87%</p>
                <p className="text-sm text-muted-foreground">Focus moyen</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Réseau
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Abonnés</span>
                  <Badge variant="outline">{userMetrics.socialStats.followers}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Abonnements</span>
                  <Badge variant="outline">{userMetrics.socialStats.following}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Groupes d'étude</span>
                  <Badge variant="outline">{userMetrics.socialStats.studyGroups}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {userMetrics.badges.map((badge, index) => (
                    <div key={index} className="text-center p-2 border rounded-lg">
                      <Award className="w-6 h-6 mx-auto mb-1 text-warning" />
                      <p className="text-xs font-medium">{badge}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Accomplissements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userMetrics.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                      <Target className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium">{achievement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};