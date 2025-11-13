import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'moderator' | 'user';

export function useUserRole() {
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRole(null);
        setIsAdmin(false);
        setIsModerator(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading user role:', error);
        setRole('user'); // Default to user
        return;
      }

      const userRole = data?.role as AppRole || 'user';
      setRole(userRole);
      setIsAdmin(userRole === 'admin');
      setIsModerator(userRole === 'moderator' || userRole === 'admin');
    } catch (err) {
      console.error('Error in loadUserRole:', err);
      setRole('user');
    } finally {
      setLoading(false);
    }
  };

  return {
    role,
    isAdmin,
    isModerator,
    loading,
    refresh: loadUserRole,
  };
}
