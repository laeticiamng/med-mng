
import { SunoApiClient } from './sunoClient.ts';

type Model = "chirp-v3-5" | "chirp-v4";

export interface GenerateMusicPayload {
  title: string;
  tags: string;
  prompt: string;
  mv: Model;
  continue_clip_id?: string | null;
  continue_at?: number | null;
}

export interface GenerateMusicResponse {
  id: string;
  title: string;
  image_url?: string;
  lyric: string;
  audio_url?: string;
  video_url?: string;
  created_at: string;
  model_name: string;
  status: string;
  gpt_description_prompt?: string;
  prompt?: string;
  type: string;
  tags?: string;
}

export class MusicGenerator {
  private client: SunoApiClient;

  constructor(apiKey: string) {
    this.client = new SunoApiClient(apiKey);
  }

  async generateMusic(payload: GenerateMusicPayload): Promise<GenerateMusicResponse> {
    this.validatePayload(payload);
    
    console.log('🎵 Génération Suno avec payload:', {
      title: payload.title,
      tags: payload.tags,
      promptLength: payload.prompt.length,
      model: payload.mv
    });

    return this.client.post<GenerateMusicResponse>('/v1/songs/generate', payload);
  }

  async getMusicStatus(songId: string): Promise<GenerateMusicResponse> {
    console.log(`🔍 Récupération du statut pour song_id: ${songId}`);
    return this.client.get<GenerateMusicResponse>(`/v1/songs/${songId}`);
  }

  async waitForCompletion(songId: string, maxAttempts: number = 60): Promise<GenerateMusicResponse> {
    let attempts = 0;
    let songData: GenerateMusicResponse;

    console.log(`🔄 Polling du statut pour song_id: ${songId}`);

    do {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Attendre 5 secondes
      attempts++;

      songData = await this.getMusicStatus(songId);
      console.log(`🔍 Tentative ${attempts}: Status=${songData.status}`);

      if (songData.status === 'complete' && songData.audio_url) {
        break;
      }

      if (songData.status === 'error') {
        throw new Error('La génération musicale a échoué sur Suno');
      }

    } while (attempts < maxAttempts && songData.status !== 'complete');

    if (attempts >= maxAttempts) {
      throw new Error('Timeout: La génération musicale prend trop de temps');
    }

    if (!songData.audio_url) {
      throw new Error('Aucune URL audio générée par Suno');
    }

    return songData;
  }

  private validatePayload(payload: GenerateMusicPayload) {
    if (!payload.title || payload.title.length > 80) {
      throw new Error('Titre requis et doit faire moins de 80 caractères');
    }

    if (!payload.tags || payload.tags.length > 1000) {
      throw new Error('Tags requis et doivent faire moins de 1000 caractères');
    }

    if (!payload.prompt || payload.prompt.length > 5000) {
      throw new Error('Prompt requis et doit faire moins de 5000 caractères');
    }

    if (!payload.mv) {
      throw new Error('Modèle requis');
    }
  }
}
