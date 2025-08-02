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

    console.log('🔍 ANALYSE COMPLÉTION DES COMPÉTENCES OIC')
    console.log('=====================================')

    // 1. Identifier les compétences incomplètes
    const { data: competencesIncompletes, error: queryError } = await supabase
      .from('backup_oic_competences')
      .select('objectif_id, intitule, description, item_parent, rang')
      .or('description.is.null,description.eq.,length(description).lt.30')
      .order('item_parent, objectif_id')

    if (queryError) {
      throw queryError
    }

    console.log(`📊 Compétences incomplètes trouvées: ${competencesIncompletes.length}`)

    // 2. Test de connectivité API MediaWiki (copié de votre workflow)
    console.log('\n🧪 TEST API MEDIAWIKI...')
    const testApiUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=1&format=json&origin=*'
    
    const testResponse = await fetch(testApiUrl)
    const testData = await testResponse.json()
    
    if (!testData?.query?.categorymembers?.[0]) {
      throw new Error('❌ API MediaWiki non accessible')
    }
    console.log('✅ API MediaWiki accessible')

    // 3. Récupérer la liste complète des pages OIC (comme votre workflow)
    console.log('\n📄 RÉCUPÉRATION LISTE COMPLÈTE DES PAGES...')
    let allPages: any[] = []
    let cmcontinue: string | undefined

    do {
      const url = new URL('https://livret.uness.fr/lisa/2025/api.php')
      url.searchParams.set('action', 'query')
      url.searchParams.set('list', 'categorymembers')
      url.searchParams.set('cmtitle', 'Catégorie:Objectif_de_connaissance')
      url.searchParams.set('cmlimit', '500')
      url.searchParams.set('format', 'json')
      url.searchParams.set('origin', '*')
      
      if (cmcontinue) {
        url.searchParams.set('cmcontinue', cmcontinue)
      }

      const response = await fetch(url.toString())
      const data = await response.json()

      if (data?.query?.categorymembers) {
        allPages = allPages.concat(data.query.categorymembers)
        cmcontinue = data?.continue?.cmcontinue
        console.log(`📋 ${allPages.length} pages récupérées...`)
      } else {
        break
      }
    } while (cmcontinue)

    console.log(`📚 Total pages trouvées: ${allPages.length}`)

    // 4. Créer un index des pages par objectif_id pour les compétences incomplètes
    const competencesMap = new Map()
    competencesIncompletes.forEach(comp => {
      competencesMap.set(comp.objectif_id, comp)
    })

    // 5. Filtrer les pages correspondant aux compétences incomplètes
    const pagesToProcess = allPages.filter(page => {
      const objectifMatch = page.title.match(/OIC-\d+-\d+-[AB]/)
      return objectifMatch && competencesMap.has(objectifMatch[0])
    })

    console.log(`🎯 Pages à retraiter: ${pagesToProcess.length}`)

    // 6. Récupérer le contenu complet en lots (comme votre workflow)
    let processed = 0
    let updated = 0
    let errors = 0
    const batchSize = 50

    for (let i = 0; i < pagesToProcess.length; i += batchSize) {
      const batch = pagesToProcess.slice(i, i + batchSize)
      const pageIds = batch.map(p => p.pageid).join('|')
      
      console.log(`\n📥 TRAITEMENT LOT ${Math.floor(i/batchSize) + 1} (${batch.length} pages)`)
      
      const contentUrl = `https://livret.uness.fr/lisa/2025/api.php?action=query&pageids=${pageIds}&prop=revisions|info&rvprop=content|ids|timestamp&rvslots=main&format=json&formatversion=2`
      
      try {
        const contentResponse = await fetch(contentUrl)
        const contentData = await contentResponse.json()

        if (contentData?.query?.pages) {
          for (const page of contentData.query.pages) {
            processed++
            
            if (!page.revisions?.[0]?.slots?.main?.content) {
              console.log(`⚠️ Pas de contenu pour page ${page.pageid}`)
              continue
            }

            const content = page.revisions[0].slots.main.content
            
            // Parser le contenu MediaWiki (comme votre workflow)
            const objectifMatch = content.match(/\|Identifiant=([^|\n]+)/)
            const intituleMatch = content.match(/\|Intitule=([^|\n]+)/)
            const descriptionMatch = content.match(/\|Description=([^|]*?)(?=\|[A-Za-z]+=/s)/)
            const rubriqueMatch = content.match(/\|Rubrique=([^|\n]+)/)
            const rangMatch = content.match(/\|Rang=([^|\n]+)/)
            const itemParentMatch = content.match(/\|Parent_id=([^|\n]+)/)

            if (!objectifMatch) {
              console.log(`⚠️ Impossible de parser l'objectif pour page ${page.pageid}`)
              continue
            }

            const objectifId = objectifMatch[1].trim()
            const intitule = intituleMatch?.[1]?.trim() || ''
            const description = descriptionMatch?.[1]?.trim() || ''
            const rubrique = rubriqueMatch?.[1]?.trim() || ''
            const rang = rangMatch?.[1]?.trim() || ''
            const itemParent = itemParentMatch?.[1]?.trim().padStart(3, '0') || ''

            // Vérifier si cette compétence était incomplète
            if (competencesMap.has(objectifId)) {
              console.log(`🔄 Mise à jour ${objectifId}: "${intitule}"`)
              console.log(`📝 Description: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`)

              // Mettre à jour la compétence avec le contenu complet
              const { error: updateError } = await supabase
                .from('backup_oic_competences')
                .update({
                  intitule: intitule,
                  description: description,
                  rubrique: rubrique,
                  rang: rang,
                  item_parent: itemParent,
                  updated_at: new Date().toISOString(),
                  extraction_status: 'completed'
                })
                .eq('objectif_id', objectifId)

              if (updateError) {
                console.error(`❌ Erreur mise à jour ${objectifId}:`, updateError)
                errors++
              } else {
                updated++
                console.log(`✅ ${objectifId} mis à jour`)
              }
            }
          }
        }
      } catch (error) {
        console.error(`❌ Erreur traitement lot:`, error)
        errors++
      }

      // Délai entre les lots pour éviter de surcharger l'API
      if (i + batchSize < pagesToProcess.length) {
        console.log('⏳ Pause 2s...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    // 7. Statistiques finales
    const finalStats = {
      success: true,
      statistics: {
        competences_incompletes_detectees: competencesIncompletes.length,
        pages_trouvees: allPages.length,
        pages_traitees: pagesToProcess.length,
        competences_processed: processed,
        competences_updated: updated,
        errors: errors,
        completion_rate: Math.round((updated / competencesIncompletes.length) * 100)
      },
      timestamp: new Date().toISOString()
    }

    console.log('\n🎉 COMPLÉTION TERMINÉE!')
    console.log(`📊 Statistiques:`)
    console.log(`   - Compétences incomplètes détectées: ${competencesIncompletes.length}`)
    console.log(`   - Pages traitées: ${processed}`)
    console.log(`   - Compétences mises à jour: ${updated}`)
    console.log(`   - Erreurs: ${errors}`)
    console.log(`   - Taux de complétion: ${finalStats.statistics.completion_rate}%`)

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