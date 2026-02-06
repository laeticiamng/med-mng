/**
 * 🎵 Gestionnaire de succès de génération
 * - Rafraîchit automatiquement les crédits Suno
 * - Affiche une notification de succès enrichie
 * - Met à jour l'historique en temps réel
 */

import { useSunoCredits } from '@/hooks/useSunoCredits';
import { useEffect } from 'react';

interface GenerationSuccessHandlerProps {
  generatedSong: any | null;
  onCreditsRefreshed?: () => void;
}

export const useGenerationSuccessHandler = ({
  generatedSong,
  onCreditsRefreshed
}: GenerationSuccessHandlerProps) => {
  const { refreshAfterGeneration } = useSunoCredits();

  // ✅ Rafraîchir automatiquement les crédits après génération réussie
  useEffect(() => {
    if (generatedSong?.audioUrl) {
      if (import.meta.env.DEV) console.log('[GenerationSuccessHandler] Génération réussie, rafraîchissement crédits...');
      refreshAfterGeneration();
      onCreditsRefreshed?.();
    }
  }, [generatedSong?.audioUrl, refreshAfterGeneration, onCreditsRefreshed]);

  return {};
};
