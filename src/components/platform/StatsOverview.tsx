import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Music, BookOpen, Trophy, Brain,
  Target, Award, Clock, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Stat {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  description?: string;
  progress?: number;
}

export const StatsOverview: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation des statistiques utilisateur
    const simulatedStats: Stat[] = [
      {
        id: 'total-items',
        title: 'Items EDN Étudiés',
        value: 147,
        change: '+12 cette semaine',
        changeType: 'positive',
        icon: BookOpen,
        description: 'Sur 365 items disponibles',
        progress: Math.round((147 / 365) * 100)
      },
      {
        id: 'music-generated',
        title: 'Musiques Générées',
        value: 23,
        change: '+5 ce mois',
        changeType: 'positive',
        icon: Music,
        description: 'Créations avec IA musicale'
      },
      {
        id: 'quiz-score',
        title: 'Score Moyen Quiz',
        value: '82%',
        change: '+5% vs mois dernier',
        changeType: 'positive',
        icon: Trophy,
        description: 'Basé sur 45 quiz complétés'
      },
      {
        id: 'study-time',
        title: 'Temps d\'Étude',
        value: '24h',
        change: 'Cette semaine',
        changeType: 'neutral',
        icon: Clock,
        description: 'Temps total d\'apprentissage'
      },
      {
        id: 'immersive-sessions',
        title: 'Sessions Immersives',
        value: 18,
        change: '+3 cette semaine',
        changeType: 'positive',
        icon: Brain,
        description: 'Expériences d\'apprentissage avancées'
      },
      {
        id: 'achievements',
        title: 'Badges Obtenus',
        value: 12,
        change: '+2 ce mois',
        changeType: 'positive',
        icon: Award,
        description: 'Récompenses débloquées'
      }
    ];

    setTimeout(() => {
      setStats(simulatedStats);
      setLoading(false);
    }, 800);
  }, []);

  const getChangeColor = (type?: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-8 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Vue d'ensemble
        </h3>
        <Badge variant="secondary" className="text-xs">
          Mis à jour maintenant
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p className={`text-xs ${getChangeColor(stat.changeType)}`}>
                    {stat.change}
                  </p>
                )}
                {stat.description && (
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                )}
                {stat.progress !== undefined && (
                  <div className="space-y-1">
                    <Progress value={stat.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                      {stat.progress}%
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};