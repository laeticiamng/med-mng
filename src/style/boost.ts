
import { SunoApiClient } from "../lib/sunoClient";

interface BoostPayload {
  content: string; // ex : "Pop, mysterious", obligatoire
}
interface BoostResponse {
  styleId: string;
}

export async function boostStyle(content: string) {
  const client = new SunoApiClient();
  return client.post<BoostResponse>("/api/v1/style/generate", { content });
}
