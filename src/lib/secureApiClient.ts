// Secure API client that uses edge functions instead of direct API calls
// This replaces the insecure openaiClient.ts and sunoClient.ts

import { supabase } from '@/integrations/supabase/client';

export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    name?: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  user?: string;
  functions?: any[];
  function_call?: any;
  tools?: any[];
  tool_choice?: any;
}

export interface ImageGenerationRequest {
  prompt: string;
  size?: string;
  quality?: string;
  n?: number;
}

// Types Suno selon documentation officielle 2024
export type SunoModel = 'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5';
export type VocalGender = 'm' | 'f';

export interface SunoGenerationRequest {
  // Paramètres requis
  customMode: boolean;
  instrumental: boolean;
  model: SunoModel;
  
  // Paramètres conditionnels
  prompt?: string;      // Paroles si customMode=true + instrumental=false
  style?: string;       // Requis si customMode=true (max 200/1000 chars selon modèle)
  title?: string;       // Requis si customMode=true (max 80/100 chars selon modèle)
  
  // Nouveaux paramètres V4.5+ optionnels
  personaId?: string;           // ID de persona pour style personnalisé
  negativeTags?: string;        // Styles à éviter
  vocalGender?: VocalGender;    // Genre vocal préféré
  styleWeight?: number;         // Poids du style (0.00-1.00)
  weirdnessConstraint?: number; // Contrainte de créativité (0.00-1.00)
  audioWeight?: number;         // Poids de l'audio d'entrée (0.00-1.00)
  
  // Legacy (gardés pour compatibilité)
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
    const { data, error } = await supabase.functions.invoke('generate-music', {
      body: request
    });

    if (error) {
      throw new Error(`Suno API Error: ${error.message}`);
    }

    return data;
  }

  async getGenerationStatus(audioId: string) {
    const { data, error } = await supabase.functions.invoke('music-status', {
      body: { taskId: audioId }
    });

    if (error) {
      throw new Error(`Suno Status API Error: ${error.message}`);
    }

    return data;
  }

  // Vocal extraction - removes vocals from a track
  // Selon doc Suno: requiert taskId + audioId (pas juste audioUrl)
  async extractVocals(taskId: string, audioId: string): Promise<{ vocalsUrl: string; instrumentalUrl: string; taskId?: string }> {
    const { data, error } = await supabase.functions.invoke('suno-audio-processing', {
      body: { action: 'extract_vocals', taskId, audioId }
    });

    if (error) {
      throw new Error(`Vocal Extraction Error: ${error.message}`);
    }

    return data;
  }

  // WAV conversion - converts audio to WAV format
  async convertToWav(audioUrl: string): Promise<{ wavUrl: string; taskId?: string }> {
    const { data, error } = await supabase.functions.invoke('suno-audio-processing', {
      body: { action: 'convert_wav', audioUrl }
    });

    if (error) {
      throw new Error(`WAV Conversion Error: ${error.message}`);
    }

    return data;
  }

  // ✅ Vérifier les crédits Suno restants
  // Endpoint: GET /api/v1/get-credits
  async getRemainingCredits(): Promise<{ credits: number; plan?: string; used?: number; total?: number; remaining?: number }> {
    const { data, error } = await supabase.functions.invoke('suno-credits', {
      body: {}
    });

    if (error) {
      console.warn('Credits check not available:', error.message);
      return { credits: -1 }; // -1 = inconnu
    }

    return data;
  }

  // ✅ NOUVEAU: Étendre une musique existante
  async extendMusic(audioId: string, options: {
    prompt?: string;
    continueAt?: number;
    model?: SunoModel;
    defaultParamFlag?: boolean;
  }): Promise<{ taskId: string }> {
    const { data, error } = await supabase.functions.invoke('suno-extend-music', {
      body: { audioId, ...options }
    });

    if (error) {
      throw new Error(`Music Extension Error: ${error.message}`);
    }

    return data;
  }

  // ✅ NOUVEAU: Générer des paroles avec Suno AI
  async generateLyrics(prompt: string): Promise<{ taskId: string; lyrics?: string }> {
    const { data, error } = await supabase.functions.invoke('suno-generate-lyrics', {
      body: { prompt }
    });

    if (error) {
      throw new Error(`Lyrics Generation Error: ${error.message}`);
    }

    return data;
  }
  // ✅ NOUVEAU: Upload & Cover - Transformer un audio avec un nouveau style
  async uploadAndCover(options: {
    uploadUrl: string;
    style: string;
    title: string;
    prompt?: string;
    instrumental?: boolean;
    model?: SunoModel;
  }): Promise<{ taskId: string }> {
    const { data, error } = await supabase.functions.invoke('suno-upload-cover', {
      body: options
    });

    if (error) {
      throw new Error(`Upload & Cover Error: ${error.message}`);
    }

    return data;
  }
}

// Export singleton instances
export const secureOpenAIClient = new SecureOpenAIClient();
export const secureSunoClient = new SecureSunoClient();