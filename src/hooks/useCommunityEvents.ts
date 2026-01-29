import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'webinar' | 'workshop' | 'competition' | 'meetup';
  event_date: string;
  end_date?: string;
  location?: string;
  max_participants: number;
  current_participants: number;
  is_registered?: boolean;
  is_active: boolean;
  created_at: string;
}

export function useCommunityEvents() {
  const queryClient = useQueryClient();

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['community-events'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // Récupérer les événements actifs
      const { data: eventsData, error: eventsError } = await supabase
        .from('community_events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;

      // Récupérer les inscriptions de l'utilisateur
      let userRegistrations: string[] = [];
      if (user) {
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select('event_id')
          .eq('user_id', user.id);
        
        userRegistrations = registrations?.map(r => r.event_id) || [];
      }

      return (eventsData || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        event_type: event.event_type as CommunityEvent['event_type'],
        event_date: event.event_date,
        end_date: event.end_date,
        location: event.location,
        max_participants: event.max_participants || 0,
        current_participants: event.current_participants || 0,
        is_registered: userRegistrations.includes(event.id),
        is_active: event.is_active,
        created_at: event.created_at,
      })) as CommunityEvent[];
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
        });

      if (error) throw error;

      // Ajouter XP
      await supabase.from('gamification_activities').insert({
        user_id: user.id,
        activity_type: 'event_registration',
        activity_name: 'Inscription événement',
        points_earned: 25,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-events'] });
      toast.success('Inscription confirmée ! +25 XP');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate')) {
        toast.error('Vous êtes déjà inscrit à cet événement');
      } else {
        toast.error('Erreur lors de l\'inscription');
      }
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-events'] });
      toast.success('Inscription annulée');
    },
    onError: () => {
      toast.error('Erreur lors de l\'annulation');
    },
  });

  const upcomingEvents = events.filter(e => new Date(e.event_date) > new Date());
  const registeredEvents = events.filter(e => e.is_registered);

  return {
    events,
    isLoading,
    error,
    register: registerMutation.mutate,
    unregister: unregisterMutation.mutate,
    isRegistering: registerMutation.isPending,
    upcomingEvents,
    registeredEvents,
  };
}
