
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './types.ts';
import { errorResponse } from './response.ts';

export async function validateAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return {
      error: errorResponse(401, 'AUTH_REQUIRED', 'Authorization header required'),
      supabase: null,
      user: null
    };
  }

  // Create Supabase client with auth token in headers
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader }
      }
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: errorResponse(401, 'INVALID_AUTH', 'Invalid authentication'),
      supabase: null,
      user: null
    };
  }

  return { error: null, supabase, user };
}
