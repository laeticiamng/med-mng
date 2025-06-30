
import { corsHeaders } from './constants.ts';

export function createSuccessResponse(audioUrl: string, rang: string, style: string, duration: number, language: string = 'fr', attempts: number = 1) {
  console.log(`✅ SUCCÈS - Création réponse avec URL:`, audioUrl);
  
  const response = {
    status: 'success',
    audioUrl: audioUrl,
    rang: rang,
    style: style,
    duration: duration,
    language: language,
    attempts: attempts,
    message: `Musique générée avec succès pour le Rang ${rang} en ${language} (${attempts} tentatives)`
  };
  
  console.log(`📤 Réponse finale:`, response);
  
  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  });
}

export function createTimeoutResponse(taskId: string, rang: string, style: string, duration: number) {
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
  
  return new Response(JSON.stringify(timeoutResponse), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 408 // Request Timeout
  });
}

export function createErrorResponse(error: any) {
  console.error(`❌ ERREUR - Création réponse erreur:`, error);
  
  const errorResponse = {
    error: 'Erreur lors de la génération musicale',
    status: 'error',
    message: error.message || 'Une erreur inattendue est survenue',
    error_code: 500,
    details: 'Erreur lors de la communication avec l\'API Suno',
    timestamp: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(errorResponse), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 500
  });
}
