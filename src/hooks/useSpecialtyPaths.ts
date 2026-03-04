import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface SpecialtyPath {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  estimated_hours: number;
  difficulty: string;
  is_published: boolean;
  steps_count?: number;
  checkpoints_count?: number;
}

export interface PathStep {
  id: string;
  path_id: string;
  item_code: string;
  step_order: number;
  title: string;
  description: string | null;
  is_checkpoint: boolean;
  checkpoint_type: string | null;
  min_score_percent: number;
}

export interface UserPathProgress {
  id: string;
  user_id: string;
  path_id: string;
  current_step_order: number;
  started_at: string;
  completed_at: string | null;
  is_certified: boolean;
  certificate_id: string | null;
}

export interface UserStepProgress {
  id: string;
  user_id: string;
  step_id: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'failed';
  score: number | null;
  attempts: number;
  completed_at: string | null;
}

export const useSpecialtyPaths = () => {
  return useQuery({
    queryKey: ['specialty-paths'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('specialty_paths')
        .select('*')
        .eq('is_published', true)
        .order('name');
      if (error) throw error;

      // Get steps count per path
      const { data: steps } = await (supabase as any)
        .from('specialty_path_steps')
        .select('path_id, is_checkpoint');

      const pathsWithCounts = (data as SpecialtyPath[]).map(path => {
        const pathSteps = (steps || []).filter((s: any) => s.path_id === path.id);
        return {
          ...path,
          steps_count: pathSteps.length,
          checkpoints_count: pathSteps.filter((s: any) => s.is_checkpoint).length,
        };
      });

      return pathsWithCounts as SpecialtyPath[];
    },
    staleTime: 15 * 60 * 1000,
  });
};

export const usePathDetail = (slug: string) => {
  return useQuery({
    queryKey: ['specialty-path', slug],
    queryFn: async () => {
      const { data: path, error } = await (supabase as any)
        .from('specialty_paths')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;

      const { data: steps, error: stepsError } = await (supabase as any)
        .from('specialty_path_steps')
        .select('*')
        .eq('path_id', path.id)
        .order('step_order');
      if (stepsError) throw stepsError;

      return { path: path as SpecialtyPath, steps: steps as PathStep[] };
    },
    enabled: !!slug,
  });
};

export const useUserPathProgress = (pathId: string | undefined) => {
  return useQuery({
    queryKey: ['user-path-progress', pathId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !pathId) return null;

      const { data } = await (supabase as any)
        .from('user_path_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('path_id', pathId)
        .maybeSingle();

      return data as UserPathProgress | null;
    },
    enabled: !!pathId,
  });
};

export const useUserStepProgresses = (stepIds: string[]) => {
  return useQuery({
    queryKey: ['user-step-progresses', stepIds],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || stepIds.length === 0) return [];

      const { data } = await (supabase as any)
        .from('user_step_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('step_id', stepIds);

      return (data || []) as UserStepProgress[];
    },
    enabled: stepIds.length > 0,
  });
};

export const useStartPath = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (pathId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await (supabase as any)
        .from('user_path_progress')
        .upsert({
          user_id: user.id,
          path_id: pathId,
          current_step_order: 1,
          started_at: new Date().toISOString(),
        }, { onConflict: 'user_id,path_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, pathId) => {
      queryClient.invalidateQueries({ queryKey: ['user-path-progress', pathId] });
      toast({ title: '🎯 Parcours démarré !', description: 'Bonne chance dans votre progression.' });
    },
  });
};

export const useCompleteStep = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ stepId, pathId, score, nextStepOrder }: {
      stepId: string; pathId: string; score?: number; nextStepOrder: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Mark step completed
      await (supabase as any)
        .from('user_step_progress')
        .upsert({
          user_id: user.id,
          step_id: stepId,
          status: 'completed',
          score: score || 100,
          attempts: 1,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,step_id' });

      // Update path progress
      await (supabase as any)
        .from('user_path_progress')
        .upsert({
          user_id: user.id,
          path_id: pathId,
          current_step_order: nextStepOrder,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,path_id' });

      return { stepId, pathId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-path-progress', data.pathId] });
      queryClient.invalidateQueries({ queryKey: ['user-step-progresses'] });
      toast({ title: '✅ Étape validée !' });
    },
  });
};

export const useCertifyPath = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (pathId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const certId = `CERT-${Date.now().toString(36).toUpperCase()}-${user.id.slice(0, 4).toUpperCase()}`;

      await (supabase as any)
        .from('user_path_progress')
        .update({
          is_certified: true,
          certificate_id: certId,
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('path_id', pathId);

      return certId;
    },
    onSuccess: (certId, pathId) => {
      queryClient.invalidateQueries({ queryKey: ['user-path-progress', pathId] });
      toast({ title: '🏆 Certification obtenue !', description: `ID: ${certId}` });
    },
  });
};
