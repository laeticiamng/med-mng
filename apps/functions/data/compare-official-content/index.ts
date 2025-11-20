import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ComparisonResult {
  item_code: string
  title: string
  official_content?: string
  our_rang_a_count: number
  our_rang_b_count: number
  official_rang_a?: string[]
  official_rang_b?: string[]
  differences: string[]
  similarity_score: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification requise pour compare-official-content
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase si nécessaire
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ compare-official-content autorisé pour user ${user.id}`);

    // Code original de la fonction
    
    console.log('🔍 Starting official content comparison...')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all EDN items from our database
    const { data: ednItems, error: ednError } = await supabase
      .from('edn_items_immersive')
      .select('item_code, title, tableau_rang_a, tableau_rang_b')
      .order('item_code')

    if (ednError) {
      throw new Error(`Error fetching EDN items: ${ednError.message}`)
    }

    console.log(`📊 Found ${ednItems?.length} EDN items to compare`)

    // Get official content from UNESS data
    const { data: unessData, error: unessError } = await supabase
      .from('edn_items_uness')
      .select('item_id, intitule, rangs_a, rangs_b, contenu_complet_html')

    if (unessError) {
      throw new Error(`Error fetching UNESS data: ${unessError.message}`)
    }

    console.log(`📚 Found ${unessData?.length} UNESS items for comparison`)

    const comparisons: ComparisonResult[] = []

    // Process each EDN item
    for (const item of ednItems || []) {
      console.log(`🔍 Processing ${item.item_code}...`)
      
      const itemNumber = parseInt(item.item_code.replace('IC-', ''))
      const officialItem = unessData?.find(u => u.item_id === itemNumber)
      
      const ourRangACount = item.tableau_rang_a?.sections?.[0]?.concepts?.length || 0
      const ourRangBCount = item.tableau_rang_b?.sections?.[0]?.concepts?.length || 0
      
      const differences: string[] = []
      let similarityScore = 100

      // Check if we have official content
      if (!officialItem) {
        differences.push('❌ Aucun contenu officiel trouvé')
        similarityScore -= 50
      } else {
        // Compare title
        if (item.title !== officialItem.intitule) {
          differences.push(`📝 Titre différent: "${item.title}" vs "${officialItem.intitule}"`)
          similarityScore -= 10
        }

        // Check official rangs
        const officialRangA = officialItem.rangs_a || []
        const officialRangB = officialItem.rangs_b || []

        if (officialRangA.length === 0 && ourRangACount > 0) {
          differences.push('⚠️ Nous avons du contenu Rang A mais pas d\'officiel')
          similarityScore -= 15
        } else if (officialRangA.length > 0 && ourRangACount === 0) {
          differences.push('❌ Contenu officiel Rang A manquant dans notre base')
          similarityScore -= 25
        }

        if (officialRangB.length === 0 && ourRangBCount > 0) {
          differences.push('⚠️ Nous avons du contenu Rang B mais pas d\'officiel')
          similarityScore -= 15
        } else if (officialRangB.length > 0 && ourRangBCount === 0) {
          differences.push('❌ Contenu officiel Rang B manquant dans notre base')
          similarityScore -= 25
        }
      }

      comparisons.push({
        item_code: item.item_code,
        title: item.title,
        official_content: officialItem?.contenu_complet_html,
        our_rang_a_count: ourRangACount,
        our_rang_b_count: ourRangBCount,
        official_rang_a: officialItem?.rangs_a,
        official_rang_b: officialItem?.rangs_b,
        differences,
        similarity_score: Math.max(0, similarityScore)
      })
    }

    // Calculate summary statistics
    const totalItems = comparisons.length
    const itemsWithOfficialContent = comparisons.filter(c => c.official_content).length
    const averageSimilarity = comparisons.reduce((sum, c) => sum + c.similarity_score, 0) / totalItems
    const itemsWithDifferences = comparisons.filter(c => c.differences.length > 0).length

    const summary = {
      total_items: totalItems,
      items_with_official_content: itemsWithOfficialContent,
      items_with_differences: itemsWithDifferences,
      average_similarity: Math.round(averageSimilarity * 100) / 100,
      completion_rate: Math.round((itemsWithOfficialContent / totalItems) * 100 * 100) / 100
    }

    console.log('📊 Comparison completed:', summary)

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        comparisons: comparisons.slice(0, 50), // Limit to first 50 for response size
        total_comparisons: comparisons.length
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )

  } catch (error) {
    console.error('❌ Error in comparison:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})