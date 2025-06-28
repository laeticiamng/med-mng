
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🔔 Auth webhook called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

  } catch (error) {
    console.error('❌ Erreur webhook auth:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
