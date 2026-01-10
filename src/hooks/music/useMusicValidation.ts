import { useCallback } from 'react';

export const useMusicValidation = () => {
  const validateAndNormalizeAudioUrl = useCallback((audioUrl: string): string => {
    if (!audioUrl) {
      throw new Error('Aucune URL audio reçue de l\'API Suno');
    }

    // URL relative
    if (audioUrl.startsWith('/')) {
      return audioUrl;
    }

    // URL absolue valide
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      return audioUrl;
    }

    throw new Error(`URL audio invalide reçue: ${audioUrl}`);
  }, []);

  const isValidAudioUrl = useCallback((url: string | undefined | null): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
  }, []);

  return {
    validateAndNormalizeAudioUrl,
    isValidAudioUrl
  };
};
