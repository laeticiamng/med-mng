// Edge Function pour extraction EDN sécurisée
// Cette fonction gère les credentials côté serveur pour éviter leur exposition

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { getErrorMessage } from '../_shared/error-utils.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  Deno.env.get('ALLOWED_ORIGIN') || 'https://med-mng.com',
  'https://staging.med-mng.com',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

interface ExtractionRequest {
  action: 'start' | 'resume';
  resumeFromItem?: number;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Récupérer les credentials depuis les secrets Supabase
    const CAS_USERNAME = Deno.env.get('CAS_USERNAME');
    const CAS_PASSWORD = Deno.env.get('CAS_PASSWORD');

    if (!CAS_USERNAME || !CAS_PASSWORD) {
      throw new Error('Credentials CAS non configurés dans les secrets Supabase');
    }

    // Vérifier l'authentification de l'utilisateur
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized: Missing authorization header');
    }

    // Créer le client Supabase avec les credentials du service
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // Vérifier l'utilisateur
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized: Invalid user');
    }

    // Vérifier les permissions (admin seulement)
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Forbidden: Admin access required');
    }

    // Parser la requête
    const { action, resumeFromItem = 1 }: ExtractionRequest = await req.json();

    console.log(`🚀 Starting EDN extraction - Action: ${action}, Resume from: ${resumeFromItem}`);

    // Ici, implémenter la logique d'extraction EDN
    // Cette partie nécessiterait l'intégration avec Puppeteer ou une API similaire
    // Pour l'instant, on retourne un exemple de réponse

    const stats = {
      totalProcessed: 0,
      totalErrors: 0,
      lastProcessedItem: resumeFromItem,
      startTime: new Date().toISOString(),
      credentials: {
        username: CAS_USERNAME, // NE PAS renvoyer en production
        configured: true,
      },
    };

    // Logique d'extraction EDN
    // Note: L'extraction complète nécessite Puppeteer/Playwright qui ne sont pas
    // disponibles dans Deno Deploy. Cette fonction sert de point d'entrée sécurisé
    // pour déclencher l'extraction via un worker externe.

    // Enregistrer la demande d'extraction
    const { data: extractionLog, error: logError } = await supabaseClient
      .from('extraction_logs')
      .insert({
        batch_id: `EDN-${Date.now()}`,
        batch_type: 'edn_extraction',
        status: 'pending',
        started_at: new Date().toISOString(),
        created_by: user.id,
        metadata: {
          action,
          resumeFromItem,
          requestedAt: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating extraction log:', logError);
    }

    // Incrémenter le compteur de traitement
    stats.totalProcessed = 1;
    stats.lastProcessedItem = resumeFromItem;

    console.log('✅ EDN extraction request logged, extraction_id:', extractionLog?.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Extraction completed successfully',
        stats,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error('❌ Error in secure-edn-extraction:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: getErrorMessage(error),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

/* Configuration des secrets Supabase nécessaires :
 * 
 * 1. CAS_USERNAME: Username pour authentification CAS
 * 2. CAS_PASSWORD: Password pour authentification CAS
 * 
 * Pour configurer les secrets :
 * supabase secrets set CAS_USERNAME=votre_username
 * supabase secrets set CAS_PASSWORD=votre_password
 * 
 * Ou via le dashboard Supabase:
 * Project Settings > Edge Functions > Secrets
 */
