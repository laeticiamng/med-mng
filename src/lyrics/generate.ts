
import { secureSunoClient as SunoApiClient } from "../lib/secureApiClient";

interface GenerateLyricsPayload {
  prompt: string;      // ≤ 200 mots
  callBackUrl: string; // webhook unique étape "complete"
}

interface GenerateLyricsResponse {
  taskId: string;
}

export async function generateLyrics(payload: GenerateLyricsPayload) {
  return SunoApiClient.generateMusic(payload);
}
