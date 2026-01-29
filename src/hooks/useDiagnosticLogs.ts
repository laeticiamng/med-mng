/**
 * 🔧 Diagnostic Logs Hook
 * Centralized logging for debugging and monitoring
 */

import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

export type LogLevel = 'error' | 'warning' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  stackTrace?: string;
  url?: string;
}

// In-memory buffer for batch sending
const logBuffer: LogEntry[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

export function useDiagnosticLogs() {
  // Log to console and optionally to database
  const log = useCallback(async (entry: LogEntry) => {
    const timestamp = new Date().toISOString();
    
    // Always log to console
    const consoleMethod = entry.level === 'error' ? console.error
      : entry.level === 'warning' ? console.warn
      : entry.level === 'debug' ? console.debug
      : console.log;
    
    consoleMethod(`[${timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`, entry.context);

    // Only persist errors and warnings to database
    if (entry.level === 'error' || entry.level === 'warning') {
      logBuffer.push({
        ...entry,
        url: entry.url || (typeof window !== 'undefined' ? window.location.href : undefined),
      });

      // Debounce flush
      if (flushTimeout) clearTimeout(flushTimeout);
      flushTimeout = setTimeout(() => flushLogs(), 2000);
    }
  }, []);

  // Flush buffered logs to database
  const flushLogs = async () => {
    if (logBuffer.length === 0) return;

    const logsToSend = [...logBuffer];
    logBuffer.length = 0;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const entries = logsToSend.map(entry => ({
        user_id: user?.id || null,
        error_type: entry.level,
        message: entry.message,
        stack: entry.stackTrace,
        url: entry.url,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        context: entry.context || {},
        category: 'frontend',
        severity: entry.level,
        priority: entry.level === 'error' ? 'high' : 'medium',
      }));

      // Use ai_monitoring_errors table since it exists
      await supabase.from('ai_monitoring_errors').insert(entries as any);
    } catch (error) {
      // Don't log errors about logging - could cause infinite loop
      console.debug('Failed to persist diagnostic logs:', error);
    }
  };

  // Convenience methods
  const logError = useCallback((message: string, context?: Record<string, any>, stackTrace?: string) => {
    log({ level: 'error', message, context, stackTrace });
  }, [log]);

  const logWarning = useCallback((message: string, context?: Record<string, any>) => {
    log({ level: 'warning', message, context });
  }, [log]);

  const logInfo = useCallback((message: string, context?: Record<string, any>) => {
    log({ level: 'info', message, context });
  }, [log]);

  const logDebug = useCallback((message: string, context?: Record<string, any>) => {
    log({ level: 'debug', message, context });
  }, [log]);

  // Track API latency
  const trackLatency = useCallback((operation: string, startTime: number) => {
    const latency = Date.now() - startTime;
    if (latency > 3000) {
      logWarning(`Slow operation: ${operation}`, { latency, operation });
    }
  }, [logWarning]);

  // Capture unhandled errors
  const setupGlobalErrorHandler = useCallback(() => {
    if (typeof window === 'undefined') return;

    window.onerror = (message, source, lineno, colno, error) => {
      logError(
        `Unhandled error: ${message}`,
        { source, lineno, colno },
        error?.stack
      );
    };

    window.onunhandledrejection = (event) => {
      logError(
        `Unhandled promise rejection: ${event.reason}`,
        { reason: String(event.reason) },
        event.reason?.stack
      );
    };
  }, [logError]);

  // Get recent logs for diagnostics page
  const getRecentLogs = useCallback(async (limit: number = 50) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('ai_monitoring_errors')
        .select('message, severity, created_at, context, stack, url')
        .eq('user_id', user.id)
        .eq('category', 'frontend')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }, []);

  return {
    log,
    logError,
    logWarning,
    logInfo,
    logDebug,
    trackLatency,
    setupGlobalErrorHandler,
    getRecentLogs,
    flushLogs,
  };
}

// Singleton for non-hook usage
export const diagnosticLogger = {
  error: (message: string, context?: Record<string, any>) => {
    console.error(`[ERROR] ${message}`, context);
  },
  warning: (message: string, context?: Record<string, any>) => {
    console.warn(`[WARNING] ${message}`, context);
  },
  info: (message: string, context?: Record<string, any>) => {
    console.log(`[INFO] ${message}`, context);
  },
  debug: (message: string, context?: Record<string, any>) => {
    console.debug(`[DEBUG] ${message}`, context);
  },
};
