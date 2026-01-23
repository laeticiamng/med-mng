import { useState, useCallback, useEffect, useRef } from 'react';

export const useMusicCardState = (isGenerating: boolean) => {
  const [isClicked, setIsClicked] = useState(false);
  const generationStarted = useRef(false);

  // Reset isClicked when generation completes (isGenerating goes from true to false)
  useEffect(() => {
    if (isGenerating) {
      generationStarted.current = true;
    } else if (generationStarted.current) {
      // Generation finished, reset clicked state
      setIsClicked(false);
      generationStarted.current = false;
    }
  }, [isGenerating]);

  const handleGenerateClick = useCallback(async (
    rang: 'A' | 'B',
    onGenerateMusic: () => void | Promise<void>
  ) => {
    if (isClicked || isGenerating) return;
    
    setIsClicked(true);
    
    try {
      await onGenerateMusic();
    } catch {
      // On error, reset the clicked state
      setIsClicked(false);
    }
  }, [isClicked, isGenerating]);

  return {
    isClicked,
    handleGenerateClick
  };
};