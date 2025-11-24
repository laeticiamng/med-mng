
import logger from '@/lib/logger';
import { useState, useRef } from 'react';

interface GeneratingState {
  rangA: boolean;
  rangB: boolean;
  rangAB: boolean;
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
    rangB: false,
    rangAB: false
  });
  const [generatedAudio, setGeneratedAudio] = useState<{ 
    rangA?: string; rangB?: string; rangAB?: string;
    rangA_v1?: string; rangA_v2?: string;
    rangB_v1?: string; rangB_v2?: string; 
    rangAB_v1?: string; rangAB_v2?: string;
  }>({});
  const [generationProgress, setGenerationProgress] = useState<{ 
    rangA?: GenerationProgress; 
    rangB?: GenerationProgress;
    rangAB?: GenerationProgress;
  }>({});
  const [lastError, setLastError] = useState<string>('');
  
  // Protection contre les appels multiples
  const generatingRef = useRef<Set<string>>(new Set());

  const setGeneratingState = (rang: 'A' | 'B' | 'AB', isGenerating: boolean) => {
    const rangKey = `rang${rang}` as keyof GeneratingState;
    setIsGenerating(prev => ({ ...prev, [rangKey]: isGenerating }));
    
    // Reset du progress quand la génération s'arrête
    if (!isGenerating) {
      const progressKey = rang === 'A' ? 'rangA' : rang === 'B' ? 'rangB' : 'rangAB';
      setGenerationProgress(prev => ({ ...prev, [progressKey]: undefined }));
    }
  };

  const setAudioUrl = (rang: 'A' | 'B' | 'AB', url: string) => {
    logger.debug(`🎵 STATE - setAudioUrl appelé:`, { rang, url, urlValid: url?.startsWith('http') });
    
    const audioKey = rang === 'A' ? 'rangA' : rang === 'B' ? 'rangB' : 'rangAB';
    
    setGeneratedAudio(prev => {
      const newState = {
        ...prev,
        [audioKey]: url
      };
      logger.debug(`🎵 STATE - Nouvel état generatedAudio:`, newState);
      return newState;
    });
  };

  const updateGenerationProgress = (rang: 'A' | 'B' | 'AB', progress: GenerationProgress) => {
    const progressKey = rang === 'A' ? 'rangA' : rang === 'B' ? 'rangB' : 'rangAB';
    setGenerationProgress(prev => ({ ...prev, [progressKey]: progress }));
  };

  const isAlreadyGenerating = (rang: 'A' | 'B' | 'AB') => {
    return generatingRef.current.has(rang);
  };

  const markAsGenerating = (rang: 'A' | 'B' | 'AB') => {
    generatingRef.current.add(rang);
  };

  const unmarkAsGenerating = (rang: 'A' | 'B' | 'AB') => {
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
