
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Clock, 
  Music, 
  Brain, 
  Target, 
  Calendar,
  BarChart3,
  Settings,
  Award,
  Zap,
  Heart,
  Star
} from 'lucide-react';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { useListeningModes } from '@/hooks/useListeningModes';

interface DashboardStats {
  totalListeningTime: number;
  completedSessions: number;
  favoriteMode: string;
  weeklyProgress: number;
  longestSession: number;
  averageRating: number;
}

interface WeeklyData {
  day: string;
  minutes: number;
  sessions: number;
}

export const PersonalizedDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalListeningTime: 0,
    completedSessions: 0,
    favoriteMode: 'Focus Intense',
    weeklyProgress: 0,
    longestSession: 0,
    averageRating: 0
  });

  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([
    { day: 'Lun', minutes: 45, sessions: 2 },
    { day: 'Mar', minutes: 60, sessions: 3 },
    { day: 'Mer', minutes: 30, sessions: 1 },
    { day: 'Jeu', minutes: 75, sessions: 3 },
    { day: 'Ven', minutes: 90, sessions: 4 },
    { day: 'Sam', minutes: 50, sessions: 2 },
    { day: 'Dim', minutes: 40, sessions: 2 }
  ]);

  const { recommendations, isLoading } = useAIRecommendations();
  const { predefinedModes, activeMode } = useListeningModes();

  useEffect(() => {
    // Simuler le chargement des statistiques
    const loadStats = async () => {
      // Ici, vous récupéreriez les vraies données depuis Supabase
      const mockStats = {
        totalListeningTime: 1280, // en minutes
        completedSessions: 47,
        favoriteMode: 'Focus Intense',
        weeklyProgress: 85,
        longestSession: 120,
        averageRating: 4.2
      };
      setStats(mockStats);
    };

    loadStats();
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-success';
    if (progress >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes));

  return (
    <div className="space-y-6">
      {/* En-tête du tableau de bord */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mon Tableau de Bord</h1>
          <p className="text-muted-foreground">Suivez votre progression et vos habitudes d'écoute</p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Paramètres
        </Button>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps d'écoute total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.totalListeningTime)}</div>
            <p className="text-xs text-muted-foreground">+2h cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions complétées</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedSessions}</div>
            <p className="text-xs text-muted-foreground">+12 cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mode préféré</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">🎯</div>
            <p className="text-xs text-muted-foreground">{stats.favoriteMode}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">⭐ Excellent</p>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">Progression</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          <TabsTrigger value="achievements">Réussites</TabsTrigger>
        </TabsList>

        {/* Onglet Progression */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progression hebdomadaire
                </CardTitle>
                <CardDescription>Votre activité des 7 derniers jours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyData.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{day.day}</span>
                      <div className="flex items-center gap-2 flex-1 mx-4">
                        <div className="flex-1 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${(day.minutes / maxMinutes) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-16">
                          {day.minutes}min
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {day.sessions}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Objectifs de la semaine
                </CardTitle>
                <CardDescription>Vos objectifs d'écoute actuels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Temps d'écoute</span>
                    <span className="text-sm text-muted-foreground">350/400 min</span>
                  </div>
                  <Progress value={87.5} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sessions complétées</span>
                    <span className="text-sm text-muted-foreground">15/20</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Modes explorés</span>
                    <span className="text-sm text-muted-foreground">4/6</span>
                  </div>
                  <Progress value={66.7} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Recommandations */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Recommandations IA personnalisées
              </CardTitle>
              <CardDescription>
                Basées sur votre historique d'écoute et vos préférences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Génération des recommandations...</p>
                </div>
              ) : recommendations ? (
                <div className="space-y-4">
                  <div className="grid gap-3">
                    {recommendations.recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{rec.genre}</Badge>
                            <Badge variant="outline">{rec.mood}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.reason}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(rec.confidence * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune recommandation disponible pour le moment
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Analytiques */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Répartition par mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predefinedModes.slice(0, 4).map((mode, index) => {
                    const usage = [45, 28, 15, 12][index];
                    return (
                      <div key={mode.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{mode.icon}</span>
                          <span className="text-sm font-medium">{mode.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${usage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">
                            {usage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session la plus longue</span>
                    <span className="text-sm font-medium">{formatTime(stats.longestSession)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Temps moyen par session</span>
                    <span className="text-sm font-medium">27 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taux de completion</span>
                    <span className="text-sm font-medium">94%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Série actuelle</span>
                    <span className="text-sm font-medium">8 jours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Réussites */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Badges et réalisations
              </CardTitle>
              <CardDescription>Vos accomplissements en matière d'écoute</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: '🔥', name: 'Série de 7 jours', desc: 'Écoute quotidienne', unlocked: true },
                  { icon: '⚡', name: 'Speed learner', desc: '50 sessions rapides', unlocked: true },
                  { icon: '🧠', name: 'Maître Focus', desc: '100h en mode focus', unlocked: true },
                  { icon: '🎯', name: 'Précision', desc: 'Tous les modes testés', unlocked: false },
                  { icon: '🌟', name: 'Explorateur', desc: 'Mode personnalisé créé', unlocked: false },
                  { icon: '🏆', name: 'Champion', desc: '500 sessions complétées', unlocked: false }
                ].map((badge, index) => (
                  <div 
                    key={index}
                    className={`p-4 border rounded-lg text-center ${
                      badge.unlocked ? 'bg-secondary/50' : 'opacity-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{badge.icon}</div>
                    <h4 className="font-medium text-sm">{badge.name}</h4>
                    <p className="text-xs text-muted-foreground">{badge.desc}</p>
                    {badge.unlocked && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Débloqué
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
