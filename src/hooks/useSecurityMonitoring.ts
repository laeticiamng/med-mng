import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SecurityCorrection {
  id: string;
  correction_type: string;
  table_or_function_name: string;
  issue_description: string;
  correction_applied: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  before_state?: any;
  after_state?: any;
  applied_by?: string;
  applied_at: string;
  migration_file?: string;
  notes?: string;
}

export interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  affected_resource?: string;
  recommendation?: string;
  status: "open" | "acknowledged" | "resolved" | "dismissed";
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  metadata?: any;
}

export interface SecurityMetricsSnapshot {
  id: string;
  recorded_at: string;
  total_tables: number;
  tables_with_rls: number;
  total_policies: number;
  total_functions: number;
  functions_with_search_path: number;
  security_score: number;
  linter_issues?: any;
  critical_issues: number;
  high_issues: number;
  medium_issues: number;
  low_issues: number;
  info_issues: number;
}

export const useSecurityMonitoring = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch corrections history
  const {
    data: corrections,
    isLoading: correctionsLoading,
    error: correctionsError,
  } = useQuery({
    queryKey: ["security-corrections"],
    queryFn: async () => {
      const { _data, _error } = await supabase
        .from("security_corrections_history")
        .select("*")
        .order("applied_at", { ascending: false })
        .limit(50);

      if (_error) throw _error;
      return _data as SecurityCorrection[];
    },
  });

  // Fetch security alerts
  const {
    data: alerts,
    isLoading: alertsLoading,
    error: alertsError,
  } = useQuery({
    queryKey: ["security-alerts"],
    queryFn: async () => {
      const { _data, _error } = await supabase
        .from("security_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (_error) throw _error;
      return _data as SecurityAlert[];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch metrics snapshots
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useQuery({
    queryKey: ["security-metrics"],
    queryFn: async () => {
      const { _data, _error } = await supabase
        .from("security_metrics_snapshots")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(30);

      if (_error) throw _error;
      return _data as SecurityMetricsSnapshot[];
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch current metrics
  const { mutate: refreshMetrics, isPending: refreshing } = useMutation({
    mutationFn: async () => {
      const { _data, error } = await supabase.functions.invoke("security-metrics");
      if (error) throw error;
      return _data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["security-alerts"] });
      toast({
        title: "Métriques actualisées",
        description: "Les métriques de sécurité ont été mises à jour",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update alert status
  const { mutate: updateAlertStatus } = useMutation({
    mutationFn: async ({
      alertId,
      status,
    }: {
      alertId: string;
      status: "acknowledged" | "resolved" | "dismissed";
    }) => {
      const updates: any = { status };
      if (status === "resolved") {
        updates.resolved_at = new Date().toISOString();
      }

      const { _error } = await supabase
        .from("security_alerts")
        .update(updates)
        .eq("id", alertId);

      if (_error) throw _error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-alerts"] });
      toast({
        title: "Alerte mise à jour",
        description: "Le statut de l'alerte a été modifié",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const latestMetrics = metrics?.[0];
  const openAlerts = alerts?.filter((a) => a.status === "open") || [];
  const criticalAlerts = openAlerts.filter((a) => a.severity === "critical");

  return {
    corrections,
    correctionsLoading,
    correctionsError,
    alerts,
    alertsLoading,
    alertsError,
    metrics,
    metricsLoading,
    metricsError,
    latestMetrics,
    openAlerts,
    criticalAlerts,
    refreshMetrics,
    refreshing,
    updateAlertStatus,
  };
};
