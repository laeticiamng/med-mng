
import logger from '@/lib/logger';
import { useState } from 'react';

export const useMusicCardState = (isGenerating: boolean) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleGenerateClick = async (
    rang: 'A' | 'B',
    onGenerateMusic: () => void
  ) => {
    if (isClicked || isGenerating) {
      logger.debug(`⚠️ Clic ignoré - isClicked: ${isClicked}, isGenerating: ${isGenerating}`);
      return;
    }
    
    setIsClicked(true);
    logger.debug(`🎵 Clic génération Rang ${rang}`);
    
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
