
import { SunoApiClient } from './sunoClient.ts';
import { 
  MAX_ATTEMPTS, 
  WAIT_TIME, 
  FAST_MODE_ENABLED,
  FAST_POLLING_INTERVAL,
  ULTRA_FAST_POLLING_INTERVAL,
  MAX_ULTRA_FAST_ATTEMPTS
} from './constants.ts';

export async function waitForAudio(sunoClient: SunoApiClient, taskId: string) {
  console.log(`🚀 DÉMARRAGE ATTENTE ULTRA-RAPIDE pour taskId: ${taskId}`);
  
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // Déterminer l'intervalle selon la phase
    let currentInterval;
    let phase;
    
    if (attempt <= MAX_ULTRA_FAST_ATTEMPTS) {
      currentInterval = ULTRA_FAST_POLLING_INTERVAL;
      phase = "ULTRA-RAPIDE ⚡⚡";
    } else if (FAST_MODE_ENABLED) {
      currentInterval = FAST_POLLING_INTERVAL;
      phase = "RAPIDE ⚡";
    } else {
      currentInterval = WAIT_TIME;
      phase = "NORMAL";
    }
    
    console.log(`🔄 ${phase} Tentative ${attempt}/${MAX_ATTEMPTS} (${Math.round((attempt / MAX_ATTEMPTS) * 100)}%) - Interval: ${currentInterval}ms`);
    
    try {
      const statusResponse = await sunoClient.get(`https://apibox.erweima.ai/api/v1/generate/record-info`, {
        taskId: taskId
      });
      
      console.log(`📥 Réponse statut tentative ${attempt}:`, statusResponse);
      console.log(`📊 Statut: ${statusResponse?.data?.status}`);

      if (statusResponse?.data?.status === 'SUCCESS' && statusResponse?.data?.response?.sunoData) {
        const sunoData = statusResponse.data.response.sunoData;
        console.log(`✅ SUCCÈS DÉTECTÉ RAPIDEMENT avec ${sunoData.length} pistes audio en ${attempt} tentatives`);
        
        // Prendre la première piste disponible
        const firstTrack = sunoData[0];
        
        // Priorité aux URLs dans cet ordre
        if (firstTrack?.audioUrl) {
          console.log(`🎵 URL AUDIO DIRECTE TROUVÉE RAPIDEMENT:`, firstTrack.audioUrl);
          return { audioUrl: firstTrack.audioUrl, attempts: attempt };
        }
        
        if (firstTrack?.streamAudioUrl) {
          console.log(`🎵 URL STREAM TROUVÉE RAPIDEMENT:`, firstTrack.streamAudioUrl);
          return { audioUrl: firstTrack.streamAudioUrl, attempts: attempt };
        }
        
        if (firstTrack?.sourceStreamAudioUrl) {
          console.log(`🎵 URL SOURCE STREAM TROUVÉE RAPIDEMENT:`, firstTrack.sourceStreamAudioUrl);
          return { audioUrl: firstTrack.sourceStreamAudioUrl, attempts: attempt };
        }
        
        console.log(`⚠️ SUCCÈS mais aucune URL audio trouvée:`, firstTrack);
      }
      
      // Nouveau : Vérifier si on a des URLs de streaming même avec TEXT_SUCCESS
      if (statusResponse?.data?.status === 'TEXT_SUCCESS' && statusResponse?.data?.response?.sunoData) {
        const sunoData = statusResponse.data.response.sunoData;
        console.log(`🔄 TEXT_SUCCESS avec ${sunoData.length} pistes, vérification URLs...`);
        
        const firstTrack = sunoData[0];
        
        // Accepter les URLs de streaming même si le statut n'est pas SUCCESS
        if (firstTrack?.streamAudioUrl) {
          console.log(`🎵 URL STREAM TROUVÉE avec TEXT_SUCCESS:`, firstTrack.streamAudioUrl);
          return { audioUrl: firstTrack.streamAudioUrl, attempts: attempt };
        }
        
        if (firstTrack?.sourceStreamAudioUrl) {
          console.log(`🎵 URL SOURCE STREAM TROUVÉE avec TEXT_SUCCESS:`, firstTrack.sourceStreamAudioUrl);
          return { audioUrl: firstTrack.sourceStreamAudioUrl, attempts: attempt };
        }
      }
      
      // Vérifications d'état optimisées
      const status = statusResponse?.data?.status;
      if (status === 'TEXT_SUCCESS') {
        console.log(`⏳ ${phase} Statut TEXT_SUCCESS, génération en cours...`);
      } else if (status === 'FIRST_SUCCESS') {
        console.log(`⏳ ${phase} Statut FIRST_SUCCESS, finalisation rapide...`);
        // En mode ultra-rapide, on réduit encore l'attente après FIRST_SUCCESS
        if (attempt <= MAX_ULTRA_FAST_ATTEMPTS) {
          currentInterval = 500; // 500ms seulement après FIRST_SUCCESS
        }
      } else if (status === 'FAIL') {
        console.error('❌ Échec de la génération Suno');
        throw new Error('La génération audio a échoué');
      }
      
      if (attempt < MAX_ATTEMPTS) {
        console.log(`⏳ ${phase} Attente de ${currentInterval}ms avant prochaine tentative...`);
        await new Promise(resolve => setTimeout(resolve, currentInterval));
      }
      
    } catch (error) {
      console.error(`❌ Erreur lors de la tentative ${attempt}:`, error);
      if (attempt === MAX_ATTEMPTS) {
        throw error;
      }
      // En cas d'erreur, on réduit légèrement l'attente pour reprendre plus vite
      const errorInterval = Math.max(currentInterval * 0.5, 1000);
      console.log(`🔄 Reprise rapide dans ${errorInterval}ms après erreur...`);
      await new Promise(resolve => setTimeout(resolve, errorInterval));
    }
  }
  
  console.log(`⏰ Timeout après ${MAX_ATTEMPTS} tentatives optimisées`);
  return { timeout: true, attempts: MAX_ATTEMPTS };
}
