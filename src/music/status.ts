
import { secureSunoClient as SunoApiClient } from "../lib/secureApiClient";

export type MusicStatusStage =
  | "PENDING"
  | "TEXT_SUCCESS"
  | "FIRST_SUCCESS"
  | "SUCCESS"
  | "CREATE_TASK_FAILED"
  | "GENERATE_AUDIO_FAILED"
  | "CALLBACK_EXCEPTION"
  | "SENSITIVE_WORD_ERROR";

export interface MusicStatus {
  status: MusicStatusStage;
  data?: {
    audio: Array<{
      id: string;
      audio_url: string;
      image_url: string;
      duration: number;
    }>;
  };
}

export async function getMusicStatus(taskId: string) {
  return SunoApiClient.getGenerationStatus(taskId);
}
