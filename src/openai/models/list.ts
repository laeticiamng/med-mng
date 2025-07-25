import { secureOpenAIClient as OpenAIApiClient } from "../../lib/secureApiClient";

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
  return OpenAIApiClient.createChatCompletion({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: 'List available models' }]
  });
}

export async function getModel(modelId: string) {
  return OpenAIApiClient.createChatCompletion({
    model: modelId,
    messages: [{ role: 'system', content: 'Get model info' }]
  });
}