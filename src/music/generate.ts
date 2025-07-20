
import { SunoApiClient } from "../lib/sunoClient";

type Model = "V3_5" | "V4" | "V4_5";

export interface GenerateMusicPayload {
  prompt?: string;
  style?: string;
  title?: string;
  customMode: boolean;
  instrumental: boolean;
  model: Model;
  negativeTags?: string;
  callBackUrl: string;
}

export interface GenerateMusicResponse {
  taskId: string;
}

export async function generateMusic(p: GenerateMusicPayload) {
  validatePayload(p);
  const client = new SunoApiClient();
  return client.post<GenerateMusicResponse>("/api/v1/generate", p);
}

// --- helpers ---------------------------------------------------------------
function validatePayload(p: GenerateMusicPayload) {
  if (p.customMode) {
    if (!p.style || !p.title)
      throw new Error("style & title requis en customMode");
    if (!p.instrumental && !p.prompt)
      throw new Error("prompt requis si instrumental=false en customMode");
  } else {
    if (!p.prompt) throw new Error("prompt requis en mode non-personnalisé");
  }

  // limites prompt/style/title selon modèle
  const len = (s?: string) => s?.length ?? 0;
  switch (p.model) {
    case "V3_5":
    case "V4":
      if (len(p.prompt) > 3000) throw new Error("prompt trop long");
      if (len(p.style) > 200) throw new Error("style trop long");
      break;
    case "V4_5":
      if (len(p.prompt) > 5000) throw new Error("prompt trop long");
      if (len(p.style) > 1000) throw new Error("style trop long");
      break;
  }
  if (len(p.title) > 80) throw new Error("title trop long");
}
