import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIRecommendation {
  reason: string;
  genre: string;
  mood: string;
  specialty: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  itemCode?: string;
}

interface RecommendationAnalysis {
  recommendations: AIRecommendation[];
  listening_pattern: string;
  suggestions: string[];
  weakAreas: string[];
  strongAreas: string[];
  nextMilestone: string;
  studyTrend: 'improving' | 'stable' | 'declining';
}

interface LearningProfile {
  preferredTime: string;
  averageSessionDuration: number;
  strongSpecialties: string[];
  weakSpecialties: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  progressRate: number;
}

export const useAIRecommendations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationAnalysis | null>(null);
  const [learningProfile, setLearningProfile] = useState<LearningProfile | null>(null);
  const { toast } = useToast();

  const generateRecommendations = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { action: 'generate_recommendations' }
      });

      if (error) throw error;

      setRecommendations(data);
      toast({
        title: "Recommandations générées !",
        description: "Vos recommandations personnalisées sont prêtes."
      });

      return data;
    } catch (error) {
      console.error('Erreur génération recommandations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les recommandations.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getPersonalizedPlaylist = useCallback(async (params: {
    specialty?: string;
    mood?: string;
    study_context: string;
  }) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { 
          action: 'get_personalized_playlist',
          ...params
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erreur playlist personnalisée:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la playlist personnalisée.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const saveUserPreferences = useCallback(async (preferences: {
    preferred_genres?: string[];
    preferred_moods?: string[];
    medical_specialties?: string[];
    study_schedule?: object;
    learning_style?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('med_mng_user_preferences' as any)
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          ...preferences,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Préférences sauvegardées !",
        description: "Vos préférences ont été mises à jour."
      });
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Analyze learning profile from activity data
  const analyzeLearningProfile = useCallback(async (): Promise<LearningProfile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get activity data
      const { data: activities } = await supabase
        .from('user_activity_log')
        .select('activity_type, duration_seconds, score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!activities || activities.length < 5) return null;

      // Analyze preferred study time
      const hourCounts: Record<number, number> = {};
      activities.forEach(a => {
        const hour = new Date(a.created_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      const preferredHour = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
      const preferredTime = parseInt(preferredHour) < 12 ? 'matin' :
                           parseInt(preferredHour) < 18 ? 'après-midi' : 'soir';

      // Calculate average session duration
      const durations = activities.filter(a => a.duration_seconds).map(a => a.duration_seconds);
      const averageSessionDuration = durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 60)
        : 15;

      // Analyze strong/weak areas from scores
      const scoresByType: Record<string, number[]> = {};
      activities.filter(a => a.score).forEach(a => {
        if (!scoresByType[a.activity_type]) scoresByType[a.activity_type] = [];
        scoresByType[a.activity_type].push(a.score);
      });

      const avgByType: Record<string, number> = {};
      Object.entries(scoresByType).forEach(([type, scores]) => {
        avgByType[type] = scores.reduce((a, b) => a + b, 0) / scores.length;
      });

      const sortedTypes = Object.entries(avgByType).sort((a, b) => b[1] - a[1]);
      const strongSpecialties = sortedTypes.slice(0, 3).map(t => t[0]);
      const weakSpecialties = sortedTypes.slice(-2).map(t => t[0]);

      // Determine learning style based on activity patterns
      const activityTypes = activities.map(a => a.activity_type);
      const musicCount = activityTypes.filter(t => t === 'music_generation').length;
      const readCount = activityTypes.filter(t => t === 'study').length;
      const practiceCount = activityTypes.filter(t => t === 'exam' || t === 'clinical_case').length;

      let learningStyle: LearningProfile['learningStyle'] = 'mixed';
      if (musicCount > readCount && musicCount > practiceCount) learningStyle = 'auditory';
      else if (readCount > musicCount && readCount > practiceCount) learningStyle = 'visual';
      else if (practiceCount > musicCount && practiceCount > readCount) learningStyle = 'kinesthetic';

      // Calculate progress rate
      const recentActivities = activities.slice(0, 20);
      const olderActivities = activities.slice(20, 40);
      const recentAvg = recentActivities.filter(a => a.score).length > 0
        ? recentActivities.filter(a => a.score).reduce((sum, a) => sum + a.score, 0) / recentActivities.filter(a => a.score).length
        : 0;
      const olderAvg = olderActivities.filter(a => a.score).length > 0
        ? olderActivities.filter(a => a.score).reduce((sum, a) => sum + a.score, 0) / olderActivities.filter(a => a.score).length
        : 0;
      const progressRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

      const profile: LearningProfile = {
        preferredTime,
        averageSessionDuration,
        strongSpecialties,
        weakSpecialties,
        learningStyle,
        progressRate: Math.round(progressRate)
      };

      setLearningProfile(profile);
      return profile;
    } catch (error) {
      console.error('Erreur analyse profil:', error);
      return null;
    }
  }, []);

  // Get smart study suggestions based on time of day and past performance
  const getSmartSuggestions = useCallback(async (): Promise<string[]> => {
    const suggestions: string[] = [];
    const hour = new Date().getHours();
    const profile = learningProfile || await analyzeLearningProfile();

    if (!profile) {
      return [
        "Commencez par explorer les items EDN",
        "Essayez de générer une chanson pour mémoriser un concept",
        "Faites un quiz pour évaluer vos connaissances"
      ];
    }

    // Time-based suggestions
    if (hour >= 6 && hour < 10) {
      suggestions.push("Le matin est idéal pour les concepts nouveaux et complexes");
    } else if (hour >= 10 && hour < 14) {
      suggestions.push("Moment optimal pour les révisions actives et les quiz");
    } else if (hour >= 14 && hour < 18) {
      suggestions.push("Après-midi propice aux cas cliniques et exercices pratiques");
    } else if (hour >= 18 && hour < 22) {
      suggestions.push("Soirée idéale pour la consolidation avec la musique");
    } else {
      suggestions.push("Session nocturne : privilégiez les révisions légères");
    }

    // Profile-based suggestions
    if (profile.weakSpecialties.length > 0) {
      suggestions.push(`Renforcez vos compétences en ${profile.weakSpecialties[0]}`);
    }

    if (profile.progressRate > 10) {
      suggestions.push("Excellente progression ! Maintenez ce rythme");
    } else if (profile.progressRate < -10) {
      suggestions.push("Augmentez la fréquence de vos révisions pour progresser");
    }

    if (profile.learningStyle === 'auditory') {
      suggestions.push("Utilisez plus de chansons mnémotechniques");
    } else if (profile.learningStyle === 'kinesthetic') {
      suggestions.push("Pratiquez avec des cas cliniques interactifs");
    }

    return suggestions;
  }, [learningProfile, analyzeLearningProfile]);

  // Get next recommended items based on spaced repetition
  const getNextReviewItems = useCallback(async (limit: number = 5): Promise<{
    itemCode: string;
    title: string;
    dueDate: Date;
    priority: 'high' | 'medium' | 'low';
  }[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get items with review data
      const { data: reviews } = await (supabase as any)
        .from('srs_reviews')
        .select('item_code, next_review, difficulty')
        .eq('user_id', user.id)
        .lte('next_review', new Date().toISOString())
        .order('next_review', { ascending: true })
        .limit(limit);

      if (!reviews || reviews.length === 0) return [];

      return reviews.map((r: any) => ({
        itemCode: r.item_code,
        title: `Item ${r.item_code}`,
        dueDate: new Date(r.next_review),
        priority: r.difficulty > 3 ? 'high' : r.difficulty > 1 ? 'medium' : 'low'
      }));
    } catch (error) {
      console.error('Erreur récupération items:', error);
      return [];
    }
  }, []);

  // Calculate optimal study duration
  const getOptimalStudyDuration = useCallback((): number => {
    if (!learningProfile) return 25; // Default pomodoro

    const baseDuration = learningProfile.averageSessionDuration;
    const hour = new Date().getHours();

    // Adjust based on time of day
    if (hour >= 6 && hour < 10) return Math.min(baseDuration + 10, 45);
    if (hour >= 22 || hour < 6) return Math.min(baseDuration - 5, 15);

    return baseDuration;
  }, [learningProfile]);

  return {
    isLoading,
    recommendations,
    learningProfile,
    generateRecommendations,
    getPersonalizedPlaylist,
    saveUserPreferences,
    analyzeLearningProfile,
    getSmartSuggestions,
    getNextReviewItems,
    getOptimalStudyDuration
  };
};