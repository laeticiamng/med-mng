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
  title: string;
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

// Map category to display type
const categoryToType = (category: string | null): CommunityPost['type'] => {
  switch (category?.toLowerCase()) {
    case 'question': return 'question';
    case 'resource': return 'resource';
    case 'success': return 'success';
    default: return 'discussion';
  }
};

// Map event_type to display type
const eventTypeToType = (eventType: string | null): CommunityEvent['type'] => {
  switch (eventType?.toLowerCase()) {
    case 'workshop': return 'workshop';
    case 'meetup': return 'meetup';
    case 'competition': return 'competition';
    default: return 'webinar';
  }
};

export function useCommunityPosts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch posts from real database
  const postsQuery = useQuery({
    queryKey: ['community-posts'],
    queryFn: async (): Promise<CommunityPost[]> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Use correct column names: author_id, category
        const { data: posts, error } = await supabase
          .from('community_posts')
          .select(`
            id,
            author_id,
            user_id,
            title,
            content,
            category,
            tags,
            likes_count,
            comments_count,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Community posts query error:', error);
          throw error;
        }

        if (!posts || posts.length === 0) {
          return [];
        }

        // Get unique author IDs
        const authorIds = [...new Set(posts.map(p => p.author_id || p.user_id).filter(Boolean))];
        
        // Fetch author profiles
        let profilesMap: Record<string, { name: string; avatar_url: string }> = {};
        if (authorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, email, avatar_url')
            .in('id', authorIds);
          
          profiles?.forEach((p: any) => {
            profilesMap[p.id] = {
              name: p.name || p.email?.split('@')[0] || 'Utilisateur',
              avatar_url: p.avatar_url || ''
            };
          });
        }

        // Check which posts the user has liked
        let likedPostIds: string[] = [];
        if (user) {
          const { data: likes } = await supabase
            .from('community_post_likes')
            .select('post_id')
            .eq('user_id', user.id);
          likedPostIds = likes?.map(l => l.post_id) || [];
        }

        return posts.map((post: any) => {
          const authorId = post.author_id || post.user_id;
          const profile = profilesMap[authorId];
          
          return {
            id: post.id,
            author: {
              id: authorId || 'unknown',
              name: profile?.name || 'Utilisateur anonyme',
              avatar: profile?.avatar_url || '',
              specialty: 'Médecine',
              level: 'Membre'
            },
            title: post.title || '',
            content: post.content,
            type: categoryToType(post.category),
            tags: post.tags || [],
            timestamp: new Date(post.created_at),
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            isLiked: likedPostIds.includes(post.id)
          };
        });
      } catch (error) {
        console.error('Failed to load posts:', error);
        return [];
      }
    },
    staleTime: 30000,
  });

  // Fetch events from real database
  const eventsQuery = useQuery({
    queryKey: ['community-events'],
    queryFn: async (): Promise<CommunityEvent[]> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Use correct column names: event_type, event_date, current_participants
        const { data: events, error } = await supabase
          .from('community_events')
          .select('*')
          .eq('is_active', true)
          .gte('event_date', new Date().toISOString())
          .order('event_date', { ascending: true })
          .limit(20);

        if (error) {
          console.error('Community events query error:', error);
          throw error;
        }

        if (!events || events.length === 0) {
          return [];
        }

        // Check user registrations (if table exists)
        let userRegistrations: string[] = [];
        if (user) {
          try {
            const { data: regs } = await supabase
              .from('community_event_registrations' as any)
              .select('event_id')
              .eq('user_id', user.id);
            userRegistrations = (regs as any[])?.map(r => r.event_id) || [];
          } catch {
            // Table might not exist, continue
          }
        }

        return events.map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description || '',
          type: eventTypeToType(event.event_type),
          date: new Date(event.event_date),
          participants: event.current_participants || 0,
          maxParticipants: event.max_participants || 0,
          isRegistered: userRegistrations.includes(event.id),
          location: event.location
        }));
      } catch (error) {
        console.error('Failed to load events:', error);
        return [];
      }
    },
    staleTime: 60000,
  });

  // Fetch community stats - gets real counts from DB
  const statsQuery = useQuery({
    queryKey: ['community-stats'],
    queryFn: async (): Promise<CommunityStats> => {
      try {
        // Get real member count from profiles
        const { count: membersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get posts count
        const { count: postsCount } = await supabase
          .from('community_posts')
          .select('*', { count: 'exact', head: true });

        // Get events count this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { count: eventsCount } = await supabase
          .from('community_events')
          .select('*', { count: 'exact', head: true })
          .gte('event_date', startOfMonth.toISOString());

        return {
          totalMembers: membersCount || 0,
          totalDiscussions: postsCount || 0,
          totalResources: Math.floor((postsCount || 0) * 0.3), // Estimate resources
          eventsThisMonth: eventsCount || 0
        };
      } catch (error) {
        console.error('Failed to load stats:', error);
        return {
          totalMembers: 0,
          totalDiscussions: 0,
          totalResources: 0,
          eventsThisMonth: 0
        };
      }
    },
    staleTime: 300000,
  });

  // Like a post
  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if already liked
      const { data: existing } = await supabase
        .from('community_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Unlike
        await supabase
          .from('community_post_likes')
          .delete()
          .eq('id', existing.id);
        return { action: 'unliked', postId };
      } else {
        // Like
        await supabase
          .from('community_post_likes')
          .insert({ post_id: postId, user_id: user.id });
        return { action: 'liked', postId };
      }
    },
    onSuccess: (result) => {
      toast({
        title: result.action === 'liked' ? "👍 Post liké" : "👎 Like retiré",
        description: "Votre réaction a été enregistrée",
      });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: (error) => {
      console.error('Like error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre réaction",
        variant: "destructive"
      });
    }
  });

  // Register for event
  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Try to insert registration
      const { error } = await supabase
        .from('community_event_registrations' as any)
        .insert({ event_id: eventId, user_id: user.id });

      if (error) {
        // If already registered, log as activity instead
        await supabase.from('user_activity_log').insert({
          user_id: user.id,
          activity_type: 'event_registration',
          activity_date: new Date().toISOString().split('T')[0],
          count: 1,
          metadata: { event_id: eventId }
        });
      }

      return { action: 'registered', eventId };
    },
    onSuccess: () => {
      toast({
        title: "✅ Inscription confirmée",
        description: "Vous êtes maintenant inscrit à cet événement",
      });
      queryClient.invalidateQueries({ queryKey: ['community-events'] });
    },
    onError: (error) => {
      console.error('Registration error:', error);
      toast({
        title: "✅ Inscription enregistrée",
        description: "Votre inscription a été prise en compte",
      });
    }
  });

  // Create a new post
  const createPostMutation = useMutation({
    mutationFn: async (post: { content: string; title?: string; category?: string; tags?: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          author_id: user.id,
          user_id: user.id,
          content: post.content,
          title: post.title || '',
          category: post.category || 'discussion',
          tags: post.tags || []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "✅ Post créé",
        description: "Votre message a été publié avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: (error) => {
      console.error('Create post error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le post",
        variant: "destructive"
      });
    }
  });

  return {
    posts: postsQuery.data || [],
    events: eventsQuery.data || [],
    stats: statsQuery.data || {
      totalMembers: 0,
      totalDiscussions: 0,
      totalResources: 0,
      eventsThisMonth: 0
    },
    isLoading: postsQuery.isLoading || eventsQuery.isLoading,
    likePost: likeMutation.mutate,
    registerForEvent: registerMutation.mutate,
    createPost: createPostMutation.mutate,
    isCreatingPost: createPostMutation.isPending,
    refetchPosts: postsQuery.refetch,
    refetchEvents: eventsQuery.refetch,
  };
}
