
import { SunoApiClient } from "../lib/sunoClient";

export interface TimestampedLyrics {
  lyrics: Array<{ time: number; text: string }>; // time en secondes
  waveform?: number[]; // si présent
}

export async function getTimestampedLyrics(
  taskId: string,
  opts: { audioId?: string; musicIndex?: 0 | 1 }
) {
  if (!opts.audioId && opts.musicIndex === undefined)
    throw new Error("audioId ou musicIndex obligatoire");
  const client = new SunoApiClient();
  return client.post<TimestampedLyrics>(
    "/api/v1/generate/get-timestamped-lyrics",
    { taskId, ...opts }
  );
}
