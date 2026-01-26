import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useState } from 'react';

export interface CompletenessResult {
  item_code: string;
  completeness_score: number;
  tableau_a_present: boolean;
  tableau_b_present: boolean;
  quiz_present: boolean;
  alerts: string[];
  status: 'complete' | 'incomplete' | 'critical';
}

export interface CompletenessReport {
  id: string;
  created_at: string;
  audit_type: string;
  summary: {
    total_items: number;
    complete_items: number;
    incomplete_items: number;
    critical_issues: number;
    average_completeness: number;
    completion_rate: number;
  };
  results: CompletenessResult[];
}

export interface CompletenessAlert {
  id: string;
  created_at: string;
  item_code: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

export const useItemsCompleteness = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<CompletenessReport[]>([]);
  const [alerts, setAlerts] = useState<CompletenessAlert[]>([]);
  const [currentReport, setCurrentReport] = useState<CompletenessReport | null>(null);
  const { toast } = useToast();

  // Lancer un audit automatisé
  const runAutomatedAudit = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Starting automated completeness audit...');
      
      const { data, error } = await supabase.functions.invoke('items-completeness-api', {
        method: 'GET',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ Audit terminé",
          description: `Audit de complétude des ${data.data.summary.total_items} items terminé avec succès`,
        });

        // Recharger les rapports
        await loadReports();

        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('❌ Error running audit:', error);
      toast({
        title: "Erreur d'audit",
        description: "Impossible de lancer l'audit de complétude",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Charger les rapports
  const loadReports = useCallback(async (_limit = 10) => {
    try {
      const { data, error } = await supabase.functions.invoke('items-completeness-api', {
        method: 'GET',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      if (data.success) {
        setReports(data.data);
        if (data.data.length > 0) {
          setCurrentReport(data.data[0]); // Le plus récent
        }
      }
    } catch (error) {
      console.error('❌ Error loading reports:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les rapports",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Charger les alertes
  const loadAlerts = useCallback(async (resolved = false, severity?: string) => {
    try {
      const params = new URLSearchParams({
        action: 'get-alerts',
        resolved: resolved.toString(),
      });
      
      if (severity) {
        params.append('severity', severity);
      }

      const { data, error } = await supabase.functions.invoke('items-completeness-api', {
        method: 'GET',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('❌ Error loading alerts:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les alertes",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Obtenir le statut d'un item spécifique
  const getItemStatus = useCallback(async (_itemCode: string): Promise<CompletenessResult | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('items-completeness-api', {
        method: 'GET',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      if (data.success) {
        return data.data;
      }

      return null;
    } catch (error) {
      console.error('❌ Error getting item status:', error);
      return null;
    }
  }, []);

  // Résoudre une alerte
  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('items-completeness-api', {
        method: 'POST',
        body: { alert_id: alertId },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ Alerte résolue",
          description: "L'alerte a été marquée comme résolue",
        });

        // Recharger les alertes
        await loadAlerts();

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error resolving alert:', error);
      toast({
        title: "Erreur",
        description: "Impossible de résoudre l'alerte",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, loadAlerts]);

  // Obtenir l'historique de complétude
  const getCompletenessHistory = useCallback(async (itemCode?: string, limit = 20) => {
    try {
      const params = new URLSearchParams({
        action: 'get-history',
        limit: limit.toString(),
      });
      
      if (itemCode) {
        params.append('item_code', itemCode);
      }

      const { data, error } = await supabase.functions.invoke('items-completeness-api', {
        method: 'GET',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      if (data.success) {
        return data.data;
      }

      return [];
    } catch (error) {
      console.error('❌ Error loading history:', error);
      return [];
    }
  }, []);

  return {
    // State
    isLoading,
    reports,
    alerts,
    currentReport,
    
    // Actions
    runAutomatedAudit,
    loadReports,
    loadAlerts,
    getItemStatus,
    resolveAlert,
    getCompletenessHistory,
  };
};