
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';

interface GeneratingState {
  rangA: boolean;
  rangB: boolean;
}

export const useMusicGenerationWithTranslation = () => {
  console.log('🎵 HOOK - useMusicGenerationWithTranslation initialisé');

  const [isGenerating, setIsGenerating] = useState<GeneratingState>({
    rangA: false,
    rangB: false
  });
  const [generatedAudio, setGeneratedAudio] = useState<{ rangA?: string; rangB?: string }>({});
  const [lastError, setLastError] = useState<string>('');
  const { toast } = useToast();
  
  let currentLanguage, translate;
  try {
    console.log('🎵 HOOK - Tentative d\'utilisation de useLanguage');
    const languageContext = useLanguage();
    currentLanguage = languageContext.currentLanguage;
    translate = languageContext.translate;
    console.log('🎵 HOOK - useLanguage réussi, langue:', currentLanguage);
  } catch (error) {
    console.error('❌ HOOK - Erreur avec useLanguage:', error);
    currentLanguage = 'fr';
    translate = async (text: string) => text; // fallback
  }
  
  // Protection contre les appels multiples
  const generatingRef = useRef<Set<string>>(new Set());

  const generateMusicInLanguage = async (
    rang: 'A' | 'B', 
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240
  ) => {
    console.log('🎵 HOOK - generateMusicInLanguage appelé:', { rang, paroles, selectedStyle, duration });
    
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

      // Gérer les styles combinés
      const isComposition = selectedStyle.includes('+');
      const styleDescription = isComposition 
        ? `Composition musicale personnalisée combinant plusieurs styles : ${selectedStyle.replace(/\+/g, ' × ')}`
        : selectedStyle;

      // Ajuster la durée pour les compositions
      const adjustedDuration = isComposition 
        ? duration + (selectedStyle.split('+').length - 1) * 30 
        : duration;

      const minutes = Math.floor(adjustedDuration / 60);
      const seconds = adjustedDuration % 60;
      const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      console.log(`🎵 DÉMARRAGE GÉNÉRATION SUNO ${isComposition ? 'COMPOSITION PREMIUM' : 'STANDARD'} Rang ${rang} en ${currentLanguage}`);
      console.log(`🎨 Style: ${styleDescription} - Durée: ${durationText}`);
      console.log(`📝 Paroles traduites (${parolesText.length} caractères):`, parolesText.substring(0, 100) + '...');
      
      // Préparer les données pour l'Edge Function avec plus de détails
      const requestBody = {
        lyrics: parolesText,
        style: selectedStyle,
        rang: rang,
        duration: adjustedDuration,
        language: currentLanguage,
        fastMode: true,
        composition: isComposition ? {
          styles: selectedStyle.split('+'),
          fusion_mode: true,
          enhanced_duration: true
        } : undefined
      };

      console.log('📤 ENVOI À EDGE FUNCTION SUPABASE (generate-music):', requestBody);
      
      // Appel à l'Edge Function Supabase avec timeout étendu
      const startTime = Date.now();
      console.log('🚀 Appel Edge Function Supabase...');

      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: requestBody
      });

      const callDuration = Math.floor((Date.now() - startTime) / 1000);
      console.log(`⏱️ Durée appel Edge Function: ${callDuration}s`);

      // Gestion des erreurs Supabase
      if (error) {
        console.error('❌ ERREUR SUPABASE FUNCTIONS:', error);
        console.error('❌ Type d\'erreur:', typeof error);
        console.error('❌ Structure erreur:', Object.keys(error));
        
        let errorMessage = 'Erreur lors de la génération musicale avec Suno';
        
        if (error.message?.includes('Failed to send') || error.message?.includes('fetch')) {
          errorMessage = '🔧 Erreur de connexion à l\'API Suno. Vérifiez votre configuration réseau et réessayez.';
        } else if (error.message?.includes('Authorization') || error.message?.includes('401')) {
          errorMessage = '🔑 Clé API Suno manquante ou invalide. Veuillez vérifier la configuration Supabase.';
        } else if (error.message?.includes('timeout')) {
          errorMessage = '⏰ Timeout: La génération Suno prend trop de temps. Réessayez avec des paroles plus courtes.';
        } else if (error.message?.includes('503')) {
          errorMessage = '🚫 Service Suno temporairement indisponible. Réessayez dans quelques minutes.';
        } else {
          errorMessage = `Erreur Suno: ${error.message || 'Erreur inconnue'}`;
        }
        
        setLastError(errorMessage);
        throw new Error(errorMessage);
      }

      console.log('📥 RÉPONSE EDGE FUNCTION REÇUE:', data);
      console.log('📊 Type de réponse:', typeof data);
      console.log('📊 Clés de la réponse:', data ? Object.keys(data) : 'aucune');

      if (!data) {
        throw new Error('Aucune donnée reçue de l\'Edge Function Suno');
      }

      if (data.error || data.status === 'error') {
        let errorMessage = data.error || data.message || 'Erreur inconnue lors de la génération Suno';
        
        if (data.error_code === 429) {
          errorMessage = '💳 Crédits Suno épuisés. Rechargez votre compte sur https://apibox.erweima.ai';
        } else if (data.error_code === 401) {
          errorMessage = '🔑 Clé API Suno invalide. Vérifiez votre configuration dans Supabase.';
        } else if (data.error_code === 408) {
          errorMessage = '⏰ Génération Suno trop longue. Réessayez avec des paroles plus courtes.';
        }
        
        console.error('❌ ERREUR API SUNO:', errorMessage);
        setLastError(errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.audioUrl) {
        console.error('❌ AUCUNE URL AUDIO dans la réponse Suno:', data);
        throw new Error('Aucune URL audio générée par l\'API Suno');
      }

      console.log(`🎧 URL AUDIO SUNO REÇUE: ${data.audioUrl}`);
      console.log(`🎵 Validation URL: ${data.audioUrl.startsWith('http') ? '✅ Valide' : '❌ Invalide'}`);

      const audioKey = rang === 'A' ? 'rangA' : 'rangB';
      setGeneratedAudio(prev => ({
        ...prev,
        [audioKey]: data.audioUrl
      }));

      const languageName = currentLanguage === 'fr' ? 'français' : currentLanguage;
      const compositionText = isComposition ? ' (Composition Premium)' : '';
      
      toast({
        title: `🎉 Musique Suno Rang ${rang} générée !${compositionText}`,
        description: `Chanson de ${durationText} avec paroles chantées générée en ${languageName} via Suno AI !`,
      });

      console.log(`✅ GÉNÉRATION SUNO RÉUSSIE pour Rang ${rang} en ${languageName} (${callDuration}s):`, data.audioUrl);
      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION SUNO Rang ${rang}:`, error);
      console.error(`❌ Stack trace:`, error.stack);
      
      const errorMessage = error.message || "Impossible de générer la musique avec Suno. Veuillez réessayer.";
      setLastError(errorMessage);
      toast({
        title: "Erreur de génération Suno",
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

  console.log('🎵 HOOK - Retour des données du hook:', {
    isGenerating,
    generatedAudio,
    lastError,
    currentLanguage
  });

  return {
    isGenerating,
    generatedAudio,
    lastError,
    generateMusicInLanguage,
    transposeMusicToLanguage,
    currentLanguage
  };
};
