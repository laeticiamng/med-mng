/**
 * Service d'analytics centralisé
 */

import { logger } from '@/lib/logger';
import type { AnalyticsMetrics } from '@/types';

interface AnalyticsEvent {
  name: string;
  properties: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startBatchFlush();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startBatchFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  track(eventName: string, properties: Record<string, unknown> = {}, userId?: string): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date(),
      userId,
      sessionId: this.sessionId
    };

    this.events.push(event);

    logger.debug('Événement analytics tracké', {
      component: 'AnalyticsService',
      action: 'track',
      metadata: { eventName, userId, sessionId: this.sessionId }
    });

    // Flush si le batch est plein
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  trackPageView(path: string, userId?: string): void {
    this.track('page_view', {
      path,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      timestamp: Date.now()
    }, userId);
  }

  trackUserAction(action: string, target: string, properties: Record<string, unknown> = {}, userId?: string): void {
    this.track('user_action', {
      action,
      target,
      ...properties
    }, userId);
  }

  trackError(error: Error, context: Record<string, unknown> = {}, userId?: string): void {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context
    }, userId);
  }

  trackPerformance(metric: string, value: number, properties: Record<string, unknown> = {}): void {
    this.track('performance', {
      metric,
      value,
      ...properties
    });
  }

  async getMetrics(): Promise<AnalyticsMetrics> {
    try {
      // TODO: Implémenter la récupération des métriques via API
      const mockMetrics: AnalyticsMetrics = {
        daily_active_users: 150,
        total_generations: 1200,
        success_rate: 0.95,
        average_response_time: 2500,
        top_content: [
          { id: '1', title: 'IC-001', usage_count: 45 },
          { id: '2', title: 'IC-002', usage_count: 38 },
          { id: '3', title: 'IC-003', usage_count: 32 }
        ]
      };

      logger.debug('Métriques analytics récupérées', {
        component: 'AnalyticsService',
        action: 'get_metrics',
        metadata: { metricsCount: Object.keys(mockMetrics).length }
      });

      return mockMetrics;
    } catch (error) {
      logger.error('Erreur récupération métriques', {
        component: 'AnalyticsService',
        action: 'get_metrics',
        metadata: { error }
      });
      throw error;
    }
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // TODO: Envoyer les événements à l'API d'analytics
      logger.debug('Envoi batch analytics', {
        component: 'AnalyticsService',
        action: 'flush',
        metadata: { eventCount: eventsToSend.length }
      });

      // Simulation temporaire
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      logger.error('Erreur envoi analytics', {
        component: 'AnalyticsService',
        action: 'flush',
        metadata: { 
          error,
          eventCount: eventsToSend.length
        }
      });

      // Remettre les événements dans la queue en cas d'erreur
      this.events.unshift(...eventsToSend);
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush(); // Dernier flush avant destruction
  }
}

export const analyticsService = new AnalyticsService();