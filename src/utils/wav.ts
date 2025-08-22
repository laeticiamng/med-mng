
import { secureSunoClient as SunoApiClient } from "../lib/secureApiClient";

export async function convertToWav(audioId: string) {
  try {
    return await SunoApiClient.convertToWav(audioId);
  } catch (error) {
    console.warn("Suno WAV conversion unavailable", error);
    return {
      success: false,
      message: "Conversion WAV indisponible pour le moment.",
    };
  }
}
