/**
 * 🎵 Suno Credits - Vérification des crédits restants
 * 
 * Endpoint: GET /api/v1/get-credits
 * Documentation: https://docs.sunoapi.org/suno-api/quickstart
 * 
 * Améliorations:
 * - Timeout handling avec AbortController
 * - Retry logic avec exponential backoff
 * - Cache côté serveur
 * - Fallback en cas d'erreur
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const SUNO_API_BASE = 'https://api.sunoapi.org/api/v1';
const TIMEOUT_MS = 8000; // 8 secondes max
const MAX_RETRIES = 2;

// Simple in-memory cache (reset on cold start)
let creditsCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 60000; // 1 minute

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchCreditsWithRetry(apiKey: string, retries = MAX_RETRIES): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        `${SUNO_API_BASE}/get-credits`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${apiKey}` }
        },
        TIMEOUT_MS
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt + 1}/${retries + 1} failed:`, error.message);
      
      if (attempt < retries) {
        // Exponential backoff: 500ms, 1000ms, 2000ms...
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
      } else {
        throw error;
      }
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    
    if (!SUNO_API_KEY) {
      console.warn('⚠️ SUNO_API_KEY not configured - returning default credits');
      return new Response(JSON.stringify({
        success: true,
        credits: 50, // Default for demo
        plan: 'demo',
        used: 0,
        total: 50,
        cached: false,
        fallback: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check cache first
    if (creditsCache && (Date.now() - creditsCache.timestamp) < CACHE_TTL_MS) {
      console.log('💾 Returning cached credits');
      return new Response(JSON.stringify({
        ...creditsCache.data,
        cached: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('💳 Fetching Suno credits...');
    
    const data = await fetchCreditsWithRetry(SUNO_API_KEY);
    console.log('✅ Credits response:', JSON.stringify(data).slice(0, 200));

    if (data.code === 200 && data.data) {
      const result = {
        success: true,
        credits: data.data.credits || data.data.remaining || 0,
        plan: data.data.plan || 'unknown',
        used: data.data.used || 0,
        total: data.data.total || 0,
        cached: false
      };
      
      // Update cache
      creditsCache = { data: result, timestamp: Date.now() };
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(data.msg || 'Invalid API response');

  } catch (error) {
    console.error('❌ Credits check error:', error.message);
    
    // Return cached data if available, even if stale
    if (creditsCache) {
      console.log('⚠️ Returning stale cache due to error');
      return new Response(JSON.stringify({
        ...creditsCache.data,
        cached: true,
        stale: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Graceful fallback
    return new Response(JSON.stringify({
      success: true,
      credits: 10, // Conservative fallback
      plan: 'fallback',
      used: 0,
      total: 10,
      cached: false,
      fallback: true,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
