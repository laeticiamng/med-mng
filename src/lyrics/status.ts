
import { secureSunoClient as SunoApiClient } from "../lib/secureApiClient";

export interface LyricsStatus {
  status:
    | "PENDING"
    | "SUCCESS"
    | "CREATE_TASK_FAILED"
    | "GENERATE_LYRICS_FAILED"
    | "CALLBACK_EXCEPTION"
    | "SENSITIVE_WORD_ERROR";
  lyricsData?: Array<{ title: string; text: string }>;
}

export async function getLyricsStatus(taskId: string) {
  return SunoApiClient.getGenerationStatus(taskId);
}
