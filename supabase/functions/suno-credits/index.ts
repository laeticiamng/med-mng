/**
 * 🎵 Suno Credits - Vérification des crédits restants
 * 
 * Endpoint: GET /api/v1/get-credits
 * Documentation: https://docs.sunoapi.org/suno-api/quickstart
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const SUNO_API_BASE = 'https://api.sunoapi.org/api/v1';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    
    if (!SUNO_API_KEY) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Suno API key not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('💳 Vérification des crédits Suno...');

    const response = await fetch(`${SUNO_API_BASE}/get-credits`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Suno credits error:', response.status, errorText);
      
      return new Response(JSON.stringify({
        success: false,
        credits: -1,
        error: `Credits check failed: ${response.status}`
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('✅ Credits response:', data);

    if (data.code === 200 && data.data) {
      return new Response(JSON.stringify({
        success: true,
        credits: data.data.credits || data.data.remaining || 0,
        plan: data.data.plan || 'unknown',
        used: data.data.used || 0,
        total: data.data.total || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      credits: -1,
      error: data.msg || 'Unknown error'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Credits check error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      credits: -1,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
