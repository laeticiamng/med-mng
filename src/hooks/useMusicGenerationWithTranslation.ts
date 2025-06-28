
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';

interface GeneratingState {
  rangA: boolean;
  rangB: boolean;
}

export const useMusicGenerationWithTranslation = () => {
  const [isGenerating, setIsGenerating] = useState<GeneratingState>({
    rangA: false,
    rangB: false
  });
  const [generatedAudio, setGeneratedAudio] = useState<{ rangA?: string; rangB?: string }>({});
  const [lastError, setLastError] = useState<string>('');
  const { toast } = useToast();
  const { currentLanguage, translate } = useLanguage();
  
  // Protection contre les appels multiples
  const generatingRef = useRef<Set<string>>(new Set());

  const generateMusicInLanguage = async (
    rang: 'A' | 'B', 
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240
  ) => {
    const rangKey = `rang${rang}` as keyof GeneratingState;
    
    // Protection contre les appels multiples
    if (generatingRef.current.has(rang)) {
      console.log(`⚠️ Génération déjà en cours pour le Rang ${rang}, ignoré`);
      return;
    }

    if (!selectedStyle) {
      toast({
        title: "Style musical requis",
        description: "Veuillez sélectionner un style musical avant de générer la musique.",
        variant: "destructive"
      });
      return;
    }

    if (!paroles || paroles.length === 0) {
      toast({
        title: "Paroles manquantes",
        description: "Aucune parole disponible pour générer la musique.",
        variant: "destructive"
      });
      return;
    }

    // Marquer comme en cours de génération
    generatingRef.current.add(rang);
    setIsGenerating(prev => ({ ...prev, [rangKey]: true }));
    setLastError('');
    
    const parolesIndex = rang === 'A' ? 0 : 1;
    let parolesText = paroles[parolesIndex];

    if (!parolesText || parolesText.trim() === '') {
      setLastError(`Aucune parole disponible pour le Rang ${rang}`);
      toast({
        title: "Paroles manquantes",
        description: `Aucune parole n'est disponible pour le Rang ${rang}.`,
        variant: "destructive"
      });
      // Nettoyer l'état
      generatingRef.current.delete(rang);
      setIsGenerating(prev => ({ ...prev, [rangKey]: false }));
      return;
    }

    try {
      // Traduire les paroles dans la langue choisie par l'utilisateur
      if (currentLanguage !== 'fr') {
        console.log(`🌍 Traduction des paroles du français vers ${currentLanguage}...`);
        parolesText = await translate(parolesText, currentLanguage);
        console.log(`✅ Paroles traduites pour Rang ${rang}`);
      }

      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      console.log(`🎵 Génération musicale Rang ${rang} en ${currentLanguage} - Style: ${selectedStyle} - Durée: ${durationText}`);
      console.log(`📝 Paroles traduites (${parolesText.length} caractères):`, parolesText.substring(0, 100) + '...');
      
      // Préparer les données pour l'Edge Function
      const requestBody = {
        lyrics: parolesText,
        style: selectedStyle,
        rang: rang,
        duration: duration,
        language: currentLanguage,
        fastMode: true
      };

      console.log('📤 Données envoyées à l\'Edge Function:', requestBody);
      
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: requestBody
      });

      // Gestion des erreurs Supabase
      if (error) {
        console.error('❌ Erreur Supabase Functions:', error);
        let errorMessage = 'Erreur lors de la génération musicale';
        
        if (error.message?.includes('Failed to send') || error.message?.includes('fetch')) {
          errorMessage = '🔧 Erreur de connexion à l\'API Suno. Vérifiez votre configuration réseau et réessayez.';
        } else if (error.message?.includes('Authorization') || error.message?.includes('401')) {
          errorMessage = '🔑 Clé API Suno manquante ou invalide. Veuillez vérifier la configuration.';
        } else if (error.message?.includes('timeout')) {
          errorMessage = '⏰ Timeout: La génération prend trop de temps. Réessayez avec des paroles plus courtes.';
        } else {
          errorMessage = error.message || errorMessage;
        }
        
        setLastError(errorMessage);
        throw new Error(errorMessage);
      }

      if (!data || data.error || data.status === 'error') {
        let errorMessage = data?.error || data?.message || 'Erreur inconnue lors de la génération';
        
        if (data?.error_code === 429) {
          errorMessage = '💳 Crédits Suno épuisés. Rechargez votre compte sur https://apibox.erweima.ai';
        } else if (data?.error_code === 401) {
          errorMessage = '🔑 Clé API Suno invalide. Vérifiez votre configuration dans Supabase.';
        } else if (data?.error_code === 408) {
          errorMessage = '⏰ Génération trop longue. Réessayez avec des paroles plus courtes.';
        }
        
        console.error('❌ Erreur API Suno:', errorMessage);
        setLastError(errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.audioUrl) {
        throw new Error('Aucune URL audio générée par l\'API');
      }

      const audioKey = rang === 'A' ? 'rangA' : 'rangB';
      setGeneratedAudio(prev => ({
        ...prev,
        [audioKey]: data.audioUrl
      }));

      const languageName = currentLanguage === 'fr' ? 'français' : currentLanguage;
      toast({
        title: `🎉 Musique Rang ${rang} générée !`,
        description: `Chanson de ${durationText} avec paroles chantées générée en ${languageName} !`,
      });

      console.log(`✅ Musique générée pour Rang ${rang} en ${languageName}:`, data.audioUrl);
      
    } catch (error) {
      console.error(`❌ Erreur génération Rang ${rang}:`, error);
      const errorMessage = error.message || "Impossible de générer la musique. Veuillez réessayer.";
      setLastError(errorMessage);
      toast({
        title: "Erreur de génération",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      // Nettoyer l'état dans tous les cas
      generatingRef.current.delete(rang);
      setIsGenerating(prev => ({ ...prev, [rangKey]: false }));
    }
  };

  // Fonction pour transposer une musique existante dans une autre langue
  const transposeMusicToLanguage = async (
    originalLyrics: string,
    targetLanguage: SupportedLanguage,
    selectedStyle: string,
    duration: number = 240
  ) => {
    try {
      setLastError('');
      
      // Traduire les paroles originales vers la langue cible
      console.log(`🌍 Transposition vers ${targetLanguage}...`);
      const translatedLyrics = await translate(originalLyrics, targetLanguage);
      
      const requestBody = {
        lyrics: translatedLyrics,
        style: selectedStyle,
        rang: 'TRANSPOSE',
        duration: duration,
        language: targetLanguage,
        fastMode: true
      };

      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: requestBody
      });

      if (error || !data?.audioUrl) {
        throw new Error(error?.message || 'Erreur lors de la transposition');
      }

      toast({
        title: "🎉 Transposition réussie !",
        description: `Musique transposée en ${targetLanguage} avec succès !`,
      });

      return data.audioUrl;
    } catch (error) {
      const errorMessage = error.message || "Erreur lors de la transposition";
      setLastError(errorMessage);
      toast({
        title: "Erreur de transposition",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    isGenerating,
    generatedAudio,
    lastError,
    generateMusicInLanguage,
    transposeMusicToLanguage,
    currentLanguage
  };
};
