
import { secureSunoClient as SunoApiClient } from "../lib/secureApiClient";

/**
 * Supprime les voix d'un audio Suno pour créer une version instrumentale
 * @param audioId - ID de l'audio à traiter
 * @returns Promise<string> - URL du fichier audio sans voix
 * @throws {Error} - Si la suppression des voix échoue ou si l'endpoint n'est pas disponible
 */
export async function removeVocals(audioId: string): Promise<string> {
  if (!audioId) {
    throw new Error("AudioId is required for vocal removal");
  }

  try {
    // Tentative d'appel via edge function pour la suppression des voix
    // Note: Cette fonctionnalité pourrait ne pas être encore disponible
    const response = await SunoApiClient.generateMusic({
      action: 'remove_vocals',
      audioId: audioId,
      output_format: 'mp3'
    });
    
    if (response?.instrumental_url) {
      return response.instrumental_url;
    }
    
    throw new Error("Vocal removal failed: No instrumental URL returned from API");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Si la fonctionnalité n'existe pas encore, retourner une erreur documentée
    if (errorMessage.includes('not implemented') || 
        errorMessage.includes('not available') ||
        errorMessage.includes('invalid action')) {
      throw new Error(
        `Vocal removal endpoint not yet available in Suno API. ` +
        `AudioId: ${audioId}. This feature requires AI vocal separation technology. ` +
        `Consider using alternative services like Lalal.ai or Spleeter for vocal isolation.`
      );
    }
    
    // Pour les autres erreurs, les propager avec le contexte
    throw new Error(`Failed to remove vocals from audio ${audioId}: ${errorMessage}`);
  }
}
