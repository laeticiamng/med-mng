
import { secureSunoClient as SunoApiClient } from "../lib/secureApiClient";

interface BoostPayload {
  content: string; // ex : "Pop, mysterious", obligatoire
}
interface BoostResponse {
  styleId: string;
}

export async function boostStyle(content: string) {
  return SunoApiClient.generateMusic({ prompt: content });
}
