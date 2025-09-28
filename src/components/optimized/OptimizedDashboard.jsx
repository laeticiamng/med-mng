import { memo, useCallback, useMemo, Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSimpleState } from '@/hooks/useSimpleState';
import { useOptimizedTranslation } from '@/hooks/useOptimizedTranslation';
import { 
  Music, 
  Brain, 
  TrendingUp, 
  Users, 
  Clock,
  Star,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

// Lazy loading des composants lourds
const OptimizedChart = lazy(() => import('./OptimizedChart'));
const MusicLibrary = lazy(() => import('./MusicLibrary'));

// Composant de loading optimisé
const LoadingCard = memo(() => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="h-4 bg-muted rounded w-1/3" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    </CardContent>
  </Card>
));

// Stats widget optimisé
const StatsWidget = memo(({ icon: Icon, title, value, trend, color = "primary" }) => {
  const colorClasses = useMemo(() => ({
    primary: "text-primary border-primary/20 bg-primary/5",
    success: "text-green-600 border-green-200 bg-green-50",
    warning: "text-yellow-600 border-yellow-200 bg-yellow-50",
    info: "text-blue-600 border-blue-200 bg-blue-50"
  }), []);

  return (
    <Card className={`border-l-4 ${colorClasses[color]}`}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full bg-background`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <Badge variant={trend > 0 ? "default" : "secondary"} className="text-xs">
                  {trend > 0 ? "+" : ""}{trend}%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Activité récente optimisée
const RecentActivity = memo(({ activities = [] }) => {
  const { translate } = useOptimizedTranslation();

  const activityIcons = useMemo(() => ({
    music: Music,
    study: Brain,
    quiz: Star,
    session: PlayCircle
  }), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Activité récente</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            Aucune activité récente
          </p>
        ) : (
          activities.slice(0, 5).map((activity, index) => {
            const Icon = activityIcons[activity.type] || Clock;
            return (
              <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
                {activity.status && (
                  <Badge variant="outline" className="text-xs">
                    {activity.status}
                  </Badge>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
});

// Dashboard principal optimisé
export const OptimizedDashboard = memo(() => {
  const { translate } = useOptimizedTranslation();
  const [state, setState] = useSimpleState({
    selectedPeriod: 'week',
    activeTab: 'overview',
    isLoading: false
  });

  // Données simulées optimisées
  const dashboardData = useMemo(() => ({
    stats: [
      { 
        icon: Music, 
        title: "Musiques générées", 
        value: "127", 
        trend: 12,
        color: "primary" 
      },
      { 
        icon: Brain, 
        title: "Items étudiés", 
        value: "89", 
        trend: 8,
        color: "success" 
      },
      { 
        icon: Users, 
        title: "Sessions actives", 
        value: "24", 
        trend: -3,
        color: "info" 
      },
      { 
        icon: TrendingUp, 
        title: "Progression", 
        value: "87%", 
        trend: 15,
        color: "warning" 
      }
    ],
    recentActivities: [
      {
        type: 'music',
        title: 'Nouvelle musique générée - Item 127',
        timestamp: 'Il y a 5 minutes',
        status: 'Terminé'
      },
      {
        type: 'study',
        title: 'Session d\'étude - Cardiologie',
        timestamp: 'Il y a 15 minutes',
        status: 'En cours'
      },
      {
        type: 'quiz',
        title: 'Quiz complété - Item 89',
        timestamp: 'Il y a 1 heure',
        status: 'Réussi'
      }
    ]
  }), []);

  const handlePeriodChange = useCallback((period) => {
    setState({ selectedPeriod: period, isLoading: true });
    // Simuler un chargement
    setTimeout(() => setState({ isLoading: false }), 500);
  }, [setState]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre progression médicale
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['day', 'week', 'month'].map((period) => (
            <Button
              key={period}
              variant={state.selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange(period)}
              disabled={state.isLoading}
            >
              {period === 'day' && 'Jour'}
              {period === 'week' && 'Semaine'}
              {period === 'month' && 'Mois'}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardData.stats.map((stat, index) => (
          <StatsWidget key={index} {...stat} />
        ))}
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphiques */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progression d'étude</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingCard />}>
                <OptimizedChart period={state.selectedPeriod} />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bibliothèque musicale</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingCard />}>
                <MusicLibrary compact />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RecentActivity activities={dashboardData.recentActivities} />
          
          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Music className="h-4 w-4 mr-2" />
                Générer une musique
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Brain className="h-4 w-4 mr-2" />
                Nouveau quiz
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Star className="h-4 w-4 mr-2" />
                Mode étude
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

OptimizedDashboard.displayName = 'OptimizedDashboard';