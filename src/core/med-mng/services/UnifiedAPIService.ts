/**
 * ⚡ Service API Unifié MED-MNG
 * Centralise toutes les intégrations externes (Suno, OpenAI, ElevenLabs)
 */

import { MED_MNG_CONFIG } from '../config/AppConfig';
import { logger } from '@/utils/logger';

// Types unifiés
export interface MusicGenerationRequest {
  prompt: string;
  style?: string;
  duration?: number;
  model?: string;
  voice?: string;
}

export interface MusicGenerationResponse {
  id: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  audio_url?: string;
  video_url?: string;
  progress?: number;
  error?: string;
  metadata?: {
    duration: number;
    title: string;
    tags: string[];
  };
}

export interface TextGenerationRequest {
  prompt: string;
  model: string;
  max_tokens?: number;
  temperature?: number;
  context?: string;
}

export interface TextToSpeechRequest {
  text: string;
  voice: string;
  model?: string;
  speed?: number;
}

class UnifiedAPIService {
  private sunoApiKey: string | null = null;
  private openaiApiKey: string | null = null;
  private elevenLabsApiKey: string | null = null;

  constructor() {
    this.loadApiKeys();
  }

  private loadApiKeys() {
    // Charger les clés API depuis les variables d'environnement ou Supabase
    this.sunoApiKey = process.env.SUNO_API_KEY || null;
    this.openaiApiKey = process.env.OPENAI_API_KEY || null;
    this.elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY || null;
  }

