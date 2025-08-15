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

    const { minCharacters = 50, maxItems = 100 } = await req.json()

    console.log(`🔧 Traitement des contenus courts avec seuil minimal: ${minCharacters} caractères`)

    // Récupérer les compétences avec contenu corrompu ou erreur
    const { data: competences, error: fetchError } = await supabase
      .from('backup_oic_competences')
      .select('objectif_id, url_source, description')
      .or('completion_status.eq.skipped_error,description.like.*CONTENU CORROMPU*,description.like.*[[2C*')
      .not('url_source', 'is', null)
      .limit(maxItems)

    if (fetchError) {
      throw new Error(`Erreur récupération: ${fetchError.message}`)
    }

    console.log(`📋 ${competences?.length || 0} compétences à retraiter`)

    let processedCount = 0
    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const competence of competences || []) {
      try {
        processedCount++
        console.log(`🔄 Traitement ${competence.objectif_id}...`)
        
        // Extraire le contenu depuis l'URL avec timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

        const response = await fetch(competence.url_source, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          console.error(`❌ ${competence.objectif_id}: HTTP ${response.status}`)
          errorCount++
          continue
        }

        const html = await response.text()
        
        // Extraction améliorée du contenu
        let textContent = html
          // Supprimer scripts et styles
          .replace(/<script[^>]*>.*?<\/script>/gis, '')
          .replace(/<style[^>]*>.*?<\/style>/gis, '')
          .replace(/<nav[^>]*>.*?<\/nav>/gis, '')
          .replace(/<header[^>]*>.*?<\/header>/gis, '')
          .replace(/<footer[^>]*>.*?<\/footer>/gis, '')
          // Supprimer les balises HTML
          .replace(/<[^>]*>/g, ' ')
          // Nettoyer les espaces
          .replace(/\s+/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&[a-zA-Z0-9]+;/g, ' ')
          .trim()

        // Extraire le contenu principal (après le titre de l'objectif)
        const objectifMatch = textContent.match(new RegExp(`${competence.objectif_id}\\s*(.{50,})`, 'i'))
        if (objectifMatch) {
          textContent = objectifMatch[1].trim()
        }

        console.log(`📊 ${competence.objectif_id}: ${textContent.length} caractères extraits`)

        // Vérification avec seuil minimal réduit
        if (textContent.length < minCharacters) {
          console.log(`⚠️ ${competence.objectif_id}: Contenu encore trop court (${textContent.length} < ${minCharacters})`)
          
          // Marquer comme traité même si court
          await supabase
            .from('backup_oic_competences')
            .update({
              description: textContent,
              completion_status: 'content_too_short',
              completion_updated_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('objectif_id', competence.objectif_id)
          
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
          console.error(`❌ ${competence.objectif_id}: Erreur DB:`, updateError)
          errorCount++
        } else {
          console.log(`✅ ${competence.objectif_id}: Mis à jour avec succès`)
          updatedCount++
        }

        // Petite pause pour éviter de surcharger le serveur
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (error) {
        console.error(`❌ ${competence.objectif_id}: Erreur:`, error.message)
        errorCount++
      }
    }

    const stats = {
      processed: processedCount,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errorCount,
      successRate: processedCount > 0 ? Math.round((updatedCount / processedCount) * 100) : 0,
      minCharacters
    }

    console.log('\n📊 STATISTIQUES FINALES:')
    console.log(`   - Compétences traitées: ${stats.processed}`)
    console.log(`   - Compétences mises à jour: ${stats.updated}`)
    console.log(`   - Compétences trop courtes: ${stats.skipped}`)
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