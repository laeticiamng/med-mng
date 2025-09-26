
import { supabase } from '@/integrations/supabase/client';
import { errorService } from '@/services/core/ErrorService';

interface GenerateMusicRequest {
  lyrics: string;
  style: string;
  rang: 'A' | 'B' | 'AB' | 'TRANSPOSE';
  duration: number;
  language: string;
  fastMode: boolean;
  composition?: {
    styles: string[];
    fusion_mode: boolean;
    enhanced_duration: true;
  };
  itemCode?: string;
  // Paramètres Suno optimisés
  customMode?: boolean;
  instrumental?: boolean;
  model?: string;
  title?: string;
}

export const callSunoApi = async (requestBody: GenerateMusicRequest) => {
  console.log('🚀 APPEL ULTRA-RAPIDE À EDGE FUNCTION SUPABASE:', requestBody);
  
  const startTime = Date.now();
  console.log('⚡ Démarrage génération ultra-optimisée...');

  // Forcer le mode rapide pour toutes les générations
  const optimizedRequest = {
    ...requestBody,
    fastMode: true, // Toujours en mode rapide
    optimized: true, // Flag pour indiquer l'optimisation
    itemCode: requestBody.itemCode || 'EDN' // Ajouter itemCode
  };

  try {
    // Utiliser suno-music-optimized pour une meilleure fiabilité
    const { data, error } = await supabase.functions.invoke('suno-music-optimized', {
      body: {
        paroles: [optimizedRequest.lyrics],
        style: optimizedRequest.style,
        rang: optimizedRequest.rang,
        duration: optimizedRequest.duration,
        customMode: optimizedRequest.customMode !== false,
        instrumental: optimizedRequest.instrumental || false,
        model: optimizedRequest.model || "V4_5"
      }
    });

    const callDuration = Math.floor((Date.now() - startTime) / 1000);
    console.log(`⚡ Durée appel ultra-optimisée: ${callDuration}s`);

    // Gestion d'erreurs optimisée
      if (error) {
        errorService.handleError(error, 'user_action', true);

      let errorMessage = 'Erreur lors de la génération musicale ultra-rapide';
      
      if (error.message?.includes('Failed to send') || error.message?.includes('fetch')) {
        errorMessage = '🔧 Problème de connexion. Vérifiez votre réseau et réessayez.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = '⏰ La génération prend plus de temps que prévu. L\'API Suno est peut-être occupée. Réessayez dans quelques minutes.';
      } else if (error.message?.includes('503')) {
        errorMessage = '🚫 Service temporairement indisponible. L\'API Suno est en maintenance. Réessayez dans quelques minutes.';
      } else if (error.message?.includes('429')) {
        errorMessage = '💳 Trop de demandes. Attendez quelques minutes avant de réessayer.';
      } else if (error.message?.includes('401') || error.message?.includes('Authorization')) {
        errorMessage = '🔑 Problème d\'authentification avec l\'API Suno. Vérifiez la configuration.';
      } else {
        errorMessage = `Erreur Suno: ${error.message || 'Erreur inconnue'}`;
      }
      
      throw new Error(errorMessage);
    }

    console.log('📥 RÉPONSE ULTRA-RAPIDE REÇUE:', data);

    if (!data) {
      throw new Error('Aucune donnée reçue en mode ultra-rapide');
    }

    // Gestion des timeouts côté serveur
    if (data.status === 'timeout') {
      errorService.handleWarning('⏰ TIMEOUT SERVEUR - La génération prend plus de temps que prévu', 'user_action');
      throw new Error('⏰ La génération Suno prend plus de temps que prévu. Cela peut arriver quand l\'API est très occupée. Réessayez dans 2-3 minutes.');
    }

    if (data.error || data.status === 'error') {
      let errorMessage = data.error || data.message || 'Erreur inconnue en mode ultra-rapide';
      
      // Détecter spécifiquement l'erreur de crédits insuffisants
      if (data.error_code === 429 || 
          data.details?.code === 429 || 
          errorMessage.includes('insufficient') || 
          errorMessage.includes('credits')) {
        errorMessage = '💳 Crédits Suno épuisés ! Veuillez recharger votre compte API Suno pour continuer la génération musicale.';
      } else if (data.error_code === 408) {
        errorMessage = '⏰ Timeout: La génération prend trop de temps. L\'API Suno est peut-être surchargée. Réessayez plus tard.';
      } else if (data.error_code === 401) {
        errorMessage = '🔑 Problème d\'authentication avec l\'API Suno. Contactez l\'administrateur.';
      }
      
      errorService.handleError(new Error(`❌ ERREUR API SUNO ULTRA-RAPIDE: ${errorMessage}`), 'user_action', true);
      throw new Error(errorMessage);
    }

    // L'API Suno peut retourner soit directement audioUrl, soit trackId pour polling
    if (data.audioUrl) {
      console.log(`🎧 URL AUDIO ULTRA-RAPIDE REÇUE: ${data.audioUrl}`);
      console.log(`⚡ Validation ultra-rapide: ${data.audioUrl.startsWith('http') ? '✅ Valide' : '❌ Invalide'}`);
      return { audioUrl: data.audioUrl, callDuration };
    } else if (data.trackId) {
      console.log(`🆔 TRACK ID REÇU pour polling: ${data.trackId}`);
      // Retourner le trackId pour que le système de polling puisse récupérer l'audio plus tard
      return { trackId: data.trackId, callDuration };
    } else {
      errorService.handleError(new Error('❌ AUCUNE URL AUDIO ni TRACK ID en mode ultra-rapide'), 'user_action', true);
      throw new Error('Aucune URL audio ni trackId généré par l\'API Suno');
    }
    
  } catch (supabaseError) {
    const callDuration = Math.floor((Date.now() - startTime) / 1000);
    console.log(`⚡ Durée appel (avec erreur): ${callDuration}s`);
    
    // Re-throw l'erreur pour qu'elle soit gérée par le caller
    if (supabaseError instanceof Error) {
      throw supabaseError;
    }

    throw new Error('Erreur lors de la génération musicale');
  }
};
