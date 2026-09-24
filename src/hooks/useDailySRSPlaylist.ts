import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';

export interface SRSPlaylistItem {
  id: string;
  itemCode: string;
  title: string;
  specialty: string | null;
  audioUrl: string;
  duration: number | null;
  genre: string | null;
  retentionProbability: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  intervalDays: number;
  reviewCount: number;
  easeFactor: number;
  isNew: boolean;
}

interface DailyPlaylistState {
  items: SRSPlaylistItem[];
  currentIndex: number;
  isAutoPlaying: boolean;
  loading: boolean;
  totalDue: number;
  completedCount: number;
  sessionStartedAt: string | null;
}

export const useDailySRSPlaylist = () => {
  const { play, currentTrack, isPlaying } = useGlobalAudio();
  const [state, setState] = useState<DailyPlaylistState>({
    items: [],
    currentIndex: -1,
    isAutoPlaying: false,
    loading: true,
    totalDue: 0,
    completedCount: 0,
    sessionStartedAt: null,
  });

  // Predict retention using Ebbinghaus curve
  const predictRetention = useCallback((easeFactor: number, daysSinceReview: number): number => {
    const stability = easeFactor * 10;
    return Math.round(Math.exp(-daysSinceReview / stability) * 100);
  }, []);

  // Generate daily playlist based on SM-2 SRS data
  const generatePlaylist = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      // 1. Get all SRS card data for this user
      const { data: srsCards } = await (supabase as any)
        .from('srs_card_data')
        .select('*')
        .eq('user_id', user.id);

      const now = new Date();
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      // 2. Find due cards (next_review <= today or never reviewed)
      const dueCards = (srsCards || []).filter((card: any) => {
        if (!card.next_review) return true;
        return new Date(card.next_review) <= today;
      });

      // 3. Get all item codes from due cards
      const cardIds = dueCards.map((c: any) => c.card_id);

      // 4. Get matching edn_items_immersive
      const { data: items } = await supabase
        .from('edn_items_immersive')
        .select('id, item_code, title, specialite');

      if (!items || items.length === 0) {
        setState(prev => ({ ...prev, loading: false, items: [] }));
        return;
      }

      // 5. Get lyrics versions for these items
      const itemCodes = items.map(i => i.item_code);
      const { data: lyricsVersions } = await (supabase as any)
        .from('edn_lyrics_versions')
        .select('id, item_code')
        .in('item_code', itemCodes);

      if (!lyricsVersions || lyricsVersions.length === 0) {
        setState(prev => ({ ...prev, loading: false, items: [] }));
        return;
      }

      // 6. Get audio tracks for these lyrics versions
      const lyricsIds = lyricsVersions.map((lv: any) => lv.id);
      const { data: tracks } = await supabase
        .from('edn_suno_tracks')
        .select('id, audio_url, duration, genre, lyrics_version_id, status')
        .in('lyrics_version_id', lyricsIds)
        .eq('status', 'completed');

      if (!tracks || tracks.length === 0) {
        // Fallback: try generated_songs table
        const { data: generatedSongs } = await (supabase as any)
          .from('generated_songs')
          .select('id, audio_url, duration, title, item_code, genre')
          .in('item_code', itemCodes)
          .not('audio_url', 'is', null)
          .limit(20);

        if (generatedSongs && generatedSongs.length > 0) {
          const playlistItems = buildPlaylistFromGenerated(generatedSongs, items, srsCards || [], now);
          setState(prev => ({
            ...prev,
            items: playlistItems,
            totalDue: playlistItems.length,
            loading: false,
          }));
          return;
        }

        setState(prev => ({ ...prev, loading: false, items: [] }));
        return;
      }

      // 7. Build lookup maps
      const lyricsToItem = new Map<string, string>();
      lyricsVersions.forEach((lv: any) => {
        lyricsToItem.set(lv.id, lv.item_code);
      });

      const itemMap = new Map<string, any>();
      items.forEach(item => {
        itemMap.set(item.item_code, item);
      });

      const srsMap = new Map<string, any>();
      (srsCards || []).forEach((card: any) => {
        srsMap.set(card.card_id, card);
      });

      // 8. Build playlist items
      const playlistItems: SRSPlaylistItem[] = [];
      const seenItems = new Set<string>();

      for (const track of tracks) {
        if (!track.audio_url) continue;
        const itemCode = lyricsToItem.get(track.lyrics_version_id);
        if (!itemCode || seenItems.has(itemCode)) continue;
        seenItems.add(itemCode);

        const item = itemMap.get(itemCode);
        if (!item) continue;

        const srsData = srsMap.get(itemCode) || srsMap.get(item.id);
        const lastReviewed = srsData?.last_reviewed ? new Date(srsData.last_reviewed) : null;
        const daysSince = lastReviewed
          ? Math.floor((now.getTime() - lastReviewed.getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        const ef = srsData?.ease_factor || 2.5;
        const retention = predictRetention(ef, daysSince);
        const intervalDays = srsData?.interval_days || 0;
        const isDue = !srsData?.next_review || new Date(srsData.next_review) <= today;

        let riskLevel: 'low' | 'medium' | 'high' | 'critical';
        if (retention < 30) riskLevel = 'critical';
        else if (retention < 50) riskLevel = 'high';
        else if (retention < 70) riskLevel = 'medium';
        else riskLevel = 'low';

        // Prioritize due items, then new items
        if (isDue || !srsData) {
          playlistItems.push({
            id: track.id,
            itemCode,
            title: item.title,
            specialty: item.specialite,
            audioUrl: track.audio_url,
            duration: track.duration,
            genre: track.genre,
            retentionProbability: retention,
            riskLevel,
            intervalDays,
            reviewCount: srsData?.review_count || 0,
            easeFactor: ef,
            isNew: !srsData,
          });
        }
      }

      // 9. Sort: critical first, then high, then new items
      playlistItems.sort((a, b) => {
        const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        if (a.isNew !== b.isNew) return a.isNew ? 1 : -1; // Due items first
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      });

      // 10. Limit to 15 items per session
      const finalItems = playlistItems.slice(0, 15);

      setState(prev => ({
        ...prev,
        items: finalItems,
        totalDue: finalItems.length,
        loading: false,
      }));
    } catch (error) {
      console.error('Error generating SRS playlist:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [predictRetention]);

  const buildPlaylistFromGenerated = (
    songs: any[],
    items: any[],
    srsCards: any[],
    now: Date
  ): SRSPlaylistItem[] => {
    const itemMap = new Map<string, any>();
    items.forEach(i => itemMap.set(i.item_code, i));
    const srsMap = new Map<string, any>();
    srsCards.forEach((c: any) => srsMap.set(c.card_id, c));

    return songs
      .filter(s => s.audio_url)
      .map(song => {
        const item = itemMap.get(song.item_code);
        const srsData = srsMap.get(song.item_code);
        const lastReviewed = srsData?.last_reviewed ? new Date(srsData.last_reviewed) : null;
        const daysSince = lastReviewed
          ? Math.floor((now.getTime() - lastReviewed.getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        const ef = srsData?.ease_factor || 2.5;
        const retention = predictRetention(ef, daysSince);

        let riskLevel: 'low' | 'medium' | 'high' | 'critical';
        if (retention < 30) riskLevel = 'critical';
        else if (retention < 50) riskLevel = 'high';
        else if (retention < 70) riskLevel = 'medium';
        else riskLevel = 'low';

        return {
          id: song.id,
          itemCode: song.item_code,
          title: item?.title || song.title || song.item_code,
          specialty: item?.specialite || null,
          audioUrl: song.audio_url,
          duration: song.duration,
          genre: song.genre || null,
          retentionProbability: retention,
          riskLevel,
          intervalDays: srsData?.interval_days || 0,
          reviewCount: srsData?.review_count || 0,
          easeFactor: ef,
          isNew: !srsData,
        };
      })
      .slice(0, 15);
  };

  // Play a specific item
  const playItem = useCallback((index: number) => {
    const item = state.items[index];
    if (!item) return;

    setState(prev => ({
      ...prev,
      currentIndex: index,
      sessionStartedAt: prev.sessionStartedAt || new Date().toISOString(),
    }));

    play({
      url: item.audioUrl,
      title: `${item.itemCode} - ${item.title}`,
      rang: 'A',
    });
  }, [state.items, play]);

  // Start auto-play from beginning
  const startAutoPlay = useCallback(() => {
    if (state.items.length === 0) return;
    setState(prev => ({ ...prev, isAutoPlaying: true }));
    playItem(0);
  }, [state.items.length, playItem]);

  // Play next item
  const playNext = useCallback(() => {
    const nextIndex = state.currentIndex + 1;
    if (nextIndex < state.items.length) {
      setState(prev => ({ ...prev, completedCount: prev.completedCount + 1 }));
      playItem(nextIndex);
    } else {
      // Playlist finished
      setState(prev => ({
        ...prev,
        isAutoPlaying: false,
        completedCount: prev.items.length,
      }));
    }
  }, [state.currentIndex, state.items.length, playItem]);

  // Play previous item
  const playPrevious = useCallback(() => {
    const prevIndex = state.currentIndex - 1;
    if (prevIndex >= 0) {
      playItem(prevIndex);
    }
  }, [state.currentIndex, playItem]);

  // Toggle auto-play
  const toggleAutoPlay = useCallback(() => {
    setState(prev => ({ ...prev, isAutoPlaying: !prev.isAutoPlaying }));
  }, []);

  // Mark current item as reviewed in SRS
  const markReviewed = useCallback(async (quality: number) => {
    const item = state.items[state.currentIndex];
    if (!item) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentSRS = await (supabase as any)
        .from('srs_card_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('card_id', item.itemCode)
        .maybeSingle();

      const existing = currentSRS?.data;
      const ef = existing?.ease_factor || 2.5;
      const interval = existing?.interval_days || 0;
      const reps = existing?.review_count || 0;
      const correct = existing?.correct_count || 0;

      // SM-2 calculation
      let newEF = Math.max(1.3, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
      let newInterval: number;
      let newReps: number;

      if (quality < 3) {
        newReps = Math.max(0, reps - 1);
        newInterval = 1;
      } else {
        newReps = reps + 1;
        if (newReps === 1) newInterval = quality === 5 ? 4 : 1;
        else if (newReps === 2) newInterval = quality === 5 ? 10 : 6;
        else newInterval = Math.min(365, Math.max(1, Math.round(interval * newEF)));
      }

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + newInterval);

      await (supabase as any)
        .from('srs_card_data')
        .upsert({
          user_id: user.id,
          card_id: item.itemCode,
          ease_factor: newEF,
          interval_days: newInterval,
          review_count: newReps,
          correct_count: quality >= 3 ? correct + 1 : correct,
          last_reviewed: new Date().toISOString(),
          next_review: nextReview.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,card_id' });

      // Log activity
      await (supabase as any)
        .from('user_activity_log')
        .insert({
          user_id: user.id,
          activity_type: 'srs_review',
          action: 'srs_music_review',
          item_code: item.itemCode,
          score: quality * 20,
          metadata: { source: 'daily_playlist', quality, item_title: item.title },
        });
    } catch (error) {
      console.error('Error marking review:', error);
    }
  }, [state.currentIndex, state.items]);

  // Auto-chain: detect track end and play next
  useEffect(() => {
    if (!state.isAutoPlaying || state.currentIndex < 0) return;
    const currentItem = state.items[state.currentIndex];
    if (!currentItem) return;

    // Check if the current global audio track matches AND has stopped playing
    const isCurrentTrackMatching = currentTrack?.url === currentItem.audioUrl;
    if (isCurrentTrackMatching && !isPlaying && state.currentIndex >= 0) {
      // Small delay to allow ended event to settle
      const timeout = setTimeout(() => {
        playNext();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isPlaying, currentTrack, state.isAutoPlaying, state.currentIndex, state.items, playNext]);

  // Load on mount
  useEffect(() => {
    generatePlaylist();
  }, [generatePlaylist]);

  return {
    ...state,
    generatePlaylist,
    playItem,
    startAutoPlay,
    playNext,
    playPrevious,
    toggleAutoPlay,
    markReviewed,
    currentItem: state.currentIndex >= 0 ? state.items[state.currentIndex] : null,
  };
};
