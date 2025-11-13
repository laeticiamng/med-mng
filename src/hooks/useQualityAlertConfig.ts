import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type NotificationFrequency = 'immediate' | 'hourly' | 'daily';
export type DigestFrequency = 'daily' | 'weekly';

export interface QualityAlertConfig {
  id: string;
  user_id: string;
  min_severity: Severity;
  email_recipients: string[];
  notification_frequency: NotificationFrequency;
  digest_enabled: boolean;
  digest_frequency: DigestFrequency;
  digest_day: number | null;
  digest_time: string;
  created_at: string;
  updated_at: string;
}

export const useQualityAlertConfig = () => {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['quality-alert-config'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('quality_alert_config')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as QualityAlertConfig | null;
    },
  });

  const saveConfig = useMutation({
    mutationFn: async (newConfig: Partial<QualityAlertConfig>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('quality_alert_config')
        .upsert({
          user_id: user.id,
          ...newConfig,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quality-alert-config'] });
      toast.success('Configuration sauvegardée');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    },
  });

  return {
    config,
    isLoading,
    saveConfig: saveConfig.mutate,
    isSaving: saveConfig.isPending,
  };
};
