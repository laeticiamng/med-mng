/**
 * useLearningPreferences - Hook pour gérer les préférences d'apprentissage
 * Intégré avec la table user_learning_preferences
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type LearningStyle = 'visual' | 'auditory' | 'reading' | 'kinesthetic';
type StudyTimePreference = 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night';
type DifficultyPreference = 'easy' | 'medium' | 'hard' | 'adaptive';
type NotificationFrequency = 'never' | 'daily' | 'weekly' | 'custom';

interface LearningPreferences {
  id: string;
  user_id: string;
  preferred_learning_style: LearningStyle;
  study_time_preference: StudyTimePreference;
  session_duration_minutes: number;
  daily_goal_minutes: number;
  weekly_goal_items: number;
  difficulty_preference: DifficultyPreference;
  notification_frequency: NotificationFrequency;
  focus_areas: string[] | null;
  weak_areas: string[] | null;
  exam_date: string | null;
  music_enabled: boolean;
  voice_enabled: boolean;
  gamification_enabled: boolean;
  accessibility_mode: boolean;
  created_at: string;
  updated_at: string;
}

const defaultPreferences: Omit<LearningPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  preferred_learning_style: 'visual',
  study_time_preference: 'morning',
  session_duration_minutes: 25,
  daily_goal_minutes: 60,
  weekly_goal_items: 20,
  difficulty_preference: 'adaptive',
  notification_frequency: 'daily',
  focus_areas: null,
  weak_areas: null,
  exam_date: null,
  music_enabled: true,
  voice_enabled: false,
  gamification_enabled: true,
  accessibility_mode: false
};

export const useLearningPreferences = () => {
  const queryClient = useQueryClient();

  // Récupérer les préférences actuelles
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['learning-preferences'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return defaultPreferences as LearningPreferences;

      const { data, error } = await supabase
        .from('user_learning_preferences')
        .select('*')
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Si pas de préférences, créer avec valeurs par défaut
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('user_learning_preferences')
          .insert({ user_id: user.user.id, ...defaultPreferences })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData as LearningPreferences;
      }

      return data as LearningPreferences;
    }
  });

  // Mettre à jour les préférences
  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<LearningPreferences>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('user_learning_preferences')
        .update(updates)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) throw error;
      return data as LearningPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-preferences'] });
      toast.success('Préférences d\'apprentissage mises à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Ajouter une zone de focus
  const addFocusArea = (area: string) => {
    if (!preferences) return;
    const currentAreas = preferences.focus_areas || [];
    if (!currentAreas.includes(area)) {
      updatePreferences.mutate({ focus_areas: [...currentAreas, area] });
    }
  };

  // Retirer une zone de focus
  const removeFocusArea = (area: string) => {
    if (!preferences) return;
    const currentAreas = preferences.focus_areas || [];
    updatePreferences.mutate({ focus_areas: currentAreas.filter(a => a !== area) });
  };

  // Ajouter une zone faible
  const addWeakArea = (area: string) => {
    if (!preferences) return;
    const currentAreas = preferences.weak_areas || [];
    if (!currentAreas.includes(area)) {
      updatePreferences.mutate({ weak_areas: [...currentAreas, area] });
    }
  };

  // Retirer une zone faible
  const removeWeakArea = (area: string) => {
    if (!preferences) return;
    const currentAreas = preferences.weak_areas || [];
    updatePreferences.mutate({ weak_areas: currentAreas.filter(a => a !== area) });
  };

  // Définir la date d'examen
  const setExamDate = (date: Date | null) => {
    updatePreferences.mutate({ exam_date: date ? date.toISOString().split('T')[0] : null });
  };

  // Calculer les jours restants avant l'examen
  const daysUntilExam = (): number | null => {
    if (!preferences?.exam_date) return null;
    const examDate = new Date(preferences.exam_date);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Obtenir des recommandations basées sur les préférences
  const getStudyRecommendations = () => {
    if (!preferences) return [];
    
    const recommendations: string[] = [];
    const days = daysUntilExam();

    if (days !== null) {
      if (days < 7) {
        recommendations.push('🚨 Examen dans moins d\'une semaine ! Concentrez-vous sur les révisions.');
      } else if (days < 30) {
        recommendations.push('📅 Moins d\'un mois avant l\'examen. Intensifiez vos révisions.');
      }
    }

    if (preferences.weak_areas && preferences.weak_areas.length > 0) {
      recommendations.push(`💪 Focus recommandé sur: ${preferences.weak_areas.slice(0, 3).join(', ')}`);
    }

    if (preferences.preferred_learning_style === 'auditory') {
      recommendations.push('🎵 Utilisez le mode musical pour un apprentissage auditif optimal.');
    }

    if (preferences.study_time_preference === 'morning' || preferences.study_time_preference === 'early_morning') {
      recommendations.push('🌅 Planifiez vos sessions les plus difficiles le matin.');
    }

    return recommendations;
  };

  return {
    preferences: preferences || defaultPreferences,
    isLoading,
    isUpdating: updatePreferences.isPending,
    updatePreferences: updatePreferences.mutate,
    addFocusArea,
    removeFocusArea,
    addWeakArea,
    removeWeakArea,
    setExamDate,
    daysUntilExam,
    getStudyRecommendations
  };
};

export default useLearningPreferences;
