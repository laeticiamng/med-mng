
import { secureSunoClient as SunoApiClient } from "../lib/secureApiClient";

/**
 * Convertit un audio Suno en format WAV
 * @param audioId - ID de l'audio à convertir
 * @returns Promise<string> - URL du fichier WAV converti
 * @throws {Error} - Si la conversion échoue ou si l'endpoint n'est pas disponible
 */
export async function convertToWav(audioId: string): Promise<string> {
  if (!audioId) {
    throw new Error("AudioId is required for WAV conversion");
  }

  try {
    // Tentative d'appel via edge function pour la conversion WAV
    // Note: Cette fonctionnalité pourrait ne pas être encore disponible
    const response = await SunoApiClient.generateMusic({
      action: 'convert_to_wav',
      audioId: audioId
    });
    
    if (response?.wav_url) {
      return response.wav_url;
    }
    
    throw new Error("WAV conversion failed: No URL returned from API");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Si la fonctionnalité n'existe pas encore, retourner une erreur documentée
    if (errorMessage.includes('not implemented') || 
        errorMessage.includes('not available') ||
        errorMessage.includes('invalid action')) {
      throw new Error(
        `WAV conversion endpoint not yet available in Suno API. ` +
        `AudioId: ${audioId}. Please check Suno documentation for updates. ` +
        `This feature requires server-side audio format conversion capabilities.`
      );
    }
    
    // Pour les autres erreurs, les propager avec le contexte
    throw new Error(`Failed to convert audio ${audioId} to WAV: ${errorMessage}`);
  }
}
