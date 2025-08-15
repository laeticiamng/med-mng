import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { competences, minCharacters = 10 } = await req.json()

    console.log(`🔧 Configuration: seuil minimum réduit à ${minCharacters} caractères`)

    let processedCount = 0
    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const competence of competences) {
      try {
        processedCount++
        
        // Extraire le contenu depuis l'URL
        const response = await fetch(competence.url_source, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })

        if (!response.ok) {
          console.error(`❌ ${competence.objectif_id}: Erreur HTTP ${response.status}`)
          errorCount++
          continue
        }

        const html = await response.text()
        
        // Extraction basique du contenu textuel
        const textContent = html
          .replace(/<script[^>]*>.*?<\/script>/gis, '')
          .replace(/<style[^>]*>.*?<\/style>/gis, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()

        console.log(`📊 ${competence.objectif_id}: Contenu extrait (${textContent.length} car)`)

        // Vérification avec seuil minimal réduit
        if (textContent.length < minCharacters) {
          console.log(`⚠️ ${competence.objectif_id}: Contenu trop court (${textContent.length} < ${minCharacters} caractères)`)
          skippedCount++
          continue
        }

        // Mise à jour dans Supabase
        const { error: updateError } = await supabase
          .from('backup_oic_competences')
          .update({
            description: textContent,
            completion_status: 'completed',
            completion_updated_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('objectif_id', competence.objectif_id)

        if (updateError) {
          console.error(`❌ ${competence.objectif_id}: Erreur mise à jour DB:`, updateError)
          errorCount++
        } else {
          console.log(`✅ ${competence.objectif_id}: Mis à jour avec succès`)
          updatedCount++
        }

      } catch (error) {
        console.error(`❌ ${competence.objectif_id}: Erreur générale:`, error)
        errorCount++
      }
    }

    const stats = {
      processed: processedCount,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errorCount,
      successRate: processedCount > 0 ? Math.round((updatedCount / processedCount) * 100) : 0
    }

    console.log('\n📊 STATISTIQUES FINALES:')
    console.log(`   - Compétences traitées: ${stats.processed}`)
    console.log(`   - Compétences mises à jour: ${stats.updated}`)
    console.log(`   - Compétences ignorées: ${stats.skipped}`)
    console.log(`   - Erreurs: ${stats.errors}`)
    console.log(`   - Taux de réussite: ${stats.successRate}%`)

    return new Response(JSON.stringify({
      success: true,
      stats
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erreur globale:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})