import { OpenAIApiClient } from "../../lib/openaiClient";

export interface ImageGenerationRequest {
  prompt: string;
  model?: 'dall-e-2' | 'dall-e-3' | 'gpt-image-1';
  n?: number;
  quality?: 'standard' | 'hd' | 'high' | 'medium' | 'low' | 'auto';
  response_format?: 'url' | 'b64_json';
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792' | '1536x1024' | '1024x1536' | 'auto';
  style?: 'vivid' | 'natural';
  user?: string;
  background?: 'transparent' | 'opaque' | 'auto';
  output_format?: 'png' | 'jpeg' | 'webp';
  output_compression?: number;
  moderation?: 'low' | 'auto';
}

export interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

export async function generateImage(payload: ImageGenerationRequest) {
  const client = new OpenAIApiClient();
  return client.post<ImageGenerationResponse>("/images/generations", payload);
}