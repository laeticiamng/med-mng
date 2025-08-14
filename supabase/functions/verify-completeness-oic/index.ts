import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 VÉRIFICATION COMPLÉTUDE DES COMPÉTENCES OIC')
    console.log('==============================================')

    // 1. Analyser toutes les compétences
    const { data: allCompetences, error: queryError } = await supabase
      .from('backup_oic_competences')
      .select('objectif_id, intitule, description, item_parent, rang, url_source, completion_status')

    if (queryError) {
      throw queryError
    }

    console.log(`📊 Total compétences analysées: ${allCompetences?.length || 0}`)

    let needCompletion = 0
    let hasGenericContent = 0
    let hasValidContent = 0
    let hasNoDescription = 0
    let hasShortContent = 0

    const toUpdate = []

    for (const comp of allCompetences || []) {
      const desc = typeof comp.description === 'string' ? comp.description : ''
      
      // Cas 1: Pas de description
      if (!desc || desc.trim().length === 0) {
        hasNoDescription++
        toUpdate.push({
          objectif_id: comp.objectif_id,
          reason: 'no_description',
          current_status: comp.completion_status
        })
        continue
      }

      // Cas 2: Contenu générique LiSA (page d'accueil)
      const descLower = desc.toLowerCase()
      const isGenericLiSA = descLower.includes('bienvenue sur lisa edn 2025') ||
                           descLower.includes('items de connaissances') ||
                           descLower.includes('la conférence des doyens a retenu') ||
                           descLower.includes('consultez la charte d\'utilisation') ||
                           descLower.includes('fiches lisa sont attribuées aux collèges')

      if (isGenericLiSA) {
        hasGenericContent++
        toUpdate.push({
          objectif_id: comp.objectif_id,
          reason: 'generic_lisa_content',
          current_status: comp.completion_status
        })
        continue
      }

      // Cas 3: Contenu potentiellement tronqué ou page de login
      const isLoginPage = descLower.includes('veuillez saisir votre adresse e-mail') ||
                         descLower.includes('cas d\'authentification') ||
                         descLower.includes('connexion à') ||
                         descLower.includes('authentification')

      if (isLoginPage) {
        hasGenericContent++
        toUpdate.push({
          objectif_id: comp.objectif_id,
          reason: 'login_page_content',
          current_status: comp.completion_status
        })
        continue
      }

      // Cas 4: Contenu suspect très court (moins de 100 caractères)
      if (desc.length < 100) {
        hasShortContent++
        toUpdate.push({
          objectif_id: comp.objectif_id,
          reason: 'content_too_short',
          current_status: comp.completion_status
        })
        continue
      }

      // Cas 5: Vérifier si le contenu correspond bien à l'objectif
      // Rechercher des indicateurs OIC valides
      const hasValidOICIndicators = descLower.includes('objectif de connaissance') ||
                                   descLower.includes('oic-') ||
                                   descLower.includes('item parent') ||
                                   descLower.includes('rang') ||
                                   descLower.includes('version novembre 2024') ||
                                   descLower.includes('physiopathologie') ||
                                   descLower.includes('étiologies') ||
                                   descLower.includes('diagnostic') ||
                                   descLower.includes('thérapeutique')

      if (!hasValidOICIndicators && desc.length < 500) {
        toUpdate.push({
          objectif_id: comp.objectif_id,
          reason: 'suspicious_content',
          current_status: comp.completion_status
        })
        continue
      }

      // Contenu valide
      hasValidContent++
    }

    needCompletion = toUpdate.length

    console.log(`📈 Résultats de l'analyse:`)
    console.log(`   - Compétences sans description: ${hasNoDescription}`)
    console.log(`   - Compétences avec contenu générique LiSA: ${hasGenericContent}`)
    console.log(`   - Compétences avec contenu trop court: ${hasShortContent}`)
    console.log(`   - Compétences avec contenu valide: ${hasValidContent}`)
    console.log(`   - TOTAL nécessitant une completion: ${needCompletion}`)

    // 2. Marquer les compétences à traiter avec 'need_completion'
    if (needCompletion > 0) {
      console.log(`🔄 Marquage de ${needCompletion} compétences pour retraitement...`)
      
      for (const item of toUpdate) {
        const { error: updateError } = await supabase
          .from('backup_oic_competences')
          .update({
            completion_status: 'need_completion',
            completion_last_error: `Verification: ${item.reason}`,
            completion_updated_at: new Date().toISOString()
          })
          .eq('objectif_id', item.objectif_id)

        if (updateError) {
          console.error(`❌ Erreur marquage ${item.objectif_id}:`, updateError)
        }
      }
      
      console.log(`✅ ${needCompletion} compétences marquées pour retraitement`)
    }

    // 3. Statistiques finales
    const completionRate = allCompetences?.length ? 
      Math.round((hasValidContent / allCompetences.length) * 100) : 0

    const finalStats = {
      success: true,
      verification: {
        total_competences: allCompetences?.length || 0,
        valid_content: hasValidContent,
        no_description: hasNoDescription,
        generic_lisa_content: hasGenericContent,
        content_too_short: hasShortContent,
        need_completion: needCompletion,
        completion_rate: completionRate
      },
      actions: {
        marked_for_reprocessing: needCompletion
      },
      next_steps: needCompletion > 0 ? [
        'Lancer le script Puppeteer avec: node complete-by-url-puppeteer.js --batch=400 --concurrency=3',
        'Les compétences marquées \'need_completion\' seront traitées en priorité'
      ] : [
        'Toutes les compétences ont un contenu valide ✅'
      ],
      timestamp: new Date().toISOString()
    }

    console.log('\n🎉 VÉRIFICATION TERMINÉE!')
    console.log(`📊 Taux de complétude: ${completionRate}%`)
    console.log(`🔄 Compétences à retraiter: ${needCompletion}`)

    return new Response(JSON.stringify(finalStats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})