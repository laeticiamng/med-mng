
import { secureSunoClient as SunoApiClient } from "../lib/secureApiClient";

export async function removeVocals(audioId: string) {
  try {
    return await SunoApiClient.removeVocals(audioId);
  } catch (error) {
    console.warn("Suno vocal removal unavailable", error);
    return {
      success: false,
      message: "Suppression de voix indisponible pour le moment.",
    };
  }
}
