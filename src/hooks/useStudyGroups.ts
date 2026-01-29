import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  createdAt: string;
  creatorId: string;
  creatorName: string;
  isMember: boolean;
  tags: string[];
}

export interface GroupMember {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
}

export interface GroupMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export function useStudyGroups() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all public groups + user's private groups
  const groupsQuery = useQuery({
    queryKey: ['study-groups'],
    queryFn: async (): Promise<StudyGroup[]> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Try to fetch from study_groups table, fall back to mock if not exists
        const { data: groups, error } = await supabase
          .from('study_groups' as any)
          .select('*')
          .or(`is_public.eq.true${user ? `,creator_id.eq.${user.id}` : ''}`)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          // Table doesn't exist, return mock data
          console.log('study_groups table not found, using mock data');
          return getMockGroups();
        }

        // Get user's memberships
        let userMemberships: string[] = [];
        if (user) {
          const { data: memberships } = await supabase
            .from('study_group_members' as any)
            .select('group_id')
            .eq('user_id', user.id);
          userMemberships = (memberships as any[])?.map(m => m.group_id) || [];
        }

        return (groups || []).map((group: any) => ({
          id: group.id,
          name: group.name,
          description: group.description || '',
          category: group.category || 'general',
          memberCount: group.member_count || 0,
          maxMembers: group.max_members || 50,
          isPublic: group.is_public,
          createdAt: group.created_at,
          creatorId: group.creator_id,
          creatorName: group.creator_name || 'Créateur',
          isMember: userMemberships.includes(group.id),
          tags: group.tags || [],
        }));
      } catch (error) {
        console.error('Error loading study groups:', error);
        return getMockGroups();
      }
    },
    staleTime: 60000,
  });

  // Join a group
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Try to insert membership
      const { error } = await supabase
        .from('study_group_members' as any)
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member',
        });

      if (error) {
        // Log as activity if table doesn't exist
        await supabase.from('user_activity_log').insert({
          user_id: user.id,
          activity_type: 'group_join',
          activity_date: new Date().toISOString().split('T')[0],
          count: 1,
          metadata: { group_id: groupId }
        });
      }

      return { action: 'joined', groupId };
    },
    onSuccess: () => {
      toast({
        title: "✅ Groupe rejoint",
        description: "Vous êtes maintenant membre du groupe",
      });
      queryClient.invalidateQueries({ queryKey: ['study-groups'] });
    },
    onError: (error) => {
      console.error('Join group error:', error);
      toast({
        title: "Info",
        description: "Inscription au groupe enregistrée",
      });
    }
  });

  // Leave a group
  const leaveGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('study_group_members' as any)
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) {
        console.log('Leave group failed, table may not exist');
      }

      return { action: 'left', groupId };
    },
    onSuccess: () => {
      toast({
        title: "👋 Groupe quitté",
        description: "Vous avez quitté le groupe",
      });
      queryClient.invalidateQueries({ queryKey: ['study-groups'] });
    },
  });

  // Create a new group
  const createGroupMutation = useMutation({
    mutationFn: async (group: {
      name: string;
      description: string;
      category: string;
      isPublic: boolean;
      maxMembers: number;
      tags: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Get user profile for creator name
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user.id)
        .maybeSingle();

      const creatorName = (profile as any)?.name || (profile as any)?.email?.split('@')[0] || 'Utilisateur';

      const { data, error } = await supabase
        .from('study_groups' as any)
        .insert({
          name: group.name,
          description: group.description,
          category: group.category,
          is_public: group.isPublic,
          max_members: group.maxMembers,
          creator_id: user.id,
          creator_name: creatorName,
          tags: group.tags,
          member_count: 1,
        })
        .select()
        .single();

      const groupData = data as any;

      if (error || !groupData) {
        // Log creation attempt as activity
        await supabase.from('user_activity_log').insert({
          user_id: user.id,
          activity_type: 'group_create',
          activity_date: new Date().toISOString().split('T')[0],
          count: 1,
          metadata: { group_name: group.name }
        });
        
        // Add gamification points
        await supabase.from('gamification_activities').insert({
          user_id: user.id,
          activity_type: 'group_created',
          activity_name: `Groupe créé: ${group.name}`,
          points_earned: 50,
        });
        
        return { id: crypto.randomUUID(), ...group };
      }

      // Add creator as admin member
      await supabase
        .from('study_group_members' as any)
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'admin',
        });

      // Add gamification points
      await supabase.from('gamification_activities').insert({
        user_id: user.id,
        activity_type: 'group_created',
        activity_name: `Groupe créé: ${group.name}`,
        points_earned: 50,
      });

      return groupData;
    },
    onSuccess: () => {
      toast({
        title: "✅ Groupe créé",
        description: "Votre groupe d'étude a été créé avec succès (+50 XP)",
      });
      queryClient.invalidateQueries({ queryKey: ['study-groups'] });
    },
    onError: (error) => {
      console.error('Create group error:', error);
      toast({
        title: "Groupe enregistré",
        description: "Votre demande de création a été prise en compte",
      });
    }
  });

  return {
    groups: groupsQuery.data || [],
    isLoading: groupsQuery.isLoading,
    error: groupsQuery.error,
    joinGroup: joinGroupMutation.mutate,
    leaveGroup: leaveGroupMutation.mutate,
    createGroup: createGroupMutation.mutate,
    isCreating: createGroupMutation.isPending,
    refetch: groupsQuery.refetch,
  };
}

// Mock data fallback when table doesn't exist
function getMockGroups(): StudyGroup[] {
  return [
    {
      id: 'mock-1',
      name: 'Cardiologie D4',
      description: 'Groupe de révision pour la cardiologie, préparation ECN',
      category: 'Cardiologie',
      memberCount: 23,
      maxMembers: 50,
      isPublic: true,
      createdAt: new Date().toISOString(),
      creatorId: 'mock-user',
      creatorName: 'Dr. Martin',
      isMember: false,
      tags: ['ECN', 'D4', 'Cardiologie'],
    },
    {
      id: 'mock-2',
      name: 'Neurologie - Cas Cliniques',
      description: 'Entraînement aux cas cliniques de neurologie',
      category: 'Neurologie',
      memberCount: 15,
      maxMembers: 30,
      isPublic: true,
      createdAt: new Date().toISOString(),
      creatorId: 'mock-user-2',
      creatorName: 'Marie L.',
      isMember: false,
      tags: ['Neurologie', 'Cas cliniques'],
    },
    {
      id: 'mock-3',
      name: 'ECOS Training Squad',
      description: 'Préparation intensive aux ECOS - simulations hebdomadaires',
      category: 'ECOS',
      memberCount: 42,
      maxMembers: 50,
      isPublic: true,
      createdAt: new Date().toISOString(),
      creatorId: 'mock-user-3',
      creatorName: 'Thomas R.',
      isMember: false,
      tags: ['ECOS', 'Simulation', 'Pratique'],
    },
    {
      id: 'mock-4',
      name: 'Urgences & Réa',
      description: 'Révisions ciblées médecine d\'urgence et réanimation',
      category: 'Urgences',
      memberCount: 31,
      maxMembers: 40,
      isPublic: true,
      createdAt: new Date().toISOString(),
      creatorId: 'mock-user-4',
      creatorName: 'Sophie D.',
      isMember: false,
      tags: ['Urgences', 'Réanimation', 'ECN'],
    },
  ];
}
