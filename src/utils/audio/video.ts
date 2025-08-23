
import { secureSunoClient as SunoApiClient } from "../../lib/secureApiClient";

/**
 * Interface pour les options de génération vidéo
 */
export interface VideoGenerationOptions {
  /** Style visuel de la vidéo */
  visualStyle?: 'abstract' | 'waveform' | 'spectrum' | 'lyric-video';
  /** Résolution de la vidéo */
  resolution?: '720p' | '1080p' | '4k';
  /** Couleurs dominantes */
  colorScheme?: string[];
  /** Inclure les paroles dans la vidéo */
  includeLyrics?: boolean;
}

/**
 * Génère une vidéo MP4 à partir d'un audio Suno
 * @param audioId - ID de l'audio à convertir en vidéo
 * @param options - Options de génération vidéo
 * @returns Promise<string> - URL du fichier vidéo MP4 généré
 * @throws {Error} - Si la génération vidéo échoue ou si l'endpoint n'est pas disponible
 */
export async function generateVideo(
  audioId: string, 
  options: VideoGenerationOptions = {}
): Promise<string> {
  if (!audioId) {
    throw new Error("AudioId is required for video generation");
  }

  const {
    visualStyle = 'waveform',
    resolution = '1080p',
    colorScheme = ['#1e40af', '#3b82f6', '#60a5fa'],
    includeLyrics = true
  } = options;

  try {
    // Tentative d'appel via edge function pour la génération vidéo
    // Note: Cette fonctionnalité pourrait ne pas être encore disponible
    const response = await SunoApiClient.generateMusic({
      action: 'generate_video',
      audioId: audioId,
      visual_style: visualStyle,
      resolution,
      color_scheme: colorScheme,
      include_lyrics: includeLyrics,
      output_format: 'mp4'
    });
    
    if (response?.video_url) {
      return response.video_url;
    }
    
    throw new Error("Video generation failed: No video URL returned from API");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Si la fonctionnalité n'existe pas encore, retourner une erreur documentée
    if (errorMessage.includes('not implemented') || 
        errorMessage.includes('not available') ||
        errorMessage.includes('invalid action')) {
      throw new Error(
        `Video generation endpoint not yet available in Suno API. ` +
        `AudioId: ${audioId}. This feature requires AI video synthesis capabilities. ` +
        `Consider using alternative video generation services like RunwayML, Pika Labs, or manual video editing tools.`
      );
    }
    
    // Pour les autres erreurs, les propager avec le contexte
    throw new Error(`Failed to generate video for audio ${audioId}: ${errorMessage}`);
  }
}
