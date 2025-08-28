import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  Music,
  Stethoscope,
  Brain,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Star,
  Play,
  Headphones,
  GraduationCap,
  Activity,
  Target,
  Zap,
  Award,
  Calendar,
  CheckCircle2,
  Timer,
  Heart,
  Volume2,
  PlusCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DashboardCard {
  title: string;
  description: string;
  to: string;
  icon: React.ComponentType<any>;
  gradient: string;
  stats?: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
  };
  actions?: {
    label: string;
    to: string;
    variant?: 'default' | 'outline';
  }[];
  badge?: string;
  progress?: number;
}

const dashboardCards: DashboardCard[] = [
  {
    title: 'EDN Immersif',
    description: 'Items de connaissances avec expérience immersive complète',
    to: '/edn',
    icon: GraduationCap,
    gradient: 'from-blue-600 to-purple-600',
    stats: {
      label: 'Items disponibles',
      value: '365+',
      trend: 'up'
    },
    actions: [
      { label: 'Explorer', to: '/edn', variant: 'default' },
      { label: 'Continuer', to: '/edn?tab=progress', variant: 'outline' }
    ],
    badge: 'Populaire',
    progress: 75
  },
  {
    title: 'MED-MNG Studio',
    description: 'Création musicale médicale avec IA et collaboration',
    to: '/med-mng/dashboard',
    icon: Music,
    gradient: 'from-purple-600 to-pink-600',
    stats: {
      label: 'Créations musicales',
      value: '1,234',
      trend: 'up'
    },
    actions: [
      { label: 'Créer', to: '/med-mng/create', variant: 'default' },
      { label: 'Bibliothèque', to: '/med-mng/library', variant: 'outline' }
    ],
    badge: 'Nouveau',
    progress: 60
  },
  {
    title: 'ECOS Cliniques',
    description: 'Situations cliniques interactives et évaluations',
    to: '/ecos',
    icon: Stethoscope,
    gradient: 'from-green-600 to-teal-600',
    stats: {
      label: 'Situations UNESS',
      value: '150+',
      trend: 'stable'
    },
    actions: [
      { label: 'Pratiquer', to: '/ecos?mode=training', variant: 'default' },
      { label: 'Évaluer', to: '/ecos?mode=exam', variant: 'outline' }
    ],
    progress: 40
  },
  {
    title: 'Assistant IA',
    description: 'Chat médical intelligent pour assistance instantanée',
    to: '/chat',
    icon: Brain,
    gradient: 'from-orange-600 to-red-600',
    stats: {
      label: 'Conversations',
      value: '2,890',
      trend: 'up'
    },
    actions: [
      { label: 'Discuter', to: '/chat', variant: 'default' }
    ],
    progress: 90
  },
  {
    title: 'Analytics',
    description: 'Tableaux de bord et analytics avancés',
    to: '/analytics',
    icon: BarChart3,
    gradient: 'from-indigo-600 to-blue-600',
    stats: {
      label: 'Données analysées',
      value: '15.2k',
      trend: 'up'
    },
    actions: [
      { label: 'Voir données', to: '/analytics', variant: 'default' }
    ],
    progress: 85
  }
];

const quickStats = [
  {
    label: 'Temps d\'étude',
    value: '47h 23min',
    icon: Clock,
    change: '+12%',
    trend: 'up' as const
  },
  {
    label: 'Items maîtrisés',
    value: '127/365',
    icon: CheckCircle2,
    change: '+8',
    trend: 'up' as const
  },
  {
    label: 'Streak quotidien',
    value: '15 jours',
    icon: Timer,
    change: '+1',
    trend: 'up' as const
  },
  {
    label: 'Score moyen',
    value: '89.5%',
    icon: Star,
    change: '+2.3%',
    trend: 'up' as const
  }
];

const recentActivities = [
  {
    type: 'edn',
    title: 'Item IC-290 complété',
    description: 'Épidémiologie et prévention des cancers',
    time: '2 min',
    icon: BookOpen,
    score: 95
  },
  {
    type: 'music',
    title: 'Nouvelle mélodie créée',
    description: 'Cardiologie - Arythmies',
    time: '15 min',
    icon: Music,
    score: null
  },
  {
    type: 'ecos',
    title: 'ECOS SD-042 réussi',
    description: 'Consultation de médecine générale',
    time: '1h',
    icon: Stethoscope,
    score: 87
  },
  {
    type: 'chat',
    title: 'Session chat terminée',
    description: 'Questions sur la pneumologie',
    time: '2h',
    icon: Brain,
    score: null
  }
];

export const CompleteDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '☀️ Bonjour';
    if (hour < 18) return '🌤️ Bon après-midi';
    return '🌙 Bonsoir';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                {getGreeting()} !
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </h1>
              <p className="text-gray-600">
                {currentTime.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Target className="h-4 w-4" />
                Objectifs
              </Button>
              <Button variant="default" size="sm" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Nouvelle session
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10" />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={cn(
                        "text-xs font-medium",
                        stat.trend === 'up' ? "text-green-600" : "text-red-600"
                      )}>
                        {stat.change}
                      </span>
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {dashboardCards.map((card, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              {/* Gradient Background */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
                card.gradient
              )} />
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-br text-white shadow-lg",
                      card.gradient
                    )}>
                      <card.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        {card.title}
                        {card.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {card.badge}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {card.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-4">
                {/* Stats */}
                {card.stats && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-muted-foreground">{card.stats.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{card.stats.value}</span>
                      {card.stats.trend && (
                        <TrendingUp className={cn(
                          "h-4 w-4",
                          card.stats.trend === 'up' ? "text-green-600" : "text-red-600",
                          card.stats.trend === 'down' && "rotate-180"
                        )} />
                      )}
                    </div>
                  </div>
                )}

                {/* Progress */}
                {card.progress !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">{card.progress}%</span>
                    </div>
                    <Progress value={card.progress} className="h-2" />
                  </div>
                )}

                {/* Actions */}
                {card.actions && (
                  <div className="flex items-center gap-2 pt-2">
                    {card.actions.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant={action.variant || 'default'}
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <NavLink to={action.to} className="gap-2">
                          {action.label}
                          <ArrowRight className="h-4 w-4" />
                        </NavLink>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activité récente
            </CardTitle>
            <CardDescription>
              Votre progression et activités des dernières heures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <activity.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    {activity.score && (
                      <div className="text-lg font-bold text-green-600 mb-1">
                        {activity.score}%
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      il y a {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};