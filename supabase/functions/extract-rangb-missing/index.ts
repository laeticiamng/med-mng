import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { getErrorMessage } from '../_shared/error-utils.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Les 11 items sans OIC Rang B
const MISSING_ITEMS = [
  { numero: 1, titre: 'La relation médecin-malade' },
  { numero: 29, titre: 'Risques professionnels pour la maternité' },
  { numero: 48, titre: 'Alimentation et besoins nutritionnels du nourrisson' },
  { numero: 59, titre: 'Sujets en situation de précarité' },
  { numero: 137, titre: "Douleur chez l'enfant" },
  { numero: 140, titre: 'Soins palliatifs (2) - Accompagnement' },
  { numero: 164, titre: "Exanthèmes fébriles de l'enfant" },
  { numero: 180, titre: 'Risques sanitaires liés aux irradiations' },
  { numero: 212, titre: "Hémogramme chez l'adulte et l'enfant" },
  { numero: 269, titre: 'Douleurs abdominales aiguës' },
  { numero: 330, titre: 'Prescription et surveillance des médicaments' },
]

interface GeneratedObjectif {
  objectif_id: string
  intitule: string
  description: string
  rubrique: string
  item_parent: string
  rang: string
}

/**
 * Génère les OIC Rang B via Lovable AI pour un item donné
 */
