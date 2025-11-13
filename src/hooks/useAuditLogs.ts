import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: 'view' | 'create' | 'update' | 'delete' | 'access';
  resource_type: string;
  resource_id: string;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface UseAuditLogsOptions {
  resourceId?: string;
  resourceType?: string;
  action?: string;
  userId?: string;
  limit?: number;
  days?: number;
}

export const useAuditLogs = (options: UseAuditLogsOptions = {}) => {
  const { resourceId, resourceType, action, userId, limit = 100, days = 90 } = options;

  return useQuery({
    queryKey: ['audit-logs', resourceId, resourceType, action, userId, limit, days],
    queryFn: async () => {
      let query = supabase
        .from('share_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters
      if (resourceId) {
        query = query.eq('resource_id', resourceId);
      }
      if (resourceType) {
        query = query.eq('resource_type', resourceType);
      }
      if (action) {
        query = query.eq('action', action);
      }
      if (userId) {
        query = query.eq('user_id', userId);
      }
      if (days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        query = query.gte('created_at', cutoffDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AuditLog[];
    },
  });
};

// Hook to manually log an audit event (for client-side tracking)
export const useLogAuditEvent = () => {
  const logEvent = async (
    action: string,
    resourceType: string,
    resourceId: string,
    details?: Record<string, any>
  ) => {
    const { error } = await supabase.rpc('log_share_audit', {
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_details: details || null,
    });

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  };

  return { logEvent };
};
