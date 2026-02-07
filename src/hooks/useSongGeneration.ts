import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { toast } from 'sonner';
import { audioApi } from '@/lib/unifiedApiClient';
import { ROUTE_PATHS } from '@/config/routes';

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
    if (!quota || quota.remaining_credits <= 0) {
      toast.error('Crédits insuffisants. Veuillez améliorer votre abonnement.');
      navigate(ROUTE_PATHS.medMngPricing);
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🎵 Lancement génération musique via Supabase Functions...');
      
      // Utiliser le routeur unifié ai-audio
      const response = await audioApi.generateMusic({
        lyrics: generateDefaultLyrics(contentType, selectedItem, selectedRang, selectedSituation),
        style,
        title,
        duration: 240,
        itemCode: contentType === 'item' ? selectedItem : undefined,
        rang: contentType === 'item' ? selectedRang : undefined,
      });

      if (!response.success || response.error) {
        const errorMsg = response.error || '';
        console.error('❌ Erreur audioApi:', errorMsg);

        if (errorMsg.includes('503') || errorMsg.includes('Service Temporarily Unavailable')) {
          throw new Error('🚫 Service de génération musicale temporairement indisponible. Réessayez dans quelques minutes.');
        } else if (errorMsg.includes('401') || errorMsg.includes('Authorization')) {
          throw new Error('🔑 Problème d\'authentification. Veuillez vous reconnecter.');
        } else if (errorMsg.includes('429')) {
          throw new Error('💳 Limite de génération atteinte. Réessayez plus tard.');
        }

        throw new Error(errorMsg || 'Erreur lors de la génération musicale');
      }

      const data = response.data;
      if (!data) {
        throw new Error('Aucune donnée reçue du service de génération');
      }

      console.log('✅ Génération réussie:', data);

      // Créer la chanson en base
      const song = await medMngApi.createSong(title, data.metadata?.audioUrl || 'temp-audio-url', {
        style,
        contentType,
        selectedItem: contentType === 'item' ? selectedItem : undefined,
        selectedRang: contentType === 'item' ? selectedRang : undefined,
        selectedSituation: contentType === 'situation' ? selectedSituation : undefined,
        duration: 240,
        generationTime: 0
      });

      // Ajouter automatiquement à la bibliothèque
      await medMngApi.addToLibrary(song.id);

      setGeneratedSong({
        ...song,
        audioUrl: data.metadata?.audioUrl || 'pending'
      });

      toast.success('🎵 Chanson générée avec succès !');
    } catch (error) {
      console.error('❌ Erreur génération:', error);
      let errorMessage = 'Erreur lors de la génération musicale';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDefaultLyrics = (contentType: string, selectedItem: string, selectedRang: string, selectedSituation: string): string => {
    if (contentType === 'item' && selectedItem && selectedRang) {
      const itemNames = {
        'IC1': 'Colloque Singulier',
        'IC2': 'Situations Cliniques',
        'IC3': 'Diagnostic Médical',
        'IC4': 'Thérapeutique',
        'IC5': 'Éthique Médicale'
      };
      
      const itemName = itemNames[selectedItem] || 'Formation Médicale';
      const rangType = selectedRang === 'A' ? 'Colloque Singulier' : 'Outils Pratiques';
      
      return `Formation médicale avec ${itemName}, 
              Apprentissage du ${rangType},
              Développement des compétences professionnelles,
              Excellence en médecine moderne`;
    }
    
    if (contentType === 'situation' && selectedSituation) {
      return `Situation clinique d'apprentissage,
              Développement des compétences médicales,
              Formation pratique et théorique,
              Excellence professionnelle`;
    }
    
    return `Formation médicale personnalisée,
            Apprentissage interactif,
            Développement professionnel,
            Excellence en santé`;
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
        navigate(ROUTE_PATHS.medMngMusicLibrary);
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
