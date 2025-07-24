// Secure API client that uses edge functions instead of direct API calls
// This replaces the insecure openaiClient.ts and sunoClient.ts

import { supabase } from '@/integrations/supabase/client';

export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
}

export interface ImageGenerationRequest {
  prompt: string;
  size?: string;
  quality?: string;
  n?: number;
}

export interface SunoGenerationRequest {
  prompt: string;
  title?: string;
  tags?: string;
  wait_audio?: boolean;
}

// Secure OpenAI API client using edge functions
export class SecureOpenAIClient {
  async createChatCompletion(request: ChatCompletionRequest) {
    const { data, error } = await supabase.functions.invoke('openai-chat', {
      body: request
    });

    if (error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }

    return data;
  }

  async generateImage(request: ImageGenerationRequest) {
    const { data, error } = await supabase.functions.invoke('openai-image', {
      body: request
    });

    if (error) {
      throw new Error(`OpenAI Image API Error: ${error.message}`);
    }

    return data;
  }
}

// Secure Suno API client using edge functions
export class SecureSunoClient {
  async generateMusic(request: SunoGenerationRequest) {
    const { data, error } = await supabase.functions.invoke('suno-music-optimized', {
      body: request
    });

    if (error) {
      throw new Error(`Suno API Error: ${error.message}`);
    }

    return data;
  }

  async getGenerationStatus(audioId: string) {
    const { data, error } = await supabase.functions.invoke('suno-music-optimized', {
      body: { action: 'status', audioId }
    });

    if (error) {
      throw new Error(`Suno Status API Error: ${error.message}`);
    }

    return data;
  }
}

// Export singleton instances
export const secureOpenAIClient = new SecureOpenAIClient();
export const secureSunoClient = new SecureSunoClient();