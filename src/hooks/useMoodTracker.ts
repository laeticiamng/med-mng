import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface MoodEntry {
  id: string;
  mood_score: number;
  energy_level: number;
  stress_level: number;
  notes: string;
  factors: string[];
  created_at: string;
}

export function useMoodTracker() {
  const queryClient = useQueryClient();

  const { data: moodHistory = [], isLoading, error } = useQuery({
    queryKey: ['mood-entries'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      return (data || []).map(entry => ({
        id: entry.id,
        mood_score: entry.mood_level || 3,
        energy_level: entry.energy_level || 3,
        stress_level: entry.stress_level || 3,
        notes: entry.notes || '',
        factors: entry.factors || [],
        created_at: entry.created_at,
      })) as MoodEntry[];
    },
  });

  const logMoodMutation = useMutation({
    mutationFn: async (entry: Omit<MoodEntry, 'id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood_level: entry.mood_score,
          energy_level: entry.energy_level,
          stress_level: entry.stress_level,
          notes: entry.notes,
          factors: entry.factors,
          emotions: getMoodLabel(entry.mood_score),
        })
        .select()
        .single();

      if (error) throw error;

      // Ajouter XP pour le suivi quotidien
      await supabase.from('gamification_activities').insert({
        user_id: user.id,
        activity_type: 'mood_logged',
        activity_name: 'Suivi humeur quotidien',
        points_earned: 10,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-entries'] });
      toast.success('Humeur enregistrée !', {
        description: '+10 XP pour le suivi quotidien'
      });
    },
    onError: (error) => {
      console.error('Error logging mood:', error);
      toast.error('Erreur lors de l\'enregistrement');
    },
  });

  const todayEntry = moodHistory.find(e => 
    new Date(e.created_at).toDateString() === new Date().toDateString()
  );

  const averageMood = moodHistory.length > 0
    ? moodHistory.reduce((acc, e) => acc + e.mood_score, 0) / moodHistory.length
    : 0;

  const last7Days = moodHistory.slice(0, 7);

  const moodTrend = last7Days.length >= 2
    ? last7Days[0].mood_score >= last7Days[last7Days.length - 1].mood_score
      ? 'up'
      : 'down'
    : 'stable';

  return {
    moodHistory,
    isLoading,
    error,
    logMood: logMoodMutation.mutate,
    isLogging: logMoodMutation.isPending,
    todayEntry,
    averageMood,
    last7Days,
    moodTrend,
  };
}

function getMoodLabel(score: number): string[] {
  switch (score) {
    case 1: return ['angry', 'frustrated'];
    case 2: return ['sad', 'tired'];
    case 3: return ['neutral', 'calm'];
    case 4: return ['happy', 'content'];
    case 5: return ['excellent', 'energetic'];
    default: return ['neutral'];
  }
}
