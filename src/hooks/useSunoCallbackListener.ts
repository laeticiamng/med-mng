
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CallbackAudio {
  [key: string]: string; // rang -> audioUrl
}

export const useSunoCallbackListener = () => {
  console.log('🚀 [useSunoCallbackListener] Hook initialisé !');
  const [completedAudio, setCompletedAudio] = useState<CallbackAudio>({});
  const { toast } = useToast();
  
  // Utiliser useRef pour persister entre les re-renders
  const processedTracksRef = useRef(new Set<string>());
  const lastPollAtRef = useRef<number>(0);

  useEffect(() => {
    console.log('🔥 [useSunoCallbackListener] useEffect démarré - le hook est actif !');

    const processed = processedTracksRef.current;
    const POLL_INTERVAL = 15000; // 15s pour réduire le spam
    const MIN_THROTTLE = 5000; // 5s mini entre deux polls

    const canPoll = () => {
      if (typeof document !== 'undefined') {
        const visible = document.visibilityState === 'visible';
        const focused = document.hasFocus ? document.hasFocus() : true;
        return visible && focused;
      }
      return true;
    };

    const processTrack = (track: any) => {
      const metadata = track.metadata as any;
      const taskId = metadata?.original_task_id || track.task_id;
      if (!taskId) return;

      // Déterminer le rang à partir du titre ou des métadonnées
      let rang = 'A';
      if (track.title?.includes('Rang B') || metadata?.rang === 'B') rang = 'B';
      else if (track.title?.includes('Rang A') || metadata?.rang === 'A') rang = 'A';
      else if (track.title?.includes('Mix') || metadata?.rang === 'AB') rang = 'AB';

      const trackId = track.id as string;
      if (processed.has(trackId)) return;

      processed.add(trackId);
      setCompletedAudio(prev => {
        const newState: any = { ...prev };
        const existingVersions = Object.keys(newState).filter(k => k.startsWith(`${rang}_v`)).length;
        const versionIndex = existingVersions + 1;
        const versionKey = `${rang}_v${versionIndex}_${taskId}`;
        newState[versionKey] = track.audio_url;

        // Compatibilité: clé simple par rang
        const simpleKey = rang === 'AB' ? 'rangAB' : rang === 'A' ? 'rangA' : 'rangB';
        if (!newState[simpleKey]) newState[simpleKey] = track.audio_url;

        console.log('🔄 État completedAudio mis à jour:', newState);
        return newState;
      });

      // Notification de succès
      toast({
        title: `🎉 Musique ${rang} prête !`,
        description: `🎵 ${track.title} est disponible`,
        duration: 6000,
      });
    };

    const pollForCallbacks = async () => {
      try {
        if (!canPoll()) return;
        const now = Date.now();
        if (now - (lastPollAtRef.current || 0) < MIN_THROTTLE) return;
        lastPollAtRef.current = now;

        console.log('🎯 [CallbackListener] Recherche de ALL tracks avec audio_url...');
        const { data: recentTracks } = await supabase
          .from('generated_music_tracks')
          .select('*')
          .not('audio_url', 'is', null)
          .neq('audio_url', '')
          .order('updated_at', { ascending: false })
          .limit(50);

        if (recentTracks && recentTracks.length > 0) {
          console.log(`🔍 ${recentTracks.length} tracks récents trouvés`);
          recentTracks.forEach(processTrack);
        } else {
          console.log('🔍 Aucun track récent trouvé');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification des callbacks:', error);
      }
    };

    // Realtime: s'abonner aux INSERT/UPDATE
    const channel = supabase
      .channel('realtime:generated_music_tracks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'generated_music_tracks' },
        (payload) => {
          const row: any = (payload as any).new || (payload as any).record;
          if (row?.audio_url) {
            processTrack(row);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });

    // Poll en secours + démarrage immédiat si visible
    const interval = setInterval(pollForCallbacks, POLL_INTERVAL);
    if (canPoll()) pollForCallbacks();

    const onVisibility = () => {
      if (canPoll()) pollForCallbacks();
    };
    window.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onVisibility);
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return {
    completedAudio,
    resetCompletedAudio: () => setCompletedAudio({})
  };
};
