
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PollingState {
  trackId: string;
  rang: 'A' | 'B' | 'AB';
  itemCode: string;
  startTime: number;
}

export const useSunoPolling = () => {
  const [pollingTracks, setPollingTracks] = useState<PollingState[]>([]);
  const [completedAudio, setCompletedAudio] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  const startPolling = useCallback((trackId: string, rang: 'A' | 'B' | 'AB', itemCode: string) => {
    console.log('🔄 Démarrage polling pour trackId:', trackId, 'rang:', rang);
    
    const newPolling: PollingState = {
      trackId,
      rang,
      itemCode,
      startTime: Date.now()
    };
    
    setPollingTracks(prev => [...prev.filter(p => p.trackId !== trackId), newPolling]);
  }, []);

  const stopPolling = useCallback((trackId: string) => {
    console.log('⏹️ Arrêt polling pour trackId:', trackId);
    setPollingTracks(prev => prev.filter(p => p.trackId !== trackId));
  }, []);

  const checkTrackStatus = useCallback(async (track: PollingState) => {
    try {
      console.log('🔍 Vérification statut pour trackId:', track.trackId);
      
      // 1. D'abord vérifier en BDD locale avec plusieurs critères
      console.log(`🔍 Recherche du track ${track.trackId} dans la DB...`);
      const { data: dbTracks, error: dbError } = await supabase
        .from('generated_music_tracks')
        .select('*')
        .or(`task_id.eq.${track.trackId},suno_track_id.eq.${track.trackId},original_task_id.eq.${track.trackId}`);
        
      console.log(`📋 ${dbTracks?.length || 0} tracks trouvés dans la DB pour ${track.trackId}`);
      
      if (dbTracks && dbTracks.length > 0) {
        const completedTrack = dbTracks.find(t => t.generation_status === 'completed' && t.audio_url);
        if (completedTrack) {
          console.log('✅ Track terminé trouvé dans la DB:', track.trackId, '-> URL:', completedTrack.audio_url);
          
          setCompletedAudio(prev => ({
            ...prev,
            [track.rang]: completedTrack.audio_url
          }));

          toast({
            title: `🎉 ${track.itemCode} Rang ${track.rang} prêt !`,
            description: `🎵 Votre musique est maintenant disponible`,
            duration: 5000,
          });

          return true;
        } else {
          console.log(`⏳ Track trouvé mais pas encore terminé: ${track.trackId}`);
          const pendingTrack = dbTracks[0];
          if (pendingTrack.generation_status) {
            console.log(`📊 Statut actuel: ${pendingTrack.generation_status}`);
          }
          // Vérifier si on a des tracks récents avec le même rang et item_code
          const recentCompletedTrack = dbTracks.find(t => 
            t.generation_status === 'completed' && 
            t.audio_url && 
            new Date(t.created_at).getTime() > Date.now() - 10 * 60 * 1000 // 10 minutes
          );
          if (recentCompletedTrack) {
            console.log('🎯 Track récent complété trouvé, on l\'utilise');
            setCompletedAudio(prev => ({
              ...prev,
              [track.rang]: recentCompletedTrack.audio_url
            }));

            toast({
              title: `🎉 ${track.itemCode} Rang ${track.rang} prêt !`,
              description: `🎵 Votre musique est maintenant disponible`,
              duration: 5000,
            });

            return true;
          }
        }
      } else {
        console.log(`❌ Aucun track trouvé dans la DB pour: ${track.trackId}`);
        
        // Chercher des tracks récents du même item_code et rang
        const { data: recentTracks } = await supabase
          .from('generated_music_tracks')
          .select('*')
          .eq('generation_status', 'completed')
          .not('audio_url', 'is', null)
          .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (recentTracks && recentTracks.length > 0) {
          console.log(`🔍 ${recentTracks.length} tracks récents trouvés, recherche de correspondance pour ${track.rang}`);
          const matchingTrack = recentTracks.find(t => {
            const metadata = t.metadata as any;
            return metadata?.rang === track.rang || metadata?.title?.includes(`Rang ${track.rang}`);
          });
          
          if (matchingTrack) {
            console.log('🎯 Track correspondant trouvé via recherche récente !');
            setCompletedAudio(prev => ({
              ...prev,
              [track.rang]: matchingTrack.audio_url
            }));

            toast({
              title: `🎉 ${track.itemCode} Rang ${track.rang} prêt !`,
              description: `🎵 Votre musique est maintenant disponible`,
              duration: 5000,
            });

            return true;
          }
        }
      }

      // 2. Si pas trouvé en BDD, vérifier directement via l'API Suno
      console.log('📡 Vérification directe via API Suno pour:', track.trackId);
      
      const { data: statusData, error: statusError } = await supabase.functions.invoke('music-status', {
        body: { taskId: track.trackId }
      });

      if (statusData && !statusError) {
        console.log('📊 Statut API Suno:', statusData);
        
        if (statusData.status === 'completed' && statusData.audioUrl) {
          console.log('✅ Track complété via API Suno:', track.trackId, 'URL:', statusData.audioUrl);
          
          // Mettre à jour la BDD avec le résultat - correction de l'erreur spread
          const existingTrack = dbTracks?.[0];
          const existingMetadata = existingTrack?.metadata || {};
          const newMetadata = {
            ...(typeof existingMetadata === 'object' && existingMetadata !== null ? existingMetadata : {}),
            stream_url: statusData.streamUrl,
            image_url: statusData.imageUrl,
            completed_at: new Date().toISOString()
          };

          // Essayer de mettre à jour la BDD, mais continuer même si ça échoue
          try {
            await supabase
              .from('generated_music_tracks')
              .update({
                generation_status: 'completed',
                audio_url: statusData.audioUrl,
                metadata: newMetadata
              })
              .eq('task_id', track.trackId);
          } catch (updateError) {
            console.warn('⚠️ Erreur mise à jour BDD, mais on continue:', updateError);
          }

          setCompletedAudio(prev => ({
            ...prev,
            [track.rang]: statusData.audioUrl
          }));

          toast({
            title: `🎉 ${track.itemCode} Rang ${track.rang} prêt !`,
            description: `🎵 Votre musique est maintenant disponible`,
            duration: 5000,
          });

          return true;
        } else if (statusData.status === 'failed') {
          console.error('❌ Génération échouée pour:', track.trackId);
          
          toast({
            title: `❌ ${track.itemCode} Rang ${track.rang} échoué`,
            description: `La génération a échoué. Veuillez réessayer.`,
            variant: "destructive",
            duration: 5000,
          });

          return true; // Arrêter le polling
        }
      } else {
        console.error('❌ Erreur lors de la vérification API Suno:', statusError);
        
        // Si c'est une erreur 404, c'est que le track n'existe pas
        if (statusError?.message?.includes('404')) {
          console.error('❌ TrackId introuvable côté Suno:', track.trackId);
          
          toast({
            title: `❌ Erreur génération ${track.itemCode} Rang ${track.rang}`,
            description: `Le track n'existe pas côté Suno. Problème lors de la génération initiale.`,
            variant: "destructive",
            duration: 8000,
          });

          return true; // Arrêter le polling
        }
      }

      console.log('⏳ Track pas encore prêt:', track.trackId);
      return false;
      
    } catch (error) {
      console.error('❌ Erreur polling:', error);
      return false;
    }
  }, [toast]);

  // Polling automatique toutes les 3 secondes
  useEffect(() => {
    if (pollingTracks.length === 0) return;

    const interval = setInterval(async () => {
      console.log('🔄 Polling check pour', pollingTracks.length, 'tracks');
      
      // Log l'état actuel du polling
      pollingTracks.forEach(track => {
        const elapsed = Math.floor((Date.now() - track.startTime) / 1000);
        console.log(`⏱️ Track ${track.trackId} - ${track.rang}: ${elapsed}s écoulées`);
      });
      
      for (const track of pollingTracks) {
        const elapsed = Date.now() - track.startTime;
        const maxWait = 2 * 60 * 1000; // 2 minutes max
        
        if (elapsed > maxWait) {
          console.log('⏰ Timeout pour track:', track.trackId);
          stopPolling(track.trackId);
          toast({
            title: "⏰ Timeout de génération",
            description: `${track.itemCode} Rang ${track.rang} prend trop de temps. Vérifiez que l'API Suno fonctionne correctement.`,
            variant: "destructive"
          });
          continue;
        }

        const isCompleted = await checkTrackStatus(track);
        if (isCompleted) {
          stopPolling(track.trackId);
        }
      }
    }, 3000); // Check toutes les 3 secondes

    return () => clearInterval(interval);
  }, [pollingTracks, checkTrackStatus, stopPolling, toast]);

  return {
    startPolling,
    stopPolling,
    completedAudio,
    pollingTracks: pollingTracks.length
  };
};
