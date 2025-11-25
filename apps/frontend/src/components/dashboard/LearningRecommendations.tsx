import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Lightbulb,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import logger from '@/lib/logger';

interface Recommendation {
  id: string;
  type: 'weak_topic' | 'continue_learning' | 'review_needed' | 'new_topic' | 'trending';
  title: string;
  description: string;
  itemNumber?: string;
  speciality?: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  estimatedTime?: number; // minutes
  xpReward?: number;
}

interface LearningStats {
  totalItemsViewed: number;
  averageQuizScore: number;
  weakTopics: string[];
  strongTopics: string[];
  lastStudiedItem?: string;
  studyStreak: number;
}

const useLearningRecommendations = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['learning-recommendations', userId],
    queryFn: async (): Promise<{ recommendations: Recommendation[]; stats: LearningStats }> => {
      if (!userId) {
        return { recommendations: [], stats: getDefaultStats() };
      }

      try {
        // Fetch user progress data
        const [progressResult, quizResult, viewsResult] = await Promise.all([
          (supabase as any)
            .from('edn_item_progress')
            .select('item_number, status, completeness_score, last_viewed_at')
            .eq('user_id', userId)
            .order('last_viewed_at', { ascending: false }),
          (supabase as any)
            .from('quiz_results')
            .select('quiz_id, score, total_questions, created_at, quiz:quizzes(speciality)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50),
          (supabase as any)
            .from('edn_item_views')
            .select('item_number, view_count, last_viewed_at')
            .eq('user_id', userId)
            .order('last_viewed_at', { ascending: false })
            .limit(20),
        ]);

        const progress = progressResult.data || [];
        const quizzes = quizResult.data || [];
        const views = viewsResult.data || [];

        // Calculate stats
        const stats = calculateStats(progress, quizzes, views);

        // Generate personalized recommendations
        const recommendations = generateRecommendations(progress, quizzes, views, stats);

        return { recommendations, stats };
      } catch (error) {
        logger.error('Error fetching learning recommendations:', error);
        return { recommendations: [], stats: getDefaultStats() };
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

const getDefaultStats = (): LearningStats => ({
  totalItemsViewed: 0,
  averageQuizScore: 0,
  weakTopics: [],
  strongTopics: [],
  studyStreak: 0,
});

const calculateStats = (
  progress: any[],
  quizzes: any[],
  views: any[]
): LearningStats => {
  // Calculate average quiz score
  const averageQuizScore = quizzes.length > 0
    ? quizzes.reduce((sum, q) => sum + (q.score / q.total_questions) * 100, 0) / quizzes.length
    : 0;

  // Identify weak and strong topics based on quiz performance
  const topicScores: Record<string, { total: number; count: number }> = {};
  quizzes.forEach((q) => {
    const speciality = q.quiz?.speciality || 'Général';
    if (!topicScores[speciality]) {
      topicScores[speciality] = { total: 0, count: 0 };
    }
    topicScores[speciality].total += (q.score / q.total_questions) * 100;
    topicScores[speciality].count += 1;
  });

  const weakTopics: string[] = [];
  const strongTopics: string[] = [];

  Object.entries(topicScores).forEach(([topic, data]) => {
    const avg = data.total / data.count;
    if (avg < 60) {
      weakTopics.push(topic);
    } else if (avg >= 80) {
      strongTopics.push(topic);
    }
  });

  return {
    totalItemsViewed: views.length,
    averageQuizScore: Math.round(averageQuizScore),
    weakTopics,
    strongTopics,
    lastStudiedItem: views[0]?.item_number,
    studyStreak: 0, // Would need streak data from user_streaks table
  };
};

const generateRecommendations = (
  progress: any[],
  quizzes: any[],
  views: any[],
  stats: LearningStats
): Recommendation[] => {
  const recommendations: Recommendation[] = [];

  // 1. Weak topics - High priority
  stats.weakTopics.slice(0, 2).forEach((topic, index) => {
    recommendations.push({
      id: `weak-${index}`,
      type: 'weak_topic',
      title: `Renforcer: ${topic}`,
      description: `Vos scores en ${topic} peuvent être améliorés`,
      speciality: topic,
      priority: 'high',
      reason: 'Score moyen inférieur à 60%',
      estimatedTime: 30,
      xpReward: 100,
    });
  });

  // 2. Continue learning - Items in progress
  const inProgressItems = progress
    .filter((p) => p.status === 'in_progress' || (p.completeness_score > 0 && p.completeness_score < 80))
    .slice(0, 2);

  inProgressItems.forEach((item, index) => {
    recommendations.push({
      id: `continue-${index}`,
      type: 'continue_learning',
      title: `Continuer: Item ${item.item_number}`,
      description: `Progression: ${item.completeness_score || 0}%`,
      itemNumber: item.item_number,
      priority: 'medium',
      reason: 'Item en cours d\'apprentissage',
      estimatedTime: 20,
      xpReward: 50,
    });
  });

  // 3. Review needed - Items not viewed recently
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const needsReview = progress
    .filter((p) => {
      if (!p.last_viewed_at) return false;
      const lastViewed = new Date(p.last_viewed_at);
      return lastViewed < thirtyDaysAgo && p.status === 'completed';
    })
    .slice(0, 2);

  needsReview.forEach((item, index) => {
    recommendations.push({
      id: `review-${index}`,
      type: 'review_needed',
      title: `Réviser: Item ${item.item_number}`,
      description: 'Non consulté depuis plus de 30 jours',
      itemNumber: item.item_number,
      priority: 'medium',
      reason: 'Révision espacée recommandée',
      estimatedTime: 15,
      xpReward: 30,
    });
  });

  // 4. New topics to explore
  if (recommendations.length < 5) {
    const popularItems = ['001', '002', '003', '157', '160', '182'];
    const viewedItems = new Set(progress.map((p) => p.item_number));

    const newItems = popularItems
      .filter((item) => !viewedItems.has(item))
      .slice(0, 2);

    newItems.forEach((itemNumber, index) => {
      recommendations.push({
        id: `new-${index}`,
        type: 'new_topic',
        title: `Découvrir: Item ${itemNumber}`,
        description: 'Item populaire à explorer',
        itemNumber,
        priority: 'low',
        reason: 'Sujet fréquemment étudié',
        estimatedTime: 25,
        xpReward: 40,
      });
    });
  }

  // 5. Trending content
  if (recommendations.length < 6) {
    recommendations.push({
      id: 'trending-1',
      type: 'trending',
      title: 'Quiz du jour',
      description: 'Testez vos connaissances avec le quiz quotidien',
      priority: 'low',
      reason: 'Populaire cette semaine',
      estimatedTime: 10,
      xpReward: 75,
    });
  }

  return recommendations.slice(0, 6);
};

const priorityConfig = {
  high: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-800',
    icon: AlertTriangle,
  },
  medium: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: Zap,
  },
  low: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Lightbulb,
  },
};

