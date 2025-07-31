import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

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
        
        const quizQuestions = []
        
        // Question basée sur rang A
        if (compA.length > 0) {
          const compRandA = compA[Math.floor(Math.random() * compA.length)]
          quizQuestions.push({
            id: 1,
            question: `Concernant ${item.title}, quelle est la notion fondamentale de rang A à retenir ?`,
            options: [
              compRandA.intitule?.substring(0, 80) || 'Notion essentielle à maîtriser',
              'Concept secondaire non prioritaire',
              'Détail technique avancé uniquement',
              'Information optionnelle pour l\'ECN'
            ],
            correct: 0,
            explanation: `${compRandA.intitule} est une compétence de rang A fondamentale pour l'item ${itemNum}. ${compRandA.description?.substring(0, 100) || 'Cette notion est essentielle à maîtriser.'}`
          })
        }

        // Question basée sur rang B
        if (compB.length > 0) {
          const compRandB = compB[Math.floor(Math.random() * compB.length)]
          quizQuestions.push({
            id: 2,
            question: `Pour l'expertise approfondie de l'item ${itemNum}, quelle compétence de rang B est importante ?`,
            options: [
              'Connaissance basique uniquement suffisante',
              compRandB.intitule?.substring(0, 80) || 'Expertise spécialisée requise',
              'Aucune compétence particulière nécessaire',
              'Simple mémorisation sans compréhension'
            ],
            correct: 1,
            explanation: `${compRandB.intitule} représente une expertise de rang B cruciale pour maîtriser complètement l'item ${itemNum}. ${compRandB.description?.substring(0, 100) || 'Cette compétence avancée est indispensable.'}`
          })
        }

        // Question de synthèse
        quizQuestions.push({
          id: 3,
          question: `Quelle approche est recommandée pour maîtriser complètement l'item ${itemNum} ?`,
          options: [
            'Se concentrer uniquement sur le rang A',
            'Ignorer les détails du rang B',
            'Maîtriser progressivement rang A puis rang B selon son niveau',
            'Mémoriser sans comprendre les concepts'
          ],
          correct: 2,
          explanation: `L'item ${itemNum} nécessite une approche progressive : maîtriser d'abord les compétences de rang A (${compA.length} compétences) puis approfondir avec le rang B (${compB.length} compétences) selon ses objectifs.`
        })

        // =====================
        // 3. GÉNÉRATION SCÉNARIO IMMERSIF
        // =====================
        
        const scenarioContent = {
          theme: 'medical_case',
          context: `Cas clinique interactif - Item ${itemNum}`,
          setting: {
            location: 'Service hospitalier',
            atmosphere: 'Environnement médical réaliste',
            characters: ['Patient', 'Médecin senior', 'Interne']
          },
          case_presentation: {
            patient_profile: `Patient présentant des signes en lien avec l'item ${itemNum}`,
            initial_symptoms: compA.length > 0 ? 
              compA.slice(0, 2).map(comp => comp.intitule?.substring(0, 60) || 'Symptôme classique').join(', ') :
              'Présentation clinique typique',
            clinical_challenge: `Diagnostic et prise en charge selon les compétences de l'item ${itemNum}`
          },
          interactions: [
            {
              type: 'anamnesis',
              content: `Interrogatoire du patient concernant ${item.title}`,
              responses: [
                'Poser les questions essentielles de rang A',
                'Approfondir avec les éléments de rang B',
                'Synthétiser les informations collectées',
                'Demander l\'avis du médecin senior'
              ],
              feedback: {
                rang_a: compA.length > 0 ? compA[0].intitule?.substring(0, 100) : 'Éléments de base à explorer',
                rang_b: compB.length > 0 ? compB[0].intitule?.substring(0, 100) : 'Approfondissement diagnostique'
              }
            },
            {
              type: 'clinical_reasoning',
              content: `Raisonnement clinique pour l'item ${itemNum}`,
              responses: [
                'Appliquer les connaissances de rang A',
                'Intégrer l\'expertise de rang B',
                'Proposer une stratégie thérapeutique',
                'Évaluer le pronostic'
              ],
              learning_objectives: {
                rang_a: `Maîtriser les ${compA.length} compétences fondamentales`,
                rang_b: `Développer l'expertise avec les ${compB.length} compétences avancées`
              }
            }
          ],
          learning_outcomes: [
            `Maîtrise des compétences de rang A de l'item ${itemNum}`,
            `Développement de l'expertise rang B`,
            `Application clinique pratique`,
            `Préparation efficace à l'ECN`
          ]
        }

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