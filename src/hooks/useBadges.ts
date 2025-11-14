import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  target: number;
  category: 'completion' | 'specialty' | 'streak' | 'score';
}

const SPECIALTY_MAPPING: Record<string, string[]> = {
  'Cardiologie': ['001', '002', '003', '004', '005', '197', '198', '199', '200', '201', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '281', '334', '335', '339'],
  'Pneumologie': ['006', '007', '008', '009', '010', '086', '087', '088', '089', '090', '091', '092', '093', '094', '095', '096', '097', '098', '099', '100'],
  'Néphrologie': ['011', '012', '013', '014', '015', '252', '253', '254', '255', '256', '257', '258', '259', '260', '261', '262', '263'],
  'Gastro-entérologie': ['016', '017', '018', '019', '020', '021', '022', '023', '024', '025', '026', '027', '028', '029', '030', '031', '032', '033', '034', '035', '036', '037', '264', '265', '266', '267', '268', '269', '270', '271', '272', '273', '274', '275', '276', '277'],
  'Endocrinologie': ['038', '039', '040', '041', '042', '043', '044', '045', '046', '047', '048', '049', '050', '051', '052', '241', '242', '243', '244', '245', '246', '247', '248', '249', '250', '251'],
};

export const useBadges = () => {
  const { user } = useAuth();

  const { data: progressData = [] } = useQuery({
    queryKey: ['badges-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await (supabase as any)
        .from('user_edn_progress')
        .select('item_number, status, score')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching badges progress:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

  const badges = useMemo((): Badge[] => {
    const completedCount = progressData.filter(
      (p: any) => p.status === 'completed' || p.status === 'mastered'
    ).length;
    const masteredCount = progressData.filter(
      (p: any) => p.status === 'mastered'
    ).length;
    const avgScore = progressData.length > 0
      ? progressData.reduce((acc: number, item: any) => acc + (item.score || 0), 0) / progressData.length
      : 0;

    const specialtyProgress: Record<string, number> = {};
    Object.entries(SPECIALTY_MAPPING).forEach(([specialty, items]) => {
      const completedInSpecialty = progressData.filter(
        (p: any) => items.includes(p.item_number) && 
                    (p.status === 'completed' || p.status === 'mastered')
      ).length;
      specialtyProgress[specialty] = completedInSpecialty;
    });

    return [
      // Completion badges
      {
        id: 'first-steps',
        name: 'Premiers Pas',
        description: 'Complétez votre premier item EDN',
        icon: '🎯',
        earned: completedCount >= 1,
        progress: Math.min(completedCount, 1),
        target: 1,
        category: 'completion',
      },
      {
        id: 'dedicated-learner',
        name: 'Apprenant Dévoué',
        description: 'Complétez 10 items EDN',
        icon: '📚',
        earned: completedCount >= 10,
        progress: Math.min(completedCount, 10),
        target: 10,
        category: 'completion',
      },
      {
        id: 'knowledge-seeker',
        name: 'Chercheur de Savoir',
        description: 'Complétez 50 items EDN',
        icon: '🔍',
        earned: completedCount >= 50,
        progress: Math.min(completedCount, 50),
        target: 50,
        category: 'completion',
      },
      {
        id: 'master-scholar',
        name: 'Maître Érudit',
        description: 'Complétez 100 items EDN',
        icon: '👑',
        earned: completedCount >= 100,
        progress: Math.min(completedCount, 100),
        target: 100,
        category: 'completion',
      },
      {
        id: 'legend',
        name: 'Légende EDN',
        description: 'Complétez tous les 367 items EDN',
        icon: '🏆',
        earned: completedCount >= 367,
        progress: Math.min(completedCount, 367),
        target: 367,
        category: 'completion',
      },

      // Specialty badges
      {
        id: 'cardiology-master',
        name: 'Maître en Cardiologie',
        description: 'Maîtrisez tous les items de Cardiologie',
        icon: '❤️',
        earned: specialtyProgress['Cardiologie'] >= (SPECIALTY_MAPPING['Cardiologie']?.length || 0),
        progress: specialtyProgress['Cardiologie'] || 0,
        target: SPECIALTY_MAPPING['Cardiologie']?.length || 0,
        category: 'specialty',
      },
      {
        id: 'pneumology-master',
        name: 'Maître en Pneumologie',
        description: 'Maîtrisez tous les items de Pneumologie',
        icon: '🫁',
        earned: specialtyProgress['Pneumologie'] >= (SPECIALTY_MAPPING['Pneumologie']?.length || 0),
        progress: specialtyProgress['Pneumologie'] || 0,
        target: SPECIALTY_MAPPING['Pneumologie']?.length || 0,
        category: 'specialty',
      },
      {
        id: 'nephrology-master',
        name: 'Maître en Néphrologie',
        description: 'Maîtrisez tous les items de Néphrologie',
        icon: '🩺',
        earned: specialtyProgress['Néphrologie'] >= (SPECIALTY_MAPPING['Néphrologie']?.length || 0),
        progress: specialtyProgress['Néphrologie'] || 0,
        target: SPECIALTY_MAPPING['Néphrologie']?.length || 0,
        category: 'specialty',
      },

      // Score badges
      {
        id: 'high-performer',
        name: 'Haute Performance',
        description: 'Obtenez une moyenne de 80% ou plus',
        icon: '⭐',
        earned: avgScore >= 80,
        progress: Math.min(avgScore, 80),
        target: 80,
        category: 'score',
      },
      {
        id: 'perfectionist',
        name: 'Perfectionniste',
        description: 'Obtenez une moyenne de 95% ou plus',
        icon: '💎',
        earned: avgScore >= 95,
        progress: Math.min(avgScore, 95),
        target: 95,
        category: 'score',
      },
    ];
  }, [progressData]);

  const earnedBadges = badges.filter(b => b.earned);
  const totalBadges = badges.length;
  const progressPercentage = (earnedBadges.length / totalBadges) * 100;

  return {
    badges,
    earnedBadges,
    totalBadges,
    progressPercentage,
  };
};
