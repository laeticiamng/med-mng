import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Trophy, Target, Clock, CheckCircle, 
  TrendingUp, Star, Zap, Award 
} from 'lucide-react';

interface ProgressData {
  category: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  achievements?: string[];
}

interface ProgressIndicatorProps {
  data: ProgressData[];
  showTrends?: boolean;
  showAchievements?: boolean;
  compact?: boolean;
}

/**
 * Indicateur de progression moderne avec analytics
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  data,
  showTrends = true,
  showAchievements = true,
  compact = false
}) => {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-success';
    if (percentage >= 70) return 'bg-primary';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-muted-foreground';
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-success" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-destructive rotate-180" />;
      default: return null;
    }
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = Math.min((item.current / item.target) * 100, 100);
          const IconComponent = item.icon;
          
          return (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.color}`}>
                <IconComponent className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate">{item.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">
                      {item.current}/{item.target} {item.unit}
                    </span>
                    {showTrends && getTrendIcon(item.trend)}
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2 mt-1"
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((item, index) => {
        const percentage = Math.min((item.current / item.target) * 100, 100);
        const IconComponent = item.icon;
        
        return (
          <Card key={index} className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                </div>
                {showTrends && getTrendIcon(item.trend)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {item.current}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      / {item.target} {item.unit}
                    </span>
                  </span>
                  <Badge 
                    variant="secondary" 
                    className={percentage >= 100 ? 'bg-success/10 text-success' : ''}
                  >
                    {Math.round(percentage)}%
                  </Badge>
                </div>

                <Progress 
                  value={percentage} 
                  className="h-2"
                />

                {showAchievements && item.achievements && item.achievements.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium">Récompenses</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.achievements.slice(0, 3).map((achievement, achIndex) => (
                        <Badge 
                          key={achIndex} 
                          variant="outline" 
                          className="text-xs"
                        >
                          {achievement}
                        </Badge>
                      ))}
                      {item.achievements.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.achievements.length - 3}
                        </Badge>
                      )}
                    </div>
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

// Hook pour données de progression
export const useProgressData = () => {
  const progressData: ProgressData[] = [
    {
      category: 'Apprentissage',
      label: 'Items EDN Complétés',
      current: 156,
      target: 370,
      unit: 'items',
      icon: Trophy,
      color: 'bg-primary',
      trend: 'up',
      achievements: ['Débutant', 'Régulier', 'Déterminé']
    },
    {
      category: 'Performance',
      label: 'Taux de Réussite',
      current: 87,
      target: 100,
      unit: '%',
      icon: Target,
      color: 'bg-success',
      trend: 'up',
      achievements: ['Excellent', 'Progressant']
    },
    {
      category: 'Temps d\'Étude',
      label: 'Heures Cette Semaine',
      current: 24,
      target: 35,
      unit: 'h',
      icon: Clock,
      color: 'bg-warning',
      trend: 'stable',
      achievements: ['Assidu', 'Constant']
    },
    {
      category: 'Simulations',
      label: 'ECOS Réalisés',
      current: 45,
      target: 60,
      unit: 'scénarios',
      icon: CheckCircle,
      color: 'bg-accent',
      trend: 'up',
      achievements: ['Simulateur', 'Expert']
    },
    {
      category: 'Créativité',
      label: 'Contenus Générés',
      current: 28,
      target: 50,
      unit: 'créations',
      icon: Zap,
      color: 'bg-purple-500',
      trend: 'up',
      achievements: ['Créatif', 'Innovant']
    },
    {
      category: 'Qualité',
      label: 'Score Moyen',
      current: 4.6,
      target: 5.0,
      unit: '★',
      icon: Star,
      color: 'bg-amber-500',
      trend: 'up',
      achievements: ['Qualité', 'Excellence']
    }
  ];

  return progressData;
};