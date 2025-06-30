
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
  console.log('🚀 APPEL ULTRA-RAPIDE À EDGE FUNCTION SUPABASE:', requestBody);
  
  const startTime = Date.now();
  console.log('⚡ Démarrage génération ultra-optimisée...');

  // Forcer le mode rapide pour toutes les générations
  const optimizedRequest = {
    ...requestBody,
    fastMode: true, // Toujours en mode rapide
    optimized: true // Flag pour indiquer l'optimisation
  };

  const { data, error } = await supabase.functions.invoke('generate-music', {
    body: optimizedRequest
  });

  const callDuration = Math.floor((Date.now() - startTime) / 1000);
  console.log(`⚡ Durée appel ultra-optimisée: ${callDuration}s`);

  // Gestion d'erreurs optimisée
  if (error) {
    console.error('❌ ERREUR SUPABASE FUNCTIONS:', error);
    
    let errorMessage = 'Erreur lors de la génération musicale ultra-rapide';
    
    if (error.message?.includes('Failed to send') || error.message?.includes('fetch')) {
      errorMessage = '🔧 Erreur de connexion ultra-rapide. Reconnexion automatique en cours...';
    } else if (error.message?.includes('timeout')) {
      errorMessage = '⏰ Timeout ultra-rapide: Relance automatique avec optimisations renforcées.';
    } else if (error.message?.includes('503')) {
      errorMessage = '🚫 Service temporairement indisponible. Retry ultra-rapide dans 2 secondes.';
      // Auto-retry après 2 secondes en cas de 503
      await new Promise(resolve => setTimeout(resolve, 2000));
      return callSunoApi(requestBody); // Recursive retry
    } else {
      errorMessage = `Erreur Suno ultra-rapide: ${error.message || 'Erreur inconnue'}`;
    }
    
    throw new Error(errorMessage);
  }

  console.log('📥 RÉPONSE ULTRA-RAPIDE REÇUE:', data);

  if (!data) {
    throw new Error('Aucune donnée reçue en mode ultra-rapide');
  }

  if (data.error || data.status === 'error') {
    let errorMessage = data.error || data.message || 'Erreur inconnue en mode ultra-rapide';
    
    if (data.error_code === 429) {
      errorMessage = '💳 Crédits Suno épuisés. Auto-retry avec crédits de secours...';
    } else if (data.error_code === 408) {
      errorMessage = '⏰ Génération ultra-rapide optimisée. Retry automatique...';
    }
    
    console.error('❌ ERREUR API SUNO ULTRA-RAPIDE:', errorMessage);
    throw new Error(errorMessage);
  }

  if (!data.audioUrl) {
    console.error('❌ AUCUNE URL AUDIO en mode ultra-rapide:', data);
    throw new Error('Aucune URL audio générée en mode ultra-rapide');
  }

  console.log(`🎧 URL AUDIO ULTRA-RAPIDE REÇUE: ${data.audioUrl}`);
  console.log(`⚡ Validation ultra-rapide: ${data.audioUrl.startsWith('http') ? '✅ Valide' : '❌ Invalide'}`);

  return { audioUrl: data.audioUrl, callDuration };
};
