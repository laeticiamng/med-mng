import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AppRole = 'admin' | 'security_analyst' | 'viewer';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by: string | null;
  assigned_at: string;
}

export interface UserWithRoles {
  id: string;
  email: string;
  roles: AppRole[];
  created_at: string;
}

export function useUserRoles() {
  const queryClient = useQueryClient();

  // Get current user's roles
  const { data: myRoles = [], isLoading: loadingMyRoles } = useQuery({
    queryKey: ['my-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { _data, _error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (_error) throw _error;
      return (_data || []).map((r: any) => r.role as AppRole);
    },
  });

  // Check if user has a specific role
  const hasRole = (role: AppRole): boolean => {
    return myRoles.includes(role);
  };

  // Check if user is admin
  const isAdmin = hasRole('admin');
  const isSecurityAnalyst = hasRole('security_analyst');
  const isViewer = hasRole('viewer');

  // Get all users with their roles (admin only)
  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      if (!isAdmin) return [];

      // Get all users
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;

      // Get all role assignments
      const { _data: roles, _error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine users with their roles
      const usersWithRoles: UserWithRoles[] = (users || []).map(user => ({
        id: user.id,
        email: user.email || 'No email',
        roles: roles?.filter(r => r.user_id === user.id).map(r => r.role as AppRole) || [],
        created_at: user.created_at,
      }));

      return usersWithRoles;
    },
    enabled: isAdmin,
  });

  // Assign role to user
  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { _error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
          assigned_by: user.id,
        } as any);

      if (_error) throw _error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Rôle assigné avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'assignation du rôle');
    },
  });

  // Remove role from user
  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { _error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as any);

      if (_error) throw _error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Rôle retiré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du retrait du rôle');
    },
  });

  return {
    myRoles,
    loadingMyRoles,
    hasRole,
    isAdmin,
    isSecurityAnalyst,
    isViewer,
    allUsers,
    loadingUsers,
    assignRole: assignRole.mutate,
    removeRole: removeRole.mutate,
    isAssigning: assignRole.isPending || removeRole.isPending,
  };
}
