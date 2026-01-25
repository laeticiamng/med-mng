
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
  // ✅ Paramètres avancés Suno V4.5+
  advancedParams?: {
    vocalGender?: 'male' | 'female' | 'mixed';
    negativeTags?: string;
    styleWeight?: number;
    weirdnessConstraint?: number;
  };
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
    const { _data, error } = await supabase.functions.invoke('generate-music', {
      body: optimizedRequest
    });

    const callDuration = Math.floor((Date.now() - startTime) / 1000);

    // Gestion d'erreurs selon documentation officielle Suno API
    if (error) {
      let errorMessage = 'Erreur lors de la génération musicale';
      let shouldRetry = false;
      let retryAfter = 0;
      
      if (error.message?.includes('Failed to send') || error.message?.includes('fetch')) {
        errorMessage = '🔧 Problème de connexion. Vérifiez votre réseau et réessayez.';
        shouldRetry = true;
        retryAfter = 3000;
      } else if (error.message?.includes('timeout') || error.message?.includes('408')) {
        errorMessage = '⏰ La génération prend plus de temps que prévu. Réessayez dans quelques minutes.';
        shouldRetry = true;
        retryAfter = 60000;
      } else if (error.message?.includes('503') || error.message?.includes('455')) {
        // 455 = Maintenance système selon doc Suno
        errorMessage = '🚫 Service en maintenance. Réessayez dans quelques minutes.';
        shouldRetry = true;
        retryAfter = 120000;
      } else if (error.message?.includes('429') || error.message?.includes('402')) {
        // 429 = Crédits insuffisants, 402 = Paiement requis
        errorMessage = '💳 Crédits Suno insuffisants. Veuillez recharger votre compte.';
        shouldRetry = false;
      } else if (error.message?.includes('430')) {
        // 430 = Fréquence d'appel trop élevée selon doc Suno - BACKOFF EXPONENTIEL
        errorMessage = '⏳ Trop de requêtes en cours. Réessai automatique dans 10 secondes...';
        shouldRetry = true;
        retryAfter = 10000; // Backoff de 10 secondes
      } else if (error.message?.includes('413')) {
        // 413 = Prompt ou thème trop long selon doc Suno
        errorMessage = '📝 Le texte est trop long. Réduisez les paroles ou le style.';
        shouldRetry = false;
      } else if (error.message?.includes('405')) {
        // 405 = Limite de taux dépassée selon doc Suno
        errorMessage = '🚦 Limite de taux dépassée. Attendez 30 secondes avant de réessayer.';
        shouldRetry = true;
        retryAfter = 30000;
      } else if (error.message?.includes('401') || error.message?.includes('Authorization')) {
        errorMessage = '🔑 Problème d\'authentification avec l\'API Suno.';
        shouldRetry = false;
      } else if (error.message?.includes('404')) {
        errorMessage = '🔗 Endpoint API Suno introuvable. Contactez le support.';
        shouldRetry = false;
      } else {
        errorMessage = `Erreur Suno: ${error.message || 'Erreur inconnue'}`;
      }
      
      // Ajouter les infos de retry au message si applicable
      const errorWithRetryInfo = new Error(errorMessage);
      (errorWithRetryInfo as any).shouldRetry = shouldRetry;
      (errorWithRetryInfo as any).retryAfter = retryAfter;
      throw errorWithRetryInfo;
    }

    if (!_data) {
      throw new Error('Aucune donnée reçue');
    }

    // Gestion des timeouts côté serveur
    if (_data.status === 'timeout') {
      throw new Error('⏰ La génération prend plus de temps que prévu. Réessayez dans 2-3 minutes.');
    }

    if (_data.error || _data.status === 'error') {
      let errorMessage = _data.error || _data.message || 'Erreur inconnue';
      
      if (_data.error_code === 429 || 
          _data.details?.code === 429 || 
          errorMessage.includes('insufficient') || 
          errorMessage.includes('credits')) {
        errorMessage = '💳 Crédits Suno épuisés ! Veuillez recharger votre compte API Suno.';
      } else if (_data.error_code === 408) {
        errorMessage = '⏰ Timeout: La génération prend trop de temps. Réessayez plus tard.';
      } else if (_data.error_code === 401) {
        errorMessage = '🔑 Problème d\'authentication avec l\'API Suno.';
      }
      
      throw new Error(errorMessage);
    }

    // L'API Suno peut retourner soit directement audioUrl, soit trackId pour polling
    if (_data.audioUrl) {
      return { audioUrl: _data.audioUrl, callDuration };
    } else if (_data.trackId) {
      return { trackId: _data.trackId, callDuration };
    } else {
      throw new Error('Aucune URL audio ni trackId généré par l\'API Suno');
    }
    
  } catch (supabaseError) {
    throw supabaseError;
  }
};
