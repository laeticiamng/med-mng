
import { supabase } from '@/integrations/supabase/client';

interface GenerateMusicRequest {
  lyrics: string;
  style: string;
  rang: 'A' | 'B' | 'TRANSPOSE';
  duration: number;
  language: string;
  fastMode: boolean;
  composition?: {
    styles: string[];
    fusion_mode: boolean;
    enhanced_duration: true;
  };
}

export const callSunoApi = async (requestBody: GenerateMusicRequest) => {
  console.log('📤 ENVOI À EDGE FUNCTION SUPABASE (generate-music):', requestBody);
  
  const startTime = Date.now();
  console.log('🚀 Appel Edge Function Supabase...');

  const { data, error } = await supabase.functions.invoke('generate-music', {
    body: requestBody
  });

  const callDuration = Math.floor((Date.now() - startTime) / 1000);
  console.log(`⏱️ Durée appel Edge Function: ${callDuration}s`);

  // Gestion des erreurs Supabase
  if (error) {
    console.error('❌ ERREUR SUPABASE FUNCTIONS:', error);
    console.error('❌ Type d\'erreur:', typeof error);
    console.error('❌ Structure erreur:', Object.keys(error));
    
    let errorMessage = 'Erreur lors de la génération musicale avec Suno';
    
    if (error.message?.includes('Failed to send') || error.message?.includes('fetch')) {
      errorMessage = '🔧 Erreur de connexion à l\'API Suno. Vérifiez votre configuration réseau et réessayez.';
    } else if (error.message?.includes('Authorization') || error.message?.includes('401')) {
      errorMessage = '🔑 Clé API Suno manquante ou invalide. Veuillez vérifier la configuration Supabase.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = '⏰ Timeout: La génération Suno prend trop de temps. Réessayez avec des paroles plus courtes.';
    } else if (error.message?.includes('503')) {
      errorMessage = '🚫 Service Suno temporairement indisponible. Réessayez dans quelques minutes.';
    } else {
      errorMessage = `Erreur Suno: ${error.message || 'Erreur inconnue'}`;
    }
    
    throw new Error(errorMessage);
  }

  console.log('📥 RÉPONSE EDGE FUNCTION REÇUE:', data);
  console.log('📊 Type de réponse:', typeof data);
  console.log('📊 Clés de la réponse:', data ? Object.keys(data) : 'aucune');

  if (!data) {
    throw new Error('Aucune donnée reçue de l\'Edge Function Suno');
  }

  if (data.error || data.status === 'error') {
    let errorMessage = data.error || data.message || 'Erreur inconnue lors de la génération Suno';
    
    if (data.error_code === 429) {
      errorMessage = '💳 Crédits Suno épuisés. Rechargez votre compte sur https://apibox.erweima.ai';
    } else if (data.error_code === 401) {
      errorMessage = '🔑 Clé API Suno invalide. Vérifiez votre configuration dans Supabase.';
    } else if (data.error_code === 408) {
      errorMessage = '⏰ Génération Suno trop longue. Réessayez avec des paroles plus courtes.';
    }
    
    console.error('❌ ERREUR API SUNO:', errorMessage);
    throw new Error(errorMessage);
  }

  if (!data.audioUrl) {
    console.error('❌ AUCUNE URL AUDIO dans la réponse Suno:', data);
    throw new Error('Aucune URL audio générée par l\'API Suno');
  }

  console.log(`🎧 URL AUDIO SUNO REÇUE: ${data.audioUrl}`);
  console.log(`🎵 Validation URL: ${data.audioUrl.startsWith('http') ? '✅ Valide' : '❌ Invalide'}`);

  return { audioUrl: data.audioUrl, callDuration };
};
