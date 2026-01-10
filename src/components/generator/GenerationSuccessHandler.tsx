/**
 * 🎵 Gestionnaire de succès de génération
 * - Rafraîchit automatiquement les crédits Suno
 * - Affiche une notification de succès enrichie
 * - Met à jour l'historique en temps réel
 */

import { useEffect } from 'react';
import { useSunoCredits } from '@/hooks/useSunoCredits';

interface GenerationSuccessHandlerProps {
  generatedSong: any | null;
  onCreditsRefreshed?: () => void;
}

export const useGenerationSuccessHandler = ({
  generatedSong,
  onCreditsRefreshed
}: GenerationSuccessHandlerProps) => {
  const { refreshAfterGeneration, credits } = useSunoCredits();

  // ✅ Rafraîchir automatiquement les crédits après génération réussie
  useEffect(() => {
    if (generatedSong?.audioUrl) {
      console.log('[GenerationSuccessHandler] Génération réussie, rafraîchissement crédits...');
      refreshAfterGeneration();
      onCreditsRefreshed?.();
    }
  }, [generatedSong?.audioUrl, refreshAfterGeneration, onCreditsRefreshed]);

  return {
    credits
  };
};
