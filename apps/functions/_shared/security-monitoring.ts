/**
 * 🔐 Security Monitoring & Alerting System
 *
 * Track security events and send real-time alerts to Slack/Teams
 *
 * Usage:
 * ```typescript
 * import { logSecurityEvent, SecurityEventType } from '../_shared/security-monitoring.ts';
 *
 * // Log unauthorized access attempt
 * await logSecurityEvent(supabase, {
 *   type: 'UNAUTHORIZED_ACCESS',
 *   severity: 'high',
 *   userId: userId,
 *   endpoint: 'admin-export',
 *   details: { reason: 'Missing admin role' },
 * });
 * ```
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

export type SecurityEventType =
  | 'UNAUTHORIZED_ACCESS'      // JWT missing or invalid
  | 'FORBIDDEN_ACCESS'         // Valid JWT but insufficient permissions
  | 'RATE_LIMIT_EXCEEDED'      // Rate limit violation
  | 'SUSPICIOUS_ACTIVITY'      // Multiple failed auth attempts
  | 'DATA_EXPORT'             // Sensitive data export
  | 'BULK_OPERATION'          // Bulk data modification
  | 'API_KEY_USAGE'           // External API usage (OpenAI, Suno, etc.)
  | 'WEBHOOK_SIGNATURE_FAIL'  // Webhook signature verification failed
  | 'SQL_INJECTION_ATTEMPT'   // Potential SQL injection detected
  | 'XSS_ATTEMPT'             // Potential XSS attempt detected
  | 'BRUTE_FORCE'             // Brute force attack detected
  | 'ACCOUNT_TAKEOVER'        // Potential account takeover
  | 'PRIVILEGE_ESCALATION';   // Privilege escalation attempt

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  endpoint: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

export interface SecurityAlert {
  title: string;
  message: string;
  severity: SecuritySeverity;
  event: SecurityEvent;
  timestamp: string;
}

/**
 * Log a security event to database
 *
 * @param supabase - Supabase client
 * @param event - Security event details
 * @returns Success boolean
 */
export async function logSecurityEvent(
  supabase: SupabaseClient,
  event: SecurityEvent
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('security_events')
      .insert({
        event_type: event.type,
        severity: event.severity,
        user_id: event.userId,
        endpoint: event.endpoint,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        details: event.details || {},
        timestamp: event.timestamp || new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to log security event:', error);
      return false;
    }

    // Send alert for high/critical events
    if (event.severity === 'high' || event.severity === 'critical') {
      await sendSecurityAlert(supabase, event);
    }

    return true;

  } catch (error) {
    console.error('Error logging security event:', error);
    return false;
  }
}

/**
 * Send security alert to configured channels (Slack/Teams/Email)
 *
 * @param supabase - Supabase client
 * @param event - Security event
 */
