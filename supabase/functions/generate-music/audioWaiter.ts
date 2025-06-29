
import { SunoApiClient } from './sunoClient.ts';
import { MAX_ATTEMPTS, WAIT_TIME } from './constants.ts';

export interface AudioResult {
  audioUrl?: string;
  timeout: boolean;
  attempts: number;
  progress?: number;
}

export interface ProgressCallback {
  (progress: number, attempt: number, maxAttempts: number): void;
}

export async function waitForAudio(
  sunoClient: SunoApiClient, 
  taskId: string,
  onProgress?: ProgressCallback
): Promise<AudioResult> {
  console.log('⏳ Attente de la génération audio avec polling rapide optimisé...');
  
  let audioUrl = null;
  let attempts = 0;
  const maxAttempts = MAX_ATTEMPTS; // 12 tentatives = 2 minutes max
  const waitTime = WAIT_TIME; // 5 secondes entre chaque tentative
  
  while (!audioUrl && attempts < maxAttempts) {
    attempts++;
    const progress = Math.round((attempts / maxAttempts) * 100);
    
    console.log(`🔄 Tentative ${attempts}/${maxAttempts} de récupération de l'audio... (${progress}%)`);
    
    // Callback de progression si fourni
    if (onProgress) {
      onProgress(progress, attempts, maxAttempts);
    }
    
    // Attendre avant chaque tentative (sauf la première)
    if (attempts > 1) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    } else {
      // Attendre seulement 5 secondes avant la première vérification
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    try {
      // Utiliser l'endpoint de statut pour vérifier l'état
      const statusResponse = await sunoClient.get(`https://apibox.erweima.ai/api/v1/generate/record-info?taskId=${taskId}`);
      console.log(`📥 Réponse statut tentative ${attempts}:`, statusResponse);
      
      // Vérifier différentes structures de réponse possibles
      let currentStatus = 'PENDING';
      let audioData = null;
      
      if (statusResponse?.data?.status) {
        currentStatus = statusResponse.data.status;
        audioData = statusResponse.data;
      } else if (statusResponse?.status) {
        currentStatus = statusResponse.status;
        audioData = statusResponse;
      }
      
      console.log(`📊 Statut de la tâche: ${currentStatus}`);
      
      // Vérifier les statuts d'erreur définitifs
      if (['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'CALLBACK_EXCEPTION', 'SENSITIVE_WORD_ERROR'].includes(currentStatus)) {
        throw new Error(`Génération échouée avec le statut: ${currentStatus}`);
      }
      
      // Chercher l'URL audio dans différentes structures possibles
      if (currentStatus === 'SUCCESS' || currentStatus === 'FIRST_SUCCESS') {
        // Structure 1: response.sunoData[0].audioUrl
        if (audioData?.response?.sunoData?.[0]?.audioUrl) {
          audioUrl = audioData.response.sunoData[0].audioUrl;
          console.log('🎵 URL audio trouvée (structure sunoData):', audioUrl);
        }
        // Structure 2: response.sunoData[0].streamAudioUrl
        else if (audioData?.response?.sunoData?.[0]?.streamAudioUrl) {
          audioUrl = audioData.response.sunoData[0].streamAudioUrl;
          console.log('🎵 URL audio trouvée (structure streamAudioUrl):', audioUrl);
        }
        // Structure 3: audio[0].audio_url
        else if (audioData?.audio?.[0]?.audio_url) {
          audioUrl = audioData.audio[0].audio_url;
          console.log('🎵 URL audio trouvée (structure audio):', audioUrl);
        }
        // Structure 4: audio_url direct
        else if (audioData?.audio_url) {
          audioUrl = audioData.audio_url;
          console.log('🎵 URL audio trouvée (structure directe):', audioUrl);
        }
        
        if (audioUrl) {
          console.log('✅ Audio généré avec succès!');
          break;
        } else {
          console.log('⚠️ Statut SUCCESS mais aucune URL audio trouvée, continue...');
        }
      }
      
      // Pour les autres statuts, continuer à attendre
      if (['PENDING', 'TEXT_SUCCESS'].includes(currentStatus)) {
        console.log(`⏳ Statut ${currentStatus}, génération en cours...`);
        continue;
      }
      
    } catch (error) {
      console.warn(`⚠️ Erreur lors de la vérification du statut (tentative ${attempts}):`, error.message);
      
      // Si c'est une erreur 404, c'est normal au début
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        console.log('📝 Tâche pas encore prête (404), continue...');
        continue;
      }
      
      // Pour les autres erreurs, continuer quand même mais logguer
      if (attempts < maxAttempts) {
        console.log('🔄 Continue malgré l\'erreur...');
        continue;
      } else {
        throw error;
      }
    }
  }

  return {
    audioUrl,
    timeout: !audioUrl,
    attempts,
    progress: Math.round((attempts / maxAttempts) * 100)
  };
}
