
import { SunoApiClient } from "../lib/sunoClient";

/**
 * Remove vocals from a generated track.
 *
 * This util hits the `POST /api/v1/audio/{id}/remove-vocals` endpoint and
 * returns the URL of the instrumental version.
 */
export async function removeVocals(audioId: string): Promise<string> {
  const client = new SunoApiClient();
  const res = await client.post<{ audioUrl: string }>(
    `/api/v1/audio/${audioId}/remove-vocals`,
    {},
  );
  return res.audioUrl;
}
