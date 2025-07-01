
import { SunoApiClient } from "../lib/sunoClient";

interface GenerateLyricsPayload {
  prompt: string;      // ≤ 200 mots
  callBackUrl: string; // webhook unique étape "complete"
}

interface GenerateLyricsResponse {
  taskId: string;
}

export async function generateLyrics(payload: GenerateLyricsPayload) {
  const client = new SunoApiClient();
  return client.post<GenerateLyricsResponse>("/api/v1/lyrics", payload);
}
