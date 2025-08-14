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

    const { item_code } = await req.json()

    if (!item_code) {
      return new Response(JSON.stringify({
        success: false,
        error: 'item_code requis'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log(`🔄 Mise à jour des compétences pour ${item_code}...`)

    // Extraire le numéro d'item
    const itemNumber = item_code.replace('IC-', '')

    // 1. Récupérer les compétences OIC mises à jour depuis backup_oic_competences
    const { data: oicRangA, error: oicErrorA } = await supabase
      .from('backup_oic_competences')
      .select('objectif_id, intitule, description, rubrique, ordre, url_source')
      .eq('item_parent', `IC-${itemNumber}`)
      .eq('rang', 'A')
      .order('ordre')

    const { data: oicRangB, error: oicErrorB } = await supabase
      .from('backup_oic_competences')
      .select('objectif_id, intitule, description, rubrique, ordre, url_source')
      .eq('item_parent', `IC-${itemNumber}`)
      .eq('rang', 'B')
      .order('ordre')

    if (oicErrorA || oicErrorB) {
      throw new Error(`Erreur récupération OIC: ${oicErrorA?.message || oicErrorB?.message}`)
    }

    // 2. Formater les compétences au format JSON
    const competencesRangA = (oicRangA || []).map((comp, index) => ({
      id: comp.objectif_id,
      concept: comp.intitule || `Concept ${index + 1}`,
      definition: comp.description || 'Définition à compléter',
      rubrique: comp.rubrique || '',
      ordre: comp.ordre || index + 1,
      url_source: comp.url_source || '',
      competence_id: comp.objectif_id
    }))

    const competencesRangB = (oicRangB || []).map((comp, index) => ({
      id: comp.objectif_id,
      concept: comp.intitule || `Concept ${index + 1}`,
      definition: comp.description || 'Définition à compléter',
      rubrique: comp.rubrique || '',
      ordre: comp.ordre || index + 1,
      url_source: comp.url_source || '',
      competence_id: comp.objectif_id
    }))

    // 3. Mettre à jour l'item EDN avec les nouvelles compétences
    const { error: updateError } = await supabase
      .from('edn_items_complete')
      .update({
        competences_oic_rang_a: competencesRangA,
        competences_oic_rang_b: competencesRangB,
        competences_count_rang_a: competencesRangA.length,
        competences_count_rang_b: competencesRangB.length,
        competences_count_total: competencesRangA.length + competencesRangB.length,
        updated_at: new Date().toISOString()
      })
      .eq('item_code', item_code)

    if (updateError) {
      throw updateError
    }

    // 4. Mettre à jour aussi dans edn_items_immersive si existe
    const { error: immersiveUpdateError } = await supabase
      .from('edn_items_immersive')
      .update({
        competences_oic_rang_a: competencesRangA,
        competences_oic_rang_b: competencesRangB,
        competences_count_rang_a: competencesRangA.length,
        competences_count_rang_b: competencesRangB.length,
        competences_count_total: competencesRangA.length + competencesRangB.length,
        updated_at: new Date().toISOString()
      })
      .eq('item_code', item_code)

    // Ne pas générer d'erreur si l'item n'existe pas dans immersive
    if (immersiveUpdateError) {
      console.warn(`Avertissement mise à jour immersive: ${immersiveUpdateError.message}`)
    }

    const result = {
      success: true,
      item_code,
      updated: {
        competences_rang_a: competencesRangA.length,
        competences_rang_b: competencesRangB.length,
        total_competences: competencesRangA.length + competencesRangB.length
      },
      timestamp: new Date().toISOString()
    }

    console.log(`✅ ${item_code} mis à jour: ${result.updated.total_competences} compétences`)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Erreur mise à jour compétences:', error)
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