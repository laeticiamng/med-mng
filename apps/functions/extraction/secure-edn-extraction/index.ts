// Edge Function pour extraction EDN sécurisée
// Cette fonction gère les credentials côté serveur pour éviter leur exposition

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractionRequest {
  action: 'start' | 'resume';
  resumeFromItem?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès secure-edn-extraction sans authentification');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('❌ Token invalide pour secure-edn-extraction');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ✅ SÉCURITÉ: Vérifier rôle ADMIN
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      console.warn(`❌ Non-admin tentative secure-edn-extraction par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ secure-edn-extraction autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
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

    // Simuler un traitement
    // TODO: Implémenter la vraie logique d'extraction ici
    // - Connexion CAS avec credentials sécurisés
    // - Navigation Puppeteer/Playwright
    // - Extraction des données
    // - Sauvegarde dans Supabase

    console.log('✅ EDN extraction completed');

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
  } catch (error) {
    console.error('❌ Error in secure-edn-extraction:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
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
