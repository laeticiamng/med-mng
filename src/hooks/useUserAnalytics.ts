import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

export interface UserAnalytics {
  // Progression globale
  totalItems: number;
  revisedItems: number;
  inProgressItems: number;
  progressPercentage: number;
  
  // Temps d'étude
  totalStudyMinutes: number;
  averageSessionMinutes: number;
  studySessionsCount: number;
  
  // Musique
  songsGenerated: number;
  songsInLibrary: number;
  totalListeningMinutes: number;
  favoriteSongsCount: number;
  
  // Streak et gamification
  currentStreak: number;
  bestStreak: number;
  totalXP: number;
  level: number;
  badgesUnlocked: number;
  
  // Tendances hebdomadaires
  weeklyProgress: {
    date: string;
    itemsRevised: number;
    minutesStudied: number;
  }[];
  
  // Performance par spécialité
  specialtyPerformance: {
    specialty: string;
    total: number;
    revised: number;
    percentage: number;
  }[];
}

const XP_PER_LEVEL = 1000;

export const useUserAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-analytics', user?.id],
    queryFn: async (): Promise<UserAnalytics> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Récupérer les données en parallèle
      const [
        itemsResponse,
        progressResponse,
        profileResponse,
        libraryResponse,
        sessionsResponse,
        badgesResponse,
      ] = await Promise.all([
        // Total items
        (supabase as any).from('items').select('id', { count: 'exact', head: true }),
        
        // Progression utilisateur
        (supabase as any)
          .from('user_progress')
          .select('content_id, mastery_level, progress_percentage, attempts_count')
          .eq('user_id', user.id)
          .eq('content_type', 'item'),
        
        // Profil utilisateur
        supabase
          .from('profiles')
          .select('streak_current, streak_best, total_xp, weekly_goal')
          .eq('id', user.id)
          .maybeSingle(),
        
        // Bibliothèque musicale
        (supabase as any)
          .from('med_mng_library')
          .select('id, song_id, is_liked, added_at')
          .eq('user_id', user.id),
        
        // Sessions d'étude
        (supabase as any)
          .from('study_sessions')
          .select('date, items_revised, duration_minutes')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(30),
        
        // Badges
        (supabase as any)
          .from('user_badges')
          .select('id')
          .eq('user_id', user.id),
      ]);

      // Calculs
      const totalItems = itemsResponse.count ?? 0;
      const progressData = progressResponse.data ?? [];
      const profileData = profileResponse.data as any;
      const libraryData = libraryResponse.data ?? [];
      const sessionsData = sessionsResponse.data ?? [];
      const badgesData = badgesResponse.data ?? [];

      // Calcul progression
      const revisedItems = progressData.filter((p: any) => p.mastery_level === 'revised').length;
      const inProgressItems = progressData.filter((p: any) => p.mastery_level === 'in_progress').length;
      const progressPercentage = totalItems > 0 ? Math.round((revisedItems / totalItems) * 100) : 0;

      // Calcul temps d'étude
      const totalStudyMinutes = sessionsData.reduce((acc: number, s: any) => acc + (s.duration_minutes || 0), 0);
      const studySessionsCount = sessionsData.length;
      const averageSessionMinutes = studySessionsCount > 0 ? Math.round(totalStudyMinutes / studySessionsCount) : 0;

      // Calcul musique
      const songsInLibrary = libraryData.length;
      const favoriteSongsCount = libraryData.filter((s: any) => s.is_liked).length;
      
      // Estimation écoute (4 min par chanson en moyenne)
      const totalListeningMinutes = songsInLibrary * 4;

      // Gamification
      const currentStreak = profileData?.streak_current ?? 0;
      const bestStreak = profileData?.streak_best ?? 0;
      const totalXP = profileData?.total_xp ?? 0;
      const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
      const badgesUnlocked = badgesData.length;

      // Tendances hebdomadaires (7 derniers jours)
      const last7Days = sessionsData.slice(0, 7).map((s: any) => ({
        date: s.date,
        itemsRevised: s.items_revised ?? 0,
        minutesStudied: s.duration_minutes ?? 0,
      }));

      // Performance par spécialité (à calculer depuis progress + items)
      // Simplifié pour l'instant
      const specialtyPerformance: UserAnalytics['specialtyPerformance'] = [];

      return {
        totalItems,
        revisedItems,
        inProgressItems,
        progressPercentage,
        totalStudyMinutes,
        averageSessionMinutes,
        studySessionsCount,
        songsGenerated: songsInLibrary, // Approximation
        songsInLibrary,
        totalListeningMinutes,
        favoriteSongsCount,
        currentStreak,
        bestStreak,
        totalXP,
        level,
        badgesUnlocked,
        weeklyProgress: last7Days,
        specialtyPerformance,
      };
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // Cache 2 minutes
  });
};
