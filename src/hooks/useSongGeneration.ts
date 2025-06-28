
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { toast } from 'sonner';

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
      // Appel à l'Edge Function de génération musicale
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType,
          selectedItem: contentType === 'item' ? selectedItem : null,
          selectedRang: contentType === 'item' ? selectedRang : null,
          selectedSituation: contentType === 'situation' ? selectedSituation : null,
          style,
          title,
          duration: 240,
          fastMode: true
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération');
      }

      const result = await response.json();
      
      // Créer la chanson en base
      const song = await medMngApi.createSong(title, result.audioUrl, {
        style,
        contentType,
        selectedItem: contentType === 'item' ? selectedItem : undefined,
        selectedRang: contentType === 'item' ? selectedRang : undefined,
        selectedSituation: contentType === 'situation' ? selectedSituation : undefined,
        duration: result.duration,
        generationTime: result.generationTime
      });

      // Ajouter automatiquement à la bibliothèque
      await medMngApi.addToLibrary(song.id);

      setGeneratedSong({
        ...song,
        audioUrl: result.audioUrl
      });

      toast.success('🎵 Chanson générée avec succès !');
    } catch (error) {
      console.error('Erreur génération:', error);
      toast.error('Erreur lors de la génération. Réessayez.');
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