const typeConfig = {
  weak_topic: { icon: Target, label: 'À renforcer' },
  continue_learning: { icon: BookOpen, label: 'Continuer' },
  review_needed: { icon: RefreshCw, label: 'Révision' },
  new_topic: { icon: Sparkles, label: 'Nouveau' },
  trending: { icon: TrendingUp, label: 'Tendance' },
};

interface LearningRecommendationsProps {
  className?: string;
  variant?: 'compact' | 'full';
  maxItems?: number;
}

export const LearningRecommendations: React.FC<LearningRecommendationsProps> = ({
  className,
  variant = 'full',
  maxItems = 6,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useLearningRecommendations(user?.id);

  const displayedRecommendations = useMemo(() => {
    return data?.recommendations.slice(0, maxItems) || [];
  }, [data, maxItems]);

  const handleRecommendationClick = (recommendation: Recommendation) => {
    if (recommendation.itemNumber) {
      navigate(`/edn-complete?item=${recommendation.itemNumber}`);
    } else if (recommendation.type === 'trending') {
      navigate('/quiz');
    } else if (recommendation.speciality) {
      navigate(`/edn-complete?speciality=${recommendation.speciality}`);
    }
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Connectez-vous pour voir vos recommandations personnalisées
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-semibold">Recommandations</span>
            </div>
            <Badge variant="secondary">{displayedRecommendations.length}</Badge>
          </div>
          <div className="space-y-2">
            {displayedRecommendations.slice(0, 3).map((rec) => {
              const TypeIcon = typeConfig[rec.type].icon;
              const priorityCfg = priorityConfig[rec.priority];

              return (
                <button
                  key={rec.id}
                  onClick={() => handleRecommendationClick(rec)}
                  className={cn(
                    'w-full text-left p-2 rounded-lg border transition-colors hover:bg-muted/50',
                    priorityCfg.border
                  )}
                >
                  <div className="flex items-center gap-2">
                    <TypeIcon className={cn('w-4 h-4', priorityCfg.color)} />
                    <span className="text-sm font-medium truncate">{rec.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Recommandations personnalisées
            </CardTitle>
            <CardDescription>
              Basées sur votre progression et vos résultats
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats summary */}
        {data?.stats && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <BookOpen className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold">{data.stats.totalItemsViewed}</p>
              <p className="text-xs text-muted-foreground">Items vus</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Target className="w-4 h-4 mx-auto mb-1 text-green-500" />
              <p className="text-lg font-bold">{data.stats.averageQuizScore}%</p>
              <p className="text-xs text-muted-foreground">Score moyen</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <CheckCircle className="w-4 h-4 mx-auto mb-1 text-purple-500" />
              <p className="text-lg font-bold">{data.stats.strongTopics.length}</p>
              <p className="text-xs text-muted-foreground">Points forts</p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {displayedRecommendations.length > 0 ? (
          <ScrollArea className={displayedRecommendations.length > 4 ? 'h-[400px]' : ''}>
            <div className="space-y-3 pr-4">
              {displayedRecommendations.map((rec) => {
                const TypeIcon = typeConfig[rec.type].icon;
                const priorityCfg = priorityConfig[rec.priority];

                return (
                  <button
                    key={rec.id}
                    onClick={() => handleRecommendationClick(rec)}
                    className={cn(
                      'w-full text-left p-4 rounded-lg border transition-all',
                      'hover:shadow-md hover:scale-[1.01]',
                      priorityCfg.border
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded-lg', priorityCfg.bg)}>
                          <TypeIcon className={cn('w-5 h-5', priorityCfg.color)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{rec.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {typeConfig[rec.type].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {rec.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              {rec.reason}
                            </span>
                            {rec.estimatedTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {rec.estimatedTime} min
                              </span>
                            )}
                            {rec.xpReward && (
                              <span className="flex items-center gap-1 text-yellow-600">
                                <Sparkles className="w-3 h-3" />
                                +{rec.xpReward} XP
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Commencez à étudier pour recevoir des recommandations personnalisées
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/edn-complete')}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Commencer à apprendre
            </Button>
          </div>
        )}

        {/* Weak topics alert */}
        {data?.stats.weakTopics && data.stats.weakTopics.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-400">
                  Points à améliorer
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-500">
                  {data.stats.weakTopics.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LearningRecommendations;
