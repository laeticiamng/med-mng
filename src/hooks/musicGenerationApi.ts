import { audioApi } from '@/lib/unifiedApiClient';
import type { CorpsRequeteGeneration } from './musicGenerationUtils';

export interface ReponseLancementGeneration {
  trackId: string;
  /** Durée demandée à Suno par le serveur (secondes). */
  dureeDemandee?: number;
  titre?: string;
  parolesTronquees?: boolean;
  lignesRetirees?: number;
  callDuration: number;
}

/**
 * Lance une génération via mm-generate-music. Les refus (abonnement, quota,
 * refus Suno…) arrivent déjà en français depuis le serveur : on les relaie
 * tels quels, sans message technique.
 */
export const callSunoApi = async (requestBody: CorpsRequeteGeneration): Promise<ReponseLancementGeneration> => {
  const startTime = Date.now();

  const response = await audioApi.generateMusic(requestBody);
  const callDuration = Math.floor((Date.now() - startTime) / 1000);

  if (!response.success || response.error) {
    throw new Error(response.error || 'Service momentanément indisponible, réessayez plus tard.');
  }

  const data = response.data;
  if (!data?.trackId) {
    throw new Error('Service momentanément indisponible, réessayez plus tard.');
  }

  const metadata = (data.metadata ?? {}) as {
    duration?: number; title?: string; parolesTronquees?: boolean; lignesRetirees?: number;
  };

  return {
    trackId: data.trackId,
    dureeDemandee: metadata.duration,
    titre: metadata.title,
    parolesTronquees: metadata.parolesTronquees,
    lignesRetirees: metadata.lignesRetirees,
    callDuration,
  };
};
