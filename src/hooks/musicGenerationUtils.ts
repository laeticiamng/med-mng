
export const validateGenerationInput = (
  paroles: string[], 
  selectedStyle: string, 
  rang: 'A' | 'B' | 'AB'
) => {
  if (!selectedStyle) {
    throw new Error('Style musical requis');
  }

  if (!paroles || paroles.length === 0) {
    throw new Error('Paroles manquantes');
  }

  // ✅ CORRECTION 2: Gérer correctement le format des paroles
  let parolesText: string;
  
  if (rang === 'AB') {
    // Pour le Mix A+B, utiliser toutes les paroles
    parolesText = Array.isArray(paroles) ? paroles.join('\n') : String(paroles);
  } else {
    // Pour A ou B, vérifier si c'est un tableau indexé ou un tableau de lignes
    if (typeof paroles[0] === 'string' && paroles.length > 2) {
      // C'est un tableau de lignes de paroles (format generateComprehensiveLyrics)
      parolesText = paroles.join('\n');
    } else {
      // C'est un tableau indexé [parolesA, parolesB]
      const parolesIndex = rang === 'A' ? 0 : 1;
      parolesText = paroles[parolesIndex];
    }
  }

  if (!parolesText || parolesText.trim() === '') {
    throw new Error(`Aucune parole disponible pour le Rang ${rang}`);
  }

  console.log(`✅ Paroles validées pour Rang ${rang}:`, {
    length: parolesText.length,
    preview: parolesText.substring(0, 100) + '...'
  });

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
  rang: 'A' | 'B' | 'AB' | 'TRANSPOSE',
  adjustedDuration: number,
  currentLanguage: string,
  isComposition: boolean,
  itemCode?: string
) => {
  // ✅ CORRECTION 3: Améliorer la structure pour l'API Suno
  const baseRequest = {
    lyrics: parolesText,
    style: selectedStyle,
    rang: rang,
    duration: adjustedDuration,
    language: currentLanguage,
    fastMode: true,
    itemCode: itemCode || 'EDN',
    // Paramètres Suno optimisés
    customMode: true,
    instrumental: false, // Car on a des paroles
    model: "V4", // Utiliser le modèle le plus récent
    title: `${rang === 'AB' ? 'Mix A+B' : `Rang ${rang}`} - ${itemCode || 'EDN'} - ${selectedStyle}`,
    composition: isComposition ? {
      styles: selectedStyle.split('+'),
      fusion_mode: true,
      enhanced_duration: true as const
    } : undefined
  };

  console.log(`🎵 Requête optimisée pour API Suno (Rang ${rang}):`, {
    hasLyrics: !!parolesText,
    lyricsLength: parolesText.length,
    style: selectedStyle,
    duration: adjustedDuration,
    isComposition
  });

  return baseRequest;
};

export const getSuccessMessage = (
  rang: 'A' | 'B' | 'AB',
  durationText: string,
  currentLanguage: string,
  isComposition: boolean
) => {
  const languageName = currentLanguage === 'fr' ? 'français' : currentLanguage;
  const compositionText = isComposition ? ' (Composition Premium)' : '';
  
  return {
    title: `🎉 Musique Suno ${rang === 'AB' ? 'Mix A+B' : `Rang ${rang}`} générée !${compositionText}`,
    description: `Chanson de ${durationText} avec paroles chantées générée en ${languageName} via Suno AI !`
  };
};
