import { useState } from 'react';

export const useMusicCardState = (isGenerating: boolean) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleGenerateClick = async (
    rang: 'A' | 'B',
    onGenerateMusic: () => void
  ) => {
    if (isClicked || isGenerating) return;
    
    setIsClicked(true);
    
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
