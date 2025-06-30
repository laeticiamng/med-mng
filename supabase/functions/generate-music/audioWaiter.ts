
import { MAX_ATTEMPTS, WAIT_TIME, FAST_POLLING_INTERVAL, ULTRA_FAST_POLLING_INTERVAL, MAX_ULTRA_FAST_ATTEMPTS } from './constants.ts';
import { SunoApiClient } from './sunoClient.ts';

interface AudioResult {
  audioUrl?: string;
  timeout: boolean;
  attempts: number;
}

export async function waitForAudio(sunoClient: SunoApiClient, taskId: string): Promise<AudioResult> {
  console.log(`🎵 Démarrage attente audio ULTRA-OPTIMISÉE pour taskId: ${taskId}`);
  
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // Calcul du délai d'attente optimisé
      let waitTime = WAIT_TIME;
      if (attempt <= MAX_ULTRA_FAST_ATTEMPTS) {
        waitTime = ULTRA_FAST_POLLING_INTERVAL; // 1 seconde pour les premières tentatives
        console.log(`🔄 ULTRA-RAPIDE ⚡ Tentative ${attempt}/${MAX_ULTRA_FAST_ATTEMPTS} (${Math.round(attempt/MAX_ULTRA_FAST_ATTEMPTS*100)}%) - Interval: ${waitTime}ms`);
      } else {
        waitTime = FAST_POLLING_INTERVAL; // 2 secondes après
        console.log(`🔄 RAPIDE ⚡ Tentative ${attempt}/${MAX_ATTEMPTS} (${Math.round(attempt/MAX_ATTEMPTS*100)}%) - Interval: ${waitTime}ms`);
      }

      // Attendre avant la prochaine tentative (sauf la première)
      if (attempt > 1) {
        console.log(`⏳ ${attempt <= MAX_ULTRA_FAST_ATTEMPTS ? 'ULTRA-RAPIDE' : 'RAPIDE'} ⚡ Attente de ${waitTime}ms avant prochaine tentative...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      console.log(`🌐 GET https://apibox.erweima.ai/api/v1/generate/record-info?taskId=${taskId}`);
      
      const statusResponse = await sunoClient.get(`https://apibox.erweima.ai/api/v1/generate/record-info?taskId=${taskId}`);
      
      console.log(`📊 Status: ${statusResponse ? 'Réponse reçue' : 'Pas de réponse'}`);
      console.log(`✅ GET Response:`, statusResponse);
      console.log(`📥 Réponse statut tentative ${attempt}:`, statusResponse);

      if (!statusResponse || !statusResponse.data) {
        console.error(`❌ Pas de données dans la réponse, tentative ${attempt}`);
        continue;
      }

      const status = statusResponse.data.status;
      console.log(`📊 Statut: ${status}`);

      if (status === 'SUCCESS' || status === 'COMPLETE') {
        console.log(`✅ GÉNÉRATION TERMINÉE après ${attempt} tentatives !`);
        
        if (statusResponse.data.response && statusResponse.data.response.length > 0) {
          const audioUrl = statusResponse.data.response[0]?.audio_url || statusResponse.data.response[0]?.audioUrl;
          
          if (audioUrl) {
            console.log(`🎧 URL AUDIO TROUVÉE: ${audioUrl}`);
            return { audioUrl, timeout: false, attempts: attempt };
          } else {
            console.error(`❌ URL audio manquante dans la réponse SUCCESS`);
          }
        } else {
          console.error(`❌ Réponse SUCCESS mais pas de données audio`);
        }
      } else if (status === 'FAILED' || status === 'ERROR') {
        console.error(`❌ Génération échouée avec statut: ${status}`);
        throw new Error(`Génération Suno échouée: ${status}`);
      } else if (status === 'PENDING' || status === 'PROCESSING' || status === 'IN_PROGRESS') {
        console.log(`⏳ Génération en cours... (${status})`);
        // Continue la boucle
      } else {
        console.warn(`⚠️ Statut inconnu: ${status}, on continue...`);
      }

    } catch (error) {
      console.error(`❌ Erreur tentative ${attempt}:`, error);
      
      // Si c'est une erreur de réseau, on continue
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        console.log(`🔄 Erreur réseau, nouvelle tentative dans ${waitTime}ms...`);
        continue;
      }
      
      // Pour les autres erreurs, on les propage après quelques tentatives
      if (attempt >= 3) {
        throw error;
      }
    }
  }

  console.log(`⏰ Timeout après ${MAX_ATTEMPTS} tentatives optimisées`);
  return { timeout: true, attempts: MAX_ATTEMPTS };
}
