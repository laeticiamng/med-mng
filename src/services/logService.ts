import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

// Use the existing supabase client for logging
// Service role key operations should be done via edge functions
const client: SupabaseClient | null = supabase as any;

// Types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type LogCategory =
  | 'auth'
  | 'api'
  | 'database'
  | 'music'
  | 'extraction'
  | 'payment'
  | 'security'
  | 'performance'
  | 'user_action'
  | 'system'
  | 'audit';

export interface LogEntry {
  id?: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
  stackTrace?: string;
  duration?: number;
  ip?: string;
  userAgent?: string;
}

export interface LogFilter {
  level?: LogLevel | LogLevel[];
  category?: LogCategory | LogCategory[];
  userId?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface LogStats {
  totalLogs: number;
  byLevel: Record<LogLevel, number>;
  byCategory: Record<LogCategory, number>;
  errorRate: number;
  averageResponseTime: number;
}

// Configuration des niveaux de log
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4
};

const CURRENT_LOG_LEVEL: LogLevel = 'info';

// Buffer pour batch logging
let logBuffer: LogEntry[] = [];
const BUFFER_SIZE = 50;
const FLUSH_INTERVAL = 5000;
let flushTimer: NodeJS.Timeout | null = null;

// Génération d'ID unique
function generateId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Vérifier si le niveau de log est suffisant
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LOG_LEVEL];
}

// Formatage du message de log pour console
function formatConsoleMessage(entry: LogEntry): string {
  const timestamp = new Date(entry.timestamp).toISOString();
  const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;
  return `${prefix} ${entry.message}`;
}

// Logging vers la console
function logToConsole(entry: LogEntry): void {
  const message = formatConsoleMessage(entry);

  switch (entry.level) {
    case 'debug':
      console.debug(message, entry.metadata || '');
      break;
    case 'info':
      console.info(message, entry.metadata || '');
      break;
    case 'warn':
      console.warn(message, entry.metadata || '');
      break;
    case 'error':
    case 'critical':
      console.error(message, entry.metadata || '', entry.stackTrace || '');
      break;
  }
}

// Flush du buffer vers Supabase
async function flushBuffer(): Promise<void> {
  if (logBuffer.length === 0 || !client) return;

  const logsToFlush = [...logBuffer];
  logBuffer = [];

  try {
    const { error } = await client.from('operation_logs').insert(
      logsToFlush.map(log => ({
        id: log.id,
        type: log.level,
        category: log.category,
        message: log.message,
        meta: {
          userId: log.userId,
          sessionId: log.sessionId,
          requestId: log.requestId,
          metadata: log.metadata,
          stackTrace: log.stackTrace,
          duration: log.duration,
          ip: log.ip,
          userAgent: log.userAgent
        },
        created_at: log.timestamp
      }))
    );

    if (error) {
      console.error('Failed to flush log buffer:', error);
      // Remettre les logs dans le buffer en cas d'échec
      logBuffer = [...logsToFlush, ...logBuffer].slice(0, BUFFER_SIZE * 2);
    }
  } catch (err) {
    console.error('Error flushing log buffer:', err);
  }
}

// Démarrer le timer de flush automatique
function startFlushTimer(): void {
  if (!flushTimer) {
    flushTimer = setInterval(flushBuffer, FLUSH_INTERVAL);
  }
}

// Arrêter le timer de flush
export function stopFlushTimer(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

// Fonction principale de logging
export async function log(
  level: LogLevel,
  category: LogCategory,
  message: string,
  options?: {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    metadata?: Record<string, unknown>;
    stackTrace?: string;
    duration?: number;
    ip?: string;
    userAgent?: string;
    immediate?: boolean;
  }
): Promise<void> {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    id: generateId(),
    level,
    category,
    message,
    timestamp: new Date().toISOString(),
    ...options
  };

  // Toujours logger en console
  logToConsole(entry);

  // Si pas de client Supabase, on s'arrête là
  if (!client) return;

  // Si immediate, envoyer directement
  if (options?.immediate || level === 'critical') {
    try {
      await client.from('operation_logs').insert({
        id: entry.id,
        type: entry.level,
        category: entry.category,
        message: entry.message,
        meta: {
          userId: entry.userId,
          sessionId: entry.sessionId,
          requestId: entry.requestId,
          metadata: entry.metadata,
          stackTrace: entry.stackTrace,
          duration: entry.duration,
          ip: entry.ip,
          userAgent: entry.userAgent
        },
        created_at: entry.timestamp
      });
    } catch (err) {
      console.error('Failed to log immediately:', err);
    }
  } else {
    // Ajouter au buffer
    logBuffer.push(entry);
    startFlushTimer();

    // Flush si buffer plein
    if (logBuffer.length >= BUFFER_SIZE) {
      await flushBuffer();
    }
  }
}

// Fonctions de raccourci par niveau
export const debug = (category: LogCategory, message: string, metadata?: Record<string, unknown>) =>
  log('debug', category, message, { metadata });

export const info = (category: LogCategory, message: string, metadata?: Record<string, unknown>) =>
  log('info', category, message, { metadata });

export const warn = (category: LogCategory, message: string, metadata?: Record<string, unknown>) =>
  log('warn', category, message, { metadata });

export const error = (category: LogCategory, message: string, options?: {
  metadata?: Record<string, unknown>;
  stackTrace?: string;
  error?: Error;
}) => {
  const stackTrace = options?.error?.stack || options?.stackTrace;
  return log('error', category, message, {
    metadata: options?.metadata,
    stackTrace,
    immediate: true
  });
};

