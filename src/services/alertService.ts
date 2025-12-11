import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

// Types d'incidents
export type IncidentType =
  | 'EXTRACTION_FAILURE'
  | 'PAYMENT_FAILURE'
  | 'BACKEND_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'SUPABASE_DOWN'
  | 'ERROR_PATTERN_DETECTED'
  | 'SECURITY_BREACH'
  | 'PERFORMANCE_DEGRADATION'
  | 'API_FAILURE'
  | 'DATABASE_ERROR'
  | 'AUTH_FAILURE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'MUSIC_GENERATION_FAILURE'
  | 'STORAGE_ERROR'
  | 'SYSTEM_OVERLOAD';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'dismissed';
export type AlertChannel = 'discord' | 'slack' | 'email' | 'sms' | 'push';

export interface Incident {
  id?: string;
  type: IncidentType;
  message: string;
  details?: Record<string, unknown>;
  severity?: AlertSeverity;
  source?: string;
  userId?: string;
  timestamp?: string;
  stackTrace?: string;
}

export interface Alert {
  id: string;
  incident: Incident;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string[];
  createdAt: string;
  updatedAt: string;
  escalationLevel: number;
  notificationsSent: AlertChannel[];
}

export interface AlertRule {
  id: string;
  name: string;
  incidentTypes: IncidentType[];
  severities: AlertSeverity[];
  channels: AlertChannel[];
  cooldownMinutes: number;
  enabled: boolean;
  escalationDelayMinutes?: number;
  recipients?: string[];
}

export interface AlertStats {
  total: number;
  byStatus: Record<AlertStatus, number>;
  bySeverity: Record<AlertSeverity, number>;
  byType: Record<string, number>;
  averageResolutionTime: number;
  openAlerts: number;
}

// Configuration des webhooks
const discordWebhook = process.env.DISCORD_WEBHOOK_URL || import.meta.env?.VITE_DISCORD_WEBHOOK_URL;
const slackWebhook = process.env.SLACK_WEBHOOK_URL || import.meta.env?.VITE_SLACK_WEBHOOK_URL;

// Cache pour déduplication et rate limiting
const alertCache = new Map<string, number>();
const DEDUP_WINDOW_MS = 60000; // 1 minute
const MAX_ALERTS_PER_MINUTE = 10;
let alertCountThisMinute = 0;
let lastMinuteReset = Date.now();

// Historique local des alertes
let alertHistory: Alert[] = [];
const MAX_HISTORY = 500;

// Génération d'ID unique
function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Génération de clé de déduplication
function getDeduplicationKey(incident: Incident): string {
  return `${incident.type}:${incident.message}:${incident.source || 'unknown'}`;
}

// Vérifier si l'alerte est dupliquée
function isDuplicate(incident: Incident): boolean {
  const key = getDeduplicationKey(incident);
  const lastSent = alertCache.get(key);

  if (lastSent && Date.now() - lastSent < DEDUP_WINDOW_MS) {
    return true;
  }

  alertCache.set(key, Date.now());
  return false;
}

// Vérifier le rate limiting
function checkRateLimit(): boolean {
  const now = Date.now();
  if (now - lastMinuteReset > 60000) {
    alertCountThisMinute = 0;
    lastMinuteReset = now;
  }

  if (alertCountThisMinute >= MAX_ALERTS_PER_MINUTE) {
    return false;
  }

  alertCountThisMinute++;
  return true;
}

// Déterminer la sévérité automatiquement
function determineSeverity(incident: Incident): AlertSeverity {
  if (incident.severity) return incident.severity;

  const criticalTypes: IncidentType[] = [
    'SECURITY_BREACH', 'SUPABASE_DOWN', 'SYSTEM_OVERLOAD', 'DATABASE_ERROR'
  ];

  const highTypes: IncidentType[] = [
    'PAYMENT_FAILURE', 'AUTH_FAILURE', 'BACKEND_ERROR', 'API_FAILURE'
  ];

  const mediumTypes: IncidentType[] = [
    'EXTRACTION_FAILURE', 'MUSIC_GENERATION_FAILURE', 'STORAGE_ERROR',
    'PERFORMANCE_DEGRADATION', 'ERROR_PATTERN_DETECTED'
  ];

  if (criticalTypes.includes(incident.type)) return 'critical';
  if (highTypes.includes(incident.type)) return 'high';
  if (mediumTypes.includes(incident.type)) return 'medium';
  return 'low';
}