async function generateRangBForItem(
  itemNumero: number,
  itemTitre: string,
  rangAObjectifs: string[],
  apiKey: string
): Promise<GeneratedObjectif[]> {
  const paddedNum = String(itemNumero).padStart(3, '0')

  const prompt = `Tu es un expert en pédagogie médicale française et tu maîtrises parfaitement le référentiel des Épreuves Dématérialisées Nationales (EDN) 2025.

Pour l'item de connaissance IC-${itemNumero} "${itemTitre}", voici les objectifs de Rang A (connaissances indispensables) déjà définis :
${rangAObjectifs.map((o, i) => `${i + 1}. ${o}`).join('\n')}

Génère maintenant les objectifs de Rang B (connaissances essentielles) pour cet item. Les objectifs Rang B sont des connaissances plus approfondies que le Rang A, portant sur :
- La physiopathologie détaillée
- Les diagnostics différentiels complets
- Les stratégies thérapeutiques spécifiques
- Les complications et leur prise en charge
- Les examens complémentaires de deuxième intention
- Les particularités selon le terrain (âge, comorbidités)

IMPORTANT :
- Génère entre 3 et 12 objectifs Rang B pertinents
- Chaque objectif doit commencer par un verbe d'action (Connaître, Savoir, Identifier, Expliquer...)
- Les objectifs doivent être complémentaires aux Rang A (pas de doublons)
- Le contenu doit être fidèle au programme officiel EDN/ECNi 2025
- Chaque objectif doit avoir un intitulé court (max 150 caractères) ET une description détaillée (2-3 phrases)

Réponds UNIQUEMENT avec un tableau JSON (pas de texte avant ou après), au format :
[
  {"intitule": "...", "description": "..."},
  {"intitule": "...", "description": "..."}
]`

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'Tu es un professeur de médecine spécialisé dans le programme EDN 2025. Tu génères du contenu pédagogique médical précis et structuré.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`AI gateway error ${response.status}: ${errText.substring(0, 200)}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  // Extraire le JSON du contenu (peut être encapsulé dans des backticks)
  const jsonMatch = content.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    console.warn(`⚠️ IC-${itemNumero}: pas de JSON valide dans la réponse AI`)
    console.log('Réponse brute:', content.substring(0, 500))
    return []
  }

  const parsed: { intitule: string; description: string }[] = JSON.parse(jsonMatch[0])

  return parsed.map((obj, idx) => {
    const idxStr = String(idx + 1).padStart(2, '0')
    return {
      objectif_id: `OIC-${paddedNum}-01-B-${idxStr}`,
      intitule: obj.intitule.substring(0, 200),
      description: obj.description,
      rubrique: 'Compétences Rang B',
      item_parent: paddedNum,
      rang: 'B',
    }
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 extract-rangb-missing démarré (mode génération IA)')

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({
        success: false,
        error: 'LOVABLE_API_KEY manquant',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Phase 1: Récupérer les OIC Rang A existants pour chaque item
    console.log('📥 Phase 1: Récupération des Rang A existants...')
    const { data: rangAData, error: rangAError } = await supabase
      .from('backup_oic_competences')
      .select('item_parent, intitule')
      .in('item_parent', MISSING_ITEMS.map(i => String(i.numero).padStart(3, '0')))
      .eq('rang', 'A')
      .order('objectif_id')

    if (rangAError) {
      throw new Error(`Erreur lecture Rang A: ${rangAError.message}`)
    }

    // Grouper par item
    const rangAByItem: Record<string, string[]> = {}
    for (const row of rangAData || []) {
      if (!rangAByItem[row.item_parent]) rangAByItem[row.item_parent] = []
      rangAByItem[row.item_parent].push(row.intitule)
    }

    // Phase 2: Générer les Rang B via IA
    console.log('🤖 Phase 2: Génération des Rang B via Lovable AI...')
    const allObjectifs: GeneratedObjectif[] = []
    const report: { item: number; status: string; count: number }[] = []

    for (const item of MISSING_ITEMS) {
      const paddedNum = String(item.numero).padStart(3, '0')
      const rangA = rangAByItem[paddedNum] || []

      console.log(`🔄 IC-${item.numero} "${item.titre}" — ${rangA.length} Rang A comme contexte`)

      try {
        const objectifs = await generateRangBForItem(item.numero, item.titre, rangA, LOVABLE_API_KEY)
        console.log(`✅ IC-${item.numero}: ${objectifs.length} objectifs Rang B générés`)
        allObjectifs.push(...objectifs)
        report.push({ item: item.numero, status: 'ok', count: objectifs.length })
      } catch (err: unknown) {
        console.error(`❌ IC-${item.numero}:`, getErrorMessage(err))
        report.push({ item: item.numero, status: 'error', count: 0 })
      }

      // Throttle pour éviter le rate limiting
      await new Promise(r => setTimeout(r, 2000))
    }

    console.log(`📊 Total: ${allObjectifs.length} objectifs Rang B générés`)

    if (allObjectifs.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Aucun objectif Rang B généré',
        report,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Phase 3: Insertion dans backup_oic_competences
    console.log('💾 Phase 3: Insertion dans backup_oic_competences...')
    let insertedCount = 0
    let insertErrors = 0

    for (const obj of allObjectifs) {
      const { error } = await supabase
        .from('backup_oic_competences')
        .upsert({
          objectif_id: obj.objectif_id,
          intitule: obj.intitule,
          description: obj.description,
          rubrique: obj.rubrique,
          item_parent: obj.item_parent,
          rang: 'B',
          url_source: 'generated-by-ai',
        }, {
          onConflict: 'objectif_id',
          ignoreDuplicates: false,
        })

      if (error) {
        console.error(`❌ Insert ${obj.objectif_id}:`, error.message)
        insertErrors++
      } else {
        insertedCount++
      }
    }

    console.log(`✅ Insérés: ${insertedCount}, Erreurs: ${insertErrors}`)

    // Phase 4: Propagation JSONB vers edn_items_immersive et edn_items_complete
    console.log('🔄 Phase 4: Propagation JSONB...')
    const itemParents = [...new Set(allObjectifs.map(o => o.item_parent))]

    for (const parent of itemParents) {
      const itemObjectifs = allObjectifs
        .filter(o => o.item_parent === parent)
        .map((o, idx) => ({
          objectif_id: o.objectif_id,
          intitule: o.intitule,
          description: o.description,
          rubrique: o.rubrique,
          ordre: idx + 1,
        }))

      const itemCode = `IC-${parseInt(parent)}`

      // Update edn_items_immersive
      const { error: errImm } = await supabase
        .from('edn_items_immersive')
        .update({
          competences_oic_rang_b: itemObjectifs,
          competences_count_rang_b: itemObjectifs.length,
        })
        .eq('item_code', itemCode)

      if (errImm) console.error(`❌ Propagation immersive ${itemCode}:`, errImm.message)

      // Update edn_items_complete
      const { error: errComp } = await supabase
        .from('edn_items_complete')
        .update({
          competences_oic_rang_b: itemObjectifs,
          competences_count_rang_b: itemObjectifs.length,
        })
        .eq('item_code', itemCode)

      if (errComp) console.error(`❌ Propagation complete ${itemCode}:`, errComp.message)
    }

    // Recalculer competences_count_total
    for (const parent of itemParents) {
      const itemCode = `IC-${parseInt(parent)}`
      const { data: immData } = await supabase
        .from('edn_items_immersive')
        .select('competences_count_rang_a, competences_count_rang_b')
        .eq('item_code', itemCode)
        .single()

      if (immData) {
        const total = (immData.competences_count_rang_a || 0) + (immData.competences_count_rang_b || 0)
        await supabase.from('edn_items_immersive').update({ competences_count_total: total }).eq('item_code', itemCode)
        await supabase.from('edn_items_complete').update({ competences_count_total: total }).eq('item_code', itemCode)
      }
    }

    console.log('✅ Propagation terminée')

    return new Response(JSON.stringify({
      success: true,
      message: `${insertedCount} objectifs Rang B générés par IA et propagés`,
      stats: {
        totalGenerated: allObjectifs.length,
        totalInserted: insertedCount,
        insertErrors,
        itemsProcessed: MISSING_ITEMS.length,
      },
      report,
      sample: allObjectifs.slice(0, 5),
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    console.error('❌ Erreur critique:', getErrorMessage(error))
    return new Response(JSON.stringify({
      success: false,
      error: getErrorMessage(error),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
