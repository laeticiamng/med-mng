/**
 * 🎙️ Whisper API Client
 * 
 * Transcription audio via OpenAI Whisper
 * - Transcription de notes vocales
 * - Conversion cours audio → texte
 * - Reconnaissance vocale multilingue
 */

import { supabase } from '@/integrations/supabase/client';

type TranscribeOptions = {
  language?: string; // 'fr', 'en', etc.
  prompt?: string; // Contexte pour améliorer la transcription
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number; // 0-1, plus bas = plus déterministe
};

type TranscribeResponse = {
  success: boolean;
  text?: string;
  duration?: number;
  language?: string;
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
  error?: string;
};

export const whisperApi = {
  /**
   * Transcrire un fichier audio depuis base64
   * @example whisperApi.transcribeBase64(audioBase64, { language: 'fr' })
   */
  async transcribeBase64(
    audioBase64: string, 
    options?: TranscribeOptions
  ): Promise<TranscribeResponse> {
    const { data, error } = await supabase.functions.invoke('whisper-transcribe', {
      body: { 
        audioBase64, 
        language: options?.language || 'fr',
        prompt: options?.prompt,
        response_format: options?.response_format || 'verbose_json',
        temperature: options?.temperature ?? 0,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  /**
   * Transcrire un fichier audio depuis une URL
   * @example whisperApi.transcribeUrl('https://storage.supabase.io/audio.webm')
   */
  async transcribeUrl(
    audioUrl: string, 
    options?: TranscribeOptions
  ): Promise<TranscribeResponse> {
    const { data, error } = await supabase.functions.invoke('whisper-transcribe', {
      body: { 
        audioUrl, 
        language: options?.language || 'fr',
        prompt: options?.prompt,
        response_format: options?.response_format || 'verbose_json',
        temperature: options?.temperature ?? 0,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  /**
   * Transcrire un Blob audio (depuis l'enregistrement navigateur)
   * @example whisperApi.transcribeBlob(audioBlob, { language: 'fr' })
   */
  async transcribeBlob(
    blob: Blob, 
    options?: TranscribeOptions
  ): Promise<TranscribeResponse> {
    // Convert blob to base64
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);

    return this.transcribeBase64(base64, options);
  },

  /**
   * Transcrire avec contexte médical
   * @example whisperApi.transcribeMedical(audioBlob)
   */
  async transcribeMedical(blob: Blob): Promise<TranscribeResponse> {
    return this.transcribeBlob(blob, {
      language: 'fr',
      prompt: 'Transcription de cours de médecine. Vocabulaire médical: pathologie, diagnostic, traitement, symptômes, examen clinique, biologie, imagerie.',
      temperature: 0,
    });
  },
};

export type { TranscribeOptions, TranscribeResponse };
