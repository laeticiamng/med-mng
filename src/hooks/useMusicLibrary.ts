
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SavedMusic {
  id: string;
  title: string;
  audio_url: string;
  music_style: string;
  rang: string;
  item_code: string;
  created_at: string;
}

export const useMusicLibrary = () => {
  const [savedMusics, setSavedMusics] = useState<SavedMusic[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSavedMusics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_generated_music' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger votre bibliothèque musicale.",
          variant: "destructive"
        });
        return;
      }

      setSavedMusics((data as unknown as SavedMusic[]) || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (music: SavedMusic) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    if (playingId === music.id) {
      setPlayingId(null);
      setCurrentAudio(null);
      return;
    }

    const audio = new Audio(music.audio_url);
    audio.play();
    
    audio.addEventListener('ended', () => {
      setPlayingId(null);
      setCurrentAudio(null);
    });

    setCurrentAudio(audio);
    setPlayingId(music.id);
  };

  const handleDelete = async (musicId: string) => {
    try {
      const { error } = await supabase
        .from('user_generated_music' as any)
        .delete()
        .eq('id', musicId);

      if (error) {
        toast({
          title: "Erreur de suppression",
          description: "Impossible de supprimer cette musique.",
          variant: "destructive"
        });
        return;
      }

      setSavedMusics(prev => prev.filter(m => m.id !== musicId));
      toast({
        title: "Musique supprimée",
        description: "La musique a été retirée de votre bibliothèque.",
      });
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  useEffect(() => {
    fetchSavedMusics();
  }, []);

  return {
    savedMusics,
    loading,
    playingId,
    handlePlay,
    handleDelete
  };
};
