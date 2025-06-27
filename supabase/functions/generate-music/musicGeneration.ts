
import { SunoApiClient } from './sunoClient.ts';

type Model = "V3_5" | "V4" | "V4_5";

export interface GenerateMusicPayload {
  prompt?: string;
  style?: string;
  title?: string;
  customMode: boolean;
  instrumental: boolean;
  model: Model;
  negativeTags?: string;
  callBackUrl: string; // Obligatoire pour l'API Suno
}

export interface GenerateMusicResponse {
  taskId: string;
}

export interface MusicStatus {
  status: "PENDING" | "TEXT_SUCCESS" | "FIRST_SUCCESS" | "SUCCESS" | "CREATE_TASK_FAILED" | "GENERATE_AUDIO_FAILED" | "CALLBACK_EXCEPTION" | "SENSITIVE_WORD_ERROR";
  data?: {
    audio: Array<{
      id: string;
      audio_url: string;
      image_url: string;
      duration: number;
      title: string;
      lyric: string;
      created_at: string;
      model_name: string;
      type: string;
      tags?: string;
    }>;
  };
}

export class MusicGenerator {
  private client: SunoApiClient;

  constructor(apiKey: string) {
    this.client = new SunoApiClient(apiKey);
  }

  async generateMusic(payload: GenerateMusicPayload): Promise<GenerateMusicResponse> {
    this.validatePayload(payload);
    
    console.log('🎵 Génération Suno avec payload:', {
      customMode: payload.customMode,
      instrumental: payload.instrumental,
      model: payload.model,
      hasPrompt: !!payload.prompt,
      hasStyle: !!payload.style,
      hasTitle: !!payload.title,
      hasCallBackUrl: !!payload.callBackUrl
    });

    return this.client.post<GenerateMusicResponse>('/api/v1/generate', payload);
  }

  async getMusicStatus(taskId: string): Promise<MusicStatus> {
    console.log(`🔍 Récupération du statut pour taskId: ${taskId}`);
    return this.client.get<MusicStatus>('/api/v1/generate/record-info', { taskId });
  }

  async waitForCompletion(taskId: string, maxAttempts: number = 60): Promise<MusicStatus> {
    let attempts = 0;
    let musicData: MusicStatus;

    console.log(`🔄 Polling du statut pour taskId: ${taskId}`);

    do {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Attendre 5 secondes
      attempts++;

      musicData = await this.getMusicStatus(taskId);
      console.log(`🔍 Tentative ${attempts}: Status=${musicData.status}`);

      if (musicData.status === 'SUCCESS' && musicData.data?.audio?.length) {
        break;
      }

      if (['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'CALLBACK_EXCEPTION', 'SENSITIVE_WORD_ERROR'].includes(musicData.status)) {
        throw new Error(`La génération musicale a échoué: ${musicData.status}`);
      }

    } while (attempts < maxAttempts && musicData.status !== 'SUCCESS');

    if (attempts >= maxAttempts) {
      throw new Error('Timeout: La génération musicale prend trop de temps');
    }

    if (!musicData.data?.audio?.length || !musicData.data.audio[0].audio_url) {
      throw new Error('Aucune URL audio générée par Suno');
    }

    return musicData;
  }

  private validatePayload(payload: GenerateMusicPayload) {
    // Vérifier le callBackUrl obligatoire
    if (!payload.callBackUrl) {
      throw new Error('callBackUrl est obligatoire pour l\'API Suno');
    }

    if (payload.customMode) {
      if (!payload.style || !payload.title) {
        throw new Error('Style et titre requis en mode personnalisé');
      }
      if (!payload.instrumental && !payload.prompt) {
        throw new Error('Prompt requis si instrumental=false en mode personnalisé');
      }
    } else {
      if (!payload.prompt) {
        throw new Error('Prompt requis en mode non-personnalisé');
      }
    }

    // Limites selon le modèle
    const len = (s?: string) => s?.length ?? 0;
    switch (payload.model) {
      case "V3_5":
      case "V4":
        if (len(payload.prompt) > 3000) throw new Error("Prompt trop long (max 3000 caractères)");
        if (len(payload.style) > 200) throw new Error("Style trop long (max 200 caractères)");
        break;
      case "V4_5":
        if (len(payload.prompt) > 5000) throw new Error("Prompt trop long (max 5000 caractères)");
        if (len(payload.style) > 1000) throw new Error("Style trop long (max 1000 caractères)");
        break;
    }
    if (len(payload.title) > 80) throw new Error("Titre trop long (max 80 caractères)");
  }
}
