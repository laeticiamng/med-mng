import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SharePermission = 'viewer' | 'editor' | 'admin';

export interface SitemapShare {
  id: string;
  owner_id: string;
  shared_with_email: string;
  shared_with_id: string | null;
  permission: SharePermission;
  created_at: string;
  updated_at: string;
}

export function useSitemapShares() {
  const queryClient = useQueryClient();

  // Get shares I've created (as owner)
  const { data: myShares = [], isLoading: loadingMyShares } = useQuery({
    queryKey: ['my-sitemap-shares'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('sitemap_shares' as any)
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as SitemapShare[];
    },
  });

  // Get shares I've received (as recipient)
  const { data: sharedWithMe = [], isLoading: loadingSharedWithMe } = useQuery({
    queryKey: ['sitemap-shares-received'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('sitemap_shares' as any)
        .select('*')
        .eq('shared_with_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as SitemapShare[];
    },
  });

  // Create a new share
  const createShare = useMutation({
    mutationFn: async ({ email, permission }: { email: string; permission: SharePermission }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('sitemap_shares' as any)
        .insert({
          owner_id: user.id,
          shared_with_email: email,
          shared_with_id: null,
          permission,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-sitemap-shares'] });
      toast.success('Partage créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création du partage');
    },
  });

  // Update share permission
  const updateShare = useMutation({
    mutationFn: async ({ shareId, permission }: { shareId: string; permission: SharePermission }) => {
      const { error } = await supabase
        .from('sitemap_shares' as any)
        .update({ permission })
        .eq('id', shareId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-sitemap-shares'] });
      toast.success('Permission mise à jour');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });

  // Delete share
  const deleteShare = useMutation({
    mutationFn: async (shareId: string) => {
      const { error } = await supabase
        .from('sitemap_shares' as any)
        .delete()
        .eq('id', shareId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-sitemap-shares'] });
      toast.success('Partage supprimé');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  return {
    myShares,
    sharedWithMe,
    loadingMyShares,
    loadingSharedWithMe,
    createShare: createShare.mutate,
    updateShare: updateShare.mutate,
    deleteShare: deleteShare.mutate,
    isLoading: createShare.isPending || updateShare.isPending || deleteShare.isPending,
  };
}
