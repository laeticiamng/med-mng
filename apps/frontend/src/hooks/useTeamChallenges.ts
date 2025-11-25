/**
 * Hook pour gérer les défis d'équipe
 * Prêt pour l'intégration backend avec Supabase
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  teamProgress: number;
  participants: number;
  goal: number;
  createdBy?: string;
  teamId?: string;
}

export interface TeamLeaderboardEntry {
  id: string;
  teamName: string;
  points: number;
  rank: number;
  members: number;
  avatarUrl?: string;
}

// Données mock pour le développement
const MOCK_CHALLENGES: TeamChallenge[] = [
  {
    id: '1',
    title: 'Marathon d\'Apprentissage Collectif',
    description: 'Complétez ensemble 1000 items EDN en équipe ce mois-ci',
    points: 500,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    teamProgress: 65,
    participants: 24,
    goal: 1000
  },
  {
    id: '2',
    title: 'Challenge Focus Hebdomadaire',
    description: 'Accumulez 100 heures de sessions focus en équipe cette semaine',
    points: 200,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    teamProgress: 42,
    participants: 18,
    goal: 100
  },
  {
    id: '3',
    title: 'Défi Collaboration',
    description: 'Créez 50 posts collaboratifs et aidez vos coéquipiers',
    points: 300,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    teamProgress: 28,
    participants: 32,
    goal: 50
  },
  {
    id: '4',
    title: 'Sprint d\'Examen Final',
    description: 'Préparez-vous ensemble pour l\'examen avec 500 items révisés',
    points: 400,
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    teamProgress: 0,
    participants: 45,
    goal: 500
  }
];

const MOCK_LEADERBOARD: TeamLeaderboardEntry[] = [
  { id: '1', teamName: 'Les Warriors Médicaux', points: 15420, rank: 1, members: 28 },
  { id: '2', teamName: 'Team Excellence', points: 14850, rank: 2, members: 25 },
  { id: '3', teamName: 'Les Challengers', points: 13200, rank: 3, members: 22 },
  { id: '4', teamName: 'Squad Motivation', points: 12100, rank: 4, members: 30 },
  { id: '5', teamName: 'Équipe Réussite', points: 11500, rank: 5, members: 20 }
];

/**
 * Hook pour récupérer les défis d'équipe
 */
export function useTeamChallenges(status?: 'active' | 'completed' | 'upcoming') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['team-challenges', user?.id, status],
    queryFn: async (): Promise<TeamChallenge[]> => {
      // Essayer de récupérer depuis Supabase d'abord
      try {
        const { data, error } = await supabase
          .from('team_challenges')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          // Table n'existe pas encore, utiliser les données mock
          console.warn('Table team_challenges non disponible, utilisation des données mock');
          let challenges = MOCK_CHALLENGES;
          if (status) {
            challenges = challenges.filter(c => c.status === status);
          }
          return challenges;
        }

        // Mapper les données Supabase vers notre interface
        return data.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          points: row.points,
          startDate: row.start_date,
          endDate: row.end_date,
          status: row.status,
          teamProgress: row.team_progress || 0,
          participants: row.participants_count || 0,
          goal: row.goal,
          createdBy: row.created_by,
          teamId: row.team_id
        }));
      } catch (error) {
        // Fallback sur les données mock
        console.error('Error fetching team challenges:', error);
        let challenges = MOCK_CHALLENGES;
        if (status) {
          challenges = challenges.filter(c => c.status === status);
        }
        return challenges;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user?.id
  });
}

/**
 * Hook pour récupérer le classement des équipes
 */
export function useTeamLeaderboard(limit = 10) {
  return useQuery({
    queryKey: ['team-leaderboard', limit],
    queryFn: async (): Promise<TeamLeaderboardEntry[]> => {
      try {
        const { data, error } = await supabase
          .from('team_leaderboard')
          .select('*')
          .order('points', { ascending: false })
          .limit(limit);

        if (error) {
          console.warn('Table team_leaderboard non disponible, utilisation des données mock');
          return MOCK_LEADERBOARD.slice(0, limit);
        }

        return data.map((row: any, index: number) => ({
          id: row.id,
          teamName: row.team_name,
          points: row.points,
          rank: index + 1,
          members: row.members_count,
          avatarUrl: row.avatar_url
        }));
      } catch (error) {
        console.error('Error fetching team leaderboard:', error);
        return MOCK_LEADERBOARD.slice(0, limit);
      }
    },
    staleTime: 1000 * 60 * 10 // 10 minutes
  });
}

/**
 * Hook pour rejoindre un défi
 */
export function useJoinChallenge() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          joined_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-challenges'] });
      toast.success('Vous avez rejoint le défi !');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la participation');
    }
  });
}

/**
 * Hook pour mettre à jour la progression d'un défi
 */
export function useUpdateChallengeProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ challengeId, progress }: { challengeId: string; progress: number }) => {
      const { error } = await supabase
        .from('team_challenges')
        .update({
          team_progress: progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-challenges'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  });
}

/**
 * Hook pour créer un nouveau défi (admin)
 */
export function useCreateChallenge() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (challenge: Omit<TeamChallenge, 'id' | 'teamProgress' | 'participants'>) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('team_challenges')
        .insert({
          title: challenge.title,
          description: challenge.description,
          points: challenge.points,
          start_date: challenge.startDate,
          end_date: challenge.endDate,
          status: challenge.status,
          goal: challenge.goal,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-challenges'] });
      toast.success('Défi créé avec succès !');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création');
    }
  });
}
