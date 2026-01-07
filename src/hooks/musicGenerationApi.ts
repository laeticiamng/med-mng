
import { supabase } from '@/integrations/supabase/client';

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
  const startTime = Date.now();

  // Forcer le mode rapide pour toutes les générations
  const optimizedRequest = {
    ...requestBody,
    fastMode: true,
    optimized: true,
    itemCode: requestBody.itemCode || 'EDN'
  };

  try {
    const { data, error } = await supabase.functions.invoke('generate-music', {
      body: optimizedRequest
    });

    const callDuration = Math.floor((Date.now() - startTime) / 1000);

    // Gestion d'erreurs selon documentation officielle Suno API
    if (error) {
      let errorMessage = 'Erreur lors de la génération musicale';
      
      if (error.message?.includes('Failed to send') || error.message?.includes('fetch')) {
        errorMessage = '🔧 Problème de connexion. Vérifiez votre réseau et réessayez.';
      } else if (error.message?.includes('timeout') || error.message?.includes('408')) {
        errorMessage = '⏰ La génération prend plus de temps que prévu. Réessayez dans quelques minutes.';
      } else if (error.message?.includes('503') || error.message?.includes('455')) {
        // 455 = Maintenance système selon doc Suno
        errorMessage = '🚫 Service en maintenance. Réessayez dans quelques minutes.';
      } else if (error.message?.includes('429')) {
        errorMessage = '💳 Crédits Suno insuffisants. Veuillez recharger votre compte.';
      } else if (error.message?.includes('430')) {
        // 430 = Fréquence d'appel trop élevée selon doc Suno
        errorMessage = '⏳ Trop de requêtes en cours. Attendez quelques secondes avant de réessayer.';
      } else if (error.message?.includes('413')) {
        // 413 = Prompt ou thème trop long selon doc Suno
        errorMessage = '📝 Le texte est trop long. Réduisez les paroles ou le style.';
      } else if (error.message?.includes('405')) {
        // 405 = Limite de taux dépassée selon doc Suno
        errorMessage = '🚦 Limite de taux dépassée. Attendez avant de réessayer.';
      } else if (error.message?.includes('401') || error.message?.includes('Authorization')) {
        errorMessage = '🔑 Problème d\'authentification avec l\'API Suno.';
      } else if (error.message?.includes('404')) {
        errorMessage = '🔗 Endpoint API Suno introuvable. Contactez le support.';
      } else {
        errorMessage = `Erreur Suno: ${error.message || 'Erreur inconnue'}`;
      }
      
      throw new Error(errorMessage);
    }

    if (!data) {
      throw new Error('Aucune donnée reçue');
    }

    // Gestion des timeouts côté serveur
    if (data.status === 'timeout') {
      throw new Error('⏰ La génération prend plus de temps que prévu. Réessayez dans 2-3 minutes.');
    }

    if (data.error || data.status === 'error') {
      let errorMessage = data.error || data.message || 'Erreur inconnue';
      
      if (data.error_code === 429 || 
          data.details?.code === 429 || 
          errorMessage.includes('insufficient') || 
          errorMessage.includes('credits')) {
        errorMessage = '💳 Crédits Suno épuisés ! Veuillez recharger votre compte API Suno.';
      } else if (data.error_code === 408) {
        errorMessage = '⏰ Timeout: La génération prend trop de temps. Réessayez plus tard.';
      } else if (data.error_code === 401) {
        errorMessage = '🔑 Problème d\'authentication avec l\'API Suno.';
      }
      
      throw new Error(errorMessage);
    }

    // L'API Suno peut retourner soit directement audioUrl, soit trackId pour polling
    if (data.audioUrl) {
      return { audioUrl: data.audioUrl, callDuration };
    } else if (data.trackId) {
      return { trackId: data.trackId, callDuration };
    } else {
      throw new Error('Aucune URL audio ni trackId généré par l\'API Suno');
    }
    
  } catch (supabaseError) {
    throw supabaseError;
  }
};
