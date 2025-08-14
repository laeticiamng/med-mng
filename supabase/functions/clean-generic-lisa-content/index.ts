import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CleanupResult {
  success: boolean
  cleaned_count: number
  affected_competences: any[]
  message: string
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🧹 Début du nettoyage des compétences avec contenu générique LiSA')

    // Étape 1: Vérifier combien de compétences sont affectées
    const { data: checkData, error: checkError } = await supabase
      .rpc('count_generic_lisa_content')

    if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError)
      throw checkError
    }

    const totalGeneric = checkData?.[0]?.total_count || 0
    const sampleObjectifs = checkData?.[0]?.sample_objectifs || []

    console.log(`🔍 ${totalGeneric} compétences avec contenu générique LiSA trouvées`)

    if (totalGeneric === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          cleaned_count: 0,
          affected_competences: [],
          message: 'Aucune compétence avec contenu générique LiSA trouvée. Base de données déjà propre.',
          total_checked: totalGeneric
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Étape 2: Nettoyer les compétences avec contenu générique
    const { data: cleanData, error: cleanError } = await supabase
      .rpc('clean_generic_lisa_content')

    if (cleanError) {
      console.error('❌ Erreur lors du nettoyage:', cleanError)
      throw cleanError
    }

    const cleanedCount = cleanData?.[0]?.cleaned_count || 0
    const affectedCompetences = cleanData?.[0]?.affected_competences || []

    console.log(`✅ ${cleanedCount} compétences nettoyées avec succès`)

    // Étape 3: Vérifier le résultat final
    const { data: verifyData, error: verifyError } = await supabase
      .rpc('count_generic_lisa_content')

    const remainingGeneric = verifyData?.[0]?.total_count || 0

    const result: CleanupResult = {
      success: true,
      cleaned_count: cleanedCount,
      affected_competences: affectedCompetences,
      message: `Nettoyage terminé avec succès. ${cleanedCount} compétences réinitialisées. ${remainingGeneric} compétences avec contenu générique restantes.`,
    }

    console.log('📊 Résumé du nettoyage:', {
      cleaned: cleanedCount,
      remaining: remainingGeneric,
      sample_cleaned: affectedCompetences.slice(0, 3)
    })

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erreur critique lors du nettoyage:', error)
    
    const errorResult: CleanupResult = {
      success: false,
      cleaned_count: 0,
      affected_competences: [],
      message: 'Erreur lors du nettoyage des compétences génériques LiSA',
      error: error.message
    }

    return new Response(
      JSON.stringify(errorResult),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})