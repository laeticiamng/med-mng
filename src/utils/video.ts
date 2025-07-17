
import { SunoApiClient } from "../lib/sunoClient";

/**
 * Generate an MP4 video from a previously generated track.
 *
 * The helper calls the `POST /api/v1/video` endpoint and returns the URL of
 * the produced video.  The Suno service processes the request asynchronously
 * but usually responds with the final resource URL directly.
 */
export async function generateVideo(audioId: string): Promise<string> {
  const client = new SunoApiClient();
  const res = await client.post<{ videoUrl: string }>("/api/v1/video", {
    audioId,
  });
  return res.videoUrl;
}
