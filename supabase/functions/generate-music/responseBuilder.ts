
import { corsHeaders, WAIT_TIME } from './constants.ts';

export function createSuccessResponse(
  audioUrl: string, 
  rang: 'A' | 'B', 
  style: string, 
  duration: number, 
  language: string, 
  attempts: number
): Response {
  const successResponse = {
    audioUrl: audioUrl,
    rang,
    style,
    duration: duration,
    durationFormatted: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
    generationTime: attempts * (WAIT_TIME / 1000),
    language: language,
    status: 'success',
    message: `✅ Musique générée avec succès pour le Rang ${rang}`,
    lyrics_integrated: true,
    vocals_included: true,
    taskId: '',
    attempts: attempts
  };

  console.log('✅ Retour de succès avec audio réel:', successResponse);

  return new Response(
    JSON.stringify(successResponse),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export function createTimeoutResponse(
  taskId: string, 
  rang: 'A' | 'B', 
  style: string, 
  duration: number
): Response {
  console.warn('⚠️ Timeout: Génération Suno prend plus de 2 minutes');
  
  const timeoutResponse = {
    status: 'timeout',
    message: 'La génération prend plus de temps que prévu. Veuillez réessayer dans quelques minutes.',
    taskId: taskId,
    rang,
    style,
    duration: duration,
    attempts: 12,
    timeoutAfter: '2 minutes'
  };

  console.log('⏰ Retour de timeout avec taskId:', timeoutResponse);

  return new Response(
    JSON.stringify(timeoutResponse),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 408
    }
  );
}

export function createErrorResponse(error: Error): Response {
  let errorMessage = error.message || 'Erreur inconnue';
  let statusCode = 500;
  
  if (errorMessage.includes('taskId manquant')) {
    errorMessage = '🔧 Erreur Suno: Réponse de génération invalide';
    statusCode = 400;
  } else if (errorMessage.includes('Génération échouée')) {
    errorMessage = '🚫 Suno AI: Génération de musique échouée';
    statusCode = 400;
  } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
    errorMessage = '🔑 Clé API Suno invalide ou expirée';
    statusCode = 401;
  }
  
  return new Response(
    JSON.stringify({ 
      error: errorMessage,
      status: 'error',
      error_code: statusCode,
      details: 'Erreur lors de la génération avec Suno API',
      debug: {
        error_type: error.name,
        error_message: error.message,
        timestamp: new Date().toISOString()
      }
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: statusCode
    }
  );
}
