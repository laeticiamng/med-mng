import { OpenAIApiClient } from "../../lib/openaiClient";

export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  object: string;
  data: Model[];
}

export async function listModels() {
  const client = new OpenAIApiClient();
  return client.get<ModelsResponse>("/models");
}

export async function getModel(modelId: string) {
  const client = new OpenAIApiClient();
  return client.get<Model>(`/models/${modelId}`);
}