import logger from '@/lib/logger';
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  Star,
  Flame,
  Target
} from 'lucide-react';

interface DifficultyItem {
  item_number: string;
  title: string;
  specialty: string;
  time_spent_minutes: number;
  score: number;
  attempts: number;
  difficulty_score: number;
}

export const DifficultyAnalysis: React.FC = () => {
  const { user } = useAuth();

  const { data: progressData = [] } = useQuery({
    queryKey: ['progress-analysis', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await (supabase as any)
        .from('user_edn_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        logger.error('Error fetching progress:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch EDN items details
  const { data: ednItems = [] } = useQuery({
    queryKey: ['edn-items-details'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('edn_items')
        .select('item_number, title, specialty');

      if (error) {
        logger.error('Error fetching EDN items:', error);
        return [];
      }
      
      return data || [];
    },
  });

  // Calculate difficulty scores
  const difficultItems = useMemo(() => {
    const items: DifficultyItem[] = progressData
      .map((progress: any) => {
        const item = ednItems.find((e: any) => e.item_number === progress.item_number);
        
        // Calculate difficulty score based on:
        // - Low score (weighted heavily)
        // - High time spent (indicates struggle)
        // - Multiple attempts
        const scoreWeight = progress.score ? (100 - progress.score) : 50;
        const timeWeight = Math.min(progress.time_spent_minutes / 10, 50); // Cap at 50
        const difficultyScore = (scoreWeight * 0.6) + (timeWeight * 0.4);
        
        return {
          item_number: progress.item_number,
          title: item?.title || `Item ${progress.item_number}`,
          specialty: item?.specialty || 'Non définie',
          time_spent_minutes: progress.time_spent_minutes || 0,
          score: progress.score || 0,
          attempts: 1, // Would need to track this separately
          difficulty_score: difficultyScore,
        };
      })
      .sort((a, b) => b.difficulty_score - a.difficulty_score)
      .slice(0, 10); // Top 10 most difficult

    return items;
  }, [progressData, ednItems]);

  // Specialty difficulty average
  const specialtyDifficulty = useMemo(() => {
    const specialties: Record<string, { total: number; count: number; avgTime: number; avgScore: number }> = {};
    
    progressData.forEach((progress: any) => {
      const item = ednItems.find((e: any) => e.item_number === progress.item_number);
      const specialty = item?.specialty || 'Non définie';
      
      if (!specialties[specialty]) {
        specialties[specialty] = { total: 0, count: 0, avgTime: 0, avgScore: 0 };
      }
      
      specialties[specialty].total += progress.time_spent_minutes || 0;
      specialties[specialty].count += 1;
      specialties[specialty].avgScore += progress.score || 0;
    });
    
    return Object.entries(specialties)
      .map(([name, data]) => ({
        name,
        avgTime: Math.round(data.total / data.count),
        avgScore: Math.round(data.avgScore / data.count),
        itemCount: data.count,
      }))
      .sort((a, b) => a.avgScore - b.avgScore) // Sort by lowest score (most difficult)
      .slice(0, 5);
  }, [progressData, ednItems]);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyse de Difficulté</CardTitle>
          <CardDescription>
            Connectez-vous pour identifier vos points à améliorer
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (progressData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyse de Difficulté</CardTitle>
          <CardDescription>
            Commencez à réviser des items pour voir l'analyse de difficulté
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucune donnée disponible pour l'instant</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Most Difficult Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Items les plus difficiles
              </CardTitle>
              <CardDescription>
                Basé sur votre score et temps passé (Top 10)
              </CardDescription>
            </div>
            <Badge variant="destructive" className="gap-1">
              <Flame className="h-3 w-3" />
              À revoir
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {difficultItems.map((item, index) => (
              <div
                key={item.item_number}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10 text-destructive font-bold text-sm">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      #{item.item_number}
                    </Badge>
                    <p className="font-medium text-sm truncate">{item.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.specialty}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{item.time_spent_minutes}min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className={`h-3 w-3 ${item.score >= 70 ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                    <span className={item.score >= 70 ? 'text-foreground' : 'text-destructive font-medium'}>
                      {item.score}/100
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Specialty Difficulty */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-blue-500" />
            Difficulté par spécialité
          </CardTitle>
          <CardDescription>
            Temps moyen et score par catégorie médicale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {specialtyDifficulty.map((specialty) => (
              <div key={specialty.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{specialty.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {specialty.itemCount} items
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {specialty.avgTime}min
                    </span>
                    <span className={specialty.avgScore >= 70 ? 'text-green-600' : 'text-orange-600'}>
                      <Star className="h-3 w-3 inline mr-1" />
                      {specialty.avgScore}/100
                    </span>
                  </div>
                </div>
                <Progress 
                  value={specialty.avgScore} 
                  className={`h-2 ${specialty.avgScore >= 70 ? '' : 'bg-orange-100'}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
