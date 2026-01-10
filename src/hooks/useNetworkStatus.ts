import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface NetworkStatus {
  isOnline: boolean;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean;
  lastOnlineAt: Date | null;
  lastOfflineAt: Date | null;
}

interface UseNetworkStatusOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  showToasts?: boolean;
}

export const useNetworkStatus = (options: UseNetworkStatusOptions = {}) => {
  const { onOnline, onOffline, showToasts = true } = options;
  
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: null,
    downlink: null,
    rtt: null,
    saveData: false,
    lastOnlineAt: null,
    lastOfflineAt: null
  });

  // Récupérer les infos de connexion
  const getConnectionInfo = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection?.effectiveType || null,
        downlink: connection?.downlink || null,
        rtt: connection?.rtt || null,
        saveData: connection?.saveData || false
      };
    }
    return { effectiveType: null, downlink: null, rtt: null, saveData: false };
  }, []);

  // Gestionnaire de changement d'état
  const handleOnline = useCallback(() => {
    const connectionInfo = getConnectionInfo();
    setStatus(prev => ({
      ...prev,
      isOnline: true,
      ...connectionInfo,
      lastOnlineAt: new Date()
    }));
    
    if (showToasts) {
      toast.success('✅ Connexion rétablie', {
        description: 'Vous êtes de nouveau en ligne'
      });
    }
    
    onOnline?.();
  }, [getConnectionInfo, onOnline, showToasts]);

  const handleOffline = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      isOnline: false,
      lastOfflineAt: new Date()
    }));
    
    if (showToasts) {
      toast.error('❌ Connexion perdue', {
        description: 'Vérifiez votre connexion internet',
        duration: 10000
      });
    }
    
    onOffline?.();
  }, [onOffline, showToasts]);

  // Écouter les changements de connexion
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Écouter les changements de qualité de connexion
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', () => {
        const connectionInfo = getConnectionInfo();
        setStatus(prev => ({ ...prev, ...connectionInfo }));
      });
    }

    // État initial
    const connectionInfo = getConnectionInfo();
    setStatus(prev => ({ ...prev, ...connectionInfo }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline, getConnectionInfo]);

  // Tester la vraie connectivité (pas juste navigator.onLine)
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Vérifier si la connexion est lente
  const isSlowConnection = useCallback(() => {
    if (status.effectiveType === '2g' || status.effectiveType === 'slow-2g') {
      return true;
    }
    if (status.rtt && status.rtt > 500) {
      return true;
    }
    if (status.downlink && status.downlink < 0.5) {
      return true;
    }
    return false;
  }, [status]);

  return {
    ...status,
    testConnection,
    isSlowConnection: isSlowConnection()
  };
};
