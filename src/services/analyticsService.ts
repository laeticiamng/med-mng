import { supabase } from '@/integrations/supabase/client';
import { ANALYTICS_EVENTS } from '@/config/analytics';

/**
 * Interface pour les données d'événement
 */
export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

/**
 * Service Analytics centralisé
 *
 * Responsabilités:
 * - Tracker les événements utilisateur
 * - Batcher les requêtes (performance)
 * - Fallback localStorage (offline support)
 * - Error handling
 *
 * @example
 * import { analyticsService } from '@/services/analyticsService';
 *
 * // Track simple event
 * analyticsService.trackEvent('item_viewed', {
 *   itemId: '123',
 *   itemType: 'edn'
 * });
 *
 * // Track page view automatically
 * analyticsService.trackPageView('/edn-complete');
 *
 * // Track error
 * analyticsService.trackError(error);
 */
export class AnalyticsService {
  private eventQueue: AnalyticsEvent[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private sessionId: string;
  private userId: string | null = null;
  private isOnline: boolean = navigator.onLine;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT_MS = 5000; // 5 seconds
  private readonly STORAGE_KEY = 'med-mng-analytics-queue';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadQueueFromStorage();
    this.setupOnlineListener();
  }

  /**
   * Générateur d'ID de session unique
   */
  private generateSessionId(): string {
    const prefix = new Date().getTime();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}-${random}`;
  }

  /**
   * Setup listener pour online/offline
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Set current user ID (call after auth)
   */
  public setUserId(userId: string | null): void {
    this.userId = userId;
  }

  /**
   * Track generic event
   */
  public trackEvent(
    eventName: string,
    properties?: Record<string, any>,
    timestamp?: number
  ): void {
    const event: AnalyticsEvent = {
      eventName,
      properties: {
        ...properties,
        url: window.location.pathname,
        timestamp: timestamp || Date.now(),
      },
      sessionId: this.sessionId,
      userId: this.userId || undefined,
    };

    this.eventQueue.push(event);

    // Flush if batch is full
    if (this.eventQueue.length >= this.BATCH_SIZE) {
      this.flushQueue();
    } else {
      // Schedule flush
      this.scheduleFlush();
    }
  }

  /**
   * Track page view
   */
  public trackPageView(pageName: string): void {
    this.trackEvent(ANALYTICS_EVENTS.pageView, {
      pageName,
      pageTitle: document.title,
    });
  }

  /**
   * Track custom performance metric
   */
  public trackPerformanceMetric(
    metricName: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent('performance_metric', {
      metricName,
      duration,
      ...metadata,
    });
  }

  /**
   * Track error
   */
  public trackError(error: Error | string, context?: Record<string, any>): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    this.trackEvent(ANALYTICS_EVENTS.errorOccurred, {
      errorMessage,
      errorStack,
      errorType: typeof error === 'string' ? 'string' : error.name,
      ...context,
    });
  }

  /**
   * Track search event
   */
  public trackSearch(query: string, resultsCount: number, category?: string): void {
    this.trackEvent(ANALYTICS_EVENTS.searchPerformed, {
      query,
      resultsCount,
      category,
    });
  }

  /**
   * Track item view
   */
  public trackItemView(
    itemId: string,
    itemType: string,
    duration?: number,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent(ANALYTICS_EVENTS.itemViewed, {
      itemId,
      itemType,
      duration,
      ...metadata,
    });
  }

  /**
   * Track user action
   */
  public trackUserAction(
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent('user_action', {
      action,
      resourceType,
      resourceId,
      ...metadata,
    });
  }

  /**
   * Flush event queue to Supabase
   */
  private async flushQueue(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    if (!this.isOnline) {
      this.saveQueueToStorage();
      return;
    }

    const eventsToSend = this.eventQueue.splice(0, this.BATCH_SIZE);

    try {
      // Try to send to Supabase
      // Note: Assurez-vous que la table 'analytics_events' existe dans Supabase
      const { error } = await supabase
        .from('analytics_events')
        .insert(
          eventsToSend.map((event) => ({
            event_name: event.eventName,
            properties: event.properties,
            user_id: event.userId,
            session_id: event.sessionId,
            created_at: new Date().toISOString(),
          }))
        );

      if (error) {
        console.error('Analytics flush error:', error);
        // Re-add events to queue on error
        this.eventQueue.unshift(...eventsToSend);
        this.saveQueueToStorage();
      } else {
        // Success - save remaining queue
        if (this.eventQueue.length > 0) {
          this.saveQueueToStorage();
        } else {
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to flush analytics:', error);
      // Re-add events to queue
      this.eventQueue.unshift(...eventsToSend);
      this.saveQueueToStorage();
    }

    // Continue flushing if more events
    if (this.eventQueue.length > 0) {
      this.scheduleFlush();
    }
  }

  /**
   * Schedule flush with debounce
   */
  private scheduleFlush(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.flushQueue();
    }, this.BATCH_TIMEOUT_MS);
  }

  /**
   * Save queue to localStorage for offline support
   */
  private saveQueueToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.eventQueue));
    } catch (error) {
      console.error('Failed to save analytics queue:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.eventQueue = JSON.parse(stored);
        // Try to flush immediately if online
        if (this.isOnline && this.eventQueue.length > 0) {
          this.flushQueue();
        }
      }
    } catch (error) {
      console.error('Failed to load analytics queue:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Manual flush
   */
  public async flush(): Promise<void> {
    return this.flushQueue();
  }

  /**
   * Clear queue and storage
   */
  public clearQueue(): void {
    this.eventQueue = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get queue size (for debugging)
   */
  public getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * Get session ID
   */
  public getSessionId(): string {
    return this.sessionId;
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();

/**
 * Export event names for usage
 */
export const AnalyticsEvents = ANALYTICS_EVENTS;
