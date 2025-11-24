import logger from '@/lib/logger';


export const useMusicValidation = () => {
  const validateAndNormalizeAudioUrl = (audioUrl: string): string => {
    if (!audioUrl) {
      throw new Error('Aucune URL audio reçue de l\'API Suno');
    }

    if (audioUrl.startsWith('/')) {
      logger.debug('🎵 URL RELATIVE DÉTECTÉE:', audioUrl);
      return audioUrl;
    }

    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      logger.debug('🎵 URL ABSOLUE DÉTECTÉE:', audioUrl);
      return audioUrl;
    }

    throw new Error(`URL audio invalide reçue: ${audioUrl}`);
  };

  return {
    validateAndNormalizeAudioUrl
  };
};
