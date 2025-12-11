import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed' | 'overtime';

export interface EcosTimerConfig {
  initialTime?: number; // en secondes
  warningThreshold?: number; // seuil d'alerte en secondes
  criticalThreshold?: number; // seuil critique en secondes
  allowOvertime?: boolean; // autoriser le dépassement
  onWarning?: () => void;
  onCritical?: () => void;
  onComplete?: () => void;
  onTick?: (timeLeft: number) => void;
  autoStart?: boolean;
}

export interface EcosTimerState {
  timeLeft: number;
  elapsed: number;
  status: TimerStatus;
  isWarning: boolean;
  isCritical: boolean;
  progress: number; // 0-100
  overtime: number; // temps dépassé si allowOvertime
}

export interface EcosTimerActions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newTime?: number) => void;
  stop: () => void;
  addTime: (seconds: number) => void;
  subtractTime: (seconds: number) => void;
}

export interface EcosTimerReturn extends EcosTimerState, EcosTimerActions {
  formatTime: (seconds: number) => string;
  formatTimeVerbose: (seconds: number) => string;
  getColorClass: () => string;
}

const DEFAULT_TIME = 900; // 15 minutes par défaut pour ECOS
const DEFAULT_WARNING = 300; // 5 minutes
const DEFAULT_CRITICAL = 60; // 1 minute

export const useEcosTimer = (config: EcosTimerConfig = {}): EcosTimerReturn => {
  const {
    initialTime = DEFAULT_TIME,
    warningThreshold = DEFAULT_WARNING,
    criticalThreshold = DEFAULT_CRITICAL,
    allowOvertime = false,
    onWarning,
    onCritical,
    onComplete,
    onTick,
    autoStart = false
  } = config;

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<TimerStatus>(autoStart ? 'running' : 'idle');
  const [overtime, setOvertime] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialTimeRef = useRef(initialTime);
  const hasWarned = useRef(false);
  const hasCritical = useRef(false);
  const hasCompleted = useRef(false);

  // Calculer les états dérivés
  const isWarning = timeLeft <= warningThreshold && timeLeft > criticalThreshold;
  const isCritical = timeLeft <= criticalThreshold;
  const progress = Math.max(0, Math.min(100, ((initialTimeRef.current - timeLeft) / initialTimeRef.current) * 100));

  // Formatage du temps (MM:SS)
  const formatTime = useCallback((seconds: number): string => {
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const prefix = seconds < 0 ? '-' : '';
    return `${prefix}${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Formatage verbeux (X min Y sec)
  const formatTimeVerbose = useCallback((seconds: number): string => {
    const absSeconds = Math.abs(seconds);
    const hours = Math.floor(absSeconds / 3600);
    const mins = Math.floor((absSeconds % 3600) / 60);
    const secs = absSeconds % 60;
    const prefix = seconds < 0 ? 'Dépassé de ' : '';

    if (hours > 0) {
      return `${prefix}${hours}h ${mins}min ${secs}s`;
    } else if (mins > 0) {
      return `${prefix}${mins} min ${secs} sec`;
    } else {
      return `${prefix}${secs} secondes`;
    }
  }, []);

  // Obtenir la classe de couleur selon le temps restant
  const getColorClass = useCallback((): string => {
    if (status === 'overtime') return 'text-purple-500';
    if (isCritical) return 'text-red-500 animate-pulse';
    if (isWarning) return 'text-yellow-500';
    return 'text-green-500';
  }, [status, isCritical, isWarning]);

  // Nettoyer l'intervalle
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Démarrer le timer
  const start = useCallback(() => {
    if (status === 'running') return;

    hasWarned.current = false;
    hasCritical.current = false;
    hasCompleted.current = false;

    setStatus('running');
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        setElapsed(e => e + 1);
        onTick?.(newTime);

        // Gestion du temps écoulé
        if (newTime <= 0) {
          if (allowOvertime) {
            setStatus('overtime');
            setOvertime(o => o + 1);
            return newTime;
          } else {
            clearTimer();
            setStatus('completed');
            if (!hasCompleted.current) {
              hasCompleted.current = true;
              onComplete?.();
            }
            return 0;
          }
        }

        return newTime;
      });
    }, 1000);
  }, [status, allowOvertime, onTick, onComplete, clearTimer]);

  // Pause
  const pause = useCallback(() => {
    if (status !== 'running' && status !== 'overtime') return;
    clearTimer();
    setStatus('paused');
  }, [status, clearTimer]);

  // Reprendre
  const resume = useCallback(() => {
    if (status !== 'paused') return;
    setStatus(timeLeft <= 0 && allowOvertime ? 'overtime' : 'running');
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        setElapsed(e => e + 1);
        onTick?.(newTime);

        if (newTime <= 0 && allowOvertime) {
          setOvertime(o => o + 1);
        } else if (newTime <= 0) {
          clearTimer();
          setStatus('completed');
          return 0;
        }

        return newTime;
      });
    }, 1000);
  }, [status, timeLeft, allowOvertime, onTick, clearTimer]);

  // Reset
  const reset = useCallback((newTime?: number) => {
    clearTimer();
    const resetTime = newTime ?? initialTime;
    initialTimeRef.current = resetTime;
    setTimeLeft(resetTime);
    setElapsed(0);
    setOvertime(0);
    setStatus('idle');
    hasWarned.current = false;
    hasCritical.current = false;
    hasCompleted.current = false;
  }, [initialTime, clearTimer]);

  // Stop
  const stop = useCallback(() => {
    clearTimer();
    setStatus('completed');
  }, [clearTimer]);

  // Ajouter du temps
  const addTime = useCallback((seconds: number) => {
    setTimeLeft(prev => prev + seconds);
    if (status === 'overtime' && timeLeft + seconds > 0) {
      setStatus('running');
      setOvertime(0);
    }
  }, [status, timeLeft]);

  // Soustraire du temps
  const subtractTime = useCallback((seconds: number) => {
    setTimeLeft(prev => Math.max(allowOvertime ? -Infinity : 0, prev - seconds));
  }, [allowOvertime]);

  // Callbacks d'alerte
  useEffect(() => {
    if (status !== 'running') return;

    if (isWarning && !hasWarned.current) {
      hasWarned.current = true;
      onWarning?.();
    }

    if (isCritical && !hasCritical.current) {
      hasCritical.current = true;
      onCritical?.();
    }
  }, [timeLeft, isWarning, isCritical, status, onWarning, onCritical]);

  // Nettoyage à la destruction
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Auto-start si configuré
  useEffect(() => {
    if (autoStart && status === 'idle') {
      start();
    }
  }, [autoStart, status, start]);

  return {
    // State
    timeLeft,
    elapsed,
    status,
    isWarning,
    isCritical,
    progress,
    overtime,
    // Actions
    start,
    pause,
    resume,
    reset,
    stop,
    addTime,
    subtractTime,
    // Helpers
    formatTime,
    formatTimeVerbose,
    getColorClass
  };
};

// Hook simplifié pour rétrocompatibilité
export const useSimpleEcosTimer = (initialTime: number = DEFAULT_TIME) => {
  const timer = useEcosTimer({ initialTime, autoStart: true });
  return {
    timeLeft: timer.timeLeft,
    formatTime: timer.formatTime
  };
};

export default useEcosTimer;
