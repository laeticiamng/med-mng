import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

export type PanicState = 'normal' | 'warning' | 'critical' | 'recovering';

interface PanicMonitorState {
  state: PanicState;
  errorCount: number;
  retryCountdown: number;
  lastError: Error | null;
}

export const usePanicMonitor = () => {
  const [monitorState, setMonitorState] = useState<PanicMonitorState>({
    state: 'normal',
    errorCount: 0,
    retryCountdown: 0,
    lastError: null
  });

  // Reset panic state
  const reset = useCallback(() => {
    setMonitorState({
      state: 'normal',
      errorCount: 0,
      retryCountdown: 0,
      lastError: null
    });
    logger.info('Panic monitor reset');
  }, []);

  // Retry mechanism
  const retry = useCallback(() => {
    setMonitorState(prev => ({
      ...prev,
      state: 'recovering',
      retryCountdown: 5
    }));
    
    // Start countdown
    const countdown = setInterval(() => {
      setMonitorState(prev => {
        const newCountdown = prev.retryCountdown - 1;
        if (newCountdown <= 0) {
          clearInterval(countdown);
          return {
            ...prev,
            state: 'normal',
            errorCount: 0,
            retryCountdown: 0,
            lastError: null
          };
        }
        return { ...prev, retryCountdown: newCountdown };
      });
    }, 1000);
  }, []);

  // Monitor global errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = new Error(event.message);
      
      setMonitorState(prev => {
        const newErrorCount = prev.errorCount + 1;
        let newState: PanicState = 'normal';
        
        if (newErrorCount >= 5) {
          newState = 'critical';
        } else if (newErrorCount >= 3) {
          newState = 'warning';
        }
        
        logger.error(`Panic monitor: Error count ${newErrorCount}, state: ${newState}`);
        
        return {
          state: newState,
          errorCount: newErrorCount,
          retryCountdown: prev.retryCountdown,
          lastError: error
        };
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new Error(event.reason?.message || 'Unhandled Promise Rejection');
      
      setMonitorState(prev => {
        const newErrorCount = prev.errorCount + 1;
        let newState: PanicState = 'normal';
        
        if (newErrorCount >= 5) {
          newState = 'critical';
        } else if (newErrorCount >= 3) {
          newState = 'warning';
        }
        
        logger.error(`Panic monitor: Promise rejection, error count ${newErrorCount}`);
        
        return {
          state: newState,
          errorCount: newErrorCount,
          retryCountdown: prev.retryCountdown,
          lastError: error
        };
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Auto-reset after some time in normal conditions
  useEffect(() => {
    if (monitorState.errorCount > 0 && monitorState.state === 'normal') {
      const resetTimer = setTimeout(() => {
        setMonitorState(prev => ({
          ...prev,
          errorCount: Math.max(0, prev.errorCount - 1)
        }));
      }, 30000); // Reduce error count every 30 seconds
      
      return () => clearTimeout(resetTimer);
    }
  }, [monitorState.errorCount, monitorState.state]);

  return {
    ...monitorState,
    reset,
    retry
  };
};