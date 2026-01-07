import { secureSunoClient } from "../lib/secureApiClient";

// Modèles Suno disponibles (selon API officielle 2024)
// Type aligné avec src/lib/secureApiClient.ts et supabase/functions/_shared/suno-api-client.ts
export type Model = "V4" | "V4_5" | "V4_5PLUS" | "V4_5ALL" | "V5";

export interface GenerateMusicPayload {
  prompt?: string;
  style?: string;
  title?: string;
  customMode: boolean;
  instrumental: boolean;
  model: Model;
  negativeTags?: string;
  callBackUrl?: string;
}

export interface GenerateMusicResponse {
  taskId?: string;
  trackId?: string;
  audioUrl?: string;
  success?: boolean;
}

export async function generateMusic(p: GenerateMusicPayload): Promise<GenerateMusicResponse> {
  validatePayload(p);
  return secureSunoClient.generateMusic(p);
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

  // Limites prompt/style/title selon modèle (documentation Suno 2024)
  const len = (s?: string) => s?.length ?? 0;
  switch (p.model) {
    case "V4":
      if (len(p.prompt) > 3000) throw new Error("prompt trop long (max 3000 pour V4)");
      if (len(p.style) > 200) throw new Error("style trop long (max 200 pour V4)");
      break;
    case "V4_5":
    case "V4_5ALL":
    case "V4_5PLUS":
    case "V5":
      if (len(p.prompt) > 5000) throw new Error("prompt trop long (max 5000)");
      if (len(p.style) > 1000) throw new Error("style trop long (max 1000)");
      break;
  }
  // Limite titre: 80 pour V4 et V4_5ALL, 100 pour les autres
  const titleLimit = (p.model === "V4" || p.model === "V4_5ALL") ? 80 : 100;
  if (len(p.title) > titleLimit) throw new Error(`title trop long (max ${titleLimit})`);
}