async function sendSecurityAlert(
  supabase: SupabaseClient,
  event: SecurityEvent
): Promise<void> {
  const alert: SecurityAlert = {
    title: getAlertTitle(event.type),
    message: getAlertMessage(event),
    severity: event.severity,
    event,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  // Send to Slack (if configured)
  const slackWebhook = Deno.env.get('SLACK_SECURITY_WEBHOOK');
  if (slackWebhook) {
    await sendSlackAlert(slackWebhook, alert);
  }

  // Send to Teams (if configured)
  const teamsWebhook = Deno.env.get('TEAMS_SECURITY_WEBHOOK');
  if (teamsWebhook) {
    await sendTeamsAlert(teamsWebhook, alert);
  }

  // Send email alert for critical events
  if (event.severity === 'critical') {
    await sendEmailAlert(supabase, alert);
  }
}

/**
 * Send alert to Slack
 */
async function sendSlackAlert(webhook: string, alert: SecurityAlert): Promise<void> {
  try {
    const color = getSeverityColor(alert.severity);
    const emoji = getSeverityEmoji(alert.severity);

    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachments: [
          {
            color,
            fallback: `${emoji} ${alert.title}`,
            pretext: `${emoji} *Security Alert*`,
            title: alert.title,
            text: alert.message,
            fields: [
              {
                title: 'Severity',
                value: alert.severity.toUpperCase(),
                short: true,
              },
              {
                title: 'Event Type',
                value: alert.event.type,
                short: true,
              },
              {
                title: 'Endpoint',
                value: alert.event.endpoint,
                short: true,
              },
              {
                title: 'User ID',
                value: alert.event.userId || 'Anonymous',
                short: true,
              },
              {
                title: 'IP Address',
                value: alert.event.ipAddress || 'Unknown',
                short: true,
              },
              {
                title: 'Timestamp',
                value: new Date(alert.timestamp).toLocaleString(),
                short: true,
              },
            ],
            footer: 'Med-MNG Security System',
            ts: Math.floor(new Date(alert.timestamp).getTime() / 1000),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Slack alert:', await response.text());
    } else {
      console.log('✅ Slack alert sent successfully');
    }

  } catch (error) {
    console.error('Error sending Slack alert:', error);
  }
}

/**
 * Send alert to Microsoft Teams
 */
async function sendTeamsAlert(webhook: string, alert: SecurityAlert): Promise<void> {
  try {
    const emoji = getSeverityEmoji(alert.severity);

    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: getSeverityColor(alert.severity),
        summary: `${emoji} ${alert.title}`,
        sections: [
          {
            activityTitle: `${emoji} **Security Alert**`,
            activitySubtitle: alert.title,
            activityImage: 'https://cdn-icons-png.flaticon.com/512/6195/6195699.png', // Shield icon
            facts: [
              { name: 'Severity:', value: alert.severity.toUpperCase() },
              { name: 'Event Type:', value: alert.event.type },
              { name: 'Endpoint:', value: alert.event.endpoint },
              { name: 'User ID:', value: alert.event.userId || 'Anonymous' },
              { name: 'IP Address:', value: alert.event.ipAddress || 'Unknown' },
              { name: 'Timestamp:', value: new Date(alert.timestamp).toLocaleString() },
            ],
            markdown: true,
          },
          {
            text: alert.message,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Teams alert:', await response.text());
    } else {
      console.log('✅ Teams alert sent successfully');
    }

  } catch (error) {
    console.error('Error sending Teams alert:', error);
  }
}

/**
 * Send email alert for critical events
 */
async function sendEmailAlert(
  supabase: SupabaseClient,
  alert: SecurityAlert
): Promise<void> {
  try {
    const alertEmail = Deno.env.get('ALERT_EMAIL') || 'security@med-mng.fr';

    await supabase.functions.invoke('send-emails', {
      body: {
        type: 'security_alert',
        to: alertEmail,
        subject: `🚨 CRITICAL: ${alert.title}`,
        html: formatEmailAlert(alert),
      },
    });

    console.log('✅ Email alert sent successfully');

  } catch (error) {
    console.error('Error sending email alert:', error);
  }
}

/**
 * Helper functions
 */

function getAlertTitle(type: SecurityEventType): string {
  const titles: Record<SecurityEventType, string> = {
    UNAUTHORIZED_ACCESS: 'Unauthorized Access Attempt',
    FORBIDDEN_ACCESS: 'Forbidden Access Attempt',
    RATE_LIMIT_EXCEEDED: 'Rate Limit Exceeded',
    SUSPICIOUS_ACTIVITY: 'Suspicious Activity Detected',
    DATA_EXPORT: 'Sensitive Data Export',
    BULK_OPERATION: 'Bulk Operation Executed',
    API_KEY_USAGE: 'External API Usage',
    WEBHOOK_SIGNATURE_FAIL: 'Webhook Signature Verification Failed',
    SQL_INJECTION_ATTEMPT: 'SQL Injection Attempt Detected',
    XSS_ATTEMPT: 'XSS Attack Attempt Detected',
    BRUTE_FORCE: 'Brute Force Attack Detected',
    ACCOUNT_TAKEOVER: 'Potential Account Takeover',
    PRIVILEGE_ESCALATION: 'Privilege Escalation Attempt',
  };

  return titles[type] || 'Security Event';
}

function getAlertMessage(event: SecurityEvent): string {
  const details = event.details || {};
  let message = `A ${event.type} event was detected on endpoint \`${event.endpoint}\``;

  if (event.userId) {
    message += `\n• User: ${event.userId}`;
  }

  if (event.ipAddress) {
    message += `\n• IP: ${event.ipAddress}`;
  }

  if (details.reason) {
    message += `\n• Reason: ${details.reason}`;
  }

  if (details.attemptCount) {
    message += `\n• Attempts: ${details.attemptCount}`;
  }

  return message;
}

function getSeverityColor(severity: SecuritySeverity): string {
  const colors = {
    low: '#36a64f',      // Green
    medium: '#ff9800',   // Orange
    high: '#ff5722',     // Red-Orange
    critical: '#d32f2f', // Dark Red
  };

  return colors[severity];
}

function getSeverityEmoji(severity: SecuritySeverity): string {
  const emojis = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴',
  };

  return emojis[severity];
}

function formatEmailAlert(alert: SecurityAlert): string {
  const emoji = getSeverityEmoji(alert.severity);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: ${getSeverityColor(alert.severity)};
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f8f9fa;
      padding: 20px;
      border: 2px solid ${getSeverityColor(alert.severity)};
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .detail {
      margin: 10px 0;
      padding: 8px;
      background: white;
      border-left: 3px solid ${getSeverityColor(alert.severity)};
    }
    .label {
      font-weight: bold;
      color: #555;
    }
    .value {
      color: #222;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${emoji} Security Alert</h1>
    <h2>${alert.title}</h2>
    <p style="text-transform: uppercase;">${alert.severity} SEVERITY</p>
  </div>

  <div class="content">
    <div class="detail">
      <span class="label">Event Type:</span>
      <span class="value">${alert.event.type}</span>
    </div>

    <div class="detail">
      <span class="label">Endpoint:</span>
      <span class="value">${alert.event.endpoint}</span>
    </div>

    <div class="detail">
      <span class="label">User ID:</span>
      <span class="value">${alert.event.userId || 'Anonymous'}</span>
    </div>

    <div class="detail">
      <span class="label">IP Address:</span>
      <span class="value">${alert.event.ipAddress || 'Unknown'}</span>
    </div>

    <div class="detail">
      <span class="label">Timestamp:</span>
      <span class="value">${new Date(alert.timestamp).toLocaleString()}</span>
    </div>

    <div class="detail">
      <span class="label">Message:</span>
      <p class="value">${alert.message}</p>
    </div>

    ${alert.event.details ? `
    <div class="detail">
      <span class="label">Additional Details:</span>
      <pre class="value">${JSON.stringify(alert.event.details, null, 2)}</pre>
    </div>
    ` : ''}
  </div>

  <p style="text-align: center; color: #888; margin-top: 20px; font-size: 12px;">
    Med-MNG Security Monitoring System
  </p>
</body>
</html>
  `.trim();
}

/**
 * Check for suspicious patterns (multiple failed attempts)
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param endpoint - Endpoint
 * @param timeWindowMinutes - Time window to check (default: 5 minutes)
 * @returns Whether suspicious activity detected
 */
export async function checkSuspiciousActivity(
  supabase: SupabaseClient,
  userId: string,
  endpoint: string,
  timeWindowMinutes: number = 5
): Promise<boolean> {
  try {
    const windowStart = new Date(Date.now() - timeWindowMinutes * 60000);

    const { data, error } = await supabase
      .from('security_events')
      .select('id')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .in('event_type', ['UNAUTHORIZED_ACCESS', 'FORBIDDEN_ACCESS'])
      .gte('timestamp', windowStart.toISOString());

    if (error) {
      console.error('Error checking suspicious activity:', error);
      return false;
    }

    const failedAttempts = data?.length || 0;

    // Alert if more than 3 failed attempts in 5 minutes
    if (failedAttempts >= 3) {
      await logSecurityEvent(supabase, {
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'high',
        userId,
        endpoint,
        details: {
          failedAttempts,
          timeWindowMinutes,
          pattern: 'Multiple failed auth attempts',
        },
      });

      return true;
    }

    return false;

  } catch (error) {
    console.error('Error checking suspicious activity:', error);
    return false;
  }
}
