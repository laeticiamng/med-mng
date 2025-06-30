
import { corsHeaders } from './constants.ts';

export function createSuccessResponse(audioUrl: string, rang: string, style: string, duration: number, language: string, attempts: number): Response {
  console.log(`✅ Création réponse succès pour ${rang} - URL: ${audioUrl}`);
  
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  return new Response(
    JSON.stringify({
      status: 'success',
      audioUrl: audioUrl,
      rang: rang,
      style: style,
      duration: duration,
      durationText: durationText,
      language: language,
      attempts: attempts,
      message: `🎵 Musique générée avec succès pour le Rang ${rang} !`,
      generationTime: `Généré en ${attempts} tentatives`
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    }
  );
}

export function createTimeoutResponse(taskId: string, rang: string, style: string, duration: number): Response {
  console.log(`⏰ TIMEOUT - Création réponse timeout pour taskId: ${taskId}`);
  
  const timeoutResponse = {
    status: 'timeout',
    message: 'La génération prend plus de temps que prévu. Veuillez réessayer dans quelques minutes.',
    taskId: taskId,
    rang: rang,
    style: style,
    duration: duration,
    attempts: 24,
    timeoutAfter: '3 minutes',
    progress: 100
  };
  
  console.log(`⏰ Retour de timeout avec taskId: ${taskId}`, timeoutResponse);
  
  return new Response(
    JSON.stringify(timeoutResponse),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 408 // Request Timeout
    }
  );
}

export function createErrorResponse(error: any): Response {
  console.error('❌ Création réponse erreur:', error);
  
  let errorMessage = 'Erreur interne du serveur';
  let errorCode = 500;
  
  if (error.message) {
    if (error.message.includes('API key') || error.message.includes('Authorization')) {
      errorMessage = 'Clé API Suno manquante ou invalide';
      errorCode = 401;
    } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      errorMessage = 'Timeout lors de la génération musicale';
      errorCode = 408;
    } else if (error.message.includes('limit') || error.message.includes('quota')) {
      errorMessage = 'Limite API atteinte, réessayez plus tard';
      errorCode = 429;
    } else {
      errorMessage = error.message;
    }
  }
  
  return new Response(
    JSON.stringify({
      error: errorMessage,
      status: 'error',
      error_code: errorCode,
      details: 'Erreur lors de la génération avec Suno API',
      debug: {
        error_type: error.name || 'Unknown',
        error_message: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: errorCode
    }
  );
}
