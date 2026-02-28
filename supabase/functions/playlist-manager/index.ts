import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getErrorMessage } from '../_shared/error-utils.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const requestData = await req.json();
    
    // Handle playlist operations
    switch (requestData.action) {
      case 'create':
        const { data, error } = await supabase
          .from('med_mng_playlists')
          .insert({
            user_id: user.id,
            name: requestData.name,
            description: requestData.description || null,
            is_public: !!requestData.isPublic
          })
          .select()
          .single();
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, playlist: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        throw new Error('Invalid action');
    }

  } catch (error: unknown) {
    console.error('Error in playlist-manager:', error);
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});