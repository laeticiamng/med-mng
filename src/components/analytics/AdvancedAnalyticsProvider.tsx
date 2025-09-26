import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

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
      // Générer un ID de session unique
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);

      // Démarrer une nouvelle session
      await startSession();

      // Charger les métriques initiales
      await loadMetrics();

    } catch (error) {
      logger.error('Erreur lors de l\'initialisation des analytics');
    }
  };

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Calculer les métriques à partir des données
      const pageViews = data.filter(event => event.event_name === 'page_view').length;
      const uniqueSessions = new Set(data.map(event => event.session_id)).size;
      const uniqueUsers = new Set(data.map(event => event.user_id)).size;

      setMetrics({
        pageViews,
        sessions: uniqueSessions,
        users: uniqueUsers,
        avgSessionDuration: 0, // À calculer
        bounceRate: 0, // À calculer
        conversionRate: 0 // À calculer
      });

    } catch (error) {
      logger.error('Erreur lors du chargement des métriques');
    }
  };

  const track = async (eventName: string, properties: Record<string, any> = {}) => {
    if (!isTracking) return;

    try {
      const event: AnalyticsEvent = {
        event_name: eventName,
        event_data: properties,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        session_id: sessionId,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('analytics_events')
        .insert([event]);

      if (error) throw error;

      logger.debug(`Événement analytics envoyé: ${eventName}`);

    } catch (error) {
      logger.error('Erreur lors de l\'envoi de l\'événement analytics');
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
      duration: Date.now() // À calculer correctement
    });
  };

  const setUserProperties = async (properties: Record<string, any>) => {
    await track('user_properties', properties);
  };

  const getAnalytics = async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Erreur lors de la récupération des analytics', {
        component: 'AdvancedAnalyticsProvider'
      });
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