// Analytics & Event Tracking System
interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId: string;
  pageId: string;
  timestamp: number;
  latencyMs?: number;
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private pageId: string = '/';
  private startTime: number = Date.now();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking() {
    // Track page loads
    if (typeof window !== 'undefined') {
      this.pageId = window.location.pathname;
      
      // Track page navigation
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = (...args) => {
        originalPushState.apply(history, args);
        this.onLocationChange();
      };
      
      history.replaceState = (...args) => {
        originalReplaceState.apply(history, args);
        this.onLocationChange();
      };
      
      window.addEventListener('popstate', () => {
        this.onLocationChange();
      });
    }
  }

  private onLocationChange() {
    const newPageId = window.location.pathname;
    if (newPageId !== this.pageId) {
      this.track('nav', 'page_change', newPageId, undefined, {
        from: this.pageId,
        to: newPageId
      });
      this.pageId = newPageId;
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  track(
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ) {
    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      userId: this.userId,
      sessionId: this.sessionId,
      pageId: this.pageId,
      timestamp: Date.now(),
      latencyMs: Date.now() - this.startTime,
      metadata
    };

    // Send to analytics service (replace with actual implementation)
    this.sendEvent(event);
    
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }
  }

  private async sendEvent(event: AnalyticsEvent) {
    try {
      // Replace with actual analytics endpoint
      if (typeof window !== 'undefined' && 'fetch' in window) {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }).catch(err => {
          console.warn('Analytics event failed to send:', err);
        });
      }
    } catch (error) {
      console.warn('Analytics tracking error:', error);
    }
  }

  // Predefined tracking methods for common events
  trackNavigation(to: string, from?: string) {
    this.track('nav', 'click', to, undefined, { from });
  }

  trackFeatureUsage(feature: string, action: string, metadata?: Record<string, any>) {
    this.track('feature', `${feature}.${action}`, undefined, undefined, metadata);
  }

  trackUserAction(action: string, target?: string, metadata?: Record<string, any>) {
    this.track('user', action, target, undefined, metadata);
  }

  trackPerformance(metric: string, value: number, metadata?: Record<string, any>) {
    this.track('performance', metric, undefined, value, metadata);
  }

  trackError(error: Error, context?: string, metadata?: Record<string, any>) {
    this.track('error', 'client_error', context, undefined, {
      message: error.message,
      stack: error.stack,
      ...metadata
    });
  }

  // ECOS specific tracking
  trackEcosStart(scenarioId: string) {
    this.track('ecos', 'start', scenarioId);
  }

  trackEcosSubmit(scenarioId: string, score?: number, duration?: number) {
    this.track('ecos', 'submit', scenarioId, score, { duration });
  }

  trackEcosComplete(scenarioId: string, score: number, duration: number) {
    this.track('ecos', 'complete', scenarioId, score, { duration });
  }

  // EDN specific tracking
  trackEdnView(itemCode: string, mode: 'standard' | 'immersive' | 'music') {
    this.track('edn', 'view', itemCode, undefined, { mode });
  }

  trackEdnInteraction(itemCode: string, interaction: string) {
    this.track('edn', 'interaction', itemCode, undefined, { interaction });
  }

  // MED-MNG specific tracking
  trackMusicGeneration(params: Record<string, any>) {
    this.track('medmng', 'generate', undefined, undefined, params);
  }

  trackMusicPlay(songId: string, duration?: number) {
    this.track('medmng', 'play', songId, duration);
  }

  trackMusicLike(songId: string, isLiked: boolean) {
    this.track('medmng', isLiked ? 'like' : 'unlike', songId);
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// React hook for analytics

export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    analytics.track('nav', 'page_view', location.pathname);
  }, [location]);

  return analytics;
}

// Higher-order component for tracking
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  eventCategory: string
) {
  return function AnalyticsWrapper(props: P) {
    useEffect(() => {
      analytics.track('component', 'mount', eventCategory);
      
      return () => {
        analytics.track('component', 'unmount', eventCategory);
      };
    }, []);

    return React.createElement(Component, props);
  };
}