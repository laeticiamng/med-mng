// Unified Analytics Service - Google Analytics + Sentry integration

import { logService } from '@/services/logService';
import { captureError, addBreadcrumb } from './sentry';

// Google Analytics 4 configuration
// GA Measurement ID should be configured via secrets if needed
const GA_MEASUREMENT_ID: string | undefined = undefined;

// Track page views
export function trackPageView(pagePath: string, pageTitle?: string) {
  // Google Analytics
  if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_title: pageTitle
    });
  }

  // Sentry breadcrumb
  addBreadcrumb(`Page view: ${pagePath}`, 'navigation', { pageTitle });

  // Internal analytics logging
  logInternalEvent('page_view', { page_path: pagePath, page_title: pageTitle });
}

// Track custom events
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  // Google Analytics
  if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams);
  }

  // Sentry breadcrumb
  addBreadcrumb(`Event: ${eventName}`, 'user', eventParams);

  // Internal analytics
  logInternalEvent(eventName, eventParams);
}

// Track user engagement
export function trackEngagement(
  action: 'study' | 'review' | 'exam' | 'music' | 'ai_chat' | 'community',
  duration?: number,
  metadata?: Record<string, any>
) {
  trackEvent('user_engagement', {
    engagement_type: action,
    engagement_time_msec: duration,
    ...metadata
  });
}

// Track feature usage
export function trackFeatureUsage(
  featureName: string,
  action: 'start' | 'complete' | 'error',
  metadata?: Record<string, any>
) {
  trackEvent('feature_usage', {
    feature_name: featureName,
    action,
    ...metadata
  });
}

// Track learning progress
export function trackLearningProgress(
  itemCode: string,
  progressType: 'started' | 'completed' | 'mastered',
  score?: number
) {
  trackEvent('learning_progress', {
    item_code: itemCode,
    progress_type: progressType,
    score
  });
}

// Track errors with context
export function trackError(
  error: Error,
  context?: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) {
  // Send to Sentry
  captureError(error, { severity, ...context });

  // Track in GA
  trackEvent('error', {
    error_message: error.message,
    error_stack: error.stack?.substring(0, 500),
    severity,
    ...context
  });
}

// Track conversion events
export function trackConversion(
  conversionType: 'signup' | 'subscription' | 'achievement' | 'milestone',
  value?: number,
  metadata?: Record<string, any>
) {
  trackEvent('conversion', {
    conversion_type: conversionType,
    value,
    ...metadata
  });
}

// Track performance metrics
export function trackPerformance(
  metricName: string,
  value: number,
  unit: 'ms' | 's' | 'count' | 'percent' = 'ms'
) {
  trackEvent('performance_metric', {
    metric_name: metricName,
    value,
    unit
  });
}

// Initialize GA4 script
export function initGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') {
    logService.debug('performance', 'Google Analytics not configured');
    return;
  }

  // Check if already loaded
  if ((window as any).gtag) return;

  // Load gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).gtag = function() {
    (window as any).dataLayer.push(arguments);
  };
  (window as any).gtag('js', new Date());
  (window as any).gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false // We'll track manually
  });

  logService.debug('performance', 'Google Analytics initialized');
}

// Internal event logging - uploads to Supabase when possible
async function logInternalEvent(eventName: string, params?: Record<string, any>) {
  const sessionId = getSessionId();
  const event = {
    event: eventName,
    params,
    timestamp: new Date().toISOString(),
    session_id: sessionId
  };

  // Try to upload to Supabase directly
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await (supabase as any).from('user_activity_log').insert({
        user_id: user.id,
        activity_type: eventName,
        action: params?.action || eventName,
        metadata: params,
        session_id: sessionId
      });
      return; // Successfully uploaded
    }
  } catch {
    // Fall through to in-memory queue
  }

  // Fallback: store in memory (not localStorage) for anonymous users
  if (typeof window !== 'undefined') {
    const queue = (window as any).__analyticsQueue || [];
    queue.push(event);
    if (queue.length > 50) queue.shift();
    (window as any).__analyticsQueue = queue;
  }
}

// Session management - sessionStorage is OK (session-scoped, not persistent)
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? `session_${crypto.randomUUID()}` 
      : `session_${Date.now()}`;
    sessionStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
}

// Export analytics queue for backend sync (from memory, not localStorage)
export function getAnalyticsQueue(): any[] {
  if (typeof window === 'undefined') return [];
  return (window as any).__analyticsQueue || [];
}

export function clearAnalyticsQueue() {
  if (typeof window !== 'undefined') {
    (window as any).__analyticsQueue = [];
  }
}
