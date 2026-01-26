import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuotaData {
  credits_left: number;
  total_credits: number;
  plan: string;
  renews_at: string;
  percentage_used: number;
}

export function useQuotaSync() {
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchQuota = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('med-mng-api', {
        body: { path: '/quota' },
        method: 'GET'
      });

      if (error) throw error;

      const newQuota: QuotaData = {
        credits_left: data.credits_left || 0,
        total_credits: data.total_credits || 0,
        plan: data.plan || 'free',
        renews_at: data.renews_at || '',
        percentage_used: data.total_credits > 0 ?
          ((data.total_credits - data.credits_left) / data.total_credits) * 100 : 0
      };

      // Check for quota changes and notify
      if (quota && quota.credits_left !== newQuota.credits_left) {
        const creditsUsed = quota.credits_left - newQuota.credits_left;
        if (creditsUsed > 0) {
          toast({
            title: "Quota mis à jour",
            description: `${creditsUsed} crédit(s) utilisé(s). Reste: ${newQuota.credits_left}`,
            variant: "default",
          });
        }
      }

      // Warning notifications
      if (newQuota.percentage_used >= 90) {
        toast({
          title: "⚠️ Quota presque épuisé",
          description: `Plus que ${newQuota.credits_left} crédits disponibles`,
          variant: "destructive",
        });
      } else if (newQuota.percentage_used >= 75) {
        toast({
          title: "Quota faible",
          description: `${newQuota.credits_left} crédits restants`,
          variant: "default",
        });
      }

      setQuota(newQuota);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Quota fetch failed:', error);
      toast({
        title: "Erreur quota",
        description: "Impossible de récupérer les informations de quota",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh quota after actions
  const refreshAfterAction = async () => {
    // Small delay to ensure backend is updated
    setTimeout(fetchQuota, 1000);
  };

  // Sync quota when component mounts and periodically
  useEffect(() => {
    fetchQuota();
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchQuota, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Listen to user activity to refresh quota
  useEffect(() => {
    const handleUserActivity = () => {
      // Refresh quota on any user interaction
      const timeSinceLastUpdate = Date.now() - lastUpdate.getTime();
      if (timeSinceLastUpdate > 30000) { // Only if last update was more than 30s ago
        fetchQuota();
      }
    };

    document.addEventListener('click', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    
    return () => {
      document.removeEventListener('click', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
    };
  }, [lastUpdate]);

  return {
    quota,
    isLoading,
    lastUpdate,
    refresh: fetchQuota,
    refreshAfterAction,
    isLowQuota: quota ? quota.percentage_used >= 75 : false,
    isCriticalQuota: quota ? quota.percentage_used >= 90 : false,
    hasQuota: quota ? quota.credits_left > 0 : false
  };
}