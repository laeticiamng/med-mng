
export interface CreateSongRequest {
  title: string;
  suno_audio_id: string;
  meta?: any;
}

export interface CreateSubscriptionRequest {
  plan_id: string;
  gateway: string;
  subscription_id: string;
}

export interface AddToLibraryRequest {
  song_id: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