export const critical = (category: LogCategory, message: string, options?: {
  metadata?: Record<string, unknown>;
  stackTrace?: string;
  error?: Error;
}) => {
  const stackTrace = options?.error?.stack || options?.stackTrace;
  return log('critical', category, message, {
    metadata: options?.metadata,
    stackTrace,
    immediate: true
  });
};

// Fonction legacy pour rétrocompatibilité
export async function logOperation(
  type: string,
  message: string,
  meta?: Record<string, unknown>
): Promise<void> {
  const level: LogLevel = type === 'error' ? 'error' : 'info';
  const category: LogCategory = 'system';
  await log(level, category, message, { metadata: meta });
}

// Récupération des logs avec filtres
export async function getLogs(filter: LogFilter = {}): Promise<LogEntry[]> {
  if (!client) {
    console.warn('Supabase not configured for log retrieval');
    return [];
  }

  try {
    let query = client
      .from('operation_logs')
      .select('*')
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filter.level) {
      const levels = Array.isArray(filter.level) ? filter.level : [filter.level];
      query = query.in('type', levels);
    }

    if (filter.category) {
      const categories = Array.isArray(filter.category) ? filter.category : [filter.category];
      query = query.in('category', categories);
    }

    if (filter.userId) {
      query = query.eq('meta->>userId', filter.userId);
    }

    if (filter.startDate) {
      query = query.gte('created_at', filter.startDate);
    }

    if (filter.endDate) {
      query = query.lte('created_at', filter.endDate);
    }

    if (filter.searchTerm) {
      query = query.ilike('message', `%${filter.searchTerm}%`);
    }

    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    if (filter.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
    }

    const { data, error: queryError } = await query;

    if (queryError) {
      console.error('Failed to retrieve logs:', queryError);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      level: row.type as LogLevel,
      category: row.category as LogCategory,
      message: row.message,
      timestamp: row.created_at,
      userId: row.meta?.userId,
      sessionId: row.meta?.sessionId,
      requestId: row.meta?.requestId,
      metadata: row.meta?.metadata,
      stackTrace: row.meta?.stackTrace,
      duration: row.meta?.duration,
      ip: row.meta?.ip,
      userAgent: row.meta?.userAgent
    }));
  } catch (err) {
    console.error('Error retrieving logs:', err);
    return [];
  }
}

// Statistiques des logs
export async function getLogStats(startDate?: string, endDate?: string): Promise<LogStats | null> {
  if (!client) {
    console.warn('Supabase not configured for log stats');
    return null;
  }

  try {
    let query = client.from('operation_logs').select('type, category, meta');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error: queryError } = await query;

    if (queryError || !data) {
      console.error('Failed to get log stats:', queryError);
      return null;
    }

    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      critical: 0
    };

    const byCategory: Record<LogCategory, number> = {
      auth: 0,
      api: 0,
      database: 0,
      music: 0,
      extraction: 0,
      payment: 0,
      security: 0,
      performance: 0,
      user_action: 0,
      system: 0,
      audit: 0
    };

    let totalDuration = 0;
    let durationCount = 0;

    for (const row of data) {
      const level = row.type as LogLevel;
      const category = row.category as LogCategory;

      if (level in byLevel) byLevel[level]++;
      if (category in byCategory) byCategory[category]++;

      if (row.meta?.duration) {
        totalDuration += row.meta.duration;
        durationCount++;
      }
    }

    const errorCount = byLevel.error + byLevel.critical;
    const errorRate = data.length > 0 ? (errorCount / data.length) * 100 : 0;

    return {
      totalLogs: data.length,
      byLevel,
      byCategory,
      errorRate: Math.round(errorRate * 100) / 100,
      averageResponseTime: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0
    };
  } catch (err) {
    console.error('Error getting log stats:', err);
    return null;
  }
}

// Suppression des vieux logs
export async function deleteOldLogs(daysToKeep: number = 30): Promise<number> {
  if (!client) {
    console.warn('Supabase not configured for log deletion');
    return 0;
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error: deleteError } = await client
      .from('operation_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (deleteError) {
      console.error('Failed to delete old logs:', deleteError);
      return 0;
    }

    return data?.length || 0;
  } catch (err) {
    console.error('Error deleting old logs:', err);
    return 0;
  }
}

// Export des logs en JSON
export async function exportLogs(filter: LogFilter = {}): Promise<string> {
  const logs = await getLogs({ ...filter, limit: 10000 });
  return JSON.stringify(logs, null, 2);
}

// Export des logs en CSV
export async function exportLogsCSV(filter: LogFilter = {}): Promise<string> {
  const logs = await getLogs({ ...filter, limit: 10000 });

  const headers = ['id', 'timestamp', 'level', 'category', 'message', 'userId', 'sessionId'];
  const rows = logs.map(log => [
    log.id || '',
    log.timestamp,
    log.level,
    log.category,
    `"${(log.message || '').replace(/"/g, '""')}"`,
    log.userId || '',
    log.sessionId || ''
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Log d'audit spécifique
export async function auditLog(
  action: string,
  userId: string,
  details: Record<string, unknown>
): Promise<void> {
  await log('info', 'audit', action, {
    userId,
    metadata: details,
    immediate: true
  });
}

// Log de performance
export async function performanceLog(
  operation: string,
  duration: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  const level: LogLevel = duration > 5000 ? 'warn' : duration > 10000 ? 'error' : 'info';
  await log(level, 'performance', `${operation} completed in ${duration}ms`, {
    duration,
    metadata
  });
}

// Nettoyage à la fermeture
export async function cleanup(): Promise<void> {
  stopFlushTimer();
  await flushBuffer();
}

// Démarrage automatique
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanup);
}
