
// ⚠️ DEPRECATED: This hook has been removed for production optimization.
// Use useUnifiedMedicalMusicGeneration from the unified system instead.
export const useMusicGenerationWithTranslation = () => {
  // Removed console.warn for production optimization
  
  // Mock subscription for compatibility
  const getSunoModel = () => 'V3_5';

  const generateMusicInLanguage = async (
    rang: 'A' | 'B' | 'AB',
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240
  ) => {
    // Removed deprecated console.warn for production optimization
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
