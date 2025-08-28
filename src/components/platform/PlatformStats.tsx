import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Music, Trophy, TrendingUp, 
  Clock, Target, Zap, Star, Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface PlatformStat {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<any>;
  color: string;
  progress?: number;
  target?: number;
}

export const PlatformStats: React.FC = () => {
  const [stats, setStats] = useState<PlatformStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation des statistiques de la plateforme
    const platformStats: PlatformStat[] = [
      {
        id: 'total-users',
        title: 'Utilisateurs Actifs',
        value: 2847,
        change: 12,
        changeLabel: 'vs mois dernier',
        icon: Users,
        color: 'text-blue-600'
      },
      {
        id: 'edn-completion',
        title: 'Items EDN Complétés',
        value: 89,
        unit: '%',
        progress: 89,
        target: 100,
        icon: BookOpen,
        color: 'text-green-600'
      },
      {
        id: 'music-generated',
        title: 'Musiques Générées',
        value: 1523,
        change: 23,
        changeLabel: 'cette semaine',
        icon: Music,
        color: 'text-purple-600'
      },
      {
        id: 'quiz-success',
        title: 'Taux de Réussite Quiz',
        value: 78,
        unit: '%',
        progress: 78,
        target: 85,
        icon: Trophy,
        color: 'text-yellow-600'
      },
      {
        id: 'study-time',
        title: 'Temps d\'Étude Moyen',
        value: 4.2,
        unit: 'h/jour',
        change: 8,
        changeLabel: 'vs moyenne',
        icon: Clock,
        color: 'text-indigo-600'
      },
      {
        id: 'satisfaction',
        title: 'Satisfaction Utilisateurs',
        value: 4.8,
        unit: '/5',
        progress: 96,
        target: 100,
        icon: Star,
        color: 'text-orange-600'
      }
    ];

    setTimeout(() => {
      setStats(platformStats);
      setLoading(false);
    }, 800);
  }, []);

  const formatValue = (value: number | string, unit?: string) => {
    if (typeof value === 'number' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}k${unit ? ` ${unit}` : ''}`;
    }
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-muted-foreground';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-8 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-2 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Statistiques de la Plateforme</h3>
        <Badge variant="outline" className="text-xs">
          Mis à jour il y a 5 min
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold">
                    {formatValue(stat.value, stat.unit)}
                  </div>
                  {stat.change && (
                    <div className={`text-xs flex items-center gap-1 mt-1 ${getChangeColor(stat.change)}`}>
                      <TrendingUp className="w-3 h-3" />
                      +{stat.change}% {stat.changeLabel}
                    </div>
                  )}
                </div>

                {stat.progress !== undefined && stat.target && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progression</span>
                      <span>{stat.progress}% / {stat.target}%</span>
                    </div>
                    <Progress value={stat.progress} className="h-2" />
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