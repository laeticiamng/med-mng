
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GeneratingState {
  rangA: boolean;
  rangB: boolean;
}

export const useMusicGeneration = () => {
  const [isGenerating, setIsGenerating] = useState<GeneratingState>({
    rangA: false,
    rangB: false
  });
  const [generatedAudio, setGeneratedAudio] = useState<{ rangA?: string; rangB?: string }>({});
  const [lastError, setLastError] = useState<string>('');
  const { toast } = useToast();
  
  // Protection contre les appels multiples
  const generatingRef = useRef<Set<string>>(new Set());

  const generateMusic = async (rang: 'A' | 'B', paroles: string[], selectedStyle: string, duration: number = 240) => {
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
    const parolesText = paroles[parolesIndex];

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
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      console.log(`🎵 Lancement génération RAPIDE Rang ${rang} - Style: ${selectedStyle} - Durée: ${durationText}`);
      console.log(`📝 Paroles (${parolesText.length} caractères):`, parolesText.substring(0, 100) + '...');
      
      // Préparer les données pour l'Edge Function
      const requestBody = {
        lyrics: parolesText,
        style: selectedStyle,
        rang: rang,
        duration: duration,
        fastMode: true
      };

      console.log('📤 Données envoyées à l\'Edge Function:', requestBody);
      
      // Configuration corrigée - sans header Content-Type qui peut causer des problèmes
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: requestBody
      });

      // Gestion des erreurs Supabase améliorée
      if (error) {
        console.error('❌ Erreur Supabase Functions:', error);
        let errorMessage = 'Erreur lors de la génération musicale';
        
        // Gestion spécifique de l'erreur "Failed to send request"
        if (error.message?.includes('Failed to send') || error.message?.includes('fetch')) {
          errorMessage = '🔧 Erreur de connexion à l\'API Suno. Vérifiez votre configuration réseau et réessayez.';
        } else if (error.message?.includes('Authorization') || error.message?.includes('401')) {
          errorMessage = '🔑 Clé API Suno manquante ou invalide. Veuillez vérifier la configuration.';
        } else if (error.message?.includes('timeout')) {
          errorMessage = '⏰ Timeout: La génération prend trop de temps. Réessayez avec des paroles plus courtes.';
        } else if (error.message?.includes('non-2xx status code')) {
          errorMessage = '🚫 Erreur du serveur. Vérifiez la configuration de l\'API Suno dans Supabase.';
        } else {
          errorMessage = error.message || errorMessage;
        }
        
        setLastError(errorMessage);
        throw new Error(errorMessage);
      }

      if (!data) {
        throw new Error('Aucune donnée reçue de l\'API');
      }

      if (data.error || data.status === 'error') {
        let errorMessage = data.error || data.message || 'Erreur inconnue lors de la génération';
        
        // Messages d'erreur spécifiques selon le code d'erreur
        if (data.error_code === 429) {
          errorMessage = '💳 Crédits Suno épuisés. Rechargez votre compte sur https://apibox.erweima.ai';
        } else if (data.error_code === 401) {
          errorMessage = '🔑 Clé API Suno invalide. Vérifiez votre configuration dans Supabase.';
        } else if (data.error_code === 408) {
          errorMessage = '⏰ Génération trop longue. Réessayez avec des paroles plus courtes.';
        } else if (data.error_code === 400 && data.error?.includes('sensitive')) {
          errorMessage = '🚫 Paroles non autorisées par Suno AI. Modifiez le contenu.';
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

      toast({
        title: `🎉 Musique Rang ${rang} générée !`,
        description: `Chanson de ${durationText} avec paroles chantées générée en mode rapide !`,
      });

      console.log(`✅ Musique RAPIDE ${durationText} générée pour Rang ${rang}:`, data.audioUrl);
      
    } catch (error) {
      console.error(`❌ Erreur génération RAPIDE Rang ${rang}:`, error);
      const errorMessage = error.message || "Impossible de générer la musique. Veuillez réessayer.";
      setLastError(errorMessage);
      toast({
        title: "Erreur de génération rapide",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      // Nettoyer l'état dans tous les cas
      generatingRef.current.delete(rang);
      setIsGenerating(prev => ({ ...prev, [rangKey]: false }));
    }
  };

  return {
    isGenerating,
    generatedAudio,
    lastError,
    generateMusic
  };
};
