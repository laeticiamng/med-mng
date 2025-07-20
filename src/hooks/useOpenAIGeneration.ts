import { useState, useCallback } from 'react';
import { 
  createChatCompletion, 
  generateImage,
  type ChatCompletionRequest,
  type ImageGenerationRequest 
} from '../openai';

export const useOpenAIGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const generateText = useCallback(async (payload: ChatCompletionRequest) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await createChatCompletion(payload);
      setLastResponse(response);
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de génération de texte';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateImageAI = useCallback(async (payload: ImageGenerationRequest) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await generateImage(payload);
      setLastResponse(response);
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de génération d\'image';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const resetGeneration = useCallback(() => {
    setIsGenerating(false);
    setError(null);
    setLastResponse(null);
  }, []);

  return {
    generateText,
    generateImageAI,
    resetGeneration,
    isGenerating,
    error,
    lastResponse
  };
};