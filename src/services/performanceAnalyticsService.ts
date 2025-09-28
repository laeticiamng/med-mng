import { supabase } from '@/integrations/supabase/client';

export interface PerformanceMetric {
  id?: string;
  session_id: string;
  user_id?: string;
  metric_type: 'web_vital' | 'api_call' | 'database_query' | 'custom';
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  url?: string;
  user_agent?: string;
  connection_type?: string;
  device_type?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface PerformanceBudget {
  id?: string;
  name: string;
  metric_type: string;
  metric_name: string;
  target_value: number;
  warning_threshold: number;
  critical_threshold: number;
  active: boolean;
}

export interface SLAMetric {
  id?: string;
  service_name: string;
  metric_name: string;
  target_value: number;
  current_value?: number;
  period_start: string;
  period_end: string;
  status: 'measuring' | 'met' | 'warning' | 'breach';
  breach_count: number;
  last_calculated?: string;
}

export interface PerformanceAlert {
  id?: string;
  alert_type: 'budget_exceeded' | 'sla_breach' | 'performance_degradation';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  metric_data: Record<string, any>;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved: boolean;
  resolved_at?: string;
  created_at?: string;
}

export interface PerformanceAnalytics {
  metrics: {
    webVitals: {
      LCP: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
      FID: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
      CLS: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
      TTFB: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
    };
    apiPerformance: {
      avgResponseTime: number;
      p95ResponseTime: number;
      errorRate: number;
      throughput: number;
    };
    databasePerformance: {
      avgQueryTime: number;
      slowQueries: number;
      connectionPool: number;
    };
  };
  budgets: PerformanceBudget[];
  slas: SLAMetric[];
  alerts: PerformanceAlert[];
  trends: {
    period: string;
    data: Array<{
      timestamp: string;
      metric_name: string;
      value: number;
    }>;
  };
}

class PerformanceAnalyticsService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async recordMetric(metric: Omit<PerformanceMetric, 'session_id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('performance_metrics')
        .insert({
          ...metric,
          session_id: this.sessionId,
          timestamp: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to record performance metric:', error);
      }
    } catch (error) {
      console.error('Error recording performance metric:', error);
    }
  }

  async recordWebVital(name: string, value: number, url?: string): Promise<void> {
    const connectionType = this.getConnectionType();
    const deviceType = this.getDeviceType();

    await this.recordMetric({
      metric_type: 'web_vital',
      metric_name: name,
      metric_value: value,
      metric_unit: name === 'CLS' ? 'score' : 'ms',
      url: url || window.location.href,
      user_agent: navigator.userAgent,
      connection_type: connectionType,
      device_type: deviceType,
      metadata: {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        timestamp: performance.now(),
      },
    });

    // Vérifier les budgets de performance
    await this.checkPerformanceBudgets(name, value);
  }

  async recordAPICall(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    errorDetails?: any
  ): Promise<void> {
    await this.recordMetric({
      metric_type: 'api_call',
      metric_name: 'response_time',
      metric_value: responseTime,
      metric_unit: 'ms',
      url: endpoint,
      metadata: {
        method,
        status_code: statusCode,
        error_details: errorDetails,
        service: this.extractServiceName(endpoint),
      },
    });
  }

  async recordDatabaseQuery(
    query: string,
    executionTime: number,
    rowCount?: number
  ): Promise<void> {
    await this.recordMetric({
      metric_type: 'database_query',
      metric_name: 'execution_time',
      metric_value: executionTime,
      metric_unit: 'ms',
      metadata: {
        query_type: this.extractQueryType(query),
        row_count: rowCount,
        query_hash: this.hashQuery(query),
      },
    });
  }

