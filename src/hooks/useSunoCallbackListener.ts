
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CallbackAudio {
  [key: string]: string; // rang -> audioUrl
}

export const useSunoCallbackListener = () => {
  const [completedAudio, setCompletedAudio] = useState<CallbackAudio>({});
  const { toast } = useToast();

  useEffect(() => {
    // Écouter les callbacks Suno via un endpoint spécial
    const pollForCallbacks = async () => {
      try {
        // Vérifier s'il y a des musiques disponibles dans les 5 dernières minutes pour inclure les existantes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        
        const { data: recentTracks } = await supabase
          .from('generated_music_tracks')
          .select('*')
          .eq('generation_status', 'completed')
          .not('audio_url', 'is', null)
          .gte('created_at', fiveMinutesAgo)
          .order('created_at', { ascending: false })
          .limit(30);

        if (recentTracks && recentTracks.length > 0) {
          console.log(`🔍 ${recentTracks.length} tracks récents trouvés`);
          
          // Regrouper les musiques par task_id (chaque génération = 2 versions)
          const tracksByTaskId = new Map();
          
          recentTracks.forEach(track => {
            const metadata = track.metadata as any;
            const taskId = metadata?.original_task_id;
            const rang = metadata?.rang || 'A';
            
            if (!taskId) return;
            
            if (!tracksByTaskId.has(taskId)) {
              tracksByTaskId.set(taskId, { rang, tracks: [] });
            }
            tracksByTaskId.get(taskId).tracks.push(track);
          });
          
          // Traiter chaque groupe de task_id
          tracksByTaskId.forEach((group, taskId) => {
            const { rang, tracks } = group;
            
            // Pour chaque task_id, nous devons avoir 2 versions selon la doc officielle
            tracks.forEach((track, index) => {
              const versionKey = `${rang}_v${index + 1}_${taskId}`;
              
              // Vérifier si c'est un nouveau track (pas encore notifié)
              if (!completedAudio[versionKey]) {
                console.log(`🎵 NOUVELLE MUSIQUE ${rang} Version ${index + 1}:`, track.audio_url);
                
                setCompletedAudio(prev => {
                  const newState = { ...prev };
                  
                  // Ajouter cette version spécifique
                  newState[versionKey] = track.audio_url;
                  
                  // Mettre à jour les clés par rang pour l'interface
                  if (rang === 'A') {
                    if (!newState.rangA_v1) newState.rangA_v1 = track.audio_url;
                    else if (!newState.rangA_v2) newState.rangA_v2 = track.audio_url;
                    
                    // Compatibilité: première version devient la version principale
                    if (!newState.rangA) newState.rangA = track.audio_url;
                  } else if (rang === 'B') {
                    if (!newState.rangB_v1) newState.rangB_v1 = track.audio_url;
                    else if (!newState.rangB_v2) newState.rangB_v2 = track.audio_url;
                    
                    // Compatibilité: première version devient la version principale  
                    if (!newState.rangB) newState.rangB = track.audio_url;
                  } else if (rang === 'AB' || rang === 'Mix') {
                    if (!newState.rangAB_v1) newState.rangAB_v1 = track.audio_url;
                    else if (!newState.rangAB_v2) newState.rangAB_v2 = track.audio_url;
                    
                    // Compatibilité: première version devient la version principale
                    if (!newState.rangAB) newState.rangAB = track.audio_url;
                  }
                  
                  console.log('🔄 État completedAudio mis à jour:', newState);
                  return newState;
                });

                // Notification de succès avec numéro de version
                toast({
                  title: `🎉 Musique ${rang} Version ${index + 1} terminée !`,
                  description: `🎵 ${track.title} est maintenant disponible`,
                  duration: 6000,
                });
              }
            });
          });
        } else {
          console.log('🔍 Aucun track récent trouvé');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification des callbacks:', error);
      }
    };

    // Vérifier TRÈS fréquemment (toutes les secondes) pour un affichage quasi-immédiat
    const interval = setInterval(pollForCallbacks, 1000);
    
    // Vérification initiale
    pollForCallbacks();

    return () => clearInterval(interval);
  }, [completedAudio, toast]);

  return {
    completedAudio,
    resetCompletedAudio: () => setCompletedAudio({})
  };
};
