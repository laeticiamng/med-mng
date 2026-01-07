import { useCallback } from 'react';

export const useMusicValidation = () => {
  const validateAndNormalizeAudioUrl = useCallback((audioUrl: string): string => {
    if (!audioUrl) {
      console.error('[useMusicValidation] URL audio vide ou null');
      throw new Error('Aucune URL audio reçue de l\'API Suno');
    }

    // URL relative
    if (audioUrl.startsWith('/')) {
      console.log('[useMusicValidation] URL relative détectée:', audioUrl);
      return audioUrl;
    }

    // URL absolue valide
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      // Vérification supplémentaire des domaines connus Suno
      const validDomains = ['cdn.suno.ai', 'cdn1.suno.ai', 'cdn2.suno.ai', 'audiopipe.suno.ai'];
      try {
        const url = new URL(audioUrl);
        const isKnownDomain = validDomains.some(domain => url.hostname.includes(domain));
        if (!isKnownDomain) {
          console.warn('[useMusicValidation] Domaine non reconnu mais accepté:', url.hostname);
        }
      } catch {
        console.warn('[useMusicValidation] Impossible de parser l\'URL, acceptée quand même');
      }
      return audioUrl;
    }

    console.error('[useMusicValidation] URL invalide:', audioUrl);
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
