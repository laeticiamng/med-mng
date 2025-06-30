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
  callBackUrl: string;
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
    
    console.log('🚀 GÉNÉRATION ULTRA-RAPIDE Suno avec payload:', {
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
    console.log(`🔍 Vérification RAPIDE du statut pour taskId: ${taskId}`);
    return this.client.get<MusicStatus>('/api/v1/generate/record-info', { taskId });
  }

  async waitForCompletion(taskId: string, maxAttempts: number = 60, fastMode: boolean = true): Promise<MusicStatus> {
    let attempts = 0;
    let musicData: any;
    
    // Intervals ultra-optimisés pour vitesse maximale
    const ULTRA_FAST_INTERVAL = 800;  // 0.8 seconde - très agressif
    const FAST_INTERVAL = 1500;       // 1.5 seconde
    const NORMAL_INTERVAL = 2500;     // 2.5 secondes
    
    // Phases de polling optimisées
    const ULTRA_FAST_PHASE = fastMode ? 12 : 0;  // 12 tentatives ultra-rapides
    const FAST_PHASE = fastMode ? 35 : 20;       // Puis 35 tentatives rapides
    
    const totalMaxAttempts = fastMode ? 60 : maxAttempts; // Plus de tentatives en mode rapide
    
    console.log(`⚡ POLLING ULTRA-OPTIMISÉ pour taskId: ${taskId}`);
    console.log(`🎯 Phase 1: ${ULTRA_FAST_PHASE} tentatives à ${ULTRA_FAST_INTERVAL}ms`);
    console.log(`🎯 Phase 2: ${FAST_PHASE - ULTRA_FAST_PHASE} tentatives à ${FAST_INTERVAL}ms`);
    console.log(`🎯 Phase 3: Reste à ${NORMAL_INTERVAL}ms (max ${totalMaxAttempts} total)`);

    do {
      // Déterminer l'intervalle selon la phase
      let currentInterval;
      let phase;
      
      if (attempts < ULTRA_FAST_PHASE) {
        currentInterval = ULTRA_FAST_INTERVAL;
        phase = "ULTRA-RAPIDE ⚡⚡⚡";
      } else if (attempts < FAST_PHASE) {
        currentInterval = FAST_INTERVAL;
        phase = "RAPIDE ⚡⚡";
      } else {
        currentInterval = NORMAL_INTERVAL;
        phase = "NORMAL ⚡";
      }

      // Attendre avant la vérification (sauf première tentative)
      if (attempts > 0) {
        await new Promise(resolve => setTimeout(resolve, currentInterval));
      }
      attempts++;

      try {
        musicData = await this.getMusicStatus(taskId);
        
        // Extraire le statut optimisé
        let currentStatus;
        if (musicData.data && musicData.data.status) {
          currentStatus = musicData.data.status;
        } else if (musicData.status) {
          currentStatus = musicData.status;
        } else {
          console.error(`❌ Aucun statut trouvé:`, JSON.stringify(musicData, null, 2));
          currentStatus = 'UNKNOWN';
        }
        
        console.log(`🔍 ${phase} ${attempts}/${totalMaxAttempts}: ${currentStatus} (${Math.round((attempts/totalMaxAttempts)*100)}%)`);
        
        // Vérification ultra-rapide des URLs audio
        let audioUrl = null;
        
        // Vérifications optimisées par priorité
        if (musicData.data?.response?.sunoData?.[0]) {
          const firstSunoData = musicData.data.response.sunoData[0];
          audioUrl = firstSunoData.audioUrl || firstSunoData.streamAudioUrl || firstSunoData.sourceStreamAudioUrl;
        } else if (musicData.data?.audio?.[0]?.audio_url) {
          audioUrl = musicData.data.audio[0].audio_url;
        } else if (musicData.data?.audio_url) {
          audioUrl = musicData.data.audio_url;
        } else if (musicData.audio_url) {
          audioUrl = musicData.audio_url;
        }

        // Si URL audio trouvée, retour immédiat
        if (audioUrl && audioUrl.length > 10) {
          console.log(`🎉 URL AUDIO RÉCUPÉRÉE EN ${phase} (${attempts} tentatives) !`);
          
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

        // Gestion des erreurs définitives
        if (['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'CALLBACK_EXCEPTION', 'SENSITIVE_WORD_ERROR'].includes(currentStatus)) {
          console.error(`❌ Erreur définitive: ${currentStatus}`);
          throw new Error(`Génération échouée: ${currentStatus}`);
        }

        // Optimisation dynamique des intervalles selon le statut
        if (currentStatus === 'FIRST_SUCCESS' && attempts < FAST_PHASE) {
          // Accélérer encore plus après FIRST_SUCCESS
          currentInterval = Math.min(currentInterval, 1000);
        }

      } catch (error) {
        console.error(`❌ Erreur tentative ${attempts}:`, error);
        if (attempts >= totalMaxAttempts) {
          throw error;
        }
        // Récupération rapide après erreur
        const recoveryInterval = Math.min(currentInterval * 0.7, 2000);
        console.log(`🔄 Récupération rapide dans ${recoveryInterval}ms...`);
        await new Promise(resolve => setTimeout(resolve, recoveryInterval));
      }

    } while (attempts < totalMaxAttempts);

    const totalTimeMinutes = Math.floor((totalMaxAttempts * 1.8) / 60); // Estimation optimiste
    console.error(`⏰ TIMEOUT après ${totalMaxAttempts} tentatives optimisées (~${totalTimeMinutes} min)`);
    throw new Error(`Timeout optimisé: ${totalTimeMinutes} minutes en mode ultra-rapide`);
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
