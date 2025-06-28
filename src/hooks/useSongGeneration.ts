
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useSongGeneration = () => {
  const navigate = useNavigate();
  const medMngApi = useMedMngApi();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSong, setGeneratedSong] = useState<any>(null);

  const generateSong = async (
    contentType: string,
    selectedItem: string,
    selectedRang: string,
    selectedSituation: string,
    style: string,
    title: string,
    quota: any
  ) => {
    if (quota?.remaining_credits <= 0) {
      toast.error('Crédits insuffisants. Veuillez améliorer votre abonnement.');
      navigate('/med-mng/pricing');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🎵 Lancement génération musique via Supabase Functions...');
      
      // Utiliser Supabase Functions pour la génération musicale
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          contentType,
          selectedItem: contentType === 'item' ? selectedItem : null,
          selectedRang: contentType === 'item' ? selectedRang : null,
          selectedSituation: contentType === 'situation' ? selectedSituation : null,
          style,
          title,
          duration: 240,
          fastMode: true
        },
      });

      if (error) {
        console.error('❌ Erreur Supabase Functions:', error);
        throw new Error(error.message || 'Erreur lors de la génération');
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Aucune donnée reçue');
      }

      console.log('✅ Génération réussie:', data);
      
      // Créer la chanson en base
      const song = await medMngApi.createSong(title, data.audioUrl, {
        style,
        contentType,
        selectedItem: contentType === 'item' ? selectedItem : undefined,
        selectedRang: contentType === 'item' ? selectedRang : undefined,
        selectedSituation: contentType === 'situation' ? selectedSituation : undefined,
        duration: data.duration || 240,
        generationTime: data.generationTime || 0
      });

      // Ajouter automatiquement à la bibliothèque
      await medMngApi.addToLibrary(song.id);

      setGeneratedSong({
        ...song,
        audioUrl: data.audioUrl
      });

      toast.success('🎵 Chanson générée avec succès !');
    } catch (error) {
      console.error('❌ Erreur génération:', error);
      toast.error(`Erreur: ${error.message || 'Réessayez plus tard'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const playGeneratedSong = () => {
    if (generatedSong) {
      navigate(`/med-mng/player/${generatedSong.id}`);
    }
  };

  const addToLibrary = async () => {
    if (generatedSong) {
      try {
        await medMngApi.addToLibrary(generatedSong.id);
        toast.success('Ajouté à votre bibliothèque !');
        navigate('/med-mng/library');
      } catch (error) {
        toast.error('Erreur lors de l\'ajout');
      }
    }
  };

  return {
    isGenerating,
    generatedSong,
    generateSong,
    playGeneratedSong,
    addToLibrary
  };
};
