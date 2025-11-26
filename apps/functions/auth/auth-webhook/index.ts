
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { corsHeaders } from '../../_shared/cors.ts';

import { getErrorMessage } from '../../_shared/error-utils.ts';
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ: Authentification JWT obligatoire
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès auth-webhook sans authentification');
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
      console.warn('❌ Token invalide pour auth-webhook');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ auth-webhook autorisé pour user ${user.id}`);

    // Code original de la fonction
    
    const payload = await req.json();
    console.log('📦 Webhook payload:', JSON.stringify(payload, null, 2));

    // Vérifier le type d'événement
    if (payload.type === 'INSERT' && payload.table === 'users') {
      const user = payload.record;
      
      console.log(`👤 Nouvel utilisateur créé: ${user.email}`);

      // Envoyer l'email de bienvenue
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          type: 'welcome',
          email: user.email,
          name: user.raw_user_meta_data?.name || user.email.split('@')[0],
        }),
      });

      if (emailResponse.ok) {
        console.log('✅ Email de bienvenue envoyé');
      } else {
        console.error('❌ Erreur envoi email de bienvenue:', await emailResponse.text());
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: unknown) {
    console.error('❌ Erreur webhook auth:', error);
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
