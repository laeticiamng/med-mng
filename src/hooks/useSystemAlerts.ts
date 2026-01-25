import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'extraction' | 'quota' | 'data' | 'auth' | 'performance' | 'security';
  title: string;
  message: string;
  source: string;
  context?: Record<string, any>;
  timestamp: string;
  acknowledged: boolean;
  auto_resolve: boolean;
  escalation_level: number;
}

interface AlertConfig {
  soundEnabled: boolean;
  emailEnabled: boolean;
  slackEnabled: boolean;
  criticalOnly: boolean;
  autoAcknowledge: boolean;
}

export function useSystemAlerts() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [config, setConfig] = useState<AlertConfig>({
    soundEnabled: true,
    emailEnabled: false,
    slackEnabled: false,
    criticalOnly: false,
    autoAcknowledge: false
  });
  const [isConnected, _setIsConnected] = useState(false);

  // Créer une nouvelle alerte
  const createAlert = useCallback((
    type: SystemAlert['type'],
    category: SystemAlert['category'],
    title: string,
    message: string,
    source: string,
    context?: Record<string, any>,
    escalationLevel: number = 0
  ) => {
    const newAlert: SystemAlert = {
      id: crypto.randomUUID(),
      type,
      category,
      title,
      message,
      source,
      context,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      auto_resolve: type === 'info' || type === 'success',
      escalation_level: escalationLevel
    };

    setAlerts(prev => [newAlert, ...prev].slice(0, 100)); // Garder les 100 dernières

    // Notification immédiate
    showNotification(newAlert);

    return newAlert.id;
  }, []);

  // Afficher notification selon le type
  const showNotification = useCallback((alert: SystemAlert) => {
    // Filtrer selon la config
    if (config.criticalOnly && alert.type !== 'critical') return;

    const toastConfig = {
      duration: alert.type === 'critical' ? Infinity : 5000
    };

    switch (alert.type) {
      case 'critical':
        toast.error(`🚨 ${alert.title}`, {
          description: alert.message,
          ...toastConfig
        });
        break;
      case 'warning':
        toast.warning(`⚠️ ${alert.title}`, {
          description: alert.message,
          ...toastConfig
        });
        break;
      case 'info':
        toast.info(`ℹ️ ${alert.title}`, {
          description: alert.message,
          ...toastConfig
        });
        break;
      case 'success':
        toast.success(`✅ ${alert.title}`, {
          description: alert.message,
          ...toastConfig
        });
        break;
    }

    // Son notification
    if (config.soundEnabled && (alert.type === 'critical' || alert.type === 'warning')) {
      playNotificationSound(alert.type);
    }
  }, [config]);

  // Son notification
  const playNotificationSound = useCallback((type: 'critical' | 'warning') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.frequency.value = type === 'critical' ? 800 : 600;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (err) {
      console.log('Sound notification not available');
    }
  }, []);

  // Acquitter une alerte
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true }
        : alert
    ));
  }, []);

  // Acquitter toutes les alertes d'un type
  const acknowledgeAllByType = useCallback((type: SystemAlert['type']) => {
    setAlerts(prev => prev.map(alert => 
      alert.type === type 
        ? { ...alert, acknowledged: true }
        : alert
    ));
  }, []);

  // Supprimer les alertes anciennes
  const clearOldAlerts = useCallback((olderThanHours: number = 24) => {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - olderThanHours);
    
    setAlerts(prev => prev.filter(alert => 
      new Date(alert.timestamp) > cutoff || !alert.acknowledged
    ));
  }, []);

  // Alertes spécialisées pour l'extraction
  const alertExtractionFailure = useCallback((batchId: string, failureRate: number, context?: any) => {
    if (failureRate > 50) {
      return createAlert(
        'critical',
        'extraction',
        'Échec critique d\'extraction',
        `Le batch ${batchId} présente un taux d'échec de ${(failureRate * 100).toFixed(1)}%`,
        'extraction-monitor',
        { batch_id: batchId, failure_rate: failureRate, ...context },
        2
      );
    } else if (failureRate > 20) {
      return createAlert(
        'warning',
        'extraction',
        'Taux d\'échec d\'extraction élevé',
        `Le batch ${batchId} présente un taux d'échec de ${(failureRate * 100).toFixed(1)}%`,
        'extraction-monitor',
        { batch_id: batchId, failure_rate: failureRate, ...context },
        1
      );
    }
  }, [createAlert]);

  // Alertes quota utilisateur
  const alertQuotaViolation = useCallback((userId: string, usage: number, plan: string) => {
    if (usage > 0.95) {
      return createAlert(
        'critical',
        'quota',
        'Quota utilisateur épuisé',
        `L'utilisateur ${userId} a dépassé son quota (${(usage * 100).toFixed(1)}%)`,
        'quota-monitor',
        { user_id: userId, usage_percent: usage * 100, plan },
        1
      );
    } else if (usage > 0.8) {
      return createAlert(
        'warning',
        'quota',
        'Quota utilisateur proche de la limite',
        `L'utilisateur ${userId} approche de son quota (${(usage * 100).toFixed(1)}%)`,
        'quota-monitor',
        { user_id: userId, usage_percent: usage * 100, plan }
      );
    }
  }, [createAlert]);

  // Alertes corruption de données
  const alertDataCorruption = useCallback((source: string, corruptedCount: number, context?: any) => {
    if (corruptedCount > 10) {
      return createAlert(
        'critical',
        'data',
        'Corruption de données critique',
        `${corruptedCount} items corrompus détectés dans ${source}`,
        'data-integrity',
        { source, corrupted_count: corruptedCount, ...context },
        2
      );
    } else if (corruptedCount > 0) {
      return createAlert(
        'warning',
        'data',
        'Données corrompues détectées',
        `${corruptedCount} items corrompus détectés dans ${source}`,
        'data-integrity',
        { source, corrupted_count: corruptedCount, ...context }
      );
    }
  }, [createAlert]);

  // Alertes performance
  const alertPerformanceDegradation = useCallback((metric: string, value: number, threshold: number) => {
    return createAlert(
      'warning',
      'performance',
      'Dégradation de performance',
      `${metric}: ${value} (seuil: ${threshold})`,
      'performance-monitor',
      { metric, value, threshold }
    );
  }, [createAlert]);

  // Auto-résolution des alertes
  useEffect(() => {
    if (config.autoAcknowledge) {
      const interval = setInterval(() => {
        setAlerts(prev => prev.map(alert => 
          alert.auto_resolve && !alert.acknowledged
            ? { ...alert, acknowledged: true }
            : alert
        ));
      }, 60000); // Chaque minute

      return () => clearInterval(interval);
    }
  }, [config.autoAcknowledge]);

  // Nettoyage périodique
  useEffect(() => {
    const interval = setInterval(() => {
      clearOldAlerts(24); // Supprimer les alertes de plus de 24h
    }, 3600000); // Chaque heure

    return () => clearInterval(interval);
  }, [clearOldAlerts]);

  // Statistiques
  const getStats = useCallback(() => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recent = alerts.filter(alert => new Date(alert.timestamp) > last24h);
    
    return {
      total: alerts.length,
      unacknowledged: alerts.filter(a => !a.acknowledged).length,
      critical: alerts.filter(a => a.type === 'critical' && !a.acknowledged).length,
      warning: alerts.filter(a => a.type === 'warning' && !a.acknowledged).length,
      last24h: recent.length,
      byCategory: {
        extraction: alerts.filter(a => a.category === 'extraction' && !a.acknowledged).length,
        quota: alerts.filter(a => a.category === 'quota' && !a.acknowledged).length,
        data: alerts.filter(a => a.category === 'data' && !a.acknowledged).length,
        auth: alerts.filter(a => a.category === 'auth' && !a.acknowledged).length,
        performance: alerts.filter(a => a.category === 'performance' && !a.acknowledged).length,
        security: alerts.filter(a => a.category === 'security' && !a.acknowledged).length
      }
    };
  }, [alerts]);

  return {
    alerts,
    config,
    isConnected,
    setConfig,
    createAlert,
    acknowledgeAlert,
    acknowledgeAllByType,
    clearOldAlerts,
    alertExtractionFailure,
    alertQuotaViolation,
    alertDataCorruption,
    alertPerformanceDegradation,
    getStats
  };
}