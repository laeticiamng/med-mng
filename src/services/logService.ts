import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env
  .SUPABASE_SERVICE_ROLE_KEY as string;

const client =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

export async function logOperation(
  type: string,
  message: string,
  meta?: Record<string, unknown>
): Promise<void> {
  if (!client) {
    console.warn('Supabase not configured for logging');
    return;
  }

  const { error } = await client.from('operation_logs').insert({
    type,
    message,
    meta,
  });

  if (error) {
    console.error('Failed to insert log', error);
  }
}
