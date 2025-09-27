import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface AnalyticsEvent {
  event_name: string;
  event_data?: Record<string, any>;
  user_id?: string;
  session_id?: string;
  timestamp?: string;
}

interface AnalyticsMetrics {
  pageViews: number;
  sessions: number;
  users: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
}

interface AnalyticsContextType {
  metrics: AnalyticsMetrics;
  isTracking: boolean;
  track: (eventName: string, properties?: Record<string, any>) => Promise<void>;
  trackPageView: (page: string, title?: string) => Promise<void>;
  trackUserAction: (action: string, target: string, value?: number) => Promise<void>;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  setUserProperties: (properties: Record<string, any>) => Promise<void>;
  getAnalytics: (startDate: string, endDate: string) => Promise<any>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAdvancedAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAdvancedAnalytics must be used within an AdvancedAnalyticsProvider');
  }
  return context;
};

interface AdvancedAnalyticsProviderProps {
  children: React.ReactNode;
  trackingEnabled?: boolean;
}

export const AdvancedAnalyticsProvider: React.FC<AdvancedAnalyticsProviderProps> = ({ 
  children, 
  trackingEnabled = true 
}) => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    pageViews: 0,
    sessions: 0,
    users: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    conversionRate: 0
  });
  const [isTracking, setIsTracking] = useState(trackingEnabled);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    if (isTracking) {
      initializeAnalytics();
    }
  }, [isTracking]);

  const initializeAnalytics = async () => {
    try {
      // Generate unique session ID
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);

      // Start new session
      await startSession();

      // Load initial metrics
      await loadMetrics();

    } catch (error) {
      logger.error('Error initializing analytics');
    }
  };

  const loadMetrics = async () => {
    try {
      // Use existing tables for analytics data
      const { data: userProfiles, error } = await supabase
        .from('profiles')
        .select('id, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Calculate basic metrics from available data
      const pageViews = 0; // Placeholder
      const uniqueSessions = 1; // Placeholder
      const uniqueUsers = userProfiles?.length || 0;

      setMetrics({
        pageViews,
        sessions: uniqueSessions,
        users: uniqueUsers,
        avgSessionDuration: 0,
        bounceRate: 0,
        conversionRate: 0
      });

    } catch (error) {
      logger.error('Error loading metrics');
    }
  };

  const track = async (eventName: string, properties: Record<string, any> = {}) => {
    if (!isTracking) return;

    try {
      // Log analytics event locally for now
      logger.debug('Analytics event sent', { component: 'AdvancedAnalyticsProvider', action: eventName, metadata: properties });

      // Store analytics in console for development
      console.log('Analytics event:', {
        event_name: eventName,
        event_data: properties,
        session_id: sessionId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error sending analytics event');
    }
  };

  const trackPageView = async (page: string, title?: string) => {
    await track('page_view', {
      page,
      title: title || document.title,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      timestamp: Date.now()
    });
  };

  const trackUserAction = async (action: string, target: string, value?: number) => {
    await track('user_action', {
      action,
      target,
      value,
      timestamp: Date.now()
    });
  };

  const startSession = async () => {
    await track('session_start', {
      timestamp: Date.now(),
      page: window.location.pathname,
      referrer: document.referrer
    });
  };

  const endSession = async () => {
    await track('session_end', {
      timestamp: Date.now(),
      duration: Date.now() // Calculate correctly
    });
  };

  const setUserProperties = async (properties: Record<string, any>) => {
    await track('user_properties', properties);
  };

  const getAnalytics = async (startDate: string, endDate: string) => {
    try {
      // Return empty data for now since analytics_events table doesn't exist
      logger.debug('Getting analytics data for date range', { component: 'AdvancedAnalyticsProvider', action: 'getAnalytics', metadata: { startDate, endDate } });
      return [];
    } catch (error) {
      logger.error('Error retrieving analytics');
      return [];
    }
  };

  const contextValue: AnalyticsContextType = {
    metrics,
    isTracking,
    track,
    trackPageView,
    trackUserAction,
    startSession,
    endSession,
    setUserProperties,
    getAnalytics
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};