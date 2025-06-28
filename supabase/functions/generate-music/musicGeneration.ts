
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

  async waitForCompletion(taskId: string, maxAttempts: number = 120, fastMode: boolean = false): Promise<MusicStatus> {
    let attempts = 0;
    let musicData: any;
    
    // Timeouts ajustés pour être plus permissifs
    let currentInterval = fastMode ? 2000 : 3000; // Mode rapide : 2s, normal : 3s
    const maxInterval = fastMode ? 5000 : 10000; // Mode rapide : 5s max, normal : 10s max
    const intervalIncrement = fastMode ? 500 : 1000; // Augmentation plus douce
    
    // Augmenter les tentatives maximales pour le mode rapide
    const adjustedMaxAttempts = fastMode ? 60 : maxAttempts; // 2 minutes en mode rapide au lieu de 30s

    console.log(`🔄 Polling ${fastMode ? 'ULTRA-RAPIDE' : 'optimisé'} pour taskId: ${taskId} (max ${adjustedMaxAttempts} tentatives)`);
    console.log(`⏰ Temps maximum estimé: ${fastMode ? '2 minutes' : '10 minutes'}`);

    do {
      // Attendre avant la vérification (sauf pour la première tentative)
      if (attempts > 0) {
        await new Promise(resolve => setTimeout(resolve, currentInterval));
      }
      attempts++;

      try {
        musicData = await this.getMusicStatus(taskId);
        
        // Extraire le statut de la bonne structure
        let currentStatus;
        if (musicData.data && musicData.data.status) {
          currentStatus = musicData.data.status;
        } else if (musicData.status) {
          currentStatus = musicData.status;
        } else {
          console.error(`❌ Aucun statut trouvé dans la réponse:`, JSON.stringify(musicData, null, 2));
          currentStatus = 'UNKNOWN';
        }
        
        console.log(`🔍 Tentative ${attempts}/${adjustedMaxAttempts}: Status=${currentStatus}, Interval=${currentInterval}ms ${fastMode ? '⚡' : ''}`);
        
        // Debug: afficher la structure complète des données reçues
        if (musicData.data) {
          if (musicData.data.response && musicData.data.response.sunoData) {
            console.log(`📊 Nombre d'audios (sunoData): ${musicData.data.response.sunoData?.length || 0}`);
            if (musicData.data.response.sunoData?.length > 0) {
              const firstAudio = musicData.data.response.sunoData[0];
              console.log(`📊 Premier audio - ID: ${firstAudio.id}, URL: ${firstAudio.audioUrl || firstAudio.streamAudioUrl || 'non définie'}`);
            }
          } else if (musicData.data.audio) {
            console.log(`📊 Nombre d'audios: ${musicData.data.audio?.length || 0}`);
            if (musicData.data.audio?.length > 0) {
              const firstAudio = musicData.data.audio[0];
              console.log(`📊 Premier audio - ID: ${firstAudio.id}, URL: ${firstAudio.audio_url || 'non définie'}`);
            }
          }
        }

        // Vérifier différentes structures possibles de réponse pour l'URL audio
        let audioUrl = null;
        
        // Structure 1: data.response.sunoData[0].audioUrl ou streamAudioUrl
        if (musicData.data?.response?.sunoData?.[0]) {
          const firstSunoData = musicData.data.response.sunoData[0];
          audioUrl = firstSunoData.audioUrl || firstSunoData.streamAudioUrl;
          if (audioUrl) {
            console.log(`✅ URL audio trouvée (structure sunoData): ${audioUrl}`);
          }
        }
        // Structure 2: data.audio[0].audio_url
        else if (musicData.data?.audio?.[0]?.audio_url) {
          audioUrl = musicData.data.audio[0].audio_url;
          console.log(`✅ URL audio trouvée (structure audio): ${audioUrl}`);
        }
        // Structure 3: data.audio_url directement
        else if (musicData.data?.audio_url) {
          audioUrl = musicData.data.audio_url;
          console.log(`✅ URL audio trouvée (structure directe): ${audioUrl}`);
        }
        // Structure 4: audio_url au niveau racine
        else if (musicData.audio_url) {
          audioUrl = musicData.audio_url;
          console.log(`✅ URL audio trouvée (structure racine): ${audioUrl}`);
        }

        // Si on a trouvé une URL audio valide, on peut retourner
        if (audioUrl && audioUrl.length > 10) { // URL valide
          console.log(`🎉 URL audio récupérée avec succès au statut ${currentStatus} ${fastMode ? '⚡ RAPIDE' : ''}`);
          // Construire la structure de retour avec le bon format
          const finalResult: MusicStatus = {
            status: currentStatus as any,
            data: {
              audio: [{
                id: musicData.data?.response?.sunoData?.[0]?.id || taskId,
                audio_url: audioUrl,
                image_url: musicData.data?.response?.sunoData?.[0]?.imageUrl || '',
                duration: musicData.data?.response?.sunoData?.[0]?.duration || 240,
                title: musicData.data?.response?.sunoData?.[0]?.title || 'Generated Music',
                lyric: musicData.data?.response?.sunoData?.[0]?.prompt || '',
                created_at: new Date().toISOString(),
                model_name: musicData.data?.response?.sunoData?.[0]?.modelName || 'V3_5',
                type: 'generated'
              }]
            }
          };
          return finalResult;
        }

        // Statuts d'erreur définitifs
        if (['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'CALLBACK_EXCEPTION', 'SENSITIVE_WORD_ERROR'].includes(currentStatus)) {
          console.error(`❌ Statut d'erreur définitif: ${currentStatus}`);
          throw new Error(`La génération musicale a échoué: ${currentStatus}`);
        }

        // Ajuster l'intervalle de polling selon le statut (mode plus permissif)
        if (fastMode) {
          if (currentStatus === 'PENDING') {
            currentInterval = Math.min(currentInterval, 2500); // 2.5s max pour PENDING
          } else if (currentStatus === 'TEXT_SUCCESS') {
            currentInterval = Math.min(currentInterval + intervalIncrement, 3000); // 3s max pour TEXT_SUCCESS
          } else if (currentStatus === 'FIRST_SUCCESS') {
            currentInterval = Math.min(currentInterval, 2000); // 2s pour FIRST_SUCCESS
          }
        } else {
          // Mode normal (logique existante)
          if (currentStatus === 'PENDING') {
            currentInterval = Math.min(currentInterval, 5000);
          } else if (currentStatus === 'TEXT_SUCCESS') {
            currentInterval = Math.min(currentInterval + intervalIncrement, 8000);
          } else if (currentStatus === 'FIRST_SUCCESS') {
            currentInterval = Math.min(currentInterval, 4000);
          }
        }

        // Pour SUCCESS, on doit avoir une URL audio
        if (currentStatus === 'SUCCESS' && !audioUrl) {
          console.error(`❌ Statut SUCCESS mais aucune URL audio trouvée`);
          console.error(`📊 Réponse complète:`, JSON.stringify(musicData, null, 2));
          // On continue le polling quelques fois de plus au cas où
          if (attempts >= adjustedMaxAttempts - 5) {
            throw new Error('Statut SUCCESS atteint mais aucune URL audio disponible');
          }
        }

        // Continuer le polling pour les autres statuts
        console.log(`⏳ Statut ${currentStatus}, continue le polling dans ${currentInterval}ms... ${fastMode ? '⚡' : ''}`);

      } catch (error) {
        console.error(`❌ Erreur lors de la vérification du statut (tentative ${attempts}):`, error);
        if (attempts >= adjustedMaxAttempts) {
          throw error;
        }
        // Augmenter légèrement l'intervalle en cas d'erreur
        currentInterval = Math.min(currentInterval + (fastMode ? 500 : 2000), maxInterval);
        console.log(`🔄 Continue le polling malgré l'erreur dans ${currentInterval}ms... ${fastMode ? '⚡' : ''}`);
      }

    } while (attempts < adjustedMaxAttempts);

    // Vérification finale
    const totalTimeMinutes = Math.floor((adjustedMaxAttempts * (fastMode ? 2.5 : 5)) / 60); // Estimation basée sur intervalle moyen
    console.error(`⏰ Timeout après ${adjustedMaxAttempts} tentatives (~${totalTimeMinutes} minutes) ${fastMode ? '⚡ MODE RAPIDE' : ''}`);
    console.error(`📊 Dernier statut:`, musicData?.data?.status || musicData?.status);
    console.error(`📊 Dernière réponse:`, JSON.stringify(musicData || {}, null, 2));
    throw new Error(`Timeout: La génération musicale prend trop de temps (~${totalTimeMinutes} minutes) ${fastMode ? 'en mode rapide' : ''}`);
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
