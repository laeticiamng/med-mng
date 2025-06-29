
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
  console.log('⏳ Attente de la génération audio (délai optimisé)...');
  
  let audioUrl = null;
  let attempts = 0;
  
  while (!audioUrl && attempts < MAX_ATTEMPTS) {
    attempts++;
    const progress = Math.round((attempts / MAX_ATTEMPTS) * 100);
    
    console.log(`🔄 Tentative ${attempts}/${MAX_ATTEMPTS} de récupération de l'audio... (${progress}%)`);
    
    // Callback de progression si fourni
    if (onProgress) {
      onProgress(progress, attempts, MAX_ATTEMPTS);
    }
    
    if (attempts > 1) {
      await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
    }
    
    try {
      const audioResponse = await sunoClient.get(`https://apibox.erweima.ai/api/v1/audio/${taskId}`);
      console.log(`📥 Réponse audio tentative ${attempts}:`, audioResponse);
      
      if (audioResponse && audioResponse.data && audioResponse.data.audio_url) {
        audioUrl = audioResponse.data.audio_url;
        console.log('🎵 URL audio trouvée:', audioUrl);
        break;
      }
      
      if (audioResponse && audioResponse.data && audioResponse.data.status) {
        console.log(`📊 Statut de la tâche: ${audioResponse.data.status}`);
        
        if (audioResponse.data.status === 'failed' || audioResponse.data.status === 'error') {
          throw new Error(`Génération échouée: ${audioResponse.data.error || 'Erreur inconnue'}`);
        }
        
        if (audioResponse.data.status === 'processing' || audioResponse.data.status === 'pending') {
          console.log('🔄 Tâche en cours de traitement, attente réduite...');
        }
      }
      
    } catch (audioError) {
      console.warn(`⚠️ Erreur lors de la vérification audio (tentative ${attempts}):`, audioError.message);
      
      if (audioError.message?.includes('404') || audioError.message?.includes('Not Found')) {
        console.log('📝 Task pas encore prête (404), continue...');
        continue;
      }
      
      if (attempts < MAX_ATTEMPTS) {
        continue;
      } else {
        throw audioError;
      }
    }
  }

  return {
    audioUrl,
    timeout: !audioUrl,
    attempts,
    progress: Math.round((attempts / MAX_ATTEMPTS) * 100)
  };
}
