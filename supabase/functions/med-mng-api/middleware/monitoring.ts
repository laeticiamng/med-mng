import { log } from '../logger.ts';

export interface RequestMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  endpoint: string;
  method: string;
  statusCode?: number;
  userId?: string;
  userAgent?: string;
  ip?: string;
}

export class MonitoringService {
  private static activeRequests = new Map<string, RequestMetrics>();
  private static requestCounter = 0;

  static startRequest(req: Request, endpoint: string, userId?: string): string {
    const requestId = `req_${++this.requestCounter}_${Date.now()}`;
    const metrics: RequestMetrics = {
      startTime: Date.now(),
      endpoint,
      method: req.method,
      userId,
      userAgent: req.headers.get('user-agent') || '',
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    };

    this.activeRequests.set(requestId, metrics);
    
    log('info', `Request started: ${req.method} ${endpoint}`, {
      requestId,
      userId,
      ip: metrics.ip,
      userAgent: metrics.userAgent
    });

    return requestId;
  }

  static endRequest(requestId: string, statusCode: number, error?: Error): void {
    const metrics = this.activeRequests.get(requestId);
    if (!metrics) return;

    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    metrics.statusCode = statusCode;

    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    const message = `Request completed: ${metrics.method} ${metrics.endpoint} - ${statusCode} (${metrics.duration}ms)`;
    
    log(logLevel, message, {
      requestId,
      metrics,
      error: error?.message
    });

    this.activeRequests.delete(requestId);

    // Emit performance warning for slow requests
    if (metrics.duration > 5000) {
      log('warn', `Slow request detected: ${metrics.duration}ms`, { requestId, metrics });
    }
  }

  static getActiveRequestsCount(): number {
    return this.activeRequests.size;
  }

  static getHealthMetrics() {
    return {
      activeRequests: this.getActiveRequestsCount(),
      totalProcessed: this.requestCounter,
      uptime: Date.now() - (globalThis as any).startTime || 0
    };
  }
}

// Initialize start time
(globalThis as any).startTime = Date.now();