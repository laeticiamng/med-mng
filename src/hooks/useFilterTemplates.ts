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
  is_shared: boolean;
  shared_with_team: boolean;
  shared_with_users: string[];
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

  // Share template
  const shareTemplate = useMutation({
    mutationFn: async ({ 
      id, 
      isShared, 
      sharedWithTeam, 
      userEmails 
    }: { 
      id: string; 
      isShared: boolean; 
      sharedWithTeam: boolean; 
      userEmails?: string[] 
    }) => {
      // If sharing with specific users, call the RPC function
      if (userEmails && userEmails.length > 0) {
        const { error } = await supabase.rpc('share_filter_template' as any, {
          template_id: id,
          user_emails: userEmails,
        } as any);

        if (error) throw error;
      } else {
        // Otherwise, just update the sharing flags
        const { error } = await supabase
          .from('notification_filter_templates' as any)
          .update({
            is_shared: isShared,
            shared_with_team: sharedWithTeam,
          })
          .eq('id', id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filter-templates'] });
      toast.success('Template partagé avec succès');
    },
    onError: (error: any) => {
      console.error('Error sharing template:', error);
      toast.error(error.message || 'Erreur lors du partage');
    },
  });

  return {
    templates,
    defaultTemplate,
    isLoading,
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
    shareTemplate: shareTemplate.mutate,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
    isSharing: shareTemplate.isPending,
  };
};
