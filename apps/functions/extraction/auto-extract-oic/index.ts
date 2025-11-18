import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification requise pour auto-extract-oic
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase si nécessaire
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ✅ SÉCURITÉ: Vérifier rôle ADMIN pour auto-extract-oic
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ auto-extract-oic autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    console.log('🤖 AUTO-EXTRACT-OIC: Démarrage automatique FORCÉ de l\'extraction')
    
    // Lancer l'extraction OIC automatiquement avec force
    console.log('⚡ Appel IMMÉDIAT à extract-edn-objectifs...')
    const extractionResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({ action: 'start' })
    })
    
    const extractionData = await extractionResponse.json()
    console.log('🎯 Résultat démarrage extraction:', extractionData)
    
    if (!extractionData.success) {
      throw new Error(`Échec démarrage extraction: ${extractionData.error}`)
    }
    
    const sessionId = extractionData.session_id
    console.log(`✅ Extraction autonome démarrée - Session: ${sessionId}`)
    
    // Fonction de surveillance automatique
    const monitorExtraction = async () => {
      let isRunning = true
      let checkCount = 0
      const maxChecks = 120 // 30 minutes max (120 x 15s)
      
      while (isRunning && checkCount < maxChecks) {
        try {
          await new Promise(resolve => setTimeout(resolve, 15000)) // Attendre 15s
          checkCount++
          
          const statusResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
               'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
            },
            body: JSON.stringify({ action: 'status', session_id: sessionId })
          })
          
          const statusData = await statusResponse.json()
          console.log(`📊 Check ${checkCount}: ${statusData.items_extracted || 0}/4872 - ${statusData.status}`)
          
          if (statusData.status === 'termine') {
            console.log(`🎉 EXTRACTION TERMINÉE! ${statusData.items_extracted} compétences extraites`)
            
            // Générer rapport final
            const reportResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
              },
              body: JSON.stringify({ action: 'rapport' })
            })
            
            const reportData = await reportResponse.json()
            console.log('📋 RAPPORT FINAL:', JSON.stringify(reportData, null, 2))
            
            isRunning = false
            break
          }
          
          if (statusData.status === 'erreur') {
            console.error('💥 EXTRACTION ÉCHOUÉE:', statusData.error_message)
            isRunning = false
            break
          }
          
        } catch (error) {
          console.error(`❌ Erreur surveillance check ${checkCount}:`, error)
        }
      }
      
      if (checkCount >= maxChecks) {
        console.log('⏰ TIMEOUT - Arrêt surveillance après 30 minutes')
      }
    }
    
    // Lancer la surveillance en arrière-plan
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      EdgeRuntime.waitUntil(monitorExtraction())
    } else {
      monitorExtraction().catch(error => {
        console.error('Erreur surveillance:', error)
      })
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Extraction autonome démarrée avec surveillance automatique',
        session_id: sessionId,
        monitoring: 'active'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('💥 Erreur auto-extract-oic:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})