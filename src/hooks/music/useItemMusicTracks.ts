import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type GeneratedMusicTrack = Database['public']['Tables']['generated_music_tracks']['Row'];

interface UseItemMusicTracksOptions {
  itemId?: string;
  itemCode?: string;
}

interface UseItemMusicTracksValue {
  tracks: GeneratedMusicTrack[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const buildMetadataFilter = (itemCode?: string) => {
  if (!itemCode) return undefined;

  const sanitized = itemCode.replace(/,/g, '');
  return `metadata->>item_code.eq.${sanitized}`;
};

export const useItemMusicTracks = ({ itemId, itemCode }: UseItemMusicTracksOptions): UseItemMusicTracksValue => {
  const [tracks, setTracks] = useState<GeneratedMusicTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelName = useMemo(() => {
    if (itemId) return `item-music-${itemId}`;
    if (itemCode) return `item-music-${itemCode}`;
    return null;
  }, [itemId, itemCode]);

  const loadTracks = useCallback(async () => {
    if (!itemId && !itemCode) {
      setTracks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('generated_music_tracks').select('*');

      if (itemId && itemCode) {
        const metadataFilter = buildMetadataFilter(itemCode);
        query = query.or(`item_id.eq.${itemId}${metadataFilter ? `,${metadataFilter}` : ''}`);
      } else if (itemId) {
        query = query.eq('item_id', itemId);
      } else if (itemCode) {
        const metadataFilter = buildMetadataFilter(itemCode);
        query = metadataFilter ? query.or(metadataFilter) : query;
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setTracks((data || []) as GeneratedMusicTrack[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de charger les pistes générées.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [itemId, itemCode]);

  useEffect(() => {
    if (!channelName) return;

    loadTracks();

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'generated_music_tracks' },
        (payload) => {
          const targetId = (payload.new as any)?.item_id ?? (payload.old as any)?.item_id;
          const targetCode = ((payload.new as any)?.metadata as Record<string, unknown> | null)?.item_code as string | undefined;

          const matchById = itemId && targetId === itemId;
          const matchByCode = itemCode && targetCode === itemCode;

          if (matchById || matchByCode) {
            void loadTracks();
          }
        }
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [channelName, itemId, itemCode, loadTracks]);

  return {
    tracks,
    loading,
    error,
    reload: loadTracks,
  };
};

