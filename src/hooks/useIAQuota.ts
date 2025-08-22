import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { appNavigate } from '@/lib/navigation';

interface QuotaStats {
  by_service: Array<{
    service_type: string;
    total_operations: number;
    total_credits: number;
    avg_response_time: number;
    error_count: number;
  }>;
  daily_usage: Array<{
    usage_date: string;
    daily_credits: number;
  }>;
  period_days: number;
  total_operations: number;
  total_credits_used: number;
}

export const useIAQuota = () => {
  const [quota, setQuota] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchQuota = async () => {
    try {
      setLoading(true);
      
      // Vérifier d'abord si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setQuota(0);
        return 0;
      }

      const { data, error } = await supabase.functions.invoke('med-mng-api/quota', {
        body: {},
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) throw error;

      setQuota(data?.remaining_credits || 0);
      return data?.remaining_credits || 0;
    } catch (error: any) {
      console.error('Erreur lors de la récupération du quota:', error);
      const status = error?.status ?? error?.context?.status ?? error?.response?.status;
      if (status === 401) {
      toast.error("Connexion requise", {
        description: "Connectez-vous pour accéder à vos crédits IA et générer de la musique.",
        action: {
          label: "Se connecter",
          onClick: () => appNavigate('/med-mng/login')
        },
        duration: 8000
      });
        setQuota(0);
        return 0;
      }
      toast.error("Erreur quota IA", {
        description: "Impossible de récupérer le quota IA. Réessayez dans quelques instants.",
        duration: 6000
      });
      return 0;
    } finally {
      setLoading(false);
    }
  };

  const checkQuota = async (serviceType: string, operationType: string) => {
    try {
      const credits_required = getCreditsRequired(serviceType, operationType);
      
      const { data, error } = await supabase.functions.invoke('med-mng-api/quota/check', {
        body: { 
          credits_required,
          service_type: serviceType,
          operation_type: operationType
        },
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) throw error;

      return {
        canProceed: data?.has_enough_credits || false,
        required: credits_required,
        remaining: data?.remaining_credits || 0
      };
    } catch (error: any) {
      console.error('Erreur lors de la vérification du quota:', error);
      const status = error?.status ?? error?.context?.status ?? error?.response?.status;
      if (status === 401) {
        toast.error("Authentification requise", {
          description: "Connectez-vous pour vérifier vos crédits IA et débloquer toutes les fonctionnalités.",
          action: {
            label: "Se connecter",
            onClick: () => appNavigate('/med-mng/login')
          },
          duration: 8000
        });
      }
      return {
        canProceed: false,
        required: 0,
        remaining: 0
      };
    }
  };

  const useQuota = async (serviceType: string, operationType: string, requestDetails?: any) => {
    try {
      const credits_to_use = getCreditsRequired(serviceType, operationType);
      
      const { data, error } = await supabase.functions.invoke('med-mng-api/quota/use', {
        body: { 
          credits_to_use,
          service_type: serviceType,
          operation_type: operationType,
          request_details: requestDetails || {}
        },
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) throw error;

      if (data?.success) {
        setQuota(data.remaining_credits || 0);
        return true;
      } else {
        toast.error("Quota insuffisant", {
          description: `Il vous faut ${data?.required_credits || 0} crédits mais vous n'en avez que ${data?.remaining_credits || 0}`,
          duration: 8000
        });
        return false;
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'utilisation du quota:', error);
      const status = error?.status ?? error?.context?.status ?? error?.response?.status;
      if (status === 401) {
        toast.error("Session expirée", {
          description: "Reconnectez-vous pour utiliser vos crédits IA et continuer à générer.",
          action: {
            label: "Se reconnecter",
            onClick: () => appNavigate('/med-mng/login')
          },
          duration: 8000
        });
      } else {
        toast.error("Erreur crédits IA", {
          description: "Impossible d'utiliser les crédits IA. Réessayez.",
          duration: 6000
        });
      }
      return false;
    }
  };

  const getStats = async (periodDays = 30): Promise<QuotaStats | null> => {
    try {
      const { data, error } = await supabase.functions.invoke(`med-mng-api/quota/stats?period=${periodDays}`, {
        body: {},
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) throw error;
      return data as QuotaStats;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      return null;
    }
  };

  // Définir les coûts en crédits pour chaque operation
  const getCreditsRequired = (serviceType: string, operationType: string): number => {
    const costs = {
      music: {
        generation: 5,
        stream: 1,
        download: 2
      },
      qcm: {
        generation: 2,
        correction: 1
      },
      chat: {
        message: 1,
        context: 2
      },
      bd: {
        generation: 10
      },
      roman: {
        generation: 15
      },
      image: {
        generation: 3
      }
    };

    return costs[serviceType as keyof typeof costs]?.[operationType as keyof any] || 1;
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadQuota = async () => {
      if (isMounted) {
        await fetchQuota();
      }
    };
    
    loadQuota();
    
    return () => {
      isMounted = false;
    };
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
};

// Fonction utilitaire pour vérifier et utiliser les crédits en une seule fois
export const checkAndUseCredits = async (
  serviceType: string, 
  operationType: string, 
  requestDetails?: any
): Promise<boolean> => {
  try {
    const getCreditsRequired = (serviceType: string, operationType: string): number => {
      const costs = {
        music: { generation: 5, stream: 1, download: 2 },
        qcm: { generation: 2, correction: 1 },
        chat: { message: 1, context: 2 },
        bd: { generation: 10 },
        roman: { generation: 15 },
        image: { generation: 3 }
      };
      return costs[serviceType as keyof typeof costs]?.[operationType as keyof any] || 1;
    };

    const credits_to_use = getCreditsRequired(serviceType, operationType);
    
    const { data, error } = await supabase.functions.invoke('med-mng-api/quota/use', {
      body: { 
        credits_to_use,
        service_type: serviceType,
        operation_type: operationType,
        request_details: requestDetails || {}
      },
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (error) throw error;
    return data?.success || false;
  } catch (error) {
    console.error('Erreur lors de la vérification et utilisation des crédits:', error);
    return false;
  }
};