  async getPerformanceAnalytics(period: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<PerformanceAnalytics> {
    const periodStart = this.getPeriodStart(period);

    // Récupérer les métriques Web Vitals
    const { data: webVitalsData } = await supabase
      .from('performance_metrics')
      .select('metric_name, metric_value')
      .eq('metric_type', 'web_vital')
      .gte('timestamp', periodStart)
      .order('timestamp', { ascending: false });

    // Récupérer les budgets de performance
    const { data: budgets } = await supabase
      .from('performance_budgets')
      .select('*')
      .eq('active', true);

    // Récupérer les SLA
    const { data: slasData } = await supabase
      .from('sla_metrics')
      .select('*')
      .gte('period_end', new Date().toISOString());

    // Récupérer les alertes actives
    const { data: alertsData } = await supabase
      .from('performance_alerts')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(50);

    // Récupérer les tendances
    const { data: trendsData } = await supabase
      .from('performance_metrics')
      .select('timestamp, metric_name, metric_value')
      .gte('timestamp', periodStart)
      .order('timestamp', { ascending: true });

    // Calculer les métriques agrégées
    const webVitals = this.calculateWebVitals(webVitalsData || []);
    const apiPerformance = await this.calculateAPIPerformance(periodStart);
    const databasePerformance = await this.calculateDatabasePerformance(periodStart);

    return {
      metrics: {
        webVitals,
        apiPerformance,
        databasePerformance,
      },
      budgets: budgets || [],
      slas: (slasData || []).map(sla => ({
        ...sla,
        status: sla.status as 'measuring' | 'met' | 'warning' | 'breach'
      })),
      alerts: (alertsData || []).map(alert => ({
        ...alert,
        alert_type: alert.alert_type as 'budget_exceeded' | 'sla_breach' | 'performance_degradation',
        severity: alert.severity as 'info' | 'warning' | 'critical',
        metric_data: alert.metric_data as Record<string, any>
      })),
      trends: {
        period,
        data: (trendsData || []).map(item => ({
          timestamp: item.timestamp,
          metric_name: item.metric_name,
          value: item.metric_value
        })),
      },
    };
  }

  async createPerformanceBudget(budget: Omit<PerformanceBudget, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('performance_budgets')
      .insert(budget);

    if (error) {
      throw new Error(`Failed to create performance budget: ${error.message}`);
    }
  }

  async updatePerformanceBudget(id: string, updates: Partial<PerformanceBudget>): Promise<void> {
    const { error } = await supabase
      .from('performance_budgets')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update performance budget: ${error.message}`);
    }
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('performance_alerts')
      .update({
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) {
      throw new Error(`Failed to acknowledge alert: ${error.message}`);
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('performance_alerts')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) {
      throw new Error(`Failed to resolve alert: ${error.message}`);
    }
  }

  async calculateSLAMetrics(): Promise<void> {
    try {
      const { error } = await supabase.rpc('calculate_sla_metrics');
      if (error) {
        console.error('Failed to calculate SLA metrics:', error);
      }
    } catch (error) {
      console.error('Error calculating SLA metrics:', error);
    }
  }

  private async checkPerformanceBudgets(metricName: string, value: number): Promise<void> {
    const { data: budgets } = await supabase
      .from('performance_budgets')
      .select('*')
      .eq('metric_type', 'web_vital')
      .eq('metric_name', metricName)
      .eq('active', true);

    for (const budget of budgets || []) {
      let severity: 'warning' | 'critical' | null = null;
      let alertType = 'budget_exceeded' as const;

      if (value > budget.critical_threshold) {
        severity = 'critical';
      } else if (value > budget.warning_threshold) {
        severity = 'warning';
      }

      if (severity) {
        await supabase.from('performance_alerts').insert({
          alert_type: alertType,
          severity,
          title: `Budget dépassé: ${budget.name}`,
          description: `${metricName} a atteint ${value}${budget.metric_name === 'CLS' ? '' : 'ms'}, dépassant le seuil ${severity === 'critical' ? 'critique' : 'warning'} de ${severity === 'critical' ? budget.critical_threshold : budget.warning_threshold}${budget.metric_name === 'CLS' ? '' : 'ms'}`,
          metric_data: {
            metric_name: metricName,
            metric_value: value,
            budget_name: budget.name,
            threshold_exceeded: severity === 'critical' ? budget.critical_threshold : budget.warning_threshold,
            target_value: budget.target_value,
          },
        });
      }
    }
  }

  private calculateWebVitals(data: Array<{ metric_name: string; metric_value: number }>) {
    const getLatestMetric = (name: string) => {
      const metric = data.find(m => m.metric_name === name);
      return metric ? metric.metric_value : 0;
    };

    const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
      const thresholds = {
        LCP: { good: 2500, poor: 4000 },
        FID: { good: 100, poor: 300 },
        CLS: { good: 0.1, poor: 0.25 },
        TTFB: { good: 600, poor: 1500 },
      };

      const threshold = thresholds[name as keyof typeof thresholds];
      if (!threshold) return 'good';

      if (value <= threshold.good) return 'good';
      if (value <= threshold.poor) return 'needs-improvement';
      return 'poor';
    };

    return {
      LCP: { value: getLatestMetric('LCP'), rating: getRating('LCP', getLatestMetric('LCP')) },
      FID: { value: getLatestMetric('FID'), rating: getRating('FID', getLatestMetric('FID')) },
      CLS: { value: getLatestMetric('CLS'), rating: getRating('CLS', getLatestMetric('CLS')) },
      TTFB: { value: getLatestMetric('TTFB'), rating: getRating('TTFB', getLatestMetric('TTFB')) },
    };
  }

  private async calculateAPIPerformance(periodStart: string) {
    const { data } = await supabase
      .from('performance_metrics')
      .select('metric_value, metadata')
      .eq('metric_type', 'api_call')
      .gte('timestamp', periodStart);

    if (!data || data.length === 0) {
      return {
        avgResponseTime: 0,
        p95ResponseTime: 0,
        errorRate: 0,
        throughput: 0,
      };
    }

    const responseTimes = data.map(d => d.metric_value);
    const errorCount = data.filter(d => {
      const metadata = d.metadata as Record<string, any>;
      return metadata?.status_code >= 400;
    }).length;

    responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(responseTimes.length * 0.95);

    return {
      avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      p95ResponseTime: responseTimes[p95Index] || 0,
      errorRate: (errorCount / data.length) * 100,
      throughput: data.length,
    };
  }

  private async calculateDatabasePerformance(periodStart: string) {
    const { data } = await supabase
      .from('performance_metrics')
      .select('metric_value, metadata')
      .eq('metric_type', 'database_query')
      .gte('timestamp', periodStart);

    if (!data || data.length === 0) {
      return {
        avgQueryTime: 0,
        slowQueries: 0,
        connectionPool: 0,
      };
    }

    const queryTimes = data.map(d => d.metric_value);
    const slowQueries = queryTimes.filter(time => time > 1000).length;

    return {
      avgQueryTime: queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length,
      slowQueries,
      connectionPool: 0, // À implémenter selon les besoins
    };
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  private getDeviceType(): string {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private extractServiceName(endpoint: string): string {
    if (endpoint.includes('/functions/v1/')) {
      return endpoint.split('/functions/v1/')[1]?.split('/')[0] || 'unknown';
    }
    return 'api';
  }

  private extractQueryType(query: string): string {
    const firstWord = query.trim().split(' ')[0].toUpperCase();
    return ['SELECT', 'INSERT', 'UPDATE', 'DELETE'].includes(firstWord) ? firstWord : 'OTHER';
  }

  private hashQuery(query: string): string {
    // Simple hash pour identifier les requêtes similaires
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  private getPeriodStart(period: string): string {
    const now = new Date();
    const hours = {
      '1h': 1,
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30,
    };

    const hoursAgo = hours[period as keyof typeof hours] || 24;
    return new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();
  }
}

export const performanceAnalyticsService = new PerformanceAnalyticsService();