
import { useState } from 'react';
import { logger } from '@/utils/structuredLogger';

export const useMusicCardState = (isGenerating: boolean) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleGenerateClick = async (
    rang: 'A' | 'B' | 'AB',
    onGenerateMusic: () => void
  ) => {
    if (isClicked || isGenerating) {
      logger.debug('Clic génération ignoré', {
        component: 'useMusicCardState',
        metadata: { rang, isClicked, isGenerating }
      });
      return;
    }
    
    setIsClicked(true);
    logger.info('Génération musique démarrée', {
      component: 'useMusicCardState',
      metadata: { rang }
    });
    
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
