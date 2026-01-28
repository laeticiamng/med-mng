import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MonitoringEvent {
  id: string;
  type: 'extraction' | 'error' | 'performance' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export function useRealTimeMonitoring() {
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Subscribe to real-time events for monitoring
    const extractionChannel = supabase
      .channel('extraction-monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'extraction_logs'
        },
        (payload) => {
          const record = payload.new as any;
          const newEvent: MonitoringEvent = {
            id: record?.id || crypto.randomUUID(),
            type: 'extraction',
            severity: record?.status === 'failed' ? 'high' : 'low',
            message: `Extraction ${record?.batch_id} - ${record?.status}`,
            details: record,
            timestamp: new Date().toISOString()
          };

          setEvents(prev => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events

          // Show toast for critical events
          if (newEvent.severity === 'high' || newEvent.severity === 'critical') {
            toast.error(`🚨 ${newEvent.message}`);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to operation logs for error monitoring
    const errorChannel = supabase
      .channel('error-monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'operation_logs',
          filter: 'type=eq.error'
        },
        (payload) => {
          const record = payload.new as any;
          const newEvent: MonitoringEvent = {
            id: record?.id || crypto.randomUUID(),
            type: 'error',
            severity: 'high',
            message: `Erreur système: ${record?.message}`,
            details: record,
            timestamp: new Date().toISOString()
          };

          setEvents(prev => [newEvent, ...prev].slice(0, 100));
          toast.error(`🔥 ${newEvent.message}`);
        }
      )
      .subscribe();

    return () => {
      extractionChannel.unsubscribe();
      errorChannel.unsubscribe();
    };
  }, []);

  const clearEvents = () => {
    setEvents([]);
  };

  const filterEventsByType = (type: MonitoringEvent['type']) => {
    return events.filter(event => event.type === type);
  };

  const filterEventsBySeverity = (severity: MonitoringEvent['severity']) => {
    return events.filter(event => event.severity === severity);
  };

  const getCriticalEvents = () => {
    return events.filter(event => event.severity === 'critical' || event.severity === 'high');
  };

  return {
    events,
    isConnected,
    clearEvents,
    filterEventsByType,
    filterEventsBySeverity,
    getCriticalEvents
  };
}