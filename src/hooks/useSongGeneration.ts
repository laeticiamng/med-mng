
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
    if (!quota || quota.remaining_credits <= 0) {
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
          fastMode: true,
          // Ajouter des paroles par défaut basées sur le contenu sélectionné
          lyrics: generateDefaultLyrics(contentType, selectedItem, selectedRang, selectedSituation)
        },
      });

      if (error) {
        console.error('❌ Erreur Supabase Functions:', error);
        
        // Gestion d'erreurs spécifiques
        if (error.message?.includes('503') || error.message?.includes('Service Temporarily Unavailable')) {
          throw new Error('🚫 Service de génération musicale temporairement indisponible. Réessayez dans quelques minutes.');
        } else if (error.message?.includes('401') || error.message?.includes('Authorization')) {
          throw new Error('🔑 Problème d\'authentification. Veuillez vous reconnecter.');
        } else if (error.message?.includes('429')) {
          throw new Error('💳 Limite de génération atteinte. Réessayez plus tard.');
        }
        
        throw new Error(error.message || 'Erreur lors de la génération musicale');
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Aucune donnée reçue du service de génération');
      }

      console.log('✅ Génération réussie:', data);
      
      // Créer la chanson en base
      const song = await medMngApi.createSong(title, data.audioUrl || 'temp-audio-url', {
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
        audioUrl: data.audioUrl || data.audio_url
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
