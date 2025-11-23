
import { useState, useCallback } from 'react';
import { generateMusic, type GenerateMusicPayload } from '@shared/music/generate';
import { useMusicGenerationStatus } from './useMusicGenerationStatus';

export const useSunoGeneration = () => {
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Utiliser le nouveau hook de polling
  const {
    status,
    isPolling,
    startPolling,
    stopPolling,
    isGenerating,
    isCompleted,
    isFailed,
    progress,
    audioUrl,
    streamUrl,
    imageUrl
  } = useMusicGenerationStatus(currentTaskId);

  const generateSong = useCallback(async (payload: GenerateMusicPayload) => {
    try {
      setError(null);
      
      console.log('🚀 Démarrage génération avec payload:', payload);
      
      // Appeler l'API qui retourne immédiatement un taskId
      const response = await generateMusic(payload);
      
      if (response?.trackId) {
        console.log('✅ TaskID reçu:', response.trackId);
        setCurrentTaskId(response.trackId);
        
        // Démarrer le polling automatique
        setTimeout(() => startPolling(), 100); // Petit délai pour que le hook soit prêt
        
        return response.trackId;
      } else {
        throw new Error('Aucun taskId reçu de l\'API');
      }
      
    } catch (err) {
      console.error('❌ Erreur génération:', err);
      setError(err instanceof Error ? err.message : 'Erreur de génération');
      throw err;
    }
  }, [startPolling]);

  const resetGeneration = useCallback(() => {
    setCurrentTaskId(null);
    setError(null);
    stopPolling();
  }, [stopPolling]);

  return {
    generateSong,
    resetGeneration,
    
    // Statuts principaux
    isGenerating: isGenerating && !error,
    currentTask: currentTaskId,
    error,
    
    // Données de la génération
    audioUrl,
    streamUrl, 
    imageUrl,
    progress,
    
    // Statuts détaillés
    isCompleted,
    isFailed,
    isPolling,
    status: status?.status,
    metadata: status?.metadata,
    
    // Actions
    startPolling,
    stopPolling
  };
};
