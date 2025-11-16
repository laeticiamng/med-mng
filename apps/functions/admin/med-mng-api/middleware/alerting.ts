import { log } from '../logger.ts';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  source: string;
  message: string;
  details?: any;
  timestamp: string;
}

interface AlertConfig {
  webhookUrl?: string;
  slackUrl?: string;
  discordUrl?: string;
  emailEndpoint?: string;
  threshold: {
    criticalErrors: number;
    errorRate: number;
    responseTime: number;
  };
}

class AlertingService {
  private alerts: Alert[] = [];
  private config: AlertConfig;
  
  constructor() {
    this.config = {
      webhookUrl: Deno.env.get('ALERT_WEBHOOK_URL'),
      slackUrl: Deno.env.get('SLACK_WEBHOOK_URL'),
      discordUrl: Deno.env.get('DISCORD_WEBHOOK_URL'),
      emailEndpoint: Deno.env.get('EMAIL_ALERT_ENDPOINT'),
      threshold: {
        criticalErrors: 5, // 5 critical errors in 5 minutes
        errorRate: 10, // 10% error rate
        responseTime: 5000 // 5 seconds
      }
    };
  }

  async sendAlert(alert: Omit<Alert, 'id' | 'timestamp'>) {
    const fullAlert: Alert = {
      ...alert,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    this.alerts.push(fullAlert);
    
    // Keep only last 1000 alerts in memory
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }

    log('warn', `Alert triggered: ${alert.type} - ${alert.source}`, alert);

    // Send to configured channels
    await this.dispatchAlert(fullAlert);
  }

  private async dispatchAlert(alert: Alert) {
    const promises: Promise<void>[] = [];

    // Send to Slack
    if (this.config.slackUrl) {
      promises.push(this.sendToSlack(alert));
    }

    // Send to Discord
    if (this.config.discordUrl) {
      promises.push(this.sendToDiscord(alert));
    }

    // Send to generic webhook
    if (this.config.webhookUrl) {
      promises.push(this.sendToWebhook(alert));
    }

    // Send email alert
    if (this.config.emailEndpoint && alert.type === 'critical') {
      promises.push(this.sendEmailAlert(alert));
    }

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      log('error', 'Failed to dispatch alert', { alert, error });
    }
  }

  private async sendToSlack(alert: Alert) {
    if (!this.config.slackUrl) return;

    const color = alert.type === 'critical' ? '#ff0000' : 
                  alert.type === 'warning' ? '#ff9900' : '#0099ff';

    const payload = {
      text: `🚨 MED-MNG Alert: ${alert.type.toUpperCase()}`,
      attachments: [{
        color,
        fields: [
          { title: 'Source', value: alert.source, short: true },
          { title: 'Type', value: alert.type, short: true },
          { title: 'Message', value: alert.message, short: false },
          { title: 'Time', value: alert.timestamp, short: true }
        ]
      }]
    };

    try {
      await fetch(this.config.slackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      log('error', 'Failed to send Slack alert', error);
    }
  }

  private async sendToDiscord(alert: Alert) {
    if (!this.config.discordUrl) return;

    const embed = {
      title: `🚨 MED-MNG Alert: ${alert.type.toUpperCase()}`,
      description: alert.message,
      color: alert.type === 'critical' ? 0xff0000 : 
             alert.type === 'warning' ? 0xff9900 : 0x0099ff,
      fields: [
        { name: 'Source', value: alert.source, inline: true },
        { name: 'Type', value: alert.type, inline: true },
        { name: 'Time', value: alert.timestamp, inline: false }
      ],
      timestamp: alert.timestamp
    };

    try {
      await fetch(this.config.discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
      });
    } catch (error) {
      log('error', 'Failed to send Discord alert', error);
    }
  }

  private async sendToWebhook(alert: Alert) {
    if (!this.config.webhookUrl) return;

    try {
      await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'med_mng_alert',
          alert
        })
      });
    } catch (error) {
      log('error', 'Failed to send webhook alert', error);
    }
  }

  private async sendEmailAlert(alert: Alert) {
    if (!this.config.emailEndpoint) return;

    const emailPayload = {
      to: ['admin@medmng.com', 'alerts@medmng.com'],
      subject: `🚨 CRITICAL Alert - MED-MNG ${alert.source}`,
      html: `
        <h2>Critical Alert Triggered</h2>
        <p><strong>Source:</strong> ${alert.source}</p>
        <p><strong>Message:</strong> ${alert.message}</p>
        <p><strong>Time:</strong> ${alert.timestamp}</p>
        <p><strong>Alert ID:</strong> ${alert.id}</p>
        ${alert.details ? `<pre>${JSON.stringify(alert.details, null, 2)}</pre>` : ''}
      `
    };

    try {
      await fetch(this.config.emailEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });
    } catch (error) {
      log('error', 'Failed to send email alert', error);
    }
  }

  // Monitor error rates and send alerts if thresholds are exceeded
  async checkErrorThresholds(metrics: any) {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);

    // Check recent critical errors
    const recentCriticalErrors = this.alerts.filter(alert => 
      alert.type === 'critical' && 
      new Date(alert.timestamp).getTime() > fiveMinutesAgo
    );

    if (recentCriticalErrors.length >= this.config.threshold.criticalErrors) {
      await this.sendAlert({
        type: 'critical',
        source: 'error_threshold_monitor',
        message: `High frequency of critical errors: ${recentCriticalErrors.length} in 5 minutes`,
        details: { threshold: this.config.threshold.criticalErrors, actual: recentCriticalErrors.length }
      });
    }

    // Check error rate
    if (metrics.errorRate && metrics.errorRate > this.config.threshold.errorRate) {
      await this.sendAlert({
        type: 'warning',
        source: 'error_rate_monitor',
        message: `High error rate detected: ${metrics.errorRate}%`,
        details: { threshold: this.config.threshold.errorRate, actual: metrics.errorRate }
      });
    }

    // Check response time
    if (metrics.avgResponseTime && metrics.avgResponseTime > this.config.threshold.responseTime) {
      await this.sendAlert({
        type: 'warning',
        source: 'performance_monitor',
        message: `High response time detected: ${metrics.avgResponseTime}ms`,
        details: { threshold: this.config.threshold.responseTime, actual: metrics.avgResponseTime }
      });
    }
  }

  getRecentAlerts(limit = 50): Alert[] {
    return this.alerts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  getAlertStats() {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    const lastHour = now - (60 * 60 * 1000);

    const recent24h = this.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > last24Hours
    );

    const recentHour = this.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > lastHour
    );

    return {
      total_alerts: this.alerts.length,
      last_24h: recent24h.length,
      last_hour: recentHour.length,
      by_type_24h: {
        critical: recent24h.filter(a => a.type === 'critical').length,
        warning: recent24h.filter(a => a.type === 'warning').length,
        info: recent24h.filter(a => a.type === 'info').length
      },
      configured_channels: {
        slack: !!this.config.slackUrl,
        discord: !!this.config.discordUrl,
        webhook: !!this.config.webhookUrl,
        email: !!this.config.emailEndpoint
      }
    };
  }
}

export const alertingService = new AlertingService();

// Helper functions for common alerts
export async function alertCriticalError(source: string, message: string, details?: any) {
  await alertingService.sendAlert({
    type: 'critical',
    source,
    message,
    details
  });
}

export async function alertWarning(source: string, message: string, details?: any) {
  await alertingService.sendAlert({
    type: 'warning',
    source,
    message,
    details
  });
}

export async function alertInfo(source: string, message: string, details?: any) {
  await alertingService.sendAlert({
    type: 'info',
    source,
    message,
    details
  });
}
