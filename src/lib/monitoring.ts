/**
 * Service de monitoring typé pour remplacer sendToMonitoring
 */
import { MonitoringData } from '../types/security';

export interface PerformanceMetrics extends Record<string, unknown> {
  responseTime: number;
  memoryUsage: number;
  cpuUsage?: number;
  activeConnections?: number;
}

export interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit_exceeded' | 'suspicious_request' | 'access_denied';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
}

export class MonitoringService {
  private static instance: MonitoringService;
  
  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Log structured monitoring data
   */
  async logEvent(data: MonitoringData): Promise<void> {
    try {
      // Log to console with structure (can be replaced with external service)
      const logEntry = {
        ...data,
        environment: process.env.NODE_ENV || 'development',
        service: 'med-mng-platform'
      };
      
      console.log('[MONITORING]', JSON.stringify(logEntry, null, 2));
      
      // TODO: In production, send to external monitoring service like Sentry, DataDog, etc.
      if (process.env.NODE_ENV === 'production' && process.env.MONITORING_ENDPOINT) {
        await fetch(process.env.MONITORING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logEntry)
        });
      }
    } catch (error) {
      console.error('Failed to log monitoring event:', error);
    }
  }

  /**
   * Log performance metrics
   */
  async logPerformance(metrics: PerformanceMetrics & { endpoint?: string }): Promise<void> {
    await this.logEvent({
      level: 'info',
      message: 'Performance metrics',
      timestamp: new Date().toISOString(),
      metadata: metrics,
    });
  }

  /**
   * Log security events
   */
  async logSecurity(event: SecurityEvent & { userId?: string; ip?: string }): Promise<void> {
    await this.logEvent({
      level: event.severity === 'critical' || event.severity === 'high' ? 'error' : 'warn',
      message: `Security event: ${event.type}`,
      timestamp: new Date().toISOString(),
      userId: event.userId,
      ip: event.ip,
      metadata: {
        securityEventType: event.type,
        severity: event.severity,
        ...event.details,
      },
    });
  }

  /**
   * Log API errors with context
   */
  async logAPIError(
    error: Error,
    context: {
      endpoint: string;
      method: string;
      userId?: string;
      requestId?: string;
      statusCode?: number;
    }
  ): Promise<void> {
    await this.logEvent({
      level: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
      ...context,
      metadata: {
        errorName: error.name,
        errorStack: error.stack,
        errorType: 'api_error',
      },
    });
  }
}

// Export typed monitoring function to replace the old sendToMonitoring
export const sendToMonitoring = (data: MonitoringData): Promise<void> => {
  return MonitoringService.getInstance().logEvent(data);
};

// Export convenience functions
export const monitoring = MonitoringService.getInstance();