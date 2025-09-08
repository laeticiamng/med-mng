// ==========================================
// MED-MNG UNIFIED API SERVICE
// Service centralisé pour toutes les APIs (Suno, OpenAI, ElevenLabs)
// ==========================================

import { appConfig, getAPIConfig } from '../config/AppConfig';
import { PerformanceService } from './PerformanceService';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    requestId: string;
    timestamp: number;
    duration: number;
    rateLimitRemaining?: number;
  };
}

interface MusicGenerationRequest {
  prompt: string;
  style?: string;
  duration?: number;
  model?: string;
  tags?: string[];
}

interface MusicGenerationResponse {
  id: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  audioUrl?: string;
  videoUrl?: string;
  title?: string;
  tags?: string[];
  metadata?: {
    duration: number;
    model: string;
    createdAt: string;
  };
}

interface TextGenerationRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

interface TextGenerationResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface VoiceGenerationRequest {
  text: string;
  voiceId?: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
}

interface VoiceGenerationResponse {
  audioUrl: string;
  duration: number;
  characters: number;
}

class UnifiedAPIService {
  private baseURLs: Map<string, string> = new Map();
  private apiKeys: Map<string, string> = new Map();
  private rateLimiters: Map<string, { requests: number; resetTime: number }> = new Map();
  private performanceService: PerformanceService;

  constructor() {
    this.performanceService = new PerformanceService();
    this.initializeServices();
  }

  private initializeServices() {
    // Initialiser les configurations
    this.baseURLs.set('suno', appConfig.apis.suno.baseURL);
    this.baseURLs.set('openai', appConfig.apis.openai.baseURL);
    this.baseURLs.set('elevenlabs', appConfig.apis.elevenlabs.baseURL);

    // Les clés API seront définies dynamiquement
    this.apiKeys.set('openai', import.meta.env.VITE_OPENAI_API_KEY || '');
    this.apiKeys.set('elevenlabs', import.meta.env.VITE_ELEVENLABS_API_KEY || '');
    this.apiKeys.set('suno', import.meta.env.VITE_SUNO_API_KEY || '');
  }

