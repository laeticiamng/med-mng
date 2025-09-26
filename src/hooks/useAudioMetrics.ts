import { useCallback, useRef } from 'react';
import { errorService } from '@/services/core/ErrorService';

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

  const startTracking = useCallback((trackUrl: string) => {
    const metrics: AudioMetrics = {
      loadStartTime: performance.now(),
      bufferHealthScore: 0,
      errors: []
    };
    
    metricsRef.current.set(trackUrl, metrics);
    console.log(`📊 [METRICS] Démarrage tracking pour: ${trackUrl}`);
    return metrics;
  }, []);

  const updateMetric = useCallback((trackUrl: string, update: Partial<AudioMetrics>) => {
    const existing = metricsRef.current.get(trackUrl);
    if (existing) {
      const updated = { ...existing, ...update };
      metricsRef.current.set(trackUrl, updated);
      
      // Log critique si dépassement
      if (updated.totalLoadTime && updated.totalLoadTime > 3000) {
        errorService.handleWarning(`⚠️ [METRICS] Temps de chargement critique: ${updated.totalLoadTime.toFixed(0)}ms pour ${trackUrl}`, 'system');
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

    console.group(`📊 [METRICS FINAL] ${trackUrl}`);
    console.log(`🔄 Temps total de chargement: ${metrics.totalLoadTime?.toFixed(0) || 'N/A'}ms`);
    console.log(`📊 Métadonnées: ${metrics.metadataLoadTime?.toFixed(0) || 'N/A'}ms`);
    console.log(`▶️ Prêt à jouer: ${metrics.canPlayTime?.toFixed(0) || 'N/A'}ms`);
    console.log(`🎵 Démarrage lecture: ${metrics.playStartTime?.toFixed(0) || 'N/A'}ms`);
    console.log(`📶 Score buffer santé: ${metrics.bufferHealthScore.toFixed(1)}%`);
    
    if (metrics.errors.length > 0) {
      errorService.handleWarning(`❌ Erreurs rencontrées: ${metrics.errors.length}`, 'system');
      metrics.errors.forEach(error => errorService.handleWarning(`- ${error}`, 'system'));
    }
    
    // Analyse de performance
    if (metrics.totalLoadTime) {
      if (metrics.totalLoadTime < 1000) {
        console.log('✅ Performance excellente (<1s)');
      } else if (metrics.totalLoadTime < 3000) {
        console.log('⚠️ Performance acceptable (1-3s)');
      } else {
        errorService.handleError(new Error('🚨 Performance dégradée (>3s)'), 'system', true);
      }
    }
    
    console.groupEnd();
    
    // Nettoyer après rapport
    metricsRef.current.delete(trackUrl);
  }, []);

  return {
    startTracking,
    updateMetric,
    getMetrics,
    calculateBufferHealth,
    logFinalMetrics
  };
};