
import { useState, useRef } from 'react';

interface GeneratingState {
  rangA: boolean;
  rangB: boolean;
}

interface GenerationProgress {
  progress: number;
  attempts: number;
  maxAttempts: number;
  estimatedTimeRemaining?: number;
}

export const useMusicGenerationState = () => {
  const [isGenerating, setIsGenerating] = useState<GeneratingState>({
    rangA: false,
    rangB: false
  });
  const [generatedAudio, setGeneratedAudio] = useState<{ rangA?: string; rangB?: string; rangAB?: string }>({});
  const [generationProgress, setGenerationProgress] = useState<{ 
    rangA?: GenerationProgress; 
    rangB?: GenerationProgress 
  }>({});
  const [lastError, setLastError] = useState<string>('');
  
  // Protection contre les appels multiples
  const generatingRef = useRef<Set<string>>(new Set());

  const setGeneratingState = (rang: 'A' | 'B', isGenerating: boolean) => {
    const rangKey = `rang${rang}` as keyof GeneratingState;
    setIsGenerating(prev => ({ ...prev, [rangKey]: isGenerating }));
    
    // Reset du progress quand la génération s'arrête
    if (!isGenerating) {
      const progressKey = rang === 'A' ? 'rangA' : 'rangB';
      setGenerationProgress(prev => ({ ...prev, [progressKey]: undefined }));
    }
  };

  const setAudioUrl = (rang: 'A' | 'B' | 'AB', url: string) => {
    console.log(`🎵 STATE - setAudioUrl appelé:`, { rang, url, urlValid: url?.startsWith('http') });
    
    const audioKey = rang === 'A' ? 'rangA' : rang === 'B' ? 'rangB' : 'rangAB';
    
    setGeneratedAudio(prev => {
      const newState = {
        ...prev,
        [audioKey]: url
      };
      console.log(`🎵 STATE - Nouvel état generatedAudio:`, newState);
      return newState;
    });
  };

  const updateGenerationProgress = (rang: 'A' | 'B', progress: GenerationProgress) => {
    const progressKey = rang === 'A' ? 'rangA' : 'rangB';
    setGenerationProgress(prev => ({ ...prev, [progressKey]: progress }));
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
    generationProgress,
    lastError,
    setLastError,
    setGeneratingState,
    setAudioUrl,
    updateGenerationProgress,
    isAlreadyGenerating,
    markAsGenerating,
    unmarkAsGenerating
  };
};
