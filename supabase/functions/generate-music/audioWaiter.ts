
import { SunoApiClient } from './sunoClient.ts';
import { MAX_ATTEMPTS, WAIT_TIME } from './constants.ts';

export async function waitForAudio(sunoClient: SunoApiClient, taskId: string) {
  console.log(`🔄 Début d'attente audio pour taskId: ${taskId}`);
  
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`🔄 Tentative ${attempt}/${MAX_ATTEMPTS} de récupération de l'audio... (${Math.round((attempt / MAX_ATTEMPTS) * 100)}%)`);
    
    try {
      const statusResponse = await sunoClient.get(`https://apibox.erweima.ai/api/v1/generate/record-info`, {
        taskId: taskId
      });
      
      console.log(`📥 Réponse statut tentative ${attempt}:`, statusResponse);
      console.log(`📊 Statut de la tâche: ${statusResponse?.data?.status}`);

      if (statusResponse?.data?.status === 'SUCCESS' && statusResponse?.data?.response?.sunoData) {
        const sunoData = statusResponse.data.response.sunoData;
        console.log(`✅ SUCCÈS DÉTECTÉ avec ${sunoData.length} pistes audio`);
        
        // Prendre la première piste disponible
        const firstTrack = sunoData[0];
        
        if (firstTrack?.audioUrl) {
          console.log(`🎵 URL AUDIO DIRECTE TROUVÉE:`, firstTrack.audioUrl);
          return { audioUrl: firstTrack.audioUrl, attempts: attempt };
        }
        
        if (firstTrack?.streamAudioUrl) {
          console.log(`🎵 URL STREAM TROUVÉE:`, firstTrack.streamAudioUrl);
          return { audioUrl: firstTrack.streamAudioUrl, attempts: attempt };
        }
        
        if (firstTrack?.sourceStreamAudioUrl) {
          console.log(`🎵 URL SOURCE STREAM TROUVÉE:`, firstTrack.sourceStreamAudioUrl);
          return { audioUrl: firstTrack.sourceStreamAudioUrl, attempts: attempt };
        }
        
        console.log(`⚠️ SUCCÈS mais aucune URL audio trouvée dans:`, firstTrack);
      }
      
      if (statusResponse?.data?.status === 'TEXT_SUCCESS') {
        console.log('⏳ Statut TEXT_SUCCESS, génération en cours...');
        // Continuer à attendre
      } else if (statusResponse?.data?.status === 'FIRST_SUCCESS') {
        console.log('⏳ Statut FIRST_SUCCESS, finalisation en cours...');
        // Continuer à attendre
      } else if (statusResponse?.data?.status === 'FAIL') {
        console.error('❌ Échec de la génération Suno');
        throw new Error('La génération audio a échoué');
      }
      
      if (attempt < MAX_ATTEMPTS) {
        console.log(`⏳ Attente de ${WAIT_TIME}ms avant la prochaine tentative...`);
        await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
      }
      
    } catch (error) {
      console.error(`❌ Erreur lors de la tentative ${attempt}:`, error);
      if (attempt === MAX_ATTEMPTS) {
        throw error;
      }
    }
  }
  
  console.log(`⏰ Timeout après ${MAX_ATTEMPTS} tentatives`);
  return { timeout: true, attempts: MAX_ATTEMPTS };
}
