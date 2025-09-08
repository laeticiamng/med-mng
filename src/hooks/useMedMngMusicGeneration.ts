
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { useMusicGenerationState } from './useMusicGenerationState';
import { 
  validateGenerationInput, 
  prepareStyleConfiguration, 
  createRequestBody, 
  getSuccessMessage 
} from './musicGenerationUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { callSunoApi } from './musicGenerationApi';

// ⚠️ DEPRECATED: This hook has been removed for production optimization.
// Use useUnifiedMedicalMusicGeneration from the unified system instead.
export const useMedMngMusicGeneration = () => {
  // Removed console.warn for production optimization
  
  const { toast } = useToast();
  
  // Simplified state for backward compatibility
  const [isGenerating, setIsGenerating] = useState({
    rangA: false,
    rangB: false,
    rangAB: false
  });
  const [generatedAudio, setGeneratedAudio] = useState({});
  const [lastError, setLastError] = useState('');
  
  const currentLanguage = 'fr';

  const generateMusicInLanguage = async (
    rang: 'A' | 'B', 
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240,
    itemCode?: string
  ) => {
    // Removed deprecated console.log calls for production optimization
    
    toast({
      title: "Fonction dépréciée",
      description: "Cette fonction sera supprimée dans une future version",
      variant: "destructive"
    });
    
    // Mock return for compatibility
    return {
      songId: `mock-${Date.now()}`,
      streamUrl: '',
      title: `${itemCode || 'EDN'} Rang ${rang} - ${selectedStyle}`
    };
  };

  return {
    isGenerating,
    generatedAudio,
    lastError,
    generateMusicInLanguage,
    currentLanguage,
    generationProgress: ''
  };
};
