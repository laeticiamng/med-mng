// ✅ HOOK POUR GESTION QUOTA IA - Utilisation dans les composants React

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour gérer les quotas IA
 */
export function useIAQuota() {
  const [quota, setQuota] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Récupérer le quota actuel
  const fetchQuota = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('ia-quota', {
        body: { action: 'get_quota' }
      });

      if (error) throw error;
      
      setQuota(data.remaining_credits || 0);
      return data.remaining_credits || 0;
    } catch (error) {
      console.error('Erreur récupération quota:', error);
      toast({
        title: "Erreur quota",
        description: "Impossible de récupérer le quota restant",
        variant: "destructive"
      });
      return 0;
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si assez de crédits pour une opération
  const checkQuota = async (serviceType: string, operationType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ia-quota', {
        body: { 
          action: 'check_quota',
          service_type: serviceType,
          operation_type: operationType
        }
      });

      if (error) throw error;
      
      return {
        canProceed: data.has_enough_credits,
        required: data.required_credits,
        remaining: data.remaining_credits
      };
    } catch (error) {
      console.error('Erreur vérification quota:', error);
      return { canProceed: false, required: 0, remaining: 0 };
    }
  };

  // Utiliser des crédits pour une opération
  const useQuota = async (
    serviceType: string, 
    operationType: string, 
    requestDetails: any = {}
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('ia-quota', {
        body: { 
          action: 'use_quota',
          service_type: serviceType,
          operation_type: operationType,
          request_details: requestDetails
        }
      });

      if (error) throw error;

      if (!data.success) {
        toast({
          title: "Quota insuffisant",
          description: `Il vous faut ${data.required_credits} crédits mais il ne vous en reste que ${data.remaining_credits}`,
          variant: "destructive"
        });
        return false;
      }

      setQuota(data.remaining_credits);
      
      toast({
        title: "Crédits utilisés",
        description: `${data.used_credits} crédits utilisés. Reste: ${data.remaining_credits}`,
      });

      return true;
    } catch (error) {
      console.error('Erreur utilisation quota:', error);
      toast({
        title: "Erreur quota",
        description: "Impossible d'utiliser les crédits",
        variant: "destructive"
      });
      return false;
    }
  };

  // Récupérer les statistiques d'usage
  const getStats = async (periodDays: number = 30) => {
    try {
      const { data, error } = await supabase.functions.invoke('ia-quota', {
        body: { 
          action: 'get_stats',
          period: periodDays
        }
      });

      if (error) throw error;
      return data.stats;
    } catch (error) {
      console.error('Erreur statistiques:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  return {
    quota,
    loading,
    fetchQuota,
    checkQuota,
    useQuota,
    getStats,
    refreshQuota: fetchQuota
  };
}

/**
 * Utilitaire pour vérifier quota avant opération (version simplifiée)
 */
export async function checkAndUseCredits(
  serviceType: string,
  operationType: string,
  requestDetails: any = {}
): Promise<boolean> {
  try {
    // Vérifier puis utiliser en une seule requête
    const { data, error } = await supabase.functions.invoke('ia-quota', {
      body: { 
        action: 'use_quota',
        service_type: serviceType,
        operation_type: operationType,
        request_details: requestDetails
      }
    });

    if (error) throw error;

    if (!data.success) {
      console.warn('Quota insuffisant:', data);
      return false;
    }

    console.log(`Crédits utilisés: ${data.used_credits}, restants: ${data.remaining_credits}`);
    return true;

  } catch (error) {
    console.error('Erreur quota:', error);
    return false;
  }
}