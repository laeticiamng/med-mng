import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  location?: string;
  color?: string;
  type: 'study' | 'exam' | 'revision' | 'break' | 'other';
  itemCodes?: string[];
}

export interface CalendarProvider {
  id: 'google' | 'apple' | 'outlook' | 'ical';
  name: string;
  connected: boolean;
  lastSync?: string;
}

export interface SyncResult {
  success: boolean;
  eventsExported: number;
  eventsImported: number;
  errors: string[];
}

/**
 * Hook for syncing study sessions with external calendars
 * Supports export to iCal format and future OAuth integration
 */
export const useCalendarSync = () => {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<CalendarProvider[]>([
    { id: 'google', name: 'Google Calendar', connected: false },
    { id: 'apple', name: 'Apple Calendar', connected: false },
    { id: 'outlook', name: 'Outlook', connected: false },
    { id: 'ical', name: 'iCal (fichier)', connected: true } // Always available
  ]);
  const { toast } = useToast();

  /**
   * Generate iCal format string from events
   */
  const generateICalString = useCallback((events: CalendarEvent[]): string => {
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MED-MNG//Study Planner//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:MED-MNG Study Schedule'
    ];

    events.forEach(event => {
      const formatDate = (date: Date, allDay?: boolean): string => {
        if (allDay) {
          return date.toISOString().split('T')[0].replace(/-/g, '');
        }
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${event.id}@med-mng.lovable.app`);
      lines.push(`DTSTAMP:${formatDate(new Date())}`);
      
      if (event.allDay) {
        lines.push(`DTSTART;VALUE=DATE:${formatDate(event.startDate, true)}`);
        lines.push(`DTEND;VALUE=DATE:${formatDate(event.endDate, true)}`);
      } else {
        lines.push(`DTSTART:${formatDate(event.startDate)}`);
        lines.push(`DTEND:${formatDate(event.endDate)}`);
      }
      
      lines.push(`SUMMARY:${event.title.replace(/,/g, '\\,')}`);
      
      if (event.description) {
        lines.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n').replace(/,/g, '\\,')}`);
      }
      
      if (event.location) {
        lines.push(`LOCATION:${event.location.replace(/,/g, '\\,')}`);
      }
      
      // Add category based on type
      const categories = {
        study: 'STUDY,EDUCATION',
        exam: 'EXAM,IMPORTANT',
        revision: 'REVISION,STUDY',
        break: 'BREAK,PERSONAL',
        other: 'OTHER'
      };
      lines.push(`CATEGORIES:${categories[event.type] || 'OTHER'}`);
      
      // Color hint for compatible clients
      if (event.color) {
        lines.push(`X-APPLE-CALENDAR-COLOR:${event.color}`);
      }
      
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }, []);

  /**
   * Export events to iCal file
   */
  const exportToIcal = useCallback(async (events: CalendarEvent[]): Promise<boolean> => {
    setLoading(true);
    try {
      const icalContent = generateICalString(events);
      const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `med-mng-planning-${new Date().toISOString().split('T')[0]}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export réussi",
        description: `${events.length} événements exportés au format iCal`,
      });
      
      return true;
    } catch (error) {
      console.error('Error exporting to iCal:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter le calendrier",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [generateICalString, toast]);

  /**
   * Load study sessions and convert to calendar events
   */
  const loadStudyEvents = useCallback(async (
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> => {
    try {
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString())
        .order('started_at', { ascending: true });

      if (!sessions) return [];

      return sessions.map((session: any) => ({
        id: session.id,
        title: session.topic || 'Session d\'étude',
        description: session.notes,
        startDate: new Date(session.started_at),
        endDate: session.ended_at 
          ? new Date(session.ended_at) 
          : new Date(new Date(session.started_at).getTime() + 60 * 60 * 1000),
        type: 'study' as const,
        itemCodes: session.item_codes || []
      }));
    } catch (error) {
      console.error('Error loading study events:', error);
      return [];
    }
  }, []);

  /**
   * Load planned sessions from study planner
   */
  const loadPlannedEvents = useCallback(async (
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> => {
    try {
      const { data: plans } = await supabase
        .from('study_plans')
        .select('*, plan_sessions(*)')
        .eq('user_id', userId)
        .gte('start_date', startDate.toISOString().split('T')[0])
        .lte('end_date', endDate.toISOString().split('T')[0]);

      if (!plans) return [];

      const events: CalendarEvent[] = [];
      
      plans.forEach((plan: any) => {
        plan.plan_sessions?.forEach((session: any) => {
          events.push({
            id: session.id,
            title: `📚 ${plan.name || 'Révision'}`,
            description: session.topic || plan.description,
            startDate: new Date(session.scheduled_at),
            endDate: new Date(new Date(session.scheduled_at).getTime() + (session.duration_minutes || 30) * 60 * 1000),
            type: session.session_type === 'exam' ? 'exam' : 'revision',
            color: plan.color
          });
        });
      });

      return events;
    } catch (error) {
      console.error('Error loading planned events:', error);
      return [];
    }
  }, []);

  /**
   * Sync all events for a date range
   */
  const syncEvents = useCallback(async (
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SyncResult> => {
    setLoading(true);
    const errors: string[] = [];
    
    try {
      const [studyEvents, plannedEvents] = await Promise.all([
        loadStudyEvents(userId, startDate, endDate),
        loadPlannedEvents(userId, startDate, endDate)
      ]);

      const allEvents = [...studyEvents, ...plannedEvents];
      
      // Save sync timestamp
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          calendar_last_sync: new Date().toISOString()
        } as any, { onConflict: 'user_id' });

      toast({
        title: "Synchronisation terminée",
        description: `${allEvents.length} événements prêts à exporter`,
      });

      return {
        success: true,
        eventsExported: allEvents.length,
        eventsImported: 0,
        errors
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      errors.push(message);
      
      toast({
        title: "Erreur de synchronisation",
        description: message,
        variant: "destructive"
      });
      
      return {
        success: false,
        eventsExported: 0,
        eventsImported: 0,
        errors
      };
    } finally {
      setLoading(false);
    }
  }, [loadStudyEvents, loadPlannedEvents, toast]);

  /**
   * Generate Google Calendar URL for quick add
   */
  const generateGoogleCalendarUrl = useCallback((event: CalendarEvent): string => {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDate(event.startDate)}/${formatDate(event.endDate)}`,
      details: event.description || '',
      location: event.location || ''
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, []);

  /**
   * Get provider status
   */
  const getProviderStatus = useCallback((providerId: string): CalendarProvider | undefined => {
    return providers.find(p => p.id === providerId);
  }, [providers]);

  return {
    loading,
    providers,
    exportToIcal,
    syncEvents,
    loadStudyEvents,
    loadPlannedEvents,
    generateICalString,
    generateGoogleCalendarUrl,
    getProviderStatus
  };
};

export default useCalendarSync;
