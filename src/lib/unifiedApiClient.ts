/**
 * 🚀 Unified API Client - Client unifié pour les Edge Functions routeurs
 * 
 * Ce client remplace les appels directs aux anciennes fonctions individuelles
 * par des appels aux nouvelles fonctions routeurs consolidées.
 * 
 * MIGRATION: 
 * - Avant: supabase.functions.invoke('generate-music', { body: {...} })
 * - Après: unifiedApi.audio.generateMusic({...})
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

type SunoModel = 'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5';
type VocalGender = 'm' | 'f';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// AI-AUDIO ACTIONS
// ============================================================================

export const audioApi = {
  /**
   * Générer une musique via Suno
   */
  async generateMusic(params: {
    lyrics?: string;
    style?: string;
    rang?: string;
    duration?: number;
    language?: string;
    itemCode?: string;
    customMode?: boolean;
    instrumental?: boolean;
    model?: SunoModel;
    title?: string;
    negativeTags?: string;
    vocalGender?: VocalGender;
    styleWeight?: number;
  }): Promise<ApiResponse<{ trackId: string; metadata: any }>> {
    const { data, error } = await supabase.functions.invoke('ai-audio', {
      body: { action: 'generate_music', payload: params }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Vérifier le statut d'une génération
   */
  async getStatus(taskId: string): Promise<ApiResponse<{
    status: 'generating' | 'completed' | 'failed';
    audioUrl?: string;
    streamUrl?: string;
    imageUrl?: string;
  }>> {
    const { data, error } = await supabase.functions.invoke('ai-audio', {
      body: { action: 'get_status', payload: { taskId } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Étendre une musique existante
   */
  async extendMusic(audioId: string, options?: {
    prompt?: string;
    continueAt?: number;
    model?: SunoModel;
  }): Promise<ApiResponse<{ taskId: string }>> {
    const { data, error } = await supabase.functions.invoke('ai-audio', {
      body: { action: 'extend', payload: { audioId, ...options } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Générer des paroles avec Suno
   */
  async generateLyrics(prompt: string): Promise<ApiResponse<{ taskId: string; lyrics?: string }>> {
    const { data, error } = await supabase.functions.invoke('ai-audio', {
      body: { action: 'generate_lyrics', payload: { prompt } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Vérifier les crédits Suno
   */
  async getCredits(): Promise<ApiResponse<{ credits: number; plan?: string }>> {
    const { data, error } = await supabase.functions.invoke('ai-audio', {
      body: { action: 'get_credits' }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Traitement audio (extraction vocale, conversion WAV)
   */
  async processAudio(operation: 'extract_vocals' | 'convert_wav', params: {
    taskId?: string;
    audioId?: string;
    audioUrl?: string;
  }): Promise<ApiResponse> {
    const { data, error } = await supabase.functions.invoke('ai-audio', {
      body: { action: 'process_audio', payload: { operation, ...params } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Générer une voix avec ElevenLabs
   */
  async generateVoice(text: string, options?: {
    voiceId?: string;
    model?: string;
    settings?: {
      stability?: number;
      similarityBoost?: number;
      style?: number;
    };
  }): Promise<ApiResponse<{ audioBase64: string; metadata: any }>> {
    const { data, error } = await supabase.functions.invoke('ai-audio', {
      body: { action: 'generate_voice', payload: { text, ...options } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Gérer les playlists
   */
  async managePlaylist(operation: 'create' | 'add_tracks' | 'list', params?: {
    playlistId?: string;
    name?: string;
    trackIds?: string[];
  }): Promise<ApiResponse> {
    const { data, error } = await supabase.functions.invoke('ai-audio', {
      body: { action: 'manage_playlist', payload: { operation, ...params } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  }
};

// ============================================================================
// AI-CORE ACTIONS
// ============================================================================

export const coreApi = {
  /**
   * Chat OpenAI complet
   */
  async chat(messages: Array<{ role: string; content: string }>, options?: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
  }): Promise<ApiResponse> {
    const { data, error } = await supabase.functions.invoke('ai-core', {
      body: { action: 'chat', payload: { messages, ...options } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Chat simplifié (retourne juste le contenu)
   */
  async chatSimple(messages: Array<{ role: string; content: string }>): Promise<ApiResponse<{ content: string }>> {
    const { data, error } = await supabase.functions.invoke('ai-core', {
      body: { action: 'chat_simple', payload: { messages } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Chat médical contextualisé
   */
  async medicalChat(messages: Array<{ role: string; content: string }>, options?: {
    context?: string;
    specialty?: string;
  }): Promise<ApiResponse<{ content: string }>> {
    const { data, error } = await supabase.functions.invoke('ai-core', {
      body: { action: 'medical_chat', payload: { messages, ...options } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Chat contextuel avec item médical
   */
  async contextualChat(messages: Array<{ role: string; content: string }>, options?: {
    itemCode?: string;
    context?: string;
  }): Promise<ApiResponse<{ content: string }>> {
    const { data, error } = await supabase.functions.invoke('ai-core', {
      body: { action: 'contextual_chat', payload: { messages, ...options } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Tuteur IA
   */
  async tutor(topic: string, options?: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    mode?: 'explain' | 'quiz' | 'case' | 'summary';
  }): Promise<ApiResponse<{ content: string }>> {
    const { data, error } = await supabase.functions.invoke('ai-core', {
      body: { action: 'tutor', payload: { topic, ...options } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Recommandations personnalisées
   */
  async getRecommendations(options?: {
    category?: string;
    limit?: number;
  }): Promise<ApiResponse<{ recommendations: any[] }>> {
    const { data, error } = await supabase.functions.invoke('ai-core', {
      body: { action: 'recommendations', payload: options }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Générer un QCM
   */
  async generateQCM(topic: string, options?: {
    difficulty?: string;
    count?: number;
    item_code?: string;
  }): Promise<ApiResponse<{ questions: any[] }>> {
    const { data, error } = await supabase.functions.invoke('ai-core', {
      body: { action: 'generate_qcm', payload: { topic, ...options } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Générer un cas clinique
   */
  async generateClinicalCase(specialty: string, options?: {
    difficulty?: string;
    learning_objectives?: string;
  }): Promise<ApiResponse<{ clinical_case: any }>> {
    const { data, error } = await supabase.functions.invoke('ai-core', {
      body: { action: 'generate_clinical_case', payload: { specialty, ...options } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Générer une image
   */
  async generateImage(prompt: string, options?: {
    size?: string;
    quality?: string;
    n?: number;
  }): Promise<ApiResponse<{ images: string[] }>> {
    const { data, error } = await supabase.functions.invoke('ai-core', {
      body: { action: 'generate_image', payload: { prompt, ...options } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Traduire du texte
   */
  async translate(text: string, options?: {
    source_lang?: string;
    target_lang?: string;
  }): Promise<ApiResponse<{ translation: string }>> {
    const { data, error } = await supabase.functions.invoke('ai-core', {
      body: { action: 'translate', payload: { text, ...options } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  }
};

// ============================================================================
// SYSTEM ACTIONS
// ============================================================================

export const systemApi = {
  /**
   * Obtenir le quota restant
   */
  async getQuota(): Promise<ApiResponse<{ remaining_credits: number }>> {
    const { data, error } = await supabase.functions.invoke('system', {
      body: { action: 'quota_get' }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Vérifier si assez de crédits
   */
  async checkQuota(params: {
    service_type: string;
    operation_type: string;
    credits_required?: number;
  }): Promise<ApiResponse<{ has_enough_credits: boolean; remaining_credits: number }>> {
    const { data, error } = await supabase.functions.invoke('system', {
      body: { action: 'quota_check', payload: params }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Utiliser des crédits
   */
  async useQuota(params: {
    service_type: string;
    operation_type: string;
    credits_to_use?: number;
  }): Promise<ApiResponse> {
    const { data, error } = await supabase.functions.invoke('system', {
      body: { action: 'quota_use', payload: params }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Tracker un événement analytics
   */
  async trackEvent(event_type: string, event_data?: any): Promise<ApiResponse> {
    const { data, error } = await supabase.functions.invoke('system', {
      body: { action: 'analytics_track', payload: { event_type, event_data } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Logger une erreur
   */
  async logError(params: {
    error_type: string;
    message: string;
    stack?: string;
    context?: any;
    url?: string;
  }): Promise<ApiResponse> {
    const { data, error } = await supabase.functions.invoke('system', {
      body: { action: 'log_error', payload: params }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Vérifier la santé du système
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; checks: any }>> {
    const { data, error } = await supabase.functions.invoke('system', {
      body: { action: 'health' }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Vérifier les performances
   */
  async perfCheck(): Promise<ApiResponse<{ performance: any }>> {
    const { data, error } = await supabase.functions.invoke('system', {
      body: { action: 'perf_check' }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  }
};

// ============================================================================
// AI-CONTENT ACTIONS
// ============================================================================

export const contentApi = {
  /**
   * Générer une image de BD médicale
   */
  async generateComicImage(scene_description: string, options?: {
    style?: string;
    item_code?: string;
  }): Promise<ApiResponse<{ imageUrl: string }>> {
    const { data, error } = await supabase.functions.invoke('ai-content', {
      body: { action: 'comic_image', payload: { scene_description, ...options } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Générer des paroles éducatives
   */
  async generateLyrics(item_code: string, options?: {
    rang?: string;
    style?: string;
    mood?: string;
  }): Promise<ApiResponse<{ lyrics: string }>> {
    const { data, error } = await supabase.functions.invoke('ai-content', {
      body: { action: 'lyrics', payload: { item_code, ...options } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Vérifier le contenu manquant
   */
  async checkMissingContent(item_codes: string[], content_types?: string[]): Promise<ApiResponse<{ missing_content: any[] }>> {
    const { data, error } = await supabase.functions.invoke('ai-content', {
      body: { action: 'missing_content', payload: { item_codes, content_types } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Obtenir le contenu pédagogique
   */
  async getPedagogicalContent(options?: {
    item_code?: string;
    content_type?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ content: any[] }>> {
    const { data, error } = await supabase.functions.invoke('ai-content', {
      body: { action: 'pedagogical_get', payload: options }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Créer un plan d'étude
   */
  async createStudyPlan(params: {
    name: string;
    target_date: string;
    items: string[];
    daily_goal_minutes?: number;
  }): Promise<ApiResponse<{ plan: any }>> {
    const { data, error } = await supabase.functions.invoke('ai-content', {
      body: { action: 'planner_create', payload: params }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Obtenir les plans d'étude
   */
  async getStudyPlans(plan_id?: string): Promise<ApiResponse<{ plans?: any[]; plan?: any }>> {
    const { data, error } = await supabase.functions.invoke('ai-content', {
      body: { action: 'planner_get', payload: { plan_id } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Vérifier la complétude des items
   */
  async checkCompleteness(item_codes: string[]): Promise<ApiResponse<{ completeness: any[] }>> {
    const { data, error } = await supabase.functions.invoke('ai-content', {
      body: { action: 'completeness_check', payload: { item_codes } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Rapport de complétude global
   */
  async getCompletenessReport(specialty?: string): Promise<ApiResponse<{ report: any }>> {
    const { data, error } = await supabase.functions.invoke('ai-content', {
      body: { action: 'completeness_report', payload: { specialty } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  }
};

// ============================================================================
// UNIFIED API EXPORT
// ============================================================================

export const unifiedApi = {
  audio: audioApi,
  core: coreApi,
  system: systemApi,
  content: contentApi
};

export default unifiedApi;
