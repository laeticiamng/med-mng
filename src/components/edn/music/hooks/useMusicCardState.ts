import { useState, useCallback } from 'react';

export const useMusicCardState = (isGenerating: boolean) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleGenerateClick = useCallback((
    rang: 'A' | 'B',
    onGenerateMusic: () => void | Promise<void>
  ) => {
    if (isClicked || isGenerating) return;
    
    setIsClicked(true);
    
    try {
      onGenerateMusic();
    } finally {
      setTimeout(() => setIsClicked(false), 2000);
    }
  }, [isClicked, isGenerating]);

  return {
    isClicked,
    handleGenerateClick
  };
};
