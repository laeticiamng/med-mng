import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import {
    Award,
    CheckCircle,
    Clock,
    Star,
    Target,
    TrendingUp,
    Trophy,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
 * Indicateur de progression moderne avec analytics - Données réelles Supabase
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  data,
  showTrends = true,
  showAchievements = true,
  compact = false
}) => {
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
                <IconComponent className="w-4 h-4 text-primary-foreground" />
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
                    <IconComponent className="w-5 h-5 text-primary-foreground" />
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
                      <Award className="w-4 h-4 text-warning" />
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

// Hook pour données de progression - Données réelles Supabase
export const useProgressData = () => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setDefaultProgressData();
          return;
        }

        // Charger les données réelles
        const { _data: itemsData } = await supabase.from('user_item_progress').select('id').eq('user_id', user.id);
        const { _data: sessionsData } = await supabase.from('activity_sessions').select('duration_seconds').eq('user_id', user.id);
        const { _data: songsData } = await supabase.from('med_mng_songs').select('id').eq('user_id', user.id);
        const { _data: quizData } = await supabase.from('quiz_sessions').select('score').eq('user_id', user.id);

        const completedItems = itemsData?.length || 0;
        const totalStudyMinutes = Math.round((sessionsData?.reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0) || 0) / 60);
        const totalStudyHours = Math.round(totalStudyMinutes / 60);
        const createdContent = songsData?.length || 0;
        const quizScores = quizData || [];
        const avgScore = quizScores.length > 0 
          ? Math.round(quizScores.reduce((sum: number, q: any) => sum + (q.score || 0), 0) / quizScores.length) 
          : 0;

        // Déterminer les tendances basées sur les données
        const getTrend = (current: number, target: number): 'up' | 'down' | 'stable' => {
          const percentage = (current / target) * 100;
          if (percentage >= 60) return 'up';
          if (percentage >= 30) return 'stable';
          return 'down';
        };

        const data: ProgressData[] = [
          {
            category: 'Apprentissage',
            label: 'Items EDN Complétés',
            current: completedItems,
            target: 370,
            unit: 'items',
            icon: Trophy,
            color: 'bg-primary',
            trend: getTrend(completedItems, 370),
            achievements: completedItems >= 50 ? ['Débutant', 'Régulier'] : completedItems >= 10 ? ['Débutant'] : []
          },
          {
            category: 'Performance',
            label: 'Score Moyen Quiz',
            current: avgScore,
            target: 100,
            unit: '%',
            icon: Target,
            color: 'bg-success',
            trend: avgScore >= 70 ? 'up' : avgScore >= 50 ? 'stable' : 'down',
            achievements: avgScore >= 80 ? ['Excellent', 'Progressant'] : avgScore >= 60 ? ['Progressant'] : []
          },
          {
            category: 'Temps d\'Étude',
            label: 'Heures Cette Semaine',
            current: totalStudyHours,
            target: 35,
            unit: 'h',
            icon: Clock,
            color: 'bg-warning',
            trend: getTrend(totalStudyHours, 35),
            achievements: totalStudyHours >= 20 ? ['Assidu', 'Constant'] : totalStudyHours >= 10 ? ['Assidu'] : []
          },
          {
            category: 'Simulations',
            label: 'Quiz Réalisés',
            current: quizScores.length,
            target: 60,
            unit: 'quiz',
            icon: CheckCircle,
            color: 'bg-accent',
            trend: getTrend(quizScores.length, 60),
            achievements: quizScores.length >= 30 ? ['Simulateur', 'Expert'] : quizScores.length >= 10 ? ['Simulateur'] : []
          },
          {
            category: 'Créativité',
            label: 'Contenus Générés',
            current: createdContent,
            target: 50,
            unit: 'créations',
            icon: Zap,
            color: 'bg-accent',
            trend: getTrend(createdContent, 50),
            achievements: createdContent >= 20 ? ['Créatif', 'Innovant'] : createdContent >= 5 ? ['Créatif'] : []
          },
          {
            category: 'Qualité',
            label: 'Score Moyen',
            current: avgScore >= 80 ? 4.5 : avgScore >= 60 ? 3.5 : 2.5,
            target: 5.0,
            unit: '★',
            icon: Star,
            color: 'bg-warning',
            trend: avgScore >= 70 ? 'up' : 'stable',
            achievements: avgScore >= 80 ? ['Qualité', 'Excellence'] : []
          }
        ];

        setProgressData(data);
      } catch (error) {
        console.error('Erreur chargement progression:', error);
        setDefaultProgressData();
      } finally {
        setLoading(false);
      }
    };

    const setDefaultProgressData = () => {
      setProgressData([
        { category: 'Apprentissage', label: 'Items EDN Complétés', current: 0, target: 370, unit: 'items', icon: Trophy, color: 'bg-primary', trend: 'stable', achievements: [] },
        { category: 'Performance', label: 'Score Moyen Quiz', current: 0, target: 100, unit: '%', icon: Target, color: 'bg-success', trend: 'stable', achievements: [] },
        { category: 'Temps d\'Étude', label: 'Heures Cette Semaine', current: 0, target: 35, unit: 'h', icon: Clock, color: 'bg-warning', trend: 'stable', achievements: [] },
        { category: 'Simulations', label: 'Quiz Réalisés', current: 0, target: 60, unit: 'quiz', icon: CheckCircle, color: 'bg-accent', trend: 'stable', achievements: [] },
        { category: 'Créativité', label: 'Contenus Générés', current: 0, target: 50, unit: 'créations', icon: Zap, color: 'bg-accent', trend: 'stable', achievements: [] },
        { category: 'Qualité', label: 'Score Moyen', current: 0, target: 5.0, unit: '★', icon: Star, color: 'bg-warning', trend: 'stable', achievements: [] }
      ]);
      setLoading(false);
    };

    loadProgressData();
  }, []);

  return progressData;
};