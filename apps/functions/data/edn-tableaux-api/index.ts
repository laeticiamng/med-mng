import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

interface TableauRang {
  title?: string
  sections?: Array<{
    title: string
    content: string
    keywords?: string[]
  }>
}

interface CompletenessResult {
  item_id: string
  item_code: string
  title: string
  completeness_score: number
  missing_fields: string[]
  rang_a_complete: boolean
  rang_b_complete: boolean
  issues: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification requise pour edn-tableaux-api
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

    console.log(`✅ edn-tableaux-api autorisé pour user ${user.id}`);

    // Code original de la fonction
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const action = pathParts[pathParts.length - 1]

    // GET /items/:item_id/tableau-rang-a
    if (req.method === 'GET' && action === 'tableau-rang-a') {
      const itemId = pathParts[pathParts.length - 2]
      
      const { data: item, error } = await supabase
        .from('edn_items_immersive')
        .select('id, item_code, title, tableau_rang_a')
        .eq('id', itemId)
        .single()

      if (error || !item) {
        return new Response(
          JSON.stringify({ error: 'Item not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          item_id: item.id,
          item_code: item.item_code,
          title: item.title,
          tableau_rang_a: item.tableau_rang_a || {},
          complete: isTableauComplete(item.tableau_rang_a)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /items/:item_id/tableau-rang-b
    if (req.method === 'GET' && action === 'tableau-rang-b') {
      const itemId = pathParts[pathParts.length - 2]
      
      const { data: item, error } = await supabase
        .from('edn_items_immersive')
        .select('id, item_code, title, tableau_rang_b')
        .eq('id', itemId)
        .single()

      if (error || !item) {
        return new Response(
          JSON.stringify({ error: 'Item not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          item_id: item.id,
          item_code: item.item_code,
          title: item.title,
          tableau_rang_b: item.tableau_rang_b || {},
          complete: isTableauComplete(item.tableau_rang_b)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /items/:item_id/tableaux (A+B)
    if (req.method === 'GET' && action === 'tableaux') {
      const itemId = pathParts[pathParts.length - 2]
      
      const { data: item, error } = await supabase
        .from('edn_items_immersive')
        .select('id, item_code, title, tableau_rang_a, tableau_rang_b')
        .eq('id', itemId)
        .single()

      if (error || !item) {
        return new Response(
          JSON.stringify({ error: 'Item not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const rangAComplete = isTableauComplete(item.tableau_rang_a)
      const rangBComplete = isTableauComplete(item.tableau_rang_b)

      return new Response(
        JSON.stringify({
          item_id: item.id,
          item_code: item.item_code,
          title: item.title,
          tableau_rang_a: item.tableau_rang_a || {},
          tableau_rang_b: item.tableau_rang_b || {},
          completeness: {
            rang_a_complete: rangAComplete,
            rang_b_complete: rangBComplete,
            overall_complete: rangAComplete && rangBComplete,
            completeness_score: calculateCompletenessScore(item.tableau_rang_a, item.tableau_rang_b)
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /items/completeness-audit
    if (req.method === 'GET' && action === 'completeness-audit') {
      console.log('🔍 Starting completeness audit...')
      
      const { data: items, error } = await supabase
        .from('edn_items_immersive')
        .select('id, item_code, title, tableau_rang_a, tableau_rang_b, quiz_questions, scene_immersive, paroles_musicales')
        .order('item_code')

      if (error) {
        throw new Error(`Failed to fetch items: ${error.message}`)
      }

      const auditResults: CompletenessResult[] = []
      let totalItems = 0
      let completeItems = 0
      let incompleteItems = 0

      for (const item of items || []) {
        totalItems++
        const result = auditItemCompleteness(item)
        auditResults.push(result)

        if (result.completeness_score >= 80) {
          completeItems++
        } else {
          incompleteItems++
        }
      }

      const summary = {
        total_items: totalItems,
        complete_items: completeItems,
        incomplete_items: incompleteItems,
        completion_rate: totalItems > 0 ? Math.round((completeItems / totalItems) * 100) : 0,
        audit_timestamp: new Date().toISOString()
      }

      // Log audit results
      console.log(`📊 Audit Summary:`, summary)
      console.log(`❌ Items with issues: ${auditResults.filter(r => r.issues.length > 0).length}`)

      return new Response(
        JSON.stringify({
          summary,
          results: auditResults,
          incomplete_items: auditResults.filter(r => r.completeness_score < 80),
          critical_issues: auditResults.filter(r => r.completeness_score < 50)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in edn-tableaux-api:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function isTableauComplete(tableau: TableauRang | null): boolean {
  if (!tableau || typeof tableau !== 'object') return false
  
  // Vérifier que le tableau a un titre
  if (!tableau.title || tableau.title.trim().length === 0) return false
  
  // Vérifier qu'il y a des sections
  if (!tableau.sections || !Array.isArray(tableau.sections) || tableau.sections.length === 0) return false
  
  // Vérifier que chaque section est complète
  for (const section of tableau.sections) {
    if (!section.title || section.title.trim().length === 0) return false
    if (!section.content || section.content.trim().length === 0) return false
  }
  
  return true
}

function calculateCompletenessScore(rangA: TableauRang | null, rangB: TableauRang | null): number {
  let score = 0
  let maxScore = 100
  
  // Score Rang A (50 points max)
  if (isTableauComplete(rangA)) {
    score += 50
  } else if (rangA && rangA.title) {
    score += 10 // Points partiels pour titre seulement
  }
  
  // Score Rang B (50 points max)
  if (isTableauComplete(rangB)) {
    score += 50
  } else if (rangB && rangB.title) {
    score += 10 // Points partiels pour titre seulement
  }
  
  return Math.round(score)
}

function auditItemCompleteness(item: any): CompletenessResult {
  const issues: string[] = []
  const missingFields: string[] = []
  
  // Vérifier tableaux Rang A et B
  const rangAComplete = isTableauComplete(item.tableau_rang_a)
  const rangBComplete = isTableauComplete(item.tableau_rang_b)
  
  if (!rangAComplete) {
    missingFields.push('tableau_rang_a')
    issues.push('Tableau Rang A incomplet ou manquant')
  }
  
  if (!rangBComplete) {
    missingFields.push('tableau_rang_b') 
    issues.push('Tableau Rang B incomplet ou manquant')
  }
  
  // Vérifier autres contenus
  if (!item.quiz_questions || !Array.isArray(item.quiz_questions) || item.quiz_questions.length === 0) {
    missingFields.push('quiz_questions')
    issues.push('QCM manquant ou vide')
  }
  
  if (!item.scene_immersive || typeof item.scene_immersive !== 'object') {
    missingFields.push('scene_immersive')
    issues.push('Scène immersive manquante')
  }
  
  if (!item.paroles_musicales || !Array.isArray(item.paroles_musicales) || item.paroles_musicales.length === 0) {
    missingFields.push('paroles_musicales')
    issues.push('Paroles musicales manquantes')
  }
  
  const completenessScore = calculateItemCompleteness(item, missingFields.length)
  
  return {
    item_id: item.id,
    item_code: item.item_code,
    title: item.title,
    completeness_score: completenessScore,
    missing_fields: missingFields,
    rang_a_complete: rangAComplete,
    rang_b_complete: rangBComplete,
    issues
  }
}

function calculateItemCompleteness(item: any, missingFieldsCount: number): number {
  const totalFields = 5 // tableau_rang_a, tableau_rang_b, quiz_questions, scene_immersive, paroles_musicales
  const completeFields = totalFields - missingFieldsCount
  return Math.round((completeFields / totalFields) * 100)
}