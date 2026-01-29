import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  current_value: number;
  reward_xp: number;
  expires_at: string;
  is_completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function useDailyChallenges() {
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading, error } = useQuery({
    queryKey: ['daily-challenges'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const today = new Date().toISOString().split('T')[0];

      // Récupérer les défis du jour
      const { data: dailyChallenges, error: challengesError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today);

      if (challengesError) throw challengesError;

      if (!dailyChallenges || dailyChallenges.length === 0) {
        // Retourner des défis par défaut si aucun n'existe
        return getDefaultChallenges();
      }

      // Récupérer la progression de l'utilisateur
      const { data: progress } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('challenge_id', dailyChallenges.map(c => c.id));

      const progressMap = new Map(progress?.map(p => [p.challenge_id, p]) || []);

      return dailyChallenges.map(challenge => {
        const userProgress = progressMap.get(challenge.id);
        return {
          id: challenge.id,
          title: challenge.title || challenge.objective || 'Défi du jour',
          description: challenge.description || challenge.objective || '',
          challenge_type: challenge.type || 'study',
          target_value: challenge.target_value || 1,
          current_value: userProgress?.current_value || 0,
          reward_xp: challenge.reward_xp || 50,
          expires_at: new Date(new Date().setHours(23, 59, 59)).toISOString(),
          is_completed: userProgress?.is_completed || false,
          difficulty: (challenge.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        };
      }) as DailyChallenge[];
    },
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) throw new Error('Défi non trouvé');

      // Mettre à jour la progression
      const { error } = await supabase
        .from('user_challenge_progress')
        .upsert({
          user_id: user.id,
          challenge_id: challengeId,
          current_value: challenge.target_value,
          is_completed: true,
          claimed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,challenge_id' });

      if (error) throw error;

      // Ajouter XP via gamification_activities
      await supabase.from('gamification_activities').insert({
        user_id: user.id,
        activity_type: 'challenge_completed',
        activity_name: `Défi: ${challenge.title}`,
        points_earned: challenge.reward_xp,
      });

      return challenge.reward_xp;
    },
    onSuccess: (xp) => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
      toast.success(`+${xp} XP gagnés !`, {
        description: 'Récompense réclamée avec succès'
      });
    },
    onError: (error) => {
      console.error('Error claiming reward:', error);
      toast.error('Erreur lors de la réclamation');
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ challengeId, increment }: { challengeId: string; increment: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      const newValue = Math.min(challenge.current_value + increment, challenge.target_value);

      const { error } = await supabase
        .from('user_challenge_progress')
        .upsert({
          user_id: user.id,
          challenge_id: challengeId,
          current_value: newValue,
          is_completed: newValue >= challenge.target_value,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,challenge_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
    },
  });

  return {
    challenges,
    isLoading,
    error,
    claimReward: claimRewardMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
    isClaimingReward: claimRewardMutation.isPending,
  };
}

function getDefaultChallenges(): DailyChallenge[] {
  const now = new Date();
  const expiresAt = new Date(now.setHours(23, 59, 59)).toISOString();
  
  return [
    {
      id: 'default-1',
      title: 'Réviser 10 items EDN',
      description: 'Étudiez au moins 10 items de la base EDN',
      challenge_type: 'study',
      target_value: 10,
      current_value: 0,
      reward_xp: 50,
      expires_at: expiresAt,
      is_completed: false,
      difficulty: 'easy',
    },
    {
      id: 'default-2',
      title: 'Compléter 5 QCM',
      description: 'Répondez à 5 séries de QCM en mode examen',
      challenge_type: 'quiz',
      target_value: 5,
      current_value: 0,
      reward_xp: 75,
      expires_at: expiresAt,
      is_completed: false,
      difficulty: 'medium',
    },
    {
      id: 'default-3',
      title: 'Générer une chanson',
      description: 'Créez une chanson médicale personnalisée',
      challenge_type: 'music',
      target_value: 1,
      current_value: 0,
      reward_xp: 100,
      expires_at: expiresAt,
      is_completed: false,
      difficulty: 'hard',
    },
  ];
}
