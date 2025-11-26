import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../../_shared/cors.ts'

import { getErrorMessage } from '../../_shared/error-utils.ts';
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès test-cas-simple sans authentification');
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
      console.warn('❌ Token invalide pour test-cas-simple');
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
      console.warn(`❌ Non-admin tentative test-cas-simple par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ test-cas-simple autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    const email = Deno.env.get('UNES_EMAIL')
    const password = Deno.env.get('UNES_PASSWORD')
    
    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Variables UNES_EMAIL et UNES_PASSWORD manquantes'
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      })
    }

    console.log('[TEST] 🔐 Test simple CAS step by step...')
    
    // Étape 1: GET cockpit.uness.fr
    console.log('[TEST] Step 1: GET cockpit.uness.fr')
    const cockpitResponse = await fetch('https://cockpit.uness.fr/', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    console.log(`[TEST] Step 1 result: ${cockpitResponse.status}`)
    
    // Étape 2: Vérifier le contenu
    const cockpitHtml = await cockpitResponse.text()
    const hasForm = cockpitHtml.includes('auth.uness.fr/cas/login')
    const hasUsernameField = cockpitHtml.includes('name="username"')
    
    console.log(`[TEST] Form found: ${hasForm}, username field: ${hasUsernameField}`)
    
    // Étape 3: POST simple vers auth.uness.fr/cas/login
    console.log('[TEST] Step 3: POST to CAS')
    const formData = new URLSearchParams()
    formData.append('username', email)
    
    const casResponse = await fetch('https://auth.uness.fr/cas/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://cockpit.uness.fr/'
      },
      body: formData,
      redirect: 'manual'
    })
    
    console.log(`[TEST] Step 3 result: ${casResponse.status}`)
    const location = casResponse.headers.get('Location')
    console.log(`[TEST] Redirect to: ${location}`)
    
    const result = {
      success: true,
      steps: {
        step1: {
          status: cockpitResponse.status,
          hasForm,
          hasUsernameField
        },
        step3: {
          status: casResponse.status,
          location: location,
          hasRedirect: !!location
        }
      },
      email_used: email.substring(0, 3) + '***'
    }
    
    console.log('[TEST] ✅ Test terminé')
    return new Response(JSON.stringify(result), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error: unknown) {
    console.error('[TEST] ❌ Erreur:', getErrorMessage(error))
    return new Response(JSON.stringify({
      success: false,
      error: getErrorMessage(error),
      stack: error.stack
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    })
  }
})