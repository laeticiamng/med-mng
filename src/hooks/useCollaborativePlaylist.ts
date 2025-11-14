import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

/**
 * Permission levels for playlist collaborators
 */
export type PlaylistPermission = 'view' | 'edit' | 'admin';

/**
 * Collaborator information
 */
export interface PlaylistCollaborator {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  permission: PlaylistPermission;
  joinedAt: string;
  isOwner: boolean;
}

/**
 * Playlist activity
 */
export interface PlaylistActivity {
  id: string;
  playlistId: string;
  userId: string;
  userName: string;
  action: 'created' | 'added_song' | 'removed_song' | 'edited' | 'shared' | 'comment';
  resourceType?: string;
  resourceId?: string;
  resourceTitle?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

/**
 * Collaborative playlist
 */
export interface CollaborativePlaylist {
  id: string;
  userId: string; // Owner
  name: string;
  description?: string;
  isPublic: boolean;
  isCollaborative: boolean;
  songIds: string[];
  collaborators: PlaylistCollaborator[];
  activity: PlaylistActivity[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook for Collaborative Playlists
 *
 * Manages:
 * - Create shared playlists
 * - Invite collaborators with permission levels
 * - Real-time song updates
 * - Activity feed
 * - Permission management
 *
 * @example
 * const {
 *   playlists,
 *   createCollaborativePlaylist,
 *   inviteCollaborator,
 *   updatePermission
 * } = useCollaborativePlaylist();
 */
export const useCollaborativePlaylist = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<CollaborativePlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch collaborative playlists for current user
   */
  const getCollaborativePlaylists = useCallback(async (): Promise<CollaborativePlaylist[]> => {
    if (!user?.id) return [];

    setIsLoading(true);
    setError(null);

    try {
      // Get playlists where user is owner or collaborator
      const { data, error: dbError } = await supabase
        .from('user_playlists')
        .select(
          `
          *,
          playlist_collaborators(*),
          playlist_activity(*)
        `
        )
        .or(`user_id.eq.${user.id},playlist_collaborators.user_id.eq.${user.id}`)
        .eq('is_collaborative', true);

      if (dbError) {
        throw dbError;
      }

      const playlistsList = (data || []).map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        name: p.name,
        description: p.description,
        isPublic: p.is_public,
        isCollaborative: p.is_collaborative,
        songIds: p.song_ids || [],
        collaborators: (p.playlist_collaborators || []).map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          userName: c.user_name,
          userEmail: c.user_email,
          userAvatar: c.user_avatar,
          permission: c.permission,
          joinedAt: c.joined_at,
          isOwner: c.user_id === p.user_id,
        })),
        activity: (p.playlist_activity || []).map((a: any) => ({
          id: a.id,
          playlistId: a.playlist_id,
          userId: a.user_id,
          userName: a.user_name,
          action: a.action,
          resourceType: a.resource_type,
          resourceId: a.resource_id,
          resourceTitle: a.resource_title,
          metadata: a.metadata,
          createdAt: a.created_at,
        })),
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));

