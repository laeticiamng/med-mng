
import { secureSunoClient as SunoApiClient } from "../lib/secureApiClient";

export async function generateVideo(audioId: string) {
  try {
    return await SunoApiClient.generateVideo(audioId);
  } catch (error) {
    console.warn("Suno video generation unavailable", error);
    return {
      success: false,
      message: "Génération vidéo indisponible pour le moment.",
    };
  }
}
