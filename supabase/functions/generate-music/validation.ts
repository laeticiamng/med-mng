
import { DEFAULT_DURATION } from './constants.ts';

export interface GenerateMusicRequest {
  lyrics: string;
  style: string;
  rang: 'A' | 'B';
  duration?: number;
  language?: string;
  fastMode?: boolean;
  composition?: {
    styles: string[];
    fusion_mode: boolean;
    enhanced_duration: boolean;
  };
}

export function validateRequest(body: string): GenerateMusicRequest {
  let requestData;
  
  try {
    requestData = JSON.parse(body);
  } catch (error) {
    throw new Error('Corps de requête JSON invalide');
  }

  if (!requestData.lyrics || typeof requestData.lyrics !== 'string') {
    throw new Error('Paroles manquantes ou invalides');
  }

  if (!requestData.style || typeof requestData.style !== 'string') {
    throw new Error('Style musical manquant ou invalide');
  }

  if (!requestData.rang || !['A', 'B'].includes(requestData.rang)) {
    throw new Error('Rang invalide (doit être A ou B)');
  }

  // Valider la durée avec une valeur par défaut
  const duration = requestData.duration && typeof requestData.duration === 'number' 
    ? Math.max(60, Math.min(600, requestData.duration)) // Entre 1 et 10 minutes
    : DEFAULT_DURATION;

  return {
    lyrics: requestData.lyrics.trim(),
    style: requestData.style.trim(),
    rang: requestData.rang,
    duration,
    language: requestData.language || 'fr',
    fastMode: requestData.fastMode !== false, // true par défaut
    composition: requestData.composition
  };
}
