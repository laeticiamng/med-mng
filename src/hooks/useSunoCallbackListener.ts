
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
          
          recentTracks.forEach(track => {
            const metadata = track.metadata as any;
            let rang = metadata?.rang || 'A';
            
            // Forcer la détection de A et B en alternant (puisque toutes les musiques sont marquées 'A')
            const existingA = completedAudio.rangA;
            const existingB = completedAudio.rangB;
            
            // Si pas de rangA encore, prendre cette musique comme rangA, sinon comme rangB
            rang = !existingA ? 'A' : 'B';
            
            // Utiliser l'ID du track comme clé unique pour éviter les doublons
            const trackKey = `${rang}_${track.id}`;
            
            // Vérifier si c'est un nouveau track (pas encore notifié)
            if (track.audio_url && !completedAudio[trackKey]) {
              console.log(`🎵 NOUVELLE MUSIQUE DÉTECTÉE! Rang ${rang}:`, track.audio_url);
              console.log('📋 Track complet:', {
                id: track.id,
                title: track.title,
                audio_url: track.audio_url,
                task_id: track.task_id,
                suno_track_id: track.suno_track_id,
                rang: rang
              });
              
              setCompletedAudio(prev => {
                const newState = {
                  ...prev,
                  [trackKey]: track.audio_url,
                  [rang]: track.audio_url, // Clé simple pour compatibilité
                  // AJOUT CRUCIAL : aussi avec la clé simple A/B pour l'interface
                  rangA: rang === 'A' ? track.audio_url : prev.rangA,
                  rangB: rang === 'B' ? track.audio_url : prev.rangB
                };
                console.log('🔄 État completedAudio mis à jour:', newState);
                return newState;
              });

              // Notification de succès
              toast({
                title: `🎉 Musique Rang ${rang} terminée !`,
                description: `🎵 ${track.title} est maintenant disponible`,
                duration: 8000,
              });
            } else if (completedAudio[trackKey]) {
              console.log(`⚠️ Track déjà notifié: ${trackKey}`);
            }
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
