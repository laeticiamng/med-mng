import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { buildQuizQuestions, buildScenarioContent } from './generators.ts'

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
    // Initialiser Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('🚀 Début génération contenu complet EDN...')

    // Récupérer tous les items EDN
    const { data: ednItems, error: ednError } = await supabase
      .from('edn_items_immersive')
      .select('*')
      .order('item_code')

    if (ednError) {
      throw new Error(`Erreur EDN items: ${ednError.message}`)
    }

    console.log(`📋 ${ednItems.length} items EDN trouvés`)

    let processed = 0
    let updated = 0
    let errors = 0

    for (const item of ednItems) {
      try {
        processed++
        console.log(`\n🔄 Traitement ${item.item_code} (${processed}/${ednItems.length})`)

        // Extraire le numéro d'item
        const itemNum = parseInt(item.item_code.replace('IC-', ''))
        
        // Récupérer les compétences OIC pour cet item
        const { data: competencesA, error: errorA } = await supabase
          .from('oic_competences')
          .select('*')
          .eq('item_parent', `IC-${itemNum}`)
          .eq('rang', 'A')
          .order('objectif_id')

        const { data: competencesB, error: errorB } = await supabase
          .from('oic_competences')
          .select('*')
          .eq('item_parent', `IC-${itemNum}`)
          .eq('rang', 'B')
          .order('objectif_id')

        if (errorA || errorB) {
          console.log(`⚠️ Pas de compétences OIC pour ${item.item_code}`)
          continue
        }

        const compA = competencesA || []
        const compB = competencesB || []

        console.log(`   📚 ${compA.length} compétences Rang A, ${compB.length} compétences Rang B`)

        // =====================
        // 1. GÉNÉRATION PAROLES MUSICALES
        // =====================
        
        const parolesRangA = compA.length > 0 ? [
          `Item ${itemNum} rang A, les bases à maîtriser`,
          ...compA.slice(0, 3).map(comp => 
            `${comp.intitule?.substring(0, 50) || 'Compétence essentielle'}, c'est la clé du succès`
          ),
          `Rang A item ${itemNum}, fondations solides pour réussir`
        ] : [`Item ${itemNum} rang A, connaissances de base importantes`]

        const parolesRangB = compB.length > 0 ? [
          `Item ${itemNum} rang B, expertise approfondie`,
          ...compB.slice(0, 3).map(comp => 
            `${comp.intitule?.substring(0, 50) || 'Expertise avancée'}, maîtrise totale`
          ),
          `Rang B item ${itemNum}, excellence clinique assurée`
        ] : [`Item ${itemNum} rang B, connaissances avancées importantes`]

        const parolesComplete = [
          `Item ${itemNum} complet, de A à B on va tout maîtriser`,
          ...parolesRangA.slice(1, 2),
          ...parolesRangB.slice(1, 2),
          `IC-${itemNum} mémorisé, succès garanti pour l'ECN`
        ]

        // =====================
        // 2. GÉNÉRATION QCM
        // =====================
        
        const quizQuestions = buildQuizQuestions({
          itemNumber: itemNum,
          itemTitle: item.title,
          competencesA: compA,
          competencesB: compB,
        })

        // =====================
        // 3. GÉNÉRATION SCÉNARIO IMMERSIF
        // =====================

        const scenarioContent = buildScenarioContent({
          itemNumber: itemNum,
          itemTitle: item.title,
          competencesA: compA,
          competencesB: compB,
        })

        // =====================
        // 4. MISE À JOUR DE L'ITEM
        // =====================
        
        const { error: updateError } = await supabase
          .from('edn_items_immersive')
          .update({
            paroles_rang_a: parolesRangA,
            paroles_rang_b: parolesRangB,
            paroles_rang_ab: parolesComplete,
            paroles_musicales: parolesComplete, // Backward compatibility
            quiz_questions: quizQuestions,
            scene_immersive: scenarioContent,
            competences_count_rang_a: compA.length,
            competences_count_rang_b: compB.length,
            competences_count_total: compA.length + compB.length,
            competences_oic_rang_a: compA,
            competences_oic_rang_b: compB,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)

        if (updateError) {
          throw new Error(`Erreur update: ${updateError.message}`)
        }

        updated++
        console.log(`   ✅ ${item.item_code} mis à jour avec succès`)
        console.log(`      🎵 ${parolesRangA.length} paroles rang A, ${parolesRangB.length} paroles rang B`)
        console.log(`      🧪 ${quizQuestions.length} questions QCM générées`)
        console.log(`      🎭 Scénario immersif créé`)

        // Pause entre les items pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (itemError) {
        errors++
        console.error(`❌ Erreur ${item.item_code}:`, itemError.message)
      }
    }

    console.log('\n🎯 GÉNÉRATION TERMINÉE')
    console.log(`📊 Statistiques:`)
    console.log(`   - Traités: ${processed}`)
    console.log(`   - Mis à jour: ${updated}`)
    console.log(`   - Erreurs: ${errors}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Génération contenu complet EDN terminée',
        statistics: {
          processed,
          updated,
          errors,
          completion_rate: `${Math.round((updated / processed) * 100)}%`
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erreur génération contenu',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
});