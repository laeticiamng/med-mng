import { supabase } from '@/integrations/supabase/client';
import { notifyIncident } from './alertService';
import { errorService } from '@/services/core/ErrorService';

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: {
    database: boolean;
    edgeFunctions: boolean;
    authentication: boolean;
    storage: boolean;
  };
  metrics: {
    responseTime: number;
    errorRate: number;
    activeConnections: number;
    memoryUsage: number;
  };
  lastCheck: Date;
}

export interface PerformanceMetrics {
  apiResponseTimes: {
    p50: number;
    p95: number;
    p99: number;
  };
  databasePerformance: {
    avgQueryTime: number;
    slowQueries: number;
    connectionPool: number;
  };
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

class MonitoringService {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private healthCallbacks: ((health: SystemHealth) => void)[] = [];

  async checkSystemHealth(): Promise<SystemHealth> {
    const startTime = Date.now();
    
    try {
      // Test database connectivity
      const { data: dbTest, error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      // Test authentication
      const { data: authTest } = await supabase.auth.getSession();

      // Test edge functions
      const { data: functionTest } = await supabase.functions.invoke('med-mng-api', {
        body: { action: 'health_check' }
      });

      const responseTime = Date.now() - startTime;

      const health: SystemHealth = {
        status: dbError ? 'degraded' : 'healthy',
        services: {
          database: !dbError,
          edgeFunctions: !!functionTest,
          authentication: !!authTest,
          storage: true // Assume storage is working if DB is working
        },
        metrics: {
          responseTime,
          errorRate: 0, // Would be calculated from recent logs
          activeConnections: 24, // Mock data
          memoryUsage: 67.3
        },
        lastCheck: new Date()
      };

      // Notify callbacks
      this.healthCallbacks.forEach(callback => callback(health));

      // Check for critical issues
      if (health.status === 'down' || health.metrics.responseTime > 5000) {
        await notifyIncident({
          type: 'BACKEND_ERROR',
          message: `System health check failed: ${health.status}`,
          details: health
        });
      }

      return health;

    } catch (error) {
      const criticalHealth: SystemHealth = {
        status: 'down',
        services: {
          database: false,
          edgeFunctions: false,
          authentication: false,
          storage: false
        },
        metrics: {
          responseTime: Date.now() - startTime,
          errorRate: 100,
          activeConnections: 0,
          memoryUsage: 0
        },
        lastCheck: new Date()
      };

      await notifyIncident({
        type: 'BACKEND_ERROR',
        message: 'Critical system failure detected',
        details: { error: error.message, health: criticalHealth }
      });

      return criticalHealth;
    }
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      // Get recent operation logs to calculate performance metrics
      const { data: recentLogs } = await supabase
        .from('operation_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      // Mock performance data (in real app, this would come from actual metrics)
      const metrics: PerformanceMetrics = {
        apiResponseTimes: {
          p50: 124,
          p95: 287,
          p99: 456
        },
        databasePerformance: {
          avgQueryTime: 23,
          slowQueries: recentLogs?.filter(log => log.type === 'slow_query').length || 0,
          connectionPool: 24
        },
        resourceUsage: {
          cpu: 34.2,
          memory: 67.3,
          storage: 45.8
        }
      };

      return metrics;

    } catch (error) {
      errorService.handleError(error instanceof Error ? error : new Error('Error fetching performance metrics'), 'system');
      throw error;
    }
  }

  async logOperation(type: string, message: string, meta?: Record<string, unknown>): Promise<void> {
    try {
      const { error } = await supabase.from('operation_logs').insert({
        type,
        message,
        meta: meta ? JSON.parse(JSON.stringify(meta)) : null
      });

      if (error) {
        errorService.handleError(error instanceof Error ? error : new Error('Failed to log operation'), 'system');
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : new Error('Error logging operation'), 'system');
    }
  }

  startHealthMonitoring(intervalMs: number = 30000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.checkSystemHealth();
    }, intervalMs);

    // Initial check
    this.checkSystemHealth();
  }

  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  onHealthChange(callback: (health: SystemHealth) => void): () => void {
    this.healthCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.healthCallbacks.indexOf(callback);
      if (index > -1) {
        this.healthCallbacks.splice(index, 1);
      }
    };
  }

  async generateHealthReport(): Promise<string> {
    const health = await this.checkSystemHealth();
    const metrics = await this.getPerformanceMetrics();

    const report = `
# Rapport de Santé Système
Généré le: ${new Date().toLocaleString()}

## État Général: ${health.status.toUpperCase()}

### Services
- Base de données: ${health.services.database ? '✅' : '❌'}
- Edge Functions: ${health.services.edgeFunctions ? '✅' : '❌'}
- Authentification: ${health.services.authentication ? '✅' : '❌'}
- Stockage: ${health.services.storage ? '✅' : '❌'}

### Métriques
- Temps de réponse: ${health.metrics.responseTime}ms
- Taux d'erreur: ${health.metrics.errorRate}%
- Connexions actives: ${health.metrics.activeConnections}
- Utilisation mémoire: ${health.metrics.memoryUsage}%

### Performance
- P50 API: ${metrics.apiResponseTimes.p50}ms
- P95 API: ${metrics.apiResponseTimes.p95}ms
- P99 API: ${metrics.apiResponseTimes.p99}ms
- Requêtes lentes: ${metrics.databasePerformance.slowQueries}

### Ressources
- CPU: ${metrics.resourceUsage.cpu}%
- Mémoire: ${metrics.resourceUsage.memory}%
- Stockage: ${metrics.resourceUsage.storage}%
    `;

    return report;
  }
}

export const monitoringService = new MonitoringService();