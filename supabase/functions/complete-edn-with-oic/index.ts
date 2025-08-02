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

    console.log('🚀 Démarrage du processus de complétion EDN avec OIC...')

    // 1. Récupérer tous les items EDN
    const { data: ednItems, error: ednError } = await supabase
      .from('edn_items_immersive')
      .select('id, item_code, title, competences_count_rang_a, competences_count_rang_b')
      .order('item_code')

    if (ednError) {
      console.error('❌ Erreur récupération EDN:', ednError)
      throw ednError
    }

    console.log(`📚 ${ednItems.length} items EDN trouvés`)

    let processed = 0
    let updated = 0
    let errors = 0
    const processingErrors: any[] = []

    // 2. Pour chaque item EDN, récupérer les compétences OIC correspondantes
    for (const item of ednItems) {
      try {
        processed++
        console.log(`\n📖 Traitement ${item.item_code}: ${item.title}`)
        
        // Extraire le numéro d'item (ex: IC-1 -> 1, IC-10 -> 10)
        const itemNumberMatch = item.item_code.match(/IC-(\d+)/)
        if (!itemNumberMatch) {
          console.log(`⚠️ Format item_code non reconnu: ${item.item_code}`)
          continue
        }
        const itemNumber = itemNumberMatch[1].padStart(3, '0') // 1 -> 001, 10 -> 010
        
        // Récupérer les compétences OIC pour cet item
        const { data: oicCompetences, error: oicError } = await supabase
          .from('backup_oic_competences')
          .select('*')
          .eq('item_parent', itemNumber)
          .order('rang, ordre')

        if (oicError) {
          console.error(`❌ Erreur OIC pour ${item.item_code}:`, oicError)
          errors++
          processingErrors.push({ item_code: item.item_code, error: oicError.message })
          continue
        }

        console.log(`🔍 ${oicCompetences.length} compétences OIC trouvées pour ${item.item_code}`)

        if (oicCompetences.length === 0) {
          console.log(`⚠️ Aucune compétence OIC pour ${item.item_code}`)
          continue
        }

        // Séparer rang A et rang B
        const competencesRangA = oicCompetences.filter(c => c.rang === 'A')
        const competencesRangB = oicCompetences.filter(c => c.rang === 'B')

        console.log(`📊 Rang A: ${competencesRangA.length}, Rang B: ${competencesRangB.length}`)

        // Formater les compétences pour l'insertion
        const formatCompetences = (competences: any[]) => {
          return competences.map(comp => ({
            objectif_id: comp.objectif_id,
            intitule: comp.intitule || '',
            description: comp.description || '',
            rubrique: comp.rubrique || '',
            ordre: comp.ordre || 0,
            concepts_cles: comp.description ? 
              comp.description.split(/[.!?]/).slice(0, 3).map((s: string) => s.trim()).filter((s: string) => s.length > 10) : 
              [],
            mots_cles: comp.intitule ? 
              comp.intitule.toLowerCase().split(/[\s,;:.]+/).filter((w: string) => w.length > 3).slice(0, 5) : 
              []
          }))
        }

        const competencesRangAFormatted = formatCompetences(competencesRangA)
        const competencesRangBFormatted = formatCompetences(competencesRangB)

        // Créer les tableaux de compétences pour les rangs A et B
        const tableauRangA = {
          title: `${item.item_code} Rang A - Connaissances fondamentales`,
          sections: competencesRangAFormatted.map(comp => ({
            title: comp.intitule,
            content: comp.description,
            concepts_cles: comp.concepts_cles,
            mots_cles: comp.mots_cles,
            rubrique: comp.rubrique
          }))
        }

        const tableauRangB = {
          title: `${item.item_code} Rang B - Connaissances approfondies`,
          sections: competencesRangBFormatted.map(comp => ({
            title: comp.intitule,
            content: comp.description,
            concepts_cles: comp.concepts_cles,
            mots_cles: comp.mots_cles,
            rubrique: comp.rubrique
          }))
        }

        // Générer des paroles musicales basées sur les compétences
        const parolesRangA = competencesRangA.slice(0, 4).map(comp => 
          `${comp.intitule} - ${comp.description?.substring(0, 50) || 'Compétence essentielle'}...`
        )
        const parolesRangB = competencesRangB.slice(0, 4).map(comp => 
          `${comp.intitule} - Expertise avancée en ${comp.rubrique || 'domaine spécialisé'}`
        )

        // Mettre à jour l'item EDN
        const { error: updateError } = await supabase
          .from('edn_items_immersive')
          .update({
            competences_oic_rang_a: competencesRangAFormatted,
            competences_oic_rang_b: competencesRangBFormatted,
            competences_count_rang_a: competencesRangA.length,
            competences_count_rang_b: competencesRangB.length,
            competences_count_total: competencesRangA.length + competencesRangB.length,
            tableau_rang_a: tableauRangA,
            tableau_rang_b: tableauRangB,
            paroles_rang_a: parolesRangA,
            paroles_rang_b: parolesRangB,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)

        if (updateError) {
          console.error(`❌ Erreur mise à jour ${item.item_code}:`, updateError)
          errors++
          processingErrors.push({ item_code: item.item_code, error: updateError.message })
        } else {
          updated++
          console.log(`✅ ${item.item_code} mis à jour avec succès`)
        }

        // Petit délai pour éviter de surcharger la DB
        if (processed % 10 === 0) {
          console.log(`📊 Progression: ${processed}/${ednItems.length} items traités`)
          await new Promise(resolve => setTimeout(resolve, 100))
        }

      } catch (error) {
        console.error(`❌ Erreur traitement ${item.item_code}:`, error)
        errors++
        processingErrors.push({ item_code: item.item_code, error: error.message })
      }
    }

    const summary = {
      success: true,
      statistics: {
        total_items: ednItems.length,
        processed,
        updated,
        errors,
        completion_rate: Math.round((updated / ednItems.length) * 100)
      },
      timestamp: new Date().toISOString(),
      processing_errors: processingErrors
    }

    console.log('\n🎉 COMPLÉTION TERMINÉE!')
    console.log(`📊 Statistiques:`)
    console.log(`   - Items traités: ${processed}/${ednItems.length}`)
    console.log(`   - Items mis à jour: ${updated}`)
    console.log(`   - Erreurs: ${errors}`)
    console.log(`   - Taux de complétion: ${summary.statistics.completion_rate}%`)

    return new Response(JSON.stringify(summary), {
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