
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CallbackAudio {
  [key: string]: string; // rang -> audioUrl
}

export const useSunoCallbackListener = () => {
  const [completedAudio, setCompletedAudio] = useState<CallbackAudio>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const processedTracksRef = useRef(new Set<string>());
  const lastCheckRef = useRef(Date.now());

  useEffect(() => {
    const pollForCallbacks = async () => {
      // Ne faire le polling que si une génération est en cours
      if (!isGenerating) return;
      
      try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        
        const { data: recentTracks } = await supabase
          .from('generated_music_tracks')
          .select('*')
          .not('audio_url', 'is', null)
          .neq('audio_url', '')
          .gte('updated_at', fiveMinutesAgo)
          .order('updated_at', { ascending: false })
          .limit(20);

        if (recentTracks && recentTracks.length > 0) {
          
          // Regrouper les musiques par task_id (chaque génération = 2 versions)
          const tracksByTaskId = new Map();
          
          recentTracks.forEach(track => {
            const metadata = track.metadata as Record<string, unknown> | null;
            const taskId = (metadata?.original_task_id as string) || track.task_id;
            
            // Déterminer le rang à partir du titre ou des métadonnées
            let rang = 'A'; // par défaut
            if (track.title?.includes('Rang B') || metadata?.rang === 'B') {
              rang = 'B';
            } else if (track.title?.includes('Rang A') || metadata?.rang === 'A') {
              rang = 'A';
            } else if (track.title?.includes('Mix') || metadata?.rang === 'AB') {
              rang = 'AB';
            }
            
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
              const trackId = track.id;
              
              // Vérifier si c'est un nouveau track (pas encore traité)
              if (!processedTracksRef.current.has(trackId)) {
                processedTracksRef.current.add(trackId);
                
                setCompletedAudio(prev => {
                  const newState = { ...prev };
                  const versionKey = `${rang}_v${index + 1}_${taskId}`;
                  
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
        }
      } catch (error) {
        // Erreur silencieuse en production
      }
    };

    // Polling toutes les 5 secondes uniquement si génération active
    const interval = setInterval(pollForCallbacks, 5000);
    
    // Vérification initiale
    pollForCallbacks();

    return () => clearInterval(interval);
  }, [isGenerating, toast]);

  return {
    completedAudio,
    isGenerating,
    setIsGenerating,
    resetCompletedAudio: () => setCompletedAudio({})
  };
};
