
export const validateGenerationInput = (
  paroles: string[], 
  selectedStyle: string, 
  rang: 'A' | 'B'
) => {
  if (!selectedStyle) {
    throw new Error('Style musical requis');
  }

  if (!paroles || paroles.length === 0) {
    throw new Error('Paroles manquantes');
  }

  const parolesIndex = rang === 'A' ? 0 : 1;
  const parolesText = paroles[parolesIndex];

  if (!parolesText || parolesText.trim() === '') {
    throw new Error(`Aucune parole disponible pour le Rang ${rang}`);
  }

  return parolesText;
};

export const prepareStyleConfiguration = (selectedStyle: string, duration: number) => {
  const isComposition = selectedStyle.includes('+');
  const styleDescription = isComposition 
    ? `Composition musicale personnalisée combinant plusieurs styles : ${selectedStyle.replace(/\+/g, ' × ')}`
    : selectedStyle;

  const adjustedDuration = isComposition 
    ? duration + (selectedStyle.split('+').length - 1) * 30 
    : duration;

  const minutes = Math.floor(adjustedDuration / 60);
  const seconds = adjustedDuration % 60;
  const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return {
    isComposition,
    styleDescription,
    adjustedDuration,
    durationText
  };
};

export const createRequestBody = (
  parolesText: string,
  selectedStyle: string,
  rang: 'A' | 'B' | 'TRANSPOSE',
  adjustedDuration: number,
  currentLanguage: string,
  isComposition: boolean
) => {
  return {
    lyrics: parolesText,
    style: selectedStyle,
    rang: rang,
    duration: adjustedDuration,
    language: currentLanguage,
    fastMode: true,
    composition: isComposition ? {
      styles: selectedStyle.split('+'),
      fusion_mode: true,
      enhanced_duration: true as const
    } : undefined
  };
};

export const getSuccessMessage = (
  rang: 'A' | 'B',
  durationText: string,
  currentLanguage: string,
  isComposition: boolean
) => {
  const languageName = currentLanguage === 'fr' ? 'français' : currentLanguage;
  const compositionText = isComposition ? ' (Composition Premium)' : '';
  
  return {
    title: `🎉 Musique Suno Rang ${rang} générée !${compositionText}`,
    description: `Chanson de ${durationText} avec paroles chantées générée en ${languageName} via Suno AI !`
  };
};
