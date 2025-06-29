
import { corsHeaders } from './constants.ts';

export function createSuccessResponse(
  audioUrl: string, 
  rang: 'A' | 'B', 
  style: string, 
  duration: number, 
  language: string, 
  attempts: number
): Response {
  return new Response(
    JSON.stringify({
      status: 'success',
      audioUrl,
      rang,
      style,
      duration,
      language,
      attempts,
      timestamp: new Date().toISOString()
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    }
  );
}

export function createTimeoutResponse(
  taskId: string, 
  rang: 'A' | 'B', 
  style: string, 
  duration: number
): Response {
  console.log('⏰ Retour de timeout avec taskId:', {
    status: 'timeout',
    message: 'La génération prend plus de temps que prévu. Veuillez réessayer dans quelques minutes.',
    taskId,
    rang,
    style,
    duration,
    attempts: 12,
    timeoutAfter: '2 minutes',
    progress: 100
  });

  return new Response(
    JSON.stringify({
      status: 'timeout',
      message: 'La génération prend plus de temps que prévu. Veuillez réessayer dans quelques minutes.',
      taskId,
      rang,
      style,
      duration,
      attempts: 12,
      timeoutAfter: '2 minutes',
      progress: 100
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 408
    }
  );
}

export function createErrorResponse(error: Error): Response {
  const errorMessage = error.message || 'Erreur inconnue lors de la génération';
  
  return new Response(
    JSON.stringify({
      status: 'error',
      message: errorMessage,
      error_code: 500,
      timestamp: new Date().toISOString()
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    }
  );
}
