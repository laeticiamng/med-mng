
import { SunoApiClient } from "../lib/sunoClient";

type Model = "V3_5" | "V4" | "V4_5";

export interface ExtendMusicPayload {
  defaultParamFlag: boolean;
  audioId: string;
  prompt?: string;
  style?: string;
  title?: string;
  continueAt?: number; // en secondes
  model: Model;
  negativeTags?: string;
  callBackUrl: string;
}

export async function extendMusic(p: ExtendMusicPayload) {
  if (!p.defaultParamFlag) {
    // mode "use defaults" → seul audioId requis
    p = { ...p, prompt: undefined, style: undefined, title: undefined, continueAt: undefined };
  } else {
    if (!p.prompt || !p.style || !p.title || !p.continueAt)
      throw new Error("prompt, style, title, continueAt requis si defaultParamFlag=true");
  }
  const client = new SunoApiClient();
  return client.post<{ taskId: string }>("/api/v1/generate/extend", p);
}
