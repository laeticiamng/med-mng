
import { audioApi } from '@/lib/unifiedApiClient';

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
  customMode?: boolean;
  instrumental?: boolean;
  model?: string;
  title?: string;
  advancedParams?: {
    vocalGender?: 'male' | 'female' | 'mixed';
    negativeTags?: string;
    styleWeight?: number;
    weirdnessConstraint?: number;
  };
}

export const callSunoApi = async (requestBody: GenerateMusicRequest) => {
  const startTime = Date.now();

  const optimizedRequest = {
    ...requestBody,
    fastMode: true,
    optimized: true,
    itemCode: requestBody.itemCode || 'EDN'
  };

  try {
    const response = await audioApi.generateMusic(optimizedRequest as any);
    const callDuration = Math.floor((Date.now() - startTime) / 1000);

    if (!response.success || response.error) {
      let errorMessage = response.error || 'Erreur lors de la génération musicale';
      let shouldRetry = false;
      let retryAfter = 0;
      
      if (errorMessage.includes('Failed to send') || errorMessage.includes('fetch')) {
        errorMessage = '🔧 Problème de connexion. Vérifiez votre réseau et réessayez.';
        shouldRetry = true; retryAfter = 3000;
      } else if (errorMessage.includes('timeout') || errorMessage.includes('408')) {
        errorMessage = '⏰ La génération prend plus de temps que prévu.';
        shouldRetry = true; retryAfter = 60000;
      } else if (errorMessage.includes('503') || errorMessage.includes('455')) {
        errorMessage = '🚫 Service en maintenance. Réessayez dans quelques minutes.';
        shouldRetry = true; retryAfter = 120000;
      } else if (errorMessage.includes('429') || errorMessage.includes('402')) {
        errorMessage = '💳 Crédits Suno insuffisants.';
      } else if (errorMessage.includes('430')) {
        errorMessage = '⏳ Trop de requêtes. Réessai automatique...';
        shouldRetry = true; retryAfter = 10000;
      } else if (errorMessage.includes('413')) {
        errorMessage = '📝 Le texte est trop long.';
      } else if (errorMessage.includes('405')) {
        errorMessage = '🚦 Limite de taux dépassée.';
        shouldRetry = true; retryAfter = 30000;
      } else if (errorMessage.includes('401') || errorMessage.includes('Authorization')) {
        errorMessage = '🔑 Problème d\'authentification.';
      }
      
      const errorWithRetryInfo = new Error(errorMessage);
      (errorWithRetryInfo as any).shouldRetry = shouldRetry;
      (errorWithRetryInfo as any).retryAfter = retryAfter;
      throw errorWithRetryInfo;
    }

    const data = response.data;

    if (!data) {
      throw new Error('Aucune donnée reçue');
    }

    if ((data as any).status === 'timeout') {
      throw new Error('⏰ La génération prend plus de temps que prévu.');
    }

    if ((data as any).error || (data as any).status === 'error') {
      throw new Error((data as any).error || 'Erreur inconnue');
    }

    if ((data as any).audioUrl) {
      return { audioUrl: (data as any).audioUrl, callDuration };
    } else if (data.trackId) {
      return { trackId: data.trackId, callDuration };
    } else {
      throw new Error('Aucune URL audio ni trackId généré');
    }
    
  } catch (err) {
    throw err;
  }
};
