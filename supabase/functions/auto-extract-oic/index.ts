import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { getErrorMessage } from '../_shared/error-utils.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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
    
  } catch (error: unknown) {
    console.error('💥 Erreur auto-extract-oic:', error)
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})