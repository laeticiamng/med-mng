
import { DEFAULT_DURATION, DEFAULT_LANGUAGE, DEFAULT_FAST_MODE } from './constants.ts';

export interface RequestData {
  lyrics: string;
  style: string;
  rang: 'A' | 'B';
  duration: number;
  language: string;
  fastMode: boolean;
}

export function validateRequest(body: string): RequestData {
  if (!body || body.trim() === '') {
    throw new Error('Corps de requête vide');
  }

  let requestData;
  try {
    requestData = JSON.parse(body);
  } catch (parseError) {
    console.error('❌ Erreur parsing JSON requête:', parseError);
    throw new Error('JSON invalide dans la requête');
  }

  const { 
    lyrics, 
    style, 
    rang, 
    duration = DEFAULT_DURATION, 
    language = DEFAULT_LANGUAGE, 
    fastMode = DEFAULT_FAST_MODE 
  } = requestData;

  if (!lyrics || !style || !rang) {
    throw new Error('Paramètres manquants: lyrics, style et rang sont requis');
  }

  if (lyrics.trim() === '' || lyrics === 'Aucune parole disponible pour le Rang A' || lyrics === 'Aucune parole disponible pour le Rang B') {
    throw new Error(`Aucune parole valide fournie pour le Rang ${rang}`);
  }

  return { lyrics, style, rang, duration, language, fastMode };
}
