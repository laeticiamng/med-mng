
import { SunoApiClient } from './sunoClient.ts';
import { validateRequest } from './validation.ts';
import { createSunoRequest } from './sunoRequestBuilder.ts';
import { waitForAudio } from './audioWaiter.ts';
import { createSuccessResponse, createTimeoutResponse, createErrorResponse } from './responseBuilder.ts';
import { corsHeaders } from './constants.ts';

export async function handleMusicGeneration(req: Request): Promise<Response> {
  try {
    const body = await req.text();
    console.log(`📥 Raw request body: ${body}`);
    
    const requestData = validateRequest(body);
    const { lyrics, style, rang, duration, language, fastMode } = requestData;

    console.log('🎵 Requête génération musique Suno reçue:', { 
      lyricsLength: lyrics?.length || 0, 
      style, 
      rang, 
      duration,
      language,
      fastMode,
      lyricsPreview: lyrics?.substring(0, 100) + '...' || 'Aucune parole'
    });

    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    if (!SUNO_API_KEY) {
      console.error('❌ SUNO_API_KEY manquante dans les secrets Supabase');
      throw new Error('Clé API Suno non configurée dans les secrets Supabase. Veuillez ajouter SUNO_API_KEY dans les paramètres des fonctions.');
    }

    console.log('🔑 SUNO_API_KEY trouvée, longueur:', SUNO_API_KEY.length);

    const sunoClient = new SunoApiClient(SUNO_API_KEY);
    const sunoRequest = createSunoRequest(lyrics, style, rang);

    console.log('🎵 Envoi requête de génération à Suno API:', sunoRequest);

    const generateResponse = await sunoClient.post('https://apibox.erweima.ai/api/v1/generate', sunoRequest);
    console.log('✅ Réponse génération Suno reçue:', generateResponse);

    if (!generateResponse || !generateResponse.data || !generateResponse.data.taskId) {
      throw new Error('Réponse de génération invalide: taskId manquant');
    }

    const taskId = generateResponse.data.taskId;
    console.log('🎵 TaskId reçu:', taskId);

    const audioResult = await waitForAudio(sunoClient, taskId);
    
    if (audioResult.timeout) {
      return createTimeoutResponse(taskId, rang, style, duration);
    }

    return createSuccessResponse(audioResult.audioUrl, rang, style, duration, language, audioResult.attempts);

  } catch (error) {
    console.error('❌ Erreur appel Suno API:', error);
    return createErrorResponse(error);
  }
}