  private async makeRequest<T>(
    service: 'suno' | 'openai' | 'elevenlabs',
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const startTime = performance.now();
    const requestId = crypto.randomUUID();
    
    try {
      // Vérifier les limites de taux
      await this.checkRateLimit(service);

      const baseURL = this.baseURLs.get(service);
      const apiKey = this.apiKeys.get(service);
      
      if (!apiKey) {
        throw new Error(`Clé API manquante pour ${service}`);
      }

      const config = getAPIConfig(service);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const duration = performance.now() - startTime;

      // Enregistrer les métriques de performance
      this.performanceService.recordAPICall(service, endpoint, duration, true);

      return {
        success: true,
        data,
        metadata: {
          requestId,
          timestamp: Date.now(),
          duration,
          rateLimitRemaining: parseInt(response.headers.get('x-ratelimit-remaining') || '0')
        }
      };

    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Enregistrer l'erreur
      this.performanceService.recordAPICall(service, endpoint, duration, false);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        metadata: {
          requestId,
          timestamp: Date.now(),
          duration
        }
      };
    }
  }

  private async checkRateLimit(service: string): Promise<void> {
    const limit = this.rateLimiters.get(service);
    const config = getAPIConfig(service as any);
    
    if (limit) {
      const now = Date.now();
      
      if (now < limit.resetTime) {
        if (limit.requests >= config.rateLimiting.maxRequests) {
          const waitTime = limit.resetTime - now;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      } else {
        // Reset du compteur
        this.rateLimiters.set(service, {
          requests: 0,
          resetTime: now + config.rateLimiting.windowMs
        });
      }
    } else {
      // Première utilisation
      this.rateLimiters.set(service, {
        requests: 0,
        resetTime: Date.now() + config.rateLimiting.windowMs
      });
    }

    // Incrémenter le compteur
    const current = this.rateLimiters.get(service)!;
    current.requests++;
    this.rateLimiters.set(service, current);
  }

  // ==========================================
  // SUNO API - Génération Musicale
  // ==========================================

  async generateMusic(request: MusicGenerationRequest): Promise<APIResponse<MusicGenerationResponse>> {
    return this.makeRequest('suno', '/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: request.prompt,
        tags: request.style,
        make_instrumental: false,
        wait_audio: false,
        model_version: request.model || 'chirp-v3-5'
      })
    });
  }

  async getMusicStatus(id: string): Promise<APIResponse<MusicGenerationResponse>> {
    return this.makeRequest('suno', `/get?ids=${id}`, {
      method: 'GET'
    });
  }

  async getMusicHistory(page: number = 0): Promise<APIResponse<MusicGenerationResponse[]>> {
    return this.makeRequest('suno', `/get?page=${page}`, {
      method: 'GET'
    });
  }

  // ==========================================
  // OPENAI API - Génération de Texte
  // ==========================================

  async generateText(request: TextGenerationRequest): Promise<APIResponse<TextGenerationResponse>> {
    const messages = [
      ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
      { role: 'user', content: request.prompt }
    ];

    return this.makeRequest('openai', '/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: request.model || 'gpt-4o-mini',
        messages,
        max_tokens: request.maxTokens || 2000,
        temperature: request.temperature || 0.7
      })
    });
  }

  async generateMedicalContent(
    topic: string,
    difficulty: 'débutant' | 'intermédiaire' | 'avancé',
    format: 'quiz' | 'résumé' | 'cas_clinique'
  ): Promise<APIResponse<TextGenerationResponse>> {
    const systemPrompt = `Tu es un expert médical spécialisé dans la création de contenus pédagogiques. 
    Crée du contenu médical précis, à jour et adapté au niveau ${difficulty}.`;

    const userPrompt = `Crée un ${format} sur ${topic} pour un étudiant de niveau ${difficulty}.
    
    Exigences:
    - Contenu scientifiquement exact
    - Adapté au niveau demandé
    - Structure claire et pédagogique
    - Exemples concrets si pertinents
    - Format: ${format}`;

    return this.generateText({
      prompt: userPrompt,
      systemPrompt,
      model: 'gpt-4o',
      temperature: 0.3
    });
  }

  // ==========================================
  // ELEVENLABS API - Synthèse Vocale
  // ==========================================

  async generateVoice(request: VoiceGenerationRequest): Promise<APIResponse<VoiceGenerationResponse>> {
    const voiceId = request.voiceId || '9BWtsMINqrJLrRacOk9x'; // Aria par défaut

    return this.makeRequest('elevenlabs', `/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: request.text,
        model_id: request.model || 'eleven_multilingual_v2',
        voice_settings: {
          stability: request.stability || 0.5,
          similarity_boost: request.similarityBoost || 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });
  }

  async getVoices(): Promise<APIResponse<any[]>> {
    return this.makeRequest('elevenlabs', '/voices', {
      method: 'GET'
    });
  }

  // ==========================================
  // MÉTHODES UTILITAIRES
  // ==========================================

  async testConnection(service: 'suno' | 'openai' | 'elevenlabs'): Promise<boolean> {
    try {
      let testEndpoint = '';
      
      switch (service) {
        case 'openai':
          testEndpoint = '/models';
          break;
        case 'elevenlabs':
          testEndpoint = '/voices';
          break;
        case 'suno':
          testEndpoint = '/get?page=0';
          break;
      }

      const result = await this.makeRequest(service, testEndpoint, { method: 'GET' });
      return result.success;
    } catch {
      return false;
    }
  }

  getServiceStatus(): Record<string, boolean> {
    return {
      suno: !!this.apiKeys.get('suno'),
      openai: !!this.apiKeys.get('openai'),
      elevenlabs: !!this.apiKeys.get('elevenlabs')
    };
  }

  updateAPIKey(service: string, key: string): void {
    this.apiKeys.set(service, key);
  }

  // Nettoyage et optimisation
  clearCache(): void {
    this.rateLimiters.clear();
  }

  getPerformanceMetrics() {
    return this.performanceService.getMetrics();
  }
}

// Instance singleton
export const unifiedAPIService = new UnifiedAPIService();
export default UnifiedAPIService;