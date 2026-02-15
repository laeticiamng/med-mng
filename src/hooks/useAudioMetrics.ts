import { logService } from '@/services/logService';
import { useCallback, useRef } from 'react';

interface AudioMetrics {
  loadStartTime: number;
  metadataLoadTime?: number;
  metadataDelay?: number;
  canPlayTime?: number;
  canPlayDelay?: number;
  canPlayThroughTime?: number;
  totalLoadDelay?: number;
  actualPlayTime?: number;
  streamingDelay?: number;
  errorTime?: number;
  errorCount?: number;
  playStartTime?: number;
  totalLoadTime?: number;
  bufferHealthScore: number;
  errors: string[];
}

export const useAudioMetrics = () => {
  const metricsRef = useRef<Map<string, AudioMetrics>>(new Map());

  const _startTracking = useCallback((trackUrl: string) => {
    const metrics: AudioMetrics = {
      loadStartTime: performance.now(),
      bufferHealthScore: 0,
      errors: []
    };
    
    metricsRef.current.set(trackUrl, metrics);
    logService.debug('music', `Démarrage tracking pour: ${trackUrl}`);
    return metrics;
  }, []);

  const updateMetric = useCallback((trackUrl: string, update: Partial<AudioMetrics>) => {
    const existing = metricsRef.current.get(trackUrl);
    if (existing) {
      const updated = { ...existing, ...update };
      metricsRef.current.set(trackUrl, updated);
      
      // Log critique si dépassement
      if (updated.totalLoadTime && updated.totalLoadTime > 3000) {
        logService.warn('music', `Temps de chargement critique: ${updated.totalLoadTime.toFixed(0)}ms pour ${trackUrl}`);
      }
    }
  }, []);

  const getMetrics = useCallback((trackUrl: string): AudioMetrics | null => {
    return metricsRef.current.get(trackUrl) || null;
  }, []);

  const calculateBufferHealth = useCallback((buffered: TimeRanges, duration: number, currentTime: number): number => {
    if (!buffered.length || !duration) return 0;
    
    // Calculer le buffer ahead (combien de secondes d'avance)
    const bufferAhead = buffered.end(buffered.length - 1) - currentTime;
    
    // Score sur 100 basé sur le buffer disponible
    // 10s+ de buffer = 100%, 0s = 0%
    const bufferScore = Math.min(100, (bufferAhead / 10) * 100);
    
    return Math.max(0, bufferScore);
  }, []);

  const logFinalMetrics = useCallback((trackUrl: string) => {
    const metrics = metricsRef.current.get(trackUrl);
    if (!metrics) return;

    logService.info('music', `Final metrics for ${trackUrl}`, {
      totalLoadTime: metrics.totalLoadTime?.toFixed(0) || 'N/A',
      metadataLoadTime: metrics.metadataLoadTime?.toFixed(0) || 'N/A',
      canPlayTime: metrics.canPlayTime?.toFixed(0) || 'N/A',
      playStartTime: metrics.playStartTime?.toFixed(0) || 'N/A',
      bufferHealthScore: metrics.bufferHealthScore.toFixed(1),
    });

    if (metrics.errors.length > 0) {
      logService.warn('music', `Erreurs rencontrées: ${metrics.errors.length}`, { errors: metrics.errors });
    }

    // Analyse de performance
    if (metrics.totalLoadTime) {
      if (metrics.totalLoadTime < 1000) {
        logService.debug('music', 'Performance excellente (<1s)', { totalLoadTime: metrics.totalLoadTime });
      } else if (metrics.totalLoadTime < 3000) {
        logService.info('music', 'Performance acceptable (1-3s)', { totalLoadTime: metrics.totalLoadTime });
      } else {
        logService.error('music', 'Performance dégradée (>3s)', { totalLoadTime: metrics.totalLoadTime });
      }
    }
    
    // Nettoyer après rapport
    metricsRef.current.delete(trackUrl);
  }, []);

  return {
    _startTracking,
    updateMetric,
    getMetrics,
    calculateBufferHealth,
    logFinalMetrics
  };
};