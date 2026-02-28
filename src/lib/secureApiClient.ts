/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SECURE API CLIENT - Utilise les routeurs Edge Functions consolidés
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * MIGRATION: Ce client utilise maintenant les routeurs unifiés:
 * - ai-audio pour Suno (musique, voix, traitement audio)
 * - ai-core pour OpenAI (chat, images)
 * 
 * Les anciennes fonctions (generate-music, openai-chat, etc.) sont deprecated.
 */

import { supabase } from '@/integrations/supabase/client';
import { audioApi, coreApi } from './unifiedApiClient';

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
  customMode: boolean;
  instrumental: boolean;
  model: SunoModel;
  prompt?: string;
  style?: string;
  title?: string;
  personaId?: string;
  negativeTags?: string;
  vocalGender?: VocalGender;
  styleWeight?: number;
  weirdnessConstraint?: number;
  audioWeight?: number;
  tags?: string;
  wait_audio?: boolean;
}

/**
 * Client OpenAI sécurisé utilisant le routeur ai-core
 */
export class SecureOpenAIClient {
  async createChatCompletion(request: ChatCompletionRequest) {
    // Utilise le routeur unifié ai-core
    const result = await coreApi.chat(request.messages, {
      model: request.model,
      max_tokens: request.max_tokens,
      temperature: request.temperature
    });

    if (!result.success) {
      throw new Error(`OpenAI API Error: ${result.error}`);
    }

    return result.data;
  }

  async generateImage(request: ImageGenerationRequest) {
    const result = await coreApi.generateImage(request.prompt, {
      size: request.size,
      quality: request.quality,
      n: request.n
    });

    if (!result.success) {
      throw new Error(`OpenAI Image API Error: ${result.error}`);
    }

    return result.data;
  }
}

/**
 * Client Suno sécurisé utilisant le routeur ai-audio
 */
export class SecureSunoClient {
  async generateMusic(request: SunoGenerationRequest) {
    const result = await audioApi.generateMusic({
      lyrics: request.prompt,
      style: request.style,
      customMode: request.customMode,
      instrumental: request.instrumental,
      model: request.model,
      title: request.title,
      negativeTags: request.negativeTags,
      vocalGender: request.vocalGender,
      styleWeight: request.styleWeight
    });

    if (!result.success) {
      throw new Error(`Suno API Error: ${result.error}`);
    }

    return result.data;
  }

  async getGenerationStatus(taskId: string) {
    const result = await audioApi.getStatus(taskId);

    if (!result.success) {
      throw new Error(`Suno Status API Error: ${result.error}`);
    }

    return result.data;
  }

  async extractVocals(taskId: string, audioId: string): Promise<{ vocalsUrl: string; instrumentalUrl: string; taskId?: string }> {
    const result = await audioApi.processAudio('extract_vocals', { taskId, audioId });

    if (!result.success) {
      throw new Error(`Vocal Extraction Error: ${result.error}`);
    }

    return result.data as any;
  }

  async convertToWav(audioUrl: string): Promise<{ wavUrl: string; taskId?: string }> {
    const result = await audioApi.processAudio('convert_wav', { audioUrl });

    if (!result.success) {
      throw new Error(`WAV Conversion Error: ${result.error}`);
    }

    return result.data as any;
  }

  async getRemainingCredits(): Promise<{ credits: number; plan?: string; used?: number; total?: number; remaining?: number }> {
    const result = await audioApi.getCredits();

    if (!result.success) {
      console.warn('Credits check not available:', result.error);
      return { credits: -1 };
    }

    return result.data as any;
  }

  async extendMusic(audioId: string, options: {
    prompt?: string;
    continueAt?: number;
    model?: SunoModel;
    defaultParamFlag?: boolean;
  }): Promise<{ taskId: string }> {
    const result = await audioApi.extendMusic(audioId, options);

    if (!result.success) {
      throw new Error(`Music Extension Error: ${result.error}`);
    }

    return result.data as any;
  }

  async generateLyrics(prompt: string): Promise<{ taskId: string; lyrics?: string }> {
    const result = await audioApi.generateLyrics(prompt);

    if (!result.success) {
      throw new Error(`Lyrics Generation Error: ${result.error}`);
    }

    return result.data as any;
  }

  async uploadAndCover(options: {
    uploadUrl: string;
    style: string;
    title: string;
    prompt?: string;
    instrumental?: boolean;
    model?: SunoModel;
  }): Promise<{ taskId: string }> {
    const { data, error } = await supabase.functions.invoke('ai-audio', {
      body: { action: 'upload_cover', ...options }
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