import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔧 Début de la correction des compétences OIC pour IC-205')

    // Supprimer les anciennes données corrompues pour IC-205
    const { error: deleteError } = await supabaseClient
      .from('oic_competences')
      .delete()
      .eq('item_parent', '205')

    if (deleteError) {
      console.error('❌ Erreur suppression:', deleteError)
      throw deleteError
    }

    // Données correctes pour IC-205 (Hémoptysie)
    const competencesIC205 = [
      // Rang A - Formation initiale
      {
        objectif_id: 'OIC-205-01-A',
        intitule: 'Connaître la définition d\'une hémoptysie',
        description: 'Saignement provenant des voies aériennes sous-glottiques (trachée, bronches, alvéoles). À distinguer des hématémèses (provenant du tube digestif) et des épistaxis déglutis.',
        rang: 'A',
        item_parent: '205',
        ordre: 1
      },
      {
        objectif_id: 'OIC-205-02-A',
        intitule: 'Connaître les deux diagnostics différentiels principaux',
        description: 'Les 2 diagnostics différentiels sont : 1) Hématémèse (saignement digestif) - différencier par l\'anamnèse et l\'examen clinique, 2) Épistaxis dégluti (saignement nasal dégluti) - rechercher des signes ORL.',
        rang: 'A',
        item_parent: '205',
        ordre: 2
      },
      {
        objectif_id: 'OIC-205-03-A',
        intitule: 'Évaluer l\'abondance de l\'hémoptysie',
        description: 'L\'abondance s\'évalue à son volume (minime <50ml/24h, moyenne 50-200ml/24h, massive >200ml/24h ou >100ml en une fois) et à son retentissement hémodynamique et respiratoire.',
        rang: 'A',
        item_parent: '205',
        ordre: 3
      },
      {
        objectif_id: 'OIC-205-04-A',
        intitule: 'Connaître le traitement symptomatique initial',
        description: 'Le traitement symptomatique repose initialement sur : l\'oxygénothérapie, la position de sécurité (côté qui saigne déclive si connu), la surveillance des constantes vitales, et l\'interdiction des antitussifs.',
        rang: 'A',
        item_parent: '205',
        ordre: 4
      },
      {
        objectif_id: 'OIC-205-05-A',
        intitule: 'Identifier les critères de gravité immédiate',
        description: 'Critères de gravité immédiate : instabilité hémodynamique, détresse respiratoire, hémoptysie massive (>200ml/24h), troubles de la conscience, signes de choc hémorragique.',
        rang: 'A',
        item_parent: '205',
        ordre: 5
      },

      // Rang B - Formation approfondie
      {
        objectif_id: 'OIC-205-01-B',
        intitule: 'Maîtriser l\'évaluation de la gravité complète',
        description: 'Évaluer la gravité par : examen clinique complet, bilan biologique initial (hémogramme, bilan d\'hémostase, ionogramme), gaz du sang artériel, radiographie thoracique en urgence.',
        rang: 'B',
        item_parent: '205',
        ordre: 1
      },
      {
        objectif_id: 'OIC-205-02-B',
        intitule: 'Identifier les étiologies par imagerie',
        description: 'Demander une imagerie appropriée : radiographie thoracique en première intention, scanner thoracique avec injection si besoin, recherche d\'infiltrats, de masses, d\'épanchements.',
        rang: 'B',
        item_parent: '205',
        ordre: 2
      },
      {
        objectif_id: 'OIC-205-03-B',
        intitule: 'Connaître les étiologies principales',
        description: 'Principales étiologies : 1) Cancer broncho-pulmonaire (évoqué devant : âge >40 ans, tabagisme, altération de l\'état général), 2) Infections (pneumonie, tuberculose, bronchectasies), 3) Embolie pulmonaire, 4) Traumatisme thoracique.',
        rang: 'B',
        item_parent: '205',
        ordre: 3
      },
      {
        objectif_id: 'OIC-205-04-B',
        intitule: 'Maîtriser la stratégie de prise en charge',
        description: 'La gravité de l\'hémoptysie conditionne le secteur de prise en charge et la stratégie thérapeutique : hémoptysie minime = ambulatoire avec surveillance, hémoptysie grave = hospitalisation en urgence avec réanimation si besoin.',
        rang: 'B',
        item_parent: '205',
        ordre: 4
      },
      {
        objectif_id: 'OIC-205-05-B',
        intitule: 'Connaître les explorations complémentaires',
        description: 'Explorations selon le contexte : fibroscopie bronchique (en urgence si massive, programmée si minime), angioscanner pulmonaire si suspicion d\'embolie, échocardiographie si suspicion de cardiopathie.',
        rang: 'B',
        item_parent: '205',
        ordre: 5
      }
    ]

    // Insérer les nouvelles données correctes
    const { error: insertError } = await supabaseClient
      .from('oic_competences')
      .insert(competencesIC205)

    if (insertError) {
      console.error('❌ Erreur insertion:', insertError)
      throw insertError
    }

    console.log(`✅ ${competencesIC205.length} compétences OIC corrigées pour IC-205`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Compétences OIC corrigées pour IC-205`,
        count: competencesIC205.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Erreur:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})