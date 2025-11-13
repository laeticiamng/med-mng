import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { NotificationFilters } from '@/components/security/SecurityNotificationsFilters';

export interface FilterTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  filters: NotificationFilters;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useFilterTemplates = () => {
  const queryClient = useQueryClient();

  // Fetch all templates for current user
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['filter-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_filter_templates' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as any as FilterTemplate[];
    },
  });

  // Get default template
  const defaultTemplate = templates.find(t => t.is_default);

  // Create new template
  const createTemplate = useMutation({
    mutationFn: async (template: Omit<FilterTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notification_filter_templates' as any)
        .insert({
          user_id: user.id,
          name: template.name,
          description: template.description,
          filters: template.filters as any,
          is_default: template.is_default,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filter-templates'] });
      toast.success('Template de filtre créé avec succès');
    },
    onError: (error: any) => {
      console.error('Error creating template:', error);
      toast.error(error.message || 'Erreur lors de la création du template');
    },
  });

  // Update template
  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FilterTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('notification_filter_templates' as any)
        .update({
          name: updates.name,
          description: updates.description,
          filters: updates.filters as any,
          is_default: updates.is_default,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filter-templates'] });
      toast.success('Template mis à jour avec succès');
    },
    onError: (error: any) => {
      console.error('Error updating template:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });

  // Delete template
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notification_filter_templates' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filter-templates'] });
      toast.success('Template supprimé avec succès');
    },
    onError: (error: any) => {
      console.error('Error deleting template:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  return {
    templates,
    defaultTemplate,
    isLoading,
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
  };
};
