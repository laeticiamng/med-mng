
import { useState, useRef } from 'react';

interface GeneratingState {
  rangA: boolean;
  rangB: boolean;
}

export const useMusicGenerationState = () => {
  const [isGenerating, setIsGenerating] = useState<GeneratingState>({
    rangA: false,
    rangB: false
  });
  const [generatedAudio, setGeneratedAudio] = useState<{ rangA?: string; rangB?: string }>({});
  const [lastError, setLastError] = useState<string>('');
  
  // Protection contre les appels multiples
  const generatingRef = useRef<Set<string>>(new Set());

  const setGeneratingState = (rang: 'A' | 'B', isGenerating: boolean) => {
    const rangKey = `rang${rang}` as keyof GeneratingState;
    setIsGenerating(prev => ({ ...prev, [rangKey]: isGenerating }));
  };

  const setAudioUrl = (rang: 'A' | 'B', url: string) => {
    const audioKey = rang === 'A' ? 'rangA' : 'rangB';
    setGeneratedAudio(prev => ({
      ...prev,
      [audioKey]: url
    }));
  };

  const isAlreadyGenerating = (rang: 'A' | 'B') => {
    return generatingRef.current.has(rang);
  };

  const markAsGenerating = (rang: 'A' | 'B') => {
    generatingRef.current.add(rang);
  };

  const unmarkAsGenerating = (rang: 'A' | 'B') => {
    generatingRef.current.delete(rang);
  };

  return {
    isGenerating,
    generatedAudio,
    lastError,
    setLastError,
    setGeneratingState,
    setAudioUrl,
    isAlreadyGenerating,
    markAsGenerating,
    unmarkAsGenerating
  };
};
