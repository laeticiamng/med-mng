
import { SunoApiClient } from "../lib/sunoClient";

/**
 * Convert a generated track to WAV format using the Suno API.
 *
 * The official documentation exposes a `GET /api/v1/audio/{id}/wav` endpoint
 * which returns the URL of the converted file.  This helper wraps the call
 * using the {@link SunoApiClient} and simply returns the `downloadUrl` field.
 */
export async function convertToWav(audioId: string): Promise<string> {
  const client = new SunoApiClient();
  const res = await client.get<{ downloadUrl: string }>(
    `/api/v1/audio/${audioId}/wav`,
  );
  return res.downloadUrl;
}
