
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
        // Vérifier s'il y a des nouvelles musiques disponibles dans les 2 dernières minutes
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
        
        const { data: recentTracks } = await supabase
          .from('generated_music_tracks')
          .select('*')
          .eq('generation_status', 'completed')
          .not('audio_url', 'is', null)
          .gte('created_at', twoMinutesAgo)
          .order('created_at', { ascending: false })
          .limit(30);

        if (recentTracks && recentTracks.length > 0) {
          console.log(`🔍 ${recentTracks.length} tracks récents trouvés`);
          
          recentTracks.forEach(track => {
            const metadata = track.metadata as any;
            let rang = metadata?.rang || 'A';
            
            // Nettoyer le rang pour ne garder que A ou B
            if (typeof rang === 'string') {
              rang = rang.toUpperCase().includes('A') ? 'A' : 'B';
            }
            
            // Utiliser l'ID du track comme clé unique pour éviter les doublons
            const trackKey = `${rang}_${track.id}`;
            
            // Vérifier si c'est un nouveau track (pas encore notifié)
            if (track.audio_url && !completedAudio[trackKey]) {
              console.log(`🎵 Nouvelle musique détectée Rang ${rang}:`, track.audio_url);
              console.log('📋 Track complet:', track);
              
              setCompletedAudio(prev => ({
                ...prev,
                [trackKey]: track.audio_url,
                [rang]: track.audio_url // Aussi garder la clé simple pour compatibilité
              }));

              // Toujours afficher la notification pour les tracks complétés
              toast({
                title: `🎉 Musique Rang ${rang} terminée !`,
                description: `🎵 Votre génération est maintenant disponible`,
                duration: 6000,
              });
            }
          });
        } else {
          console.log('🔍 Aucun track récent trouvé');
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
