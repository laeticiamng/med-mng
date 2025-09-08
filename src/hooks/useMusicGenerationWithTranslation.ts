
// ⚠️ DEPRECATED: Use useUnifiedMedicalMusicGeneration instead
export const useMusicGenerationWithTranslation = () => {
  console.warn('🚨 useMusicGenerationWithTranslation is deprecated. Use useUnifiedMedicalMusicGeneration instead.');
  
  // Mock subscription for compatibility
  const getSunoModel = () => 'V3_5';

  const generateMusicInLanguage = async (
    rang: 'A' | 'B' | 'AB',
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240
  ) => {
    console.warn('🚨 Deprecated function. Use useUnifiedMedicalMusicGeneration instead.');
    return '';
  };

  return {
    generateMusicInLanguage,
    isGenerating: false,
    generatedAudio: {},
    lastError: '',
    generationProgress: '',
    currentLanguage: 'fr'
  };
};