  // 🎵 SUNO AI - Génération musicale
  async generateMusic(request: MusicGenerationRequest): Promise<MusicGenerationResponse> {
    try {
      logger.info('Generating music with Suno AI', 'UnifiedAPIService', request);

      if (!this.sunoApiKey) {
        throw new Error('Suno API key not configured');
      }

      const response = await fetch(`${MED_MNG_CONFIG.APIS.SUNO.BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sunoApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          model: request.model || MED_MNG_CONFIG.APIS.SUNO.MODELS.DEFAULT,
          duration: Math.min(request.duration || 120, MED_MNG_CONFIG.APIS.SUNO.LIMITS.MAX_DURATION),
          style: request.style || 'educational',
          make_instrumental: false,
          wait_audio: false
        }),
      });

      if (!response.ok) {
        throw new Error(`Suno API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      logger.info('Music generation initiated', 'UnifiedAPIService', { id: data.id });
      
      return {
        id: data.id,
        status: 'queued',
        progress: 0,
        metadata: {
          duration: request.duration || 120,
          title: this.extractTitleFromPrompt(request.prompt),
          tags: this.extractTagsFromPrompt(request.prompt)
        }
      };

    } catch (error) {
      logger.error('Music generation failed', 'UnifiedAPIService', error);
      throw error;
    }
  }

  async getMusicGenerationStatus(id: string): Promise<MusicGenerationResponse> {
    try {
      if (!this.sunoApiKey) {
        throw new Error('Suno API key not configured');
      }

      const response = await fetch(`${MED_MNG_CONFIG.APIS.SUNO.BASE_URL}/get?ids=${id}`, {
        headers: {
          'Authorization': `Bearer ${this.sunoApiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Suno API error: ${response.status}`);
      }

      const data = await response.json();
      const track = data[0];

      return {
        id: track.id,
        status: track.status,
        audio_url: track.audio_url,
        video_url: track.video_url,
        progress: this.calculateProgress(track.status),
        metadata: {
          duration: track.duration || 0,
          title: track.title,
          tags: track.tags || []
        }
      };

    } catch (error) {
      logger.error('Failed to get music status', 'UnifiedAPIService', error);
      throw error;
    }
  }

  // 🤖 OpenAI - Génération de texte et TTS
  async generateText(request: TextGenerationRequest): Promise<string> {
    try {
      logger.info('Generating text with OpenAI', 'UnifiedAPIService', { model: request.model });

      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          messages: [
            { role: 'system', content: request.context || 'You are a medical education expert.' },
            { role: 'user', content: request.prompt }
          ],
          max_completion_tokens: request.max_tokens || 1000,
          // Note: temperature not supported in GPT-5 models
          ...(request.model.includes('gpt-4') && { temperature: request.temperature || 0.7 })
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      logger.error('Text generation failed', 'UnifiedAPIService', error);
      throw error;
    }
  }

  async generateSpeech(request: TextToSpeechRequest): Promise<ArrayBuffer> {
    try {
      logger.info('Generating speech with OpenAI TTS', 'UnifiedAPIService', { voice: request.voice });

      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model || MED_MNG_CONFIG.APIS.OPENAI.MODELS.TTS,
          input: request.text,
          voice: request.voice,
          speed: request.speed || 1.0,
          response_format: 'mp3'
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI TTS error: ${response.status}`);
      }

      return await response.arrayBuffer();

    } catch (error) {
      logger.error('Speech generation failed', 'UnifiedAPIService', error);
      throw error;
    }
  }

  // 🎙️ ElevenLabs - TTS avancé
  async generateSpeechElevenLabs(request: TextToSpeechRequest): Promise<ArrayBuffer> {
    try {
      logger.info('Generating speech with ElevenLabs', 'UnifiedAPIService', { voice: request.voice });

      if (!this.elevenLabsApiKey) {
        throw new Error('ElevenLabs API key not configured');
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${request.voice}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': this.elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          model_id: request.model || MED_MNG_CONFIG.APIS.ELEVEN_LABS.MODELS.MULTILINGUAL,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.5,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      return await response.arrayBuffer();

    } catch (error) {
      logger.error('ElevenLabs speech generation failed', 'UnifiedAPIService', error);
      throw error;
    }
  }

  // 🛠️ Méthodes utilitaires
  private extractTitleFromPrompt(prompt: string): string {
    const match = prompt.match(/(?:titre|title|item|sujet)[\s:]*([^,\n.]{5,50})/i);
    return match ? match[1].trim() : 'Contenu médical musical';
  }

  private extractTagsFromPrompt(prompt: string): string[] {
    const medicalKeywords = [
      'cardiologie', 'neurologie', 'psychiatrie', 'pédiatrie',
      'gynécologie', 'obstétrique', 'urgences', 'médecine'
    ];
    
    const tags = medicalKeywords.filter(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
    
    return tags.length > 0 ? tags : ['médical', 'éducatif'];
  }

  private calculateProgress(status: string): number {
    switch (status) {
      case 'queued': return 10;
      case 'generating': return 50;
      case 'completed': return 100;
      case 'failed': return 0;
      default: return 0;
    }
  }

  // 🔧 Configuration des clés API
  setApiKey(service: 'suno' | 'openai' | 'elevenlabs', key: string) {
    switch (service) {
      case 'suno':
        this.sunoApiKey = key;
        break;
      case 'openai':
        this.openaiApiKey = key;
        break;
      case 'elevenlabs':
        this.elevenLabsApiKey = key;
        break;
    }
    logger.info(`API key configured for ${service}`, 'UnifiedAPIService');
  }

  // 🔍 Vérification de l'état des services
  async checkServiceHealth() {
    const services = {
      suno: false,
      openai: false,
      elevenlabs: false
    };

    try {
      // Test Suno
      if (this.sunoApiKey) {
        const response = await fetch(`${MED_MNG_CONFIG.APIS.SUNO.BASE_URL}/credits`, {
          headers: { 'Authorization': `Bearer ${this.sunoApiKey}` }
        });
        services.suno = response.ok;
      }
    } catch (error) {
      logger.warn('Suno health check failed', 'UnifiedAPIService', error);
    }

    try {
      // Test OpenAI
      if (this.openaiApiKey) {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${this.openaiApiKey}` }
        });
        services.openai = response.ok;
      }
    } catch (error) {
      logger.warn('OpenAI health check failed', 'UnifiedAPIService', error);
    }

    try {
      // Test ElevenLabs
      if (this.elevenLabsApiKey) {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: { 'xi-api-key': this.elevenLabsApiKey }
        });
        services.elevenlabs = response.ok;
      }
    } catch (error) {
      logger.warn('ElevenLabs health check failed', 'UnifiedAPIService', error);
    }

    return services;
  }
}

// Instance singleton
export const unifiedAPIService = new UnifiedAPIService();