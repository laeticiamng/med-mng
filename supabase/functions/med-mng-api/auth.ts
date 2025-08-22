
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './types.ts';
import { errorResponse } from './response.ts';

/**
 * Validates that critical environment variables are present
 * @throws {Error} If any required environment variable is missing
 */
function validateEnvironmentVariables(): { url: string; key: string } {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing SUPABASE_ANON_KEY environment variable');
  }

  // Basic URL validation
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error('Invalid SUPABASE_URL format - must be a valid URL');
  }

  // Basic key validation (should be a JWT-like string)
  if (supabaseAnonKey.length < 100 || !supabaseAnonKey.includes('.')) {
    throw new Error('Invalid SUPABASE_ANON_KEY format - must be a valid JWT token');
  }

  return { url: supabaseUrl, key: supabaseAnonKey };
}

export async function validateAuth(req: Request) {
  let supabase;
  
  try {
    // Validate environment variables before creating client
    const { url, key } = validateEnvironmentVariables();
    supabase = createClient(url, key);
  } catch (envError) {
    console.error('🚨 Environment validation failed:', envError.message);
    return {
      error: errorResponse(500, 'ENV_CONFIG_ERROR', `Configuration error: ${envError.message}`),
      supabase: null,
      user: null
    };
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return {
      error: errorResponse(401, 'AUTH_REQUIRED', 'Authorization header required'),
      supabase: null,
      user: null
    };
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return {
        error: errorResponse(401, 'INVALID_AUTH', 'Invalid authentication'),
        supabase: null,
        user: null
      };
    }

    return { error: null, supabase, user };
  } catch (authValidationError) {
    console.error('🚨 Auth validation failed:', authValidationError);
    return {
      error: errorResponse(500, 'AUTH_VALIDATION_ERROR', 'Authentication validation failed'),
      supabase: null,
      user: null
    };
  }
}
