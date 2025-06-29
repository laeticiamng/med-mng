
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleMusicGeneration } from './requestHandler.ts';
import { corsHeaders } from './constants.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    return await handleMusicGeneration(req);
  } catch (error) {
    console.error('❌ Erreur génération chanson Suno:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne du serveur',
        status: 'error',
        error_code: 500,
        details: 'Erreur lors de la génération avec Suno API',
        debug: {
          error_type: error.name,
          error_message: error.message,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
