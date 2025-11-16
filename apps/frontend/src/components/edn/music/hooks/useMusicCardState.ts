
import { useState } from 'react';

export const useMusicCardState = (isGenerating: boolean) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleGenerateClick = async (
    rang: 'A' | 'B',
    onGenerateMusic: () => void
  ) => {
    if (isClicked || isGenerating) {
      console.log(`⚠️ Clic ignoré - isClicked: ${isClicked}, isGenerating: ${isGenerating}`);
      return;
    }
    
    setIsClicked(true);
    console.log(`🎵 Clic génération Rang ${rang}`);
    
    try {
      await onGenerateMusic();
    } finally {
      setTimeout(() => setIsClicked(false), 2000);
    }
  };

  return {
    isClicked,
    handleGenerateClick
  };
};
