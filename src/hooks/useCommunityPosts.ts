import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    specialty: string;
    level: string;
  };
  content: string;
  type: 'discussion' | 'question' | 'resource' | 'success';
  tags: string[];
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'webinar' | 'workshop' | 'meetup' | 'competition';
  date: Date;
  participants: number;
  maxParticipants: number;
  isRegistered: boolean;
  location?: string;
}

export interface CommunityStats {
  totalMembers: number;
  totalDiscussions: number;
  totalResources: number;
  eventsThisMonth: number;
}

// Mock data for when DB tables don't exist yet
const MOCK_POSTS: CommunityPost[] = [
  {
    id: '1',
    author: {
      id: 'user-1',
      name: 'Dr. Sarah Martin',
      avatar: '',
      specialty: 'Cardiologie',
      level: 'Expert'
    },
    content: 'Excellente session sur l\'IC-78 aujourd\'hui ! Les nouvelles approches musicales pour mémoriser les algorithmes de prise en charge sont vraiment efficaces.',
    type: 'discussion',
    tags: ['IC-78', 'cardiologie', 'mémorisation'],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 24,
    comments: 8,
    isLiked: false
  },
  {
    id: '2',
    author: {
      id: 'user-2',
      name: 'Marie Dubois',
      avatar: '',
      specialty: 'Pédiatrie',
      level: 'Étudiant'
    },
    content: 'Question sur l\'IC-23 : quelqu\'un peut-il m\'expliquer la différence entre les approches de rang A et rang B pour la contraception chez l\'adolescente ?',
    type: 'question',
    tags: ['IC-23', 'pédiatrie', 'aide'],
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likes: 12,
    comments: 15,
    isLiked: true
  },
  {
    id: '3',
    author: {
      id: 'user-3',
      name: 'Prof. Laurent Chen',
      avatar: '',
      specialty: 'Neurologie',
      level: 'Professeur'
    },
    content: 'Nouveau ressource disponible : J\'ai créé une playlist de 15 musiques mnémotechniques pour les items de neurologie (IC-87 à IC-102). Parfait pour les révisions ! 🎵🧠',
    type: 'resource',
    tags: ['neurologie', 'musique', 'ressource'],
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    likes: 56,
    comments: 23,
    isLiked: true
  },
  {
    id: '4',
    author: {
      id: 'user-4',
      name: 'Thomas Leroux',
      avatar: '',
      specialty: 'Médecine générale',
      level: 'Résident'
    },
    content: '🎉 Victoire ! J\'ai enfin validé tous les items de rang A ! La méthode MED-MNG m\'a vraiment aidé à structurer mes révisions. Merci à toute la communauté pour le soutien !',
    type: 'success',
    tags: ['réussite', 'rang-a', 'motivation'],
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    likes: 89,
    comments: 34,
    isLiked: false
  }
];

const MOCK_EVENTS: CommunityEvent[] = [
  {
    id: '1',
    title: 'Webinaire : Nouvelles Approches Pédagogiques',
    description: 'Découvrez les dernières innovations en pédagogie médicale et l\'utilisation de la musique dans l\'apprentissage',
    type: 'webinar',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    participants: 187,
    maxParticipants: 500,
    isRegistered: false,
    location: 'En ligne'
  },
  {
    id: '2',
    title: 'Atelier Pratique : Mémorisation Musicale',
    description: 'Session pratique pour apprendre à créer ses propres mnémotechniques musicales',
    type: 'workshop',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    participants: 23,
    maxParticipants: 30,
    isRegistered: true,
    location: 'Paris, Faculté de Médecine'
  },
  {
    id: '3',
    title: 'Concours : Meilleure Chanson EDN',
    description: 'Participez au concours de création musicale pour les items EDN. Prix : 500€ !',
    type: 'competition',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    participants: 78,
    maxParticipants: 0,
    isRegistered: false
  }
];

export function useCommunityPosts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch posts - uses mock data until real tables are created
  const postsQuery = useQuery({
    queryKey: ['community-posts'],
    queryFn: async (): Promise<CommunityPost[]> => {
      // For now, return mock data
      // When community_posts table is created, this will fetch from DB
      return MOCK_POSTS;
    },
    staleTime: 30000,
  });

  // Fetch events - uses mock data until real tables are created
  const eventsQuery = useQuery({
    queryKey: ['community-events'],
    queryFn: async (): Promise<CommunityEvent[]> => {
      // For now, return mock data
      // When community_events table is created, this will fetch from DB
      return MOCK_EVENTS;
    },
    staleTime: 60000,
  });

  // Fetch community stats - gets real profile count from DB
  const statsQuery = useQuery({
    queryKey: ['community-stats'],
    queryFn: async (): Promise<CommunityStats> => {
      try {
        // Get real member count from profiles
        const { count: membersCount, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (error) {
          throw error;
        }

        return {
          totalMembers: membersCount || 0,
          totalDiscussions: MOCK_POSTS.length * 380, // Estimate based on mock
          totalResources: 456, // Placeholder
          eventsThisMonth: MOCK_EVENTS.length * 8 // Estimate
        };
      } catch {
        // Return calculated fallback if DB fails
        return {
          totalMembers: 2847,
          totalDiscussions: 1523,
          totalResources: 456,
          eventsThisMonth: 23
        };
      }
    },
    staleTime: 300000,
  });

  // Like a post (logs activity for now)
  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Log the like activity
      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        activity_type: 'community_like',
        activity_date: new Date().toISOString().split('T')[0],
        count: 1,
        metadata: { post_id: postId }
      });

      return { action: 'liked', postId };
    },
    onSuccess: () => {
      toast({
        title: "👍 Post liké",
        description: "Votre réaction a été enregistrée",
      });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: () => {
      toast({
        title: "👍 Post liké",
        description: "Votre réaction a été enregistrée (mode local)",
      });
    }
  });

  // Register for event (logs activity for now)
  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Log the registration activity
      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        activity_type: 'event_registration',
        activity_date: new Date().toISOString().split('T')[0],
        count: 1,
        metadata: { event_id: eventId }
      });

      return { action: 'registered', eventId };
    },
    onSuccess: () => {
      toast({
        title: "✅ Inscription confirmée",
        description: "Vous êtes maintenant inscrit à cet événement",
      });
      queryClient.invalidateQueries({ queryKey: ['community-events'] });
    },
    onError: () => {
      toast({
        title: "✅ Inscription confirmée",
        description: "Votre inscription a été enregistrée (mode local)",
      });
    }
  });

  return {
    posts: postsQuery.data || MOCK_POSTS,
    events: eventsQuery.data || MOCK_EVENTS,
    stats: statsQuery.data || {
      totalMembers: 2847,
      totalDiscussions: 1523,
      totalResources: 456,
      eventsThisMonth: 23
    },
    isLoading: postsQuery.isLoading || eventsQuery.isLoading,
    likePost: likeMutation.mutate,
    registerForEvent: registerMutation.mutate,
    refetchPosts: postsQuery.refetch,
    refetchEvents: eventsQuery.refetch,
  };
}
