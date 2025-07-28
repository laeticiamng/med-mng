
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
        // Vérifier s'il y a des nouvelles musiques disponibles
        const { data: recentTracks } = await supabase
          .from('generated_music_tracks')
          .select('*')
          .eq('generation_status', 'completed')
          .not('audio_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10);

        if (recentTracks) {
          recentTracks.forEach(track => {
            const metadata = track.metadata as any;
            const rang = metadata?.rang || 'A';
            
            // Vérifier si c'est un nouveau track (pas encore dans completedAudio)
            if (track.audio_url && !completedAudio[rang]) {
              console.log('🎵 Nouvelle musique détectée:', track.audio_url);
              console.log('🎵 Track metadata:', metadata);
              
              setCompletedAudio(prev => ({
                ...prev,
                [rang]: track.audio_url
              }));

              // Afficher notification seulement si c'est vraiment nouveau
              const isNewTrack = metadata?.created_via_callback || 
                                (track.updated_at && new Date(track.updated_at) > new Date(Date.now() - 30000));
              
              if (isNewTrack) {
                toast({
                  title: `🎉 Musique Rang ${rang} prête !`,
                  description: `🎵 Votre musique est maintenant disponible`,
                  duration: 5000,
                });
              }
            }
          });
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification des callbacks:', error);
      }
    };

    // Vérifier toutes les 3 secondes (plus rapide pour détecter les nouveaux tracks)
    const interval = setInterval(pollForCallbacks, 3000);
    
    // Vérification initiale
    pollForCallbacks();

    return () => clearInterval(interval);
  }, [completedAudio, toast]);

  return {
    completedAudio,
    resetCompletedAudio: () => setCompletedAudio({})
  };
};
