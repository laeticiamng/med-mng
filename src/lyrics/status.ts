
import { SunoApiClient } from "../lib/sunoClient";

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
  const client = new SunoApiClient();
  return client.get<LyricsStatus>("/api/v1/lyrics/record-info", { taskId });
}
