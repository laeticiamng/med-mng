
export const useMusicValidation = () => {
  const validateAndNormalizeAudioUrl = (audioUrl: string): string => {
    if (!audioUrl) {
      throw new Error('Aucune URL audio reçue de l\'API Suno');
    }

    if (audioUrl.startsWith('/')) {
      console.log('🎵 URL RELATIVE DÉTECTÉE:', audioUrl);
      return audioUrl;
    }

    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      console.log('🎵 URL ABSOLUE DÉTECTÉE:', audioUrl);
      return audioUrl;
    }

    throw new Error(`URL audio invalide reçue: ${audioUrl}`);
  };

  return {
    validateAndNormalizeAudioUrl
  };
};