      setPlaylists(playlistsList);
      return playlistsList;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch playlists';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Create a new collaborative playlist
   */
  const createCollaborativePlaylist = useCallback(
    async (
      name: string,
      description?: string,
      isPublic: boolean = false
    ): Promise<CollaborativePlaylist | null> => {
      if (!user?.id) return null;

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: dbError } = await supabase
          .from('user_playlists')
          .insert({
            user_id: user.id,
            name,
            description,
            is_public: isPublic,
            is_collaborative: true,
            song_ids: [],
          })
          .select()
          .single();

        if (dbError) {
          throw dbError;
        }

        const newPlaylist: CollaborativePlaylist = {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          description: data.description,
          isPublic: data.is_public,
          isCollaborative: data.is_collaborative,
          songIds: data.song_ids || [],
          collaborators: [
            {
              id: `owner-${user.id}`,
              userId: user.id,
              userName: user.email || 'You',
              userEmail: user.email || '',
              permission: 'admin',
              joinedAt: new Date().toISOString(),
              isOwner: true,
            },
          ],
          activity: [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setPlaylists((prev) => [...prev, newPlaylist]);
        return newPlaylist;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create playlist';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  /**
   * Invite collaborator to playlist
   */
  const inviteCollaborator = useCallback(
    async (
      playlistId: string,
      userEmail: string,
      permission: PlaylistPermission = 'edit'
    ): Promise<boolean> => {
      if (!user?.id) return false;

      setIsLoading(true);
      setError(null);

      try {
        // Find user by email
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', userEmail)
          .single();

        if (userError || !userData) {
          setError('User not found');
          return false;
        }

        // Add collaborator
        const { error: dbError } = await supabase.from('playlist_collaborators').insert({
          playlist_id: playlistId,
          user_id: userData.id,
          user_email: userEmail,
          permission,
        });

        if (dbError) {
          throw dbError;
        }

        // Log activity
        await supabase.from('playlist_activity').insert({
          playlist_id: playlistId,
          user_id: user.id,
          user_name: user.email || 'User',
          action: 'shared',
          metadata: { invitedEmail: userEmail, permission },
        });

        await getCollaborativePlaylists();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to invite collaborator';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, getCollaborativePlaylists]
  );

  /**
   * Update collaborator permission
   */
  const updatePermission = useCallback(
    async (playlistId: string, collaboratorId: string, permission: PlaylistPermission): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const { error: dbError } = await supabase
          .from('playlist_collaborators')
          .update({ permission })
          .eq('id', collaboratorId)
          .eq('playlist_id', playlistId);

        if (dbError) {
          throw dbError;
        }

        await getCollaborativePlaylists();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update permission';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [getCollaborativePlaylists]
  );

  /**
   * Remove collaborator from playlist
   */
  const removeCollaborator = useCallback(
    async (playlistId: string, collaboratorId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const { error: dbError } = await supabase
          .from('playlist_collaborators')
          .delete()
          .eq('id', collaboratorId)
          .eq('playlist_id', playlistId);

        if (dbError) {
          throw dbError;
        }

        await getCollaborativePlaylists();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove collaborator';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [getCollaborativePlaylists]
  );

  /**
   * Add song to collaborative playlist
   */
  const addSongToPlaylist = useCallback(
    async (playlistId: string, songId: string, songTitle?: string): Promise<boolean> => {
      if (!user?.id) return false;

      setIsLoading(true);
      setError(null);

      try {
        // Get current songs
        const { data: playlistData, error: fetchError } = await supabase
          .from('user_playlists')
          .select('song_ids')
          .eq('id', playlistId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        const songIds = playlistData?.song_ids || [];
        if (!songIds.includes(songId)) {
          songIds.push(songId);
        }

        // Update songs
        const { error: updateError } = await supabase
          .from('user_playlists')
          .update({ song_ids: songIds })
          .eq('id', playlistId);

        if (updateError) {
          throw updateError;
        }

        // Log activity
        await supabase.from('playlist_activity').insert({
          playlist_id: playlistId,
          user_id: user.id,
          user_name: user.email || 'User',
          action: 'added_song',
          resource_id: songId,
          resource_title: songTitle,
        });

        await getCollaborativePlaylists();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add song';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, getCollaborativePlaylists]
  );

  /**
   * Remove song from playlist
   */
  const removeSongFromPlaylist = useCallback(
    async (playlistId: string, songId: string): Promise<boolean> => {
      if (!user?.id) return false;

      setIsLoading(true);
      setError(null);

      try {
        const { data: playlistData, error: fetchError } = await supabase
          .from('user_playlists')
          .select('song_ids')
          .eq('id', playlistId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        const songIds = (playlistData?.song_ids || []).filter((id: string) => id !== songId);

        const { error: updateError } = await supabase
          .from('user_playlists')
          .update({ song_ids: songIds })
          .eq('id', playlistId);

        if (updateError) {
          throw updateError;
        }

        // Log activity
        await supabase.from('playlist_activity').insert({
          playlist_id: playlistId,
          user_id: user.id,
          user_name: user.email || 'User',
          action: 'removed_song',
          resource_id: songId,
        });

        await getCollaborativePlaylists();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove song';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, getCollaborativePlaylists]
  );

  // Load playlists on mount
  useEffect(() => {
    if (user?.id) {
      getCollaborativePlaylists();
    }
  }, [user?.id, getCollaborativePlaylists]);

  return {
    playlists,
    getCollaborativePlaylists,
    createCollaborativePlaylist,
    inviteCollaborator,
    updatePermission,
    removeCollaborator,
    addSongToPlaylist,
    removeSongFromPlaylist,
    isLoading,
    error,
  };
};

export default useCollaborativePlaylist;
