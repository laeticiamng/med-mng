import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type IncidentStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'escalated';
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affected_resource: string;
  detected_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  assigned_to?: string;
  resolution_notes?: string;
  metadata?: Record<string, unknown>;
}

export function useSecurityIncidents() {
  const queryClient = useQueryClient();

  const { data: incidents = [], isLoading, error } = useQuery({
    queryKey: ['security-incidents'],
    queryFn: async () => {
      const { _data, _error } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (_error) throw _error;
      
      return (_data || []).map(alert => ({
        id: alert.id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity as IncidentSeverity,
        status: alert.status as IncidentStatus,
        affected_resource: alert.affected_resource,
        detected_at: alert.created_at,
        acknowledged_at: alert.created_at,
        resolved_at: alert.resolved_at,
        assigned_to: alert.resolved_by,
        resolution_notes: alert.recommendation,
        metadata: alert.metadata as Record<string, unknown>,
      }));
    },
  });

  const updateIncidentStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: IncidentStatus;
      notes?: string;
    }) => {
      const updates: Record<string, unknown> = { status };

      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
        if (notes) {
          updates.recommendation = notes;
        }
      }

      const { _error } = await supabase
        .from('security_alerts')
        .update(updates)
        .eq('id', id);

      if (_error) throw _error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['security-incidents'] });
      toast.success(`Incident ${variables.status === 'resolved' ? 'résolu' : 'mis à jour'}`);
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour de l\'incident');
      console.error('Update incident error:', error);
    },
  });

  const escalateIncident = useMutation({
    mutationFn: async ({ id, assignedTo }: { id: string; assignedTo: string }) => {
      const { _error } = await supabase
        .from('security_alerts')
        .update({
          status: 'escalated',
          resolved_by: assignedTo,
        })
        .eq('id', id);

      if (_error) throw _error;

      // Send notification
      await supabase.functions.invoke('send-security-alert', {
        body: { incidentId: id, assignedTo },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-incidents'] });
      toast.success('Incident escaladé avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'escalade');
      console.error('Escalate incident error:', error);
    },
  });

  const openIncidents = incidents.filter(i => i.status === 'open');
  const criticalIncidents = incidents.filter(i => i.severity === 'critical');
  const activeIncidents = incidents.filter(i => 
    ['open', 'acknowledged', 'investigating', 'escalated'].includes(i.status)
  );

  return {
    incidents,
    openIncidents,
    criticalIncidents,
    activeIncidents,
    isLoading,
    error,
    updateIncidentStatus: updateIncidentStatus.mutate,
    escalateIncident: escalateIncident.mutate,
    isUpdating: updateIncidentStatus.isPending || escalateIncident.isPending,
  };
}
