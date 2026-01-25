import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeeklyAnalytics {
  weekStart: string;
  totalStudyTime: number;
  itemsReviewed: number;
  itemsMastered: number;
  examsCompleted: number;
  averageScore: number;
  streakDays: number;
  weakItems: string[];
  strongItems: string[];
}

interface LearningInsight {
  type: 'strength' | 'weakness' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  relatedItems?: string[];
  actionUrl?: string;
}

interface PerformanceTrend {
  period: string;
  score: number;
  itemsReviewed: number;
  studyTime: number;
}

export const useLearningAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [_insights, setInsights] = useState<LearningInsight[]>([]);

  // Get weekly analytics
  const getWeeklyAnalytics = useCallback(async (weeks: number = 12): Promise<WeeklyAnalytics[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { _data, _error } = await supabase
        .from('learning_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(weeks);

      if (_error) {
        console.error('Error fetching analytics:', _error);
        return [];
      }

      return (_data || []).map(d => ({
        weekStart: d.week_start,
        totalStudyTime: d.total_study_time || 0,
        itemsReviewed: d.items_reviewed || 0,
        itemsMastered: d.items_mastered || 0,
        examsCompleted: d.exams_completed || 0,
        averageScore: d.average_score || 0,
        streakDays: d.streak_days || 0,
        weakItems: d.weak_items || [],
        strongItems: d.strong_items || []
      }));
    } catch (error) {
      console.error('Error in getWeeklyAnalytics:', error);
      return [];
    }
  }, []);

  // Generate AI-powered insights
  const generateInsights = useCallback(async (): Promise<LearningInsight[]> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get recent activity data
      const { _data: activities } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false })
        .limit(100);

      const { _data: analytics } = await supabase
        .from('learning_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(4);

      const generatedInsights: LearningInsight[] = [];

      // Analyze activity patterns
      if (activities && activities.length > 0) {
        const byType = activities.reduce((acc, a) => {
          acc[a.activity_type] = (acc[a.activity_type] || 0) + a.count;
          return acc;
        }, {} as Record<string, number>);

        // Check for underutilized features
        if (!byType.flashcard || byType.flashcard < 10) {
          generatedInsights.push({
            type: 'recommendation',
            title: 'Utilisez les Flashcards',
            description: 'Les flashcards sont sous-utilisées. Elles peuvent améliorer votre rétention de 30%.',
            priority: 'medium',
            actionUrl: '/flashcards'
          });
        }

        if (!byType.clinical_case || byType.clinical_case < 5) {
          generatedInsights.push({
            type: 'recommendation',
            title: 'Pratiquez les cas cliniques',
            description: 'Entraînez-vous avec des cas cliniques pour améliorer votre raisonnement.',
            priority: 'medium',
            actionUrl: '/clinical-cases'
          });
        }
      }

      // Analyze performance trends
      if (analytics && analytics.length >= 2) {
        const recent = analytics[0];
        const previous = analytics[1];

        if (recent.average_score && previous.average_score) {
          const scoreDiff = recent.average_score - previous.average_score;
          
          if (scoreDiff > 5) {
            generatedInsights.push({
              type: 'strength',
              title: 'Progression excellente !',
              description: `Votre score moyen a augmenté de ${Math.round(scoreDiff)}% cette semaine.`,
              priority: 'low'
            });
          } else if (scoreDiff < -5) {
            generatedInsights.push({
              type: 'weakness',
              title: 'Baisse de performance',
              description: `Votre score a baissé de ${Math.abs(Math.round(scoreDiff))}%. Révisez vos points faibles.`,
              priority: 'high',
              relatedItems: recent.weak_items || []
            });
          }
        }

        // Streak analysis
        if (recent.streak_days < 3) {
          generatedInsights.push({
            type: 'recommendation',
            title: 'Maintenez votre régularité',
            description: 'Étudiez au moins 15 minutes par jour pour maintenir votre streak.',
            priority: 'high'
          });
        } else if (recent.streak_days >= 7) {
          generatedInsights.push({
            type: 'strength',
            title: `${recent.streak_days} jours de suite !`,
            description: 'Continuez comme ça, votre régularité porte ses fruits.',
            priority: 'low'
          });
        }
      }

      // Weak items analysis
      const allWeakItems = analytics?.flatMap(a => a.weak_items || []) || [];
      const weakItemCounts = allWeakItems.reduce((acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const persistentWeakItems = Object.entries(weakItemCounts)
        .filter(([_, count]) => count >= 2)
        .map(([item]) => item);

      if (persistentWeakItems.length > 0) {
        generatedInsights.push({
          type: 'weakness',
          title: 'Items récurrents à travailler',
          description: `Ces items apparaissent souvent dans vos erreurs : ${persistentWeakItems.slice(0, 3).join(', ')}`,
          priority: 'high',
          relatedItems: persistentWeakItems
        });
      }

      // Prediction based on current pace
      if (analytics && analytics.length >= 4) {
        const avgItemsPerWeek = analytics.reduce((sum, a) => sum + (a.items_mastered || 0), 0) / analytics.length;
        const remainingItems = 367 - (analytics[0]?.items_mastered || 0) * 10; // Rough estimate
        const weeksToComplete = Math.ceil(remainingItems / avgItemsPerWeek);

        if (avgItemsPerWeek > 0) {
          generatedInsights.push({
            type: 'prediction',
            title: 'Estimation de progression',
            description: `À ce rythme (${Math.round(avgItemsPerWeek)} items/semaine), vous aurez terminé dans environ ${weeksToComplete} semaines.`,
            priority: 'low'
          });
        }
      }

      setInsights(generatedInsights);
      return generatedInsights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Update weekly analytics
  const updateWeeklyAnalytics = useCallback(async (data: Partial<WeeklyAnalytics>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get current week start (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(now.setDate(diff));
      weekStart.setHours(0, 0, 0, 0);
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { _error } = await supabase
        .from('learning_analytics')
        .upsert({
          user_id: user.id,
          week_start: weekStartStr,
          total_study_time: data.totalStudyTime,
          items_reviewed: data.itemsReviewed,
          items_mastered: data.itemsMastered,
          exams_completed: data.examsCompleted,
          average_score: data.averageScore,
          streak_days: data.streakDays,
          weak_items: data.weakItems,
          strong_items: data.strongItems
        }, {
          onConflict: 'user_id,week_start'
        });

      if (_error) {
        console.error('Error updating analytics:', _error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in updateWeeklyAnalytics:', error);
      return false;
    }
  }, []);

  // Get performance trend
  const getPerformanceTrend = useCallback(async (days: number = 30): Promise<PerformanceTrend[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { _data, _error } = await supabase
        .from('user_activity_log')
        .select('activity_date, score, count, duration_seconds')
        .eq('user_id', user.id)
        .gte('activity_date', startDate.toISOString().split('T')[0])
        .order('activity_date', { ascending: true });

      if (_error || !_data) return [];

      // Group by date
      const byDate: Record<string, { scores: number[]; items: number; time: number }> = {};
      
      _data.forEach(log => {
        if (!byDate[log.activity_date]) {
          byDate[log.activity_date] = { scores: [], items: 0, time: 0 };
        }
        if (log.score) byDate[log.activity_date].scores.push(log.score);
        byDate[log.activity_date].items += log.count;
        byDate[log.activity_date].time += log.duration_seconds || 0;
      });

      return Object.entries(byDate).map(([date, stats]) => ({
        period: date,
        score: stats.scores.length > 0 
          ? Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length)
          : 0,
        itemsReviewed: stats.items,
        studyTime: Math.round(stats.time / 60) // Convert to minutes
      }));
    } catch (error) {
      console.error('Error getting performance trend:', error);
      return [];
    }
  }, []);

  return {
    loading,
    _insights,
    getWeeklyAnalytics,
    generateInsights,
    updateWeeklyAnalytics,
    getPerformanceTrend
  };
};
