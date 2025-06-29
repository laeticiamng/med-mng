
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './types.ts';
import { validateAuth } from './auth.ts';
import { handleSubscriptions } from './routes/subscriptions.ts';
import { handleSongs } from './routes/songs.ts';
import { handleLibrary } from './routes/library.ts';
import { handleQuota } from './routes/quota.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { error, supabase, user } = await validateAuth(req);
  if (error) return error;

  const url = new URL(req.url);
  const path = url.pathname.replace('/functions/v1/med-mng-api', '');

  try {
    // Route handlers
    let response;
    
    response = await handleSubscriptions(req, supabase);
    if (response) return response;

    response = await handleSongs(req, supabase, path);
    if (response) return response;

    response = await handleLibrary(req, supabase, path, url);
    if (response) return response;

    response = await handleQuota(req, supabase, path);
    if (response) return response;

    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
