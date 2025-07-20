
import { useState, useCallback } from 'react';
import { generateMusic, getMusicStatus, type GenerateMusicPayload, type MusicStatus } from '../suno';

export const useSunoGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [status, setStatus] = useState<MusicStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSong = useCallback(async (payload: GenerateMusicPayload) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await generateMusic(payload);
      setCurrentTask(response.taskId);
      
      // Polling du statut
      const pollStatus = async () => {
        try {
          const statusResponse = await getMusicStatus(response.taskId);
          setStatus(statusResponse);
          
          if (statusResponse.status === 'SUCCESS' || statusResponse.status.includes('FAILED')) {
            setIsGenerating(false);
            return;
          }
          
          // Continuer le polling
          setTimeout(pollStatus, 3000);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erreur de statut');
          setIsGenerating(false);
        }
      };
      
      pollStatus();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de génération');
      setIsGenerating(false);
    }
  }, []);

  const resetGeneration = useCallback(() => {
    setIsGenerating(false);
    setCurrentTask(null);
    setStatus(null);
    setError(null);
  }, []);

  return {
    generateSong,
    resetGeneration,
    isGenerating,
    currentTask,
    status,
    error,
    audioUrl: status?.data?.audio?.[0]?.audio_url,
    progress: status?.status === 'PENDING' ? 0 : 
              status?.status === 'TEXT_SUCCESS' ? 25 :
              status?.status === 'FIRST_SUCCESS' ? 75 :
              status?.status === 'SUCCESS' ? 100 : 0
  };
};