// Formater le message pour Discord
function formatDiscordMessage(incident: Incident, severity: AlertSeverity): object {
  const colors: Record<AlertSeverity, number> = {
    critical: 0xFF0000, // Rouge
    high: 0xFF8C00,     // Orange
    medium: 0xFFD700,   // Jaune
    low: 0x00FF00       // Vert
  };

  const severityEmojis: Record<AlertSeverity, string> = {
    critical: '🚨',
    high: '⚠️',
    medium: '📢',
    low: 'ℹ️'
  };

  return {
    embeds: [{
      title: `${severityEmojis[severity]} [${severity.toUpperCase()}] ${incident.type}`,
      description: incident.message,
      color: colors[severity],
      fields: [
        {
          name: 'Type',
          value: incident.type,
          inline: true
        },
        {
          name: 'Source',
          value: incident.source || 'Unknown',
          inline: true
        },
        {
          name: 'Timestamp',
          value: incident.timestamp || new Date().toISOString(),
          inline: true
        },
        ...(incident.details ? [{
          name: 'Details',
          value: '```json\n' + JSON.stringify(incident.details, null, 2).slice(0, 1000) + '\n```',
          inline: false
        }] : []),
        ...(incident.stackTrace ? [{
          name: 'Stack Trace',
          value: '```\n' + incident.stackTrace.slice(0, 500) + '\n```',
          inline: false
        }] : [])
      ],
      footer: {
        text: 'Med-MNG Alert System'
      },
      timestamp: new Date().toISOString()
    }]
  };
}

// Formater le message pour Slack
function formatSlackMessage(incident: Incident, severity: AlertSeverity): object {
  const colors: Record<AlertSeverity, string> = {
    critical: 'danger',
    high: 'warning',
    medium: '#FFD700',
    low: 'good'
  };

  return {
    attachments: [{
      color: colors[severity],
      title: `[${severity.toUpperCase()}] ${incident.type}`,
      text: incident.message,
      fields: [
        {
          title: 'Type',
          value: incident.type,
          short: true
        },
        {
          title: 'Source',
          value: incident.source || 'Unknown',
          short: true
        },
        {
          title: 'Severity',
          value: severity,
          short: true
        },
        {
          title: 'Time',
          value: incident.timestamp || new Date().toISOString(),
          short: true
        }
      ],
      footer: 'Med-MNG Alert System',
      ts: Math.floor(Date.now() / 1000)
    }]
  };
}

// Envoyer à Discord
async function sendToDiscord(incident: Incident, severity: AlertSeverity): Promise<boolean> {
  if (!discordWebhook) return false;

  try {
    const message = formatDiscordMessage(incident, severity);
    await axios.post(discordWebhook, message, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });
    return true;
  } catch (err) {
    console.error('Discord alert failed:', err);
    return false;
  }
}

// Envoyer à Slack
async function sendToSlack(incident: Incident, severity: AlertSeverity): Promise<boolean> {
  if (!slackWebhook) return false;

  try {
    const message = formatSlackMessage(incident, severity);
    await axios.post(slackWebhook, message, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });
    return true;
  } catch (err) {
    console.error('Slack alert failed:', err);
    return false;
  }
}

