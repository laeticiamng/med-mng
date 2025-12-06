import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Minus, Target, Clock, 
  Users, Zap, Heart, BookOpen, Music, Trophy,
  Calendar, Activity, Star, Award, BarChart3
} from 'lucide-react';

interface StatItem {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'stable';
    period: string;
  };
  target?: {
    current: number;
    goal: number;
    unit: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
  actionable?: boolean;
}

interface ModernStatsProps {
  stats: StatItem[];
  layout?: 'grid' | 'list' | 'compact';
  showTrends?: boolean;
  showTargets?: boolean;
  animated?: boolean;
}

/**
 * Affichage de statistiques modernes avec animations
 */
export const ModernStats: React.FC<ModernStatsProps> = ({
  stats,
  layout = 'grid',
  showTrends = true,
  showTargets = true,
  animated = true
}) => {
  const getTrendIcon = (type: string) => {
    switch (type) {
      case 'increase': return TrendingUp;
      case 'decrease': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (type: string) => {
    switch (type) {
      case 'increase': return 'text-success';
      case 'decrease': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const formatValue = (value: string | number, unit?: string) => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      }
      if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'k';
      }
      return value.toString();
    }
    return value;
  };

  if (layout === 'compact') {
    return (
      <div className="space-y-2">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const TrendIcon = stat.change ? getTrendIcon(stat.change.type) : null;
          
          return (
            <div 
              key={stat.id}
              className={`flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors ${
                animated ? 'animate-fade-in-up' : ''
              }`}
              style={{ animationDelay: animated ? `${index * 0.1}s` : '0s' }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stat.color}`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-lg">
                  {formatValue(stat.value, stat.unit)}
                  {stat.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>}
                </p>
                {showTrends && stat.change && TrendIcon && (
                  <div className={`flex items-center gap-1 text-xs ${getTrendColor(stat.change.type)}`}>
                    <TrendIcon className="w-3 h-3" />
                    {Math.abs(stat.change.value)}% {stat.change.period}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="space-y-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const TrendIcon = stat.change ? getTrendIcon(stat.change.type) : null;
          
          return (
            <Card 
              key={stat.id}
              className={`medical-card ${animated ? 'animate-slide-in-right' : ''}`}
              style={{ animationDelay: animated ? `${index * 0.1}s` : '0s' }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{stat.label}</h3>
                      {stat.description && (
                        <p className="text-sm text-muted-foreground">{stat.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-3xl font-bold">
                      {formatValue(stat.value, stat.unit)}
                      {stat.unit && <span className="text-lg font-normal text-muted-foreground ml-2">{stat.unit}</span>}
                    </p>
                    
                    {showTrends && stat.change && TrendIcon && (
                      <div className={`flex items-center gap-2 mt-2 ${getTrendColor(stat.change.type)}`}>
                        <TrendIcon className="w-4 h-4" />
                        <span className="font-medium">
                          {Math.abs(stat.change.value)}% {stat.change.period}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {showTargets && stat.target && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Objectif</span>
                      <span className="font-medium">
                        {stat.target.current}/{stat.target.goal} {stat.target.unit}
                      </span>
                    </div>
                    <Progress 
                      value={(stat.target.current / stat.target.goal) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Layout Grid (default)
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        const TrendIcon = stat.change ? getTrendIcon(stat.change.type) : null;
        
        return (
          <Card 
            key={stat.id}
            className={`medical-card ${animated ? 'animate-scale-in' : ''} ${
              stat.actionable ? 'cursor-pointer hover:shadow-md' : ''
            }`}
            style={{ animationDelay: animated ? `${index * 0.1}s` : '0s' }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color}`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                {showTrends && stat.change && TrendIcon && (
                  <Badge 
                    variant="secondary" 
                    className={`${getTrendColor(stat.change.type)} border-current`}
                  >
                    <TrendIcon className="w-3 h-3 mr-1" />
                    {Math.abs(stat.change.value)}%
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">
                  {stat.label}
                </h3>
                
                <p className="text-2xl font-bold">
                  {formatValue(stat.value, stat.unit)}
                  {stat.unit && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {stat.unit}
                    </span>
                  )}
                </p>
                
                {stat.description && (
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                )}
                
                {showTrends && stat.change && (
                  <p className={`text-xs ${getTrendColor(stat.change.type)}`}>
                    {stat.change.type === 'increase' ? '+' : stat.change.type === 'decrease' ? '-' : ''}
                    {Math.abs(stat.change.value)}% {stat.change.period}
                  </p>
                )}
                
                {showTargets && stat.target && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Objectif</span>
                      <span>{Math.round((stat.target.current / stat.target.goal) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(stat.target.current / stat.target.goal) * 100} 
                      className="h-1"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Hook pour données de statistiques
export const useModernStatsData = (): StatItem[] => {
  return [
    {
      id: 'total-users',
      label: 'Utilisateurs Actifs',
      value: 15420,
      change: { value: 12.5, type: 'increase', period: 'ce mois' },
      target: { current: 15420, goal: 20000, unit: 'utilisateurs' },
      icon: Users,
      color: 'bg-blue-500',
      description: 'Utilisateurs connectés dans les 30 derniers jours',
      actionable: true
    },
    {
      id: 'completion-rate',
      label: 'Taux de Complétion',
      value: 87.3,
      unit: '%',
      change: { value: 5.2, type: 'increase', period: 'cette semaine' },
      target: { current: 87.3, goal: 95, unit: '%' },
      icon: Target,
      color: 'bg-green-500',
      description: 'Pourcentage d\'items EDN complétés'
    },
    {
      id: 'study-time',
      label: 'Temps d\'Étude',
      value: 2.4,
      unit: 'h/jour',
      change: { value: 8.1, type: 'increase', period: 'cette semaine' },
      target: { current: 2.4, goal: 3, unit: 'h/jour' },
      icon: Clock,
      color: 'bg-purple-500',
      description: 'Temps moyen d\'étude par utilisateur'
    },
    {
      id: 'generated-content',
      label: 'Contenus Générés',
      value: 45230,
      change: { value: 23.7, type: 'increase', period: 'ce mois' },
      icon: Music,
      color: 'bg-pink-500',
      description: 'Contenus musicaux créés par l\'IA'
    },
    {
      id: 'engagement',
      label: 'Engagement',
      value: 94.2,
      unit: '%',
      change: { value: 3.1, type: 'increase', period: 'cette semaine' },
      icon: Heart,
      color: 'bg-red-500',
      description: 'Taux d\'engagement moyen'
    },
    {
      id: 'success-rate',
      label: 'Taux de Réussite',
      value: 89.5,
      unit: '%',
      change: { value: 2.3, type: 'increase', period: 'ce mois' },
      target: { current: 89.5, goal: 95, unit: '%' },
      icon: Trophy,
      color: 'bg-amber-500',
      description: 'Réussite aux évaluations'
    },
    {
      id: 'active-sessions',
      label: 'Sessions Actives',
      value: 1247,
      change: { value: 15.2, type: 'increase', period: 'maintenant' },
      icon: Activity,
      color: 'bg-cyan-500',
      description: 'Utilisateurs actuellement connectés'
    },
    {
      id: 'satisfaction',
      label: 'Satisfaction',
      value: 4.8,
      unit: '/5',
      change: { value: 0.3, type: 'increase', period: 'ce mois' },
      icon: Star,
      color: 'bg-orange-500',
      description: 'Note moyenne des utilisateurs'
    }
  ];
};