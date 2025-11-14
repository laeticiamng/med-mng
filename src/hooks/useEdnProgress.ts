import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

export interface EdnProgressStats {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  notStartedItems: number;
  completionPercentage: number;
}

export const useEdnProgress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['edn-progress', user?.id],
    queryFn: async (): Promise<EdnProgressStats> => {
      // Fetch total items count
      const { count: totalItems } = await supabase
        .from('edn_items_unified' as any)
        .select('*', { count: 'exact', head: true });

      if (!user) {
        return {
          totalItems: totalItems || 367,
          completedItems: 0,
          inProgressItems: 0,
          notStartedItems: totalItems || 367,
          completionPercentage: 0,
        };
      }

      // Fetch user progress (this would need a user_progress table)
      // For now, return mock data
      const completedItems = 0;
      const inProgressItems = 0;
      const notStartedItems = totalItems || 367;

      return {
        totalItems: totalItems || 367,
        completedItems,
        inProgressItems,
        notStartedItems,
        completionPercentage: totalItems ? (completedItems / totalItems) * 100 : 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });
};
