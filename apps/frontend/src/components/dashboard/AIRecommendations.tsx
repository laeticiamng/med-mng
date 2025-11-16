import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Target,
  Brain,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';

interface Recommendation {
  item_number: string;
  title: string;
  specialty: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ComponentType<{ className?: string }>;
}

export const AIRecommendations: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: progressData = [] } = useQuery({
    queryKey: ['progress-recommendations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await (supabase as any)
        .from('user_edn_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) return [];
      return data || [];
    },
    enabled: !!user,
  });

  const { data: allItems = [] } = useQuery({
    queryKey: ['all-edn-items-reco'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('edn_items')
        .select('item_number, title, specialty')
        .limit(367);

      if (error) return [];
      return data || [];
    },
  });

  // AI-based recommendations
  const recommendations = useMemo(() => {
    const recs: Recommendation[] = [];
    
    if (!user || progressData.length === 0) {
      // New user recommendations
      const starterItems = allItems.slice(0, 5);
      return starterItems.map((item: any) => ({
        item_number: item.item_number,
        title: item.title,
        specialty: item.specialty || 'Non définie',
        reason: 'Item recommandé pour démarrer votre progression',
        priority: 'medium' as const,
        icon: Target,
      }));
    }

    // 1. Items with low scores (need review)
    const lowScoreItems = progressData
      .filter((p: any) => p.score > 0 && p.score < 60)
      .slice(0, 2);

    lowScoreItems.forEach((progress: any) => {
      const item = allItems.find((i: any) => i.item_number === progress.item_number);
      if (item) {
        recs.push({
          item_number: progress.item_number,
          title: item.title,
          specialty: item.specialty || 'Non définie',
          reason: `Score faible (${progress.score}/100) - Révision recommandée`,
          priority: 'high',
          icon: TrendingUp,
        });
      }
    });

    // 2. Items not reviewed recently
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oldItems = progressData
      .filter((p: any) => {
        if (!p.last_reviewed_at) return false;
        return new Date(p.last_reviewed_at) < oneWeekAgo;
      })
      .slice(0, 2);

    oldItems.forEach((progress: any) => {
      const item = allItems.find((i: any) => i.item_number === progress.item_number);
      if (item && !recs.find(r => r.item_number === progress.item_number)) {
        recs.push({
          item_number: progress.item_number,
          title: item.title,
          specialty: item.specialty || 'Non définie',
          reason: 'Pas révisé depuis plus d\'une semaine',
          priority: 'medium',
          icon: Clock,
        });
      }
    });

    // 3. Items in same specialty as completed ones (reinforcement)
    const completedSpecialties = progressData
      .filter((p: any) => p.status === 'completed' || p.status === 'mastered')
      .map((p: any) => {
        const item = allItems.find((i: any) => i.item_number === p.item_number);
        return item?.specialty;
      })
      .filter(Boolean);

    const mostCommonSpecialty = completedSpecialties.length > 0
      ? completedSpecialties.sort((a, b) =>
          completedSpecialties.filter(s => s === a).length - 
          completedSpecialties.filter(s => s === b).length
        ).pop()
      : null;

    if (mostCommonSpecialty) {
      const relatedItems = allItems
        .filter((item: any) => 
          item.specialty === mostCommonSpecialty &&
          !progressData.find((p: any) => p.item_number === item.item_number)
        )
        .slice(0, 2);

      relatedItems.forEach((item: any) => {
        if (recs.length < 5 && !recs.find(r => r.item_number === item.item_number)) {
          recs.push({
            item_number: item.item_number,
            title: item.title,
            specialty: item.specialty,
            reason: `Continue dans la spécialité ${mostCommonSpecialty}`,
            priority: 'low',
            icon: Brain,
          });
        }
      });
    }

    // 4. Fill with new items if needed
    const newItems = allItems
      .filter((item: any) => 
        !progressData.find((p: any) => p.item_number === item.item_number)
      )
      .slice(0, 5 - recs.length);

    newItems.forEach((item: any) => {
      if (recs.length < 5) {
        recs.push({
          item_number: item.item_number,
          title: item.title,
          specialty: item.specialty || 'Non définie',
          reason: 'Nouvel item à découvrir',
          priority: 'low',
          icon: Sparkles,
        });
      }
    });

    return recs.slice(0, 5);
  }, [progressData, allItems, user]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Urgent';
      case 'medium': return 'Important';
      default: return 'À explorer';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommandations IA
          </CardTitle>
          <CardDescription>
            Connectez-vous pour obtenir des recommandations personnalisées
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recommandations IA
            </CardTitle>
            <CardDescription>
              Items suggérés basés sur votre progression et vos performances
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <Brain className="h-3 w-3" />
            {recommendations.length} suggestions
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <div
                key={rec.item_number}
                className="group flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all cursor-pointer"
                onClick={() => navigate(`${ROUTE_PATHS.ednComplete}?item=${rec.item_number}`)}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      #{rec.item_number}
                    </Badge>
                    <Badge variant={getPriorityColor(rec.priority)} className="text-xs">
                      {getPriorityLabel(rec.priority)}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm mb-1 truncate">{rec.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{rec.specialty}</span>
                    <span>•</span>
                    <span>{rec.reason}</span>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          {recommendations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune recommandation pour le moment</p>
              <p className="text-sm mt-2">Complétez quelques items pour obtenir des suggestions personnalisées</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
