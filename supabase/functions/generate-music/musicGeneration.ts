
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

  async waitForCompletion(taskId: string, maxAttempts: number = 120): Promise<MusicStatus> {
    let attempts = 0;
    let musicData: MusicStatus;
    let currentInterval = 3000; // Commencer avec 3 secondes
    const maxInterval = 10000; // Max 10 secondes
    const intervalIncrement = 1000; // Augmenter de 1 seconde à chaque étape

    console.log(`🔄 Polling optimisé pour taskId: ${taskId} (max ${maxAttempts} tentatives)`);

    do {
      // Attendre avant la vérification (sauf pour la première tentative)
      if (attempts > 0) {
        await new Promise(resolve => setTimeout(resolve, currentInterval));
      }
      attempts++;

      try {
        musicData = await this.getMusicStatus(taskId);
        console.log(`🔍 Tentative ${attempts}/${maxAttempts}: Status=${musicData.status}, Interval=${currentInterval}ms`);
        
        // Debug: afficher la structure complète des données reçues
        if (musicData.data) {
          console.log(`📊 Nombre d'audios: ${musicData.data.audio?.length || 0}`);
          if (musicData.data.audio?.length > 0) {
            const firstAudio = musicData.data.audio[0];
            console.log(`📊 Premier audio - ID: ${firstAudio.id}, URL: ${firstAudio.audio_url || 'non définie'}`);
          }
        }

        // Vérifier différentes structures possibles de réponse
        let audioUrl = null;
        
        // Structure 1: data.audio[0].audio_url
        if (musicData.data?.audio?.[0]?.audio_url) {
          audioUrl = musicData.data.audio[0].audio_url;
          console.log(`✅ URL audio trouvée (structure 1): ${audioUrl}`);
        }
        // Structure 2: data.audio_url directement
        else if (musicData.data?.audio_url) {
          audioUrl = musicData.data.audio_url;
          console.log(`✅ URL audio trouvée (structure 2): ${audioUrl}`);
        }
        // Structure 3: audio_url au niveau racine
        else if (musicData.audio_url) {
          audioUrl = musicData.audio_url;
          console.log(`✅ URL audio trouvée (structure 3): ${audioUrl}`);
        }

        // Si on a trouvé une URL audio, on peut retourner
        if (audioUrl && audioUrl.length > 10) { // URL valide
          console.log(`🎉 URL audio récupérée avec succès au statut ${musicData.status}`);
          // Assurer que la structure est correcte pour le retour
          if (!musicData.data?.audio?.[0]?.audio_url) {
            if (!musicData.data) musicData.data = { audio: [] };
            if (!musicData.data.audio) musicData.data.audio = [];
            if (!musicData.data.audio[0]) {
              musicData.data.audio[0] = {
                id: taskId,
                audio_url: audioUrl,
                image_url: '',
                duration: 240,
                title: 'Generated Music',
                lyric: '',
                created_at: new Date().toISOString(),
                model_name: 'V3_5',
                type: 'generated'
              };
            } else {
              musicData.data.audio[0].audio_url = audioUrl;
            }
          }
          return musicData;
        }

        // Statuts d'erreur définitifs
        if (['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'CALLBACK_EXCEPTION', 'SENSITIVE_WORD_ERROR'].includes(musicData.status)) {
          console.error(`❌ Statut d'erreur définitif: ${musicData.status}`);
          throw new Error(`La génération musicale a échoué: ${musicData.status}`);
        }

        // Ajuster l'intervalle de polling selon le statut
        if (musicData.status === 'PENDING') {
          // Garder un intervalle court pour PENDING
          currentInterval = Math.min(currentInterval, 5000);
        } else if (musicData.status === 'TEXT_SUCCESS') {
          // Intervalle moyen pour TEXT_SUCCESS
          currentInterval = Math.min(currentInterval + intervalIncrement, 8000);
        } else if (musicData.status === 'FIRST_SUCCESS') {
          // Intervalle plus court pour FIRST_SUCCESS
          currentInterval = Math.min(currentInterval, 4000);
        }

        // Pour SUCCESS, on doit avoir une URL audio
        if (musicData.status === 'SUCCESS' && !audioUrl) {
          console.error(`❌ Statut SUCCESS mais aucune URL audio trouvée`);
          console.error(`📊 Réponse complète:`, JSON.stringify(musicData, null, 2));
          // On continue le polling quelques fois de plus au cas où
          if (attempts >= maxAttempts - 5) {
            throw new Error('Statut SUCCESS atteint mais aucune URL audio disponible');
          }
        }

        // Continuer le polling pour les autres statuts
        console.log(`⏳ Statut ${musicData.status}, continue le polling dans ${currentInterval}ms...`);

      } catch (error) {
        console.error(`❌ Erreur lors de la vérification du statut (tentative ${attempts}):`, error);
        if (attempts >= maxAttempts) {
          throw error;
        }
        // Augmenter légèrement l'intervalle en cas d'erreur
        currentInterval = Math.min(currentInterval + 2000, maxInterval);
        console.log(`🔄 Continue le polling malgré l'erreur dans ${currentInterval}ms...`);
      }

    } while (attempts < maxAttempts);

    // Vérification finale
    const totalTimeMinutes = Math.floor((maxAttempts * 5) / 60); // Estimation basée sur intervalle moyen de 5s
    console.error(`⏰ Timeout après ${maxAttempts} tentatives (~${totalTimeMinutes} minutes)`);
    console.error(`📊 Dernier statut:`, musicData?.status);
    console.error(`📊 Dernière réponse:`, JSON.stringify(musicData || {}, null, 2));
    throw new Error(`Timeout: La génération musicale prend trop de temps (~${totalTimeMinutes} minutes)`);
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