// Persister l'alerte dans Supabase
async function persistAlert(alert: Alert): Promise<boolean> {
  try {
    const { error } = await supabase.from('alerts').insert({
      id: alert.id,
      incident_type: alert.incident.type,
      message: alert.incident.message,
      severity: determineSeverity(alert.incident),
      status: alert.status,
      details: alert.incident.details,
      source: alert.incident.source,
      user_id: alert.incident.userId,
      stack_trace: alert.incident.stackTrace,
      escalation_level: alert.escalationLevel,
      notifications_sent: alert.notificationsSent,
      created_at: alert.createdAt
    });

    if (error) {
      console.error('Failed to persist alert:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error persisting alert:', err);
    return false;
  }
}

// Fonction principale de notification
export async function notifyIncident(incident: Incident): Promise<Alert | null> {
  // Vérifications préliminaires
  if (isDuplicate(incident)) {
    console.log('Duplicate alert suppressed:', incident.type);
    return null;
  }

  if (!checkRateLimit()) {
    console.warn('Alert rate limit exceeded');
    return null;
  }

  const severity = determineSeverity(incident);
  const timestamp = incident.timestamp || new Date().toISOString();

  // Créer l'objet alerte
  const alert: Alert = {
    id: generateAlertId(),
    incident: { ...incident, timestamp, severity },
    status: 'open',
    createdAt: timestamp,
    updatedAt: timestamp,
    escalationLevel: 0,
    notificationsSent: []
  };

  // Envoyer les notifications
  const tasks: Promise<{ channel: AlertChannel; success: boolean }>[] = [];

  if (discordWebhook) {
    tasks.push(
      sendToDiscord(incident, severity)
        .then(success => ({ channel: 'discord' as AlertChannel, success }))
    );
  }

  if (slackWebhook) {
    tasks.push(
      sendToSlack(incident, severity)
        .then(success => ({ channel: 'slack' as AlertChannel, success }))
    );
  }

  // Attendre les résultats
  const results = await Promise.all(tasks);
  alert.notificationsSent = results
    .filter(r => r.success)
    .map(r => r.channel);

  // Persister l'alerte
  await persistAlert(alert);

  // Ajouter à l'historique local
  alertHistory.unshift(alert);
  if (alertHistory.length > MAX_HISTORY) {
    alertHistory = alertHistory.slice(0, MAX_HISTORY);
  }

  // Log console
  console.log(`[ALERT] [${severity.toUpperCase()}] ${incident.type}: ${incident.message}`);

  return alert;
}

// Accuser réception d'une alerte
export async function acknowledgeAlert(
  alertId: string,
  userId: string,
  notes?: string
): Promise<boolean> {
  try {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('alerts')
      .update({
        status: 'acknowledged',
        acknowledged_by: userId,
        acknowledged_at: now,
        notes: notes ? [notes] : [],
        updated_at: now
      })
      .eq('id', alertId);

    if (error) {
      console.error('Failed to acknowledge alert:', error);
      return false;
    }

    // Mettre à jour l'historique local
    const localAlert = alertHistory.find(a => a.id === alertId);
    if (localAlert) {
      localAlert.status = 'acknowledged';
      localAlert.acknowledgedBy = userId;
      localAlert.acknowledgedAt = now;
      localAlert.updatedAt = now;
      if (notes) localAlert.notes = [notes];
    }

    return true;
  } catch (err) {
    console.error('Error acknowledging alert:', err);
    return false;
  }
}

// Résoudre une alerte
export async function resolveAlert(
  alertId: string,
  userId: string,
  resolution?: string
): Promise<boolean> {
  try {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('alerts')
      .update({
        status: 'resolved',
        resolved_by: userId,
        resolved_at: now,
        updated_at: now
      })
      .eq('id', alertId);

    if (error) {
      console.error('Failed to resolve alert:', error);
      return false;
    }

    // Mettre à jour l'historique local
    const localAlert = alertHistory.find(a => a.id === alertId);
    if (localAlert) {
      localAlert.status = 'resolved';
      localAlert.resolvedBy = userId;
      localAlert.resolvedAt = now;
      localAlert.updatedAt = now;
      if (resolution) {
        localAlert.notes = [...(localAlert.notes || []), `Resolution: ${resolution}`];
      }
    }

    return true;
  } catch (err) {
    console.error('Error resolving alert:', err);
    return false;
  }
}

// Récupérer les alertes
export async function getAlerts(filter?: {
  status?: AlertStatus;
  severity?: AlertSeverity;
  type?: IncidentType;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<Alert[]> {
  try {
    let query = supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }
    if (filter?.severity) {
      query = query.eq('severity', filter.severity);
    }
    if (filter?.type) {
      query = query.eq('incident_type', filter.type);
    }
    if (filter?.startDate) {
      query = query.gte('created_at', filter.startDate);
    }
    if (filter?.endDate) {
      query = query.lte('created_at', filter.endDate);
    }
    if (filter?.limit) {
      query = query.limit(filter.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to get alerts:', error);
      return alertHistory;
    }

    return (data || []).map(row => ({
      id: row.id,
      incident: {
        type: row.incident_type as IncidentType,
        message: row.message,
        details: row.details,
        severity: row.severity as AlertSeverity,
        source: row.source,
        userId: row.user_id,
        stackTrace: row.stack_trace
      },
      status: row.status as AlertStatus,
      acknowledgedBy: row.acknowledged_by,
      acknowledgedAt: row.acknowledged_at,
      resolvedBy: row.resolved_by,
      resolvedAt: row.resolved_at,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      escalationLevel: row.escalation_level || 0,
      notificationsSent: row.notifications_sent || []
    }));
  } catch (err) {
    console.error('Error getting alerts:', err);
    return alertHistory;
  }
}

// Statistiques des alertes
export async function getAlertStats(
  startDate?: string,
  endDate?: string
): Promise<AlertStats | null> {
  try {
    let query = supabase.from('alerts').select('*');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('Failed to get alert stats:', error);
      return null;
    }

    const byStatus: Record<AlertStatus, number> = {
      open: 0,
      acknowledged: 0,
      investigating: 0,
      resolved: 0,
      dismissed: 0
    };

    const bySeverity: Record<AlertSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    const byType: Record<string, number> = {};
    let totalResolutionTime = 0;
    let resolvedCount = 0;

    for (const row of data) {
      const status = row.status as AlertStatus;
      const severity = row.severity as AlertSeverity;
      const type = row.incident_type;

      if (status in byStatus) byStatus[status]++;
      if (severity in bySeverity) bySeverity[severity]++;
      byType[type] = (byType[type] || 0) + 1;

      if (row.resolved_at && row.created_at) {
        const created = new Date(row.created_at).getTime();
        const resolved = new Date(row.resolved_at).getTime();
        totalResolutionTime += resolved - created;
        resolvedCount++;
      }
    }

    return {
      total: data.length,
      byStatus,
      bySeverity,
      byType,
      averageResolutionTime: resolvedCount > 0
        ? Math.round(totalResolutionTime / resolvedCount / 1000 / 60) // en minutes
        : 0,
      openAlerts: byStatus.open + byStatus.acknowledged + byStatus.investigating
    };
  } catch (err) {
    console.error('Error getting alert stats:', err);
    return null;
  }
}

// Ajouter une note à une alerte
export async function addAlertNote(alertId: string, note: string): Promise<boolean> {
  try {
    const { data: existing } = await supabase
      .from('alerts')
      .select('notes')
      .eq('id', alertId)
      .single();

    const currentNotes = existing?.notes || [];
    const updatedNotes = [...currentNotes, `[${new Date().toISOString()}] ${note}`];

    const { error } = await supabase
      .from('alerts')
      .update({
        notes: updatedNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      console.error('Failed to add note:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error adding note:', err);
    return false;
  }
}

// Escalader une alerte
export async function escalateAlert(alertId: string): Promise<boolean> {
  try {
    const { data: existing } = await supabase
      .from('alerts')
      .select('escalation_level')
      .eq('id', alertId)
      .single();

    const newLevel = (existing?.escalation_level || 0) + 1;

    const { error } = await supabase
      .from('alerts')
      .update({
        escalation_level: newLevel,
        status: 'investigating',
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      console.error('Failed to escalate alert:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error escalating alert:', err);
    return false;
  }
}

// Récupérer l'historique local
export function getLocalAlertHistory(): Alert[] {
  return [...alertHistory];
}

// Effacer le cache de déduplication
export function clearDeduplicationCache(): void {
  alertCache.clear();
}

// Nettoyer les anciennes alertes
export async function cleanupOldAlerts(daysToKeep: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error } = await supabase
      .from('alerts')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .eq('status', 'resolved')
      .select('id');

    if (error) {
      console.error('Failed to cleanup old alerts:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (err) {
    console.error('Error cleaning up alerts:', err);
    return 0;
  }
}

// Fonctions utilitaires pour créer des incidents rapidement
export const createIncident = {
  extraction: (message: string, details?: Record<string, unknown>) =>
    notifyIncident({ type: 'EXTRACTION_FAILURE', message, details }),

  payment: (message: string, details?: Record<string, unknown>) =>
    notifyIncident({ type: 'PAYMENT_FAILURE', message, details, severity: 'high' }),

  security: (message: string, details?: Record<string, unknown>) =>
    notifyIncident({ type: 'SECURITY_BREACH', message, details, severity: 'critical' }),

  performance: (message: string, details?: Record<string, unknown>) =>
    notifyIncident({ type: 'PERFORMANCE_DEGRADATION', message, details }),

  api: (message: string, details?: Record<string, unknown>) =>
    notifyIncident({ type: 'API_FAILURE', message, details }),

  database: (message: string, details?: Record<string, unknown>) =>
    notifyIncident({ type: 'DATABASE_ERROR', message, details, severity: 'critical' }),

  music: (message: string, details?: Record<string, unknown>) =>
    notifyIncident({ type: 'MUSIC_GENERATION_FAILURE', message, details })
};
