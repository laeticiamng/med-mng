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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration Supabase manquante')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })

    const requestBody = await req.json()
    const { action } = requestBody

    console.log(`🎯 Action demandée: ${action}`)

    switch (action) {
      case 'check_incomplete':
        return await checkIncompleteCompetences(supabaseClient)
      case 'complete_all':
        return await completeAllCompetences(supabaseClient)
      case 'status':
        return await getCompletionStatus(supabaseClient)
      default:
        throw new Error('Action non reconnue')
    }

  } catch (error) {
    console.error('❌ Erreur dans complete-oic-competences:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Vérifier quelles compétences sont incomplètes
 */
async function checkIncompleteCompetences(supabaseClient: any) {
  console.log('🔍 Vérification des compétences incomplètes...')
  
  // Récupérer toutes les compétences de backup_oic_competences
  const { data: competences, error } = await supabaseClient
    .from('backup_oic_competences')
    .select('objectif_id, intitule, description, item_parent, rang')
    .order('item_parent', { ascending: true })
    .order('objectif_id', { ascending: true })

  if (error) {
    throw new Error(`Erreur récupération compétences: ${error.message}`)
  }

  console.log(`📊 ${competences.length} compétences à vérifier`)

  // Analyser les compétences incomplètes
  const incompletes = []
  let totalIncompletes = 0

  for (const comp of competences) {
    const issues = []
    
    // Vérifier l'intitulé
    if (!comp.intitule || comp.intitule.trim() === '' || comp.intitule.includes('&nbsp;') || comp.intitule.length < 10) {
      issues.push('intitule_incomplet')
    }
    
    // Vérifier la description
    if (!comp.description || 
        comp.description.trim() === '' || 
        comp.description === '&lt;br /&gt;' ||
        comp.description === '<br />' ||
        comp.description.includes('&nbsp; &nbsp; &nbsp;') ||
        comp.description.length < 20) {
      issues.push('description_incomplete')
    }

    if (issues.length > 0) {
      incompletes.push({
        objectif_id: comp.objectif_id,
        item_parent: comp.item_parent,
        rang: comp.rang,
        issues: issues,
        current_intitule: comp.intitule,
        current_description: comp.description
      })
      totalIncompletes++
    }
  }

  console.log(`❌ ${totalIncompletes} compétences incomplètes trouvées`)

  // Grouper par item pour le rapport
  const byItem = {}
  for (const comp of incompletes) {
    const key = `${comp.item_parent}-${comp.rang}`
    if (!byItem[key]) {
      byItem[key] = { item_parent: comp.item_parent, rang: comp.rang, count: 0, competences: [] }
    }
    byItem[key].count++
    byItem[key].competences.push(comp)
  }

  const rapport = {
    total_competences: competences.length,
    total_incompletes: totalIncompletes,
    pourcentage_incomplet: ((totalIncompletes / competences.length) * 100).toFixed(2),
    par_item: Object.values(byItem),
    echantillon_incomplet: incompletes.slice(0, 10) // Premier 10 pour exemple
  }

  return new Response(
    JSON.stringify(rapport),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

/**
 * Compléter toutes les compétences incomplètes en extrayant depuis UNESS
 */
async function completeAllCompetences(supabaseClient: any) {
  const session_id = crypto.randomUUID()
  console.log(`🚀 Démarrage complétion des compétences OIC - Session: ${session_id}`)
  
  // Démarrer la tâche en arrière-plan
  const backgroundTask = performCompletion(supabaseClient, session_id)
  
  if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
    EdgeRuntime.waitUntil(backgroundTask)
  } else {
    backgroundTask.catch(error => {
      console.error('Erreur tâche complétion:', error)
    })
  }

  return new Response(
    JSON.stringify({
      success: true,
      session_id,
      message: 'Complétion des compétences OIC démarrée',
      status_url: `/functions/complete-oic-competences?action=status&session_id=${session_id}`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

/**
 * Effectuer la complétion des compétences incomplètes
 */
async function performCompletion(supabaseClient: any, session_id: string) {
  let totalProcessed = 0
  let totalCompleted = 0
  let totalErrors = 0

  try {
    // Identifier les compétences incomplètes
    console.log('🔍 Identification des compétences incomplètes...')
    
    const { data: incompleteCompetences, error } = await supabaseClient
      .from('backup_oic_competences')
      .select('*')
      .or('description.eq.&lt;br /&gt;,description.eq.<br />,description.eq.,description.ilike.%&nbsp; &nbsp; &nbsp;%,description.is.null,intitule.eq.,intitule.is.null')
      .order('item_parent', { ascending: true })
      .order('objectif_id', { ascending: true })

    if (error) {
      throw new Error(`Erreur identification compétences incomplètes: ${error.message}`)
    }

    console.log(`📊 ${incompleteCompetences.length} compétences incomplètes à traiter`)

    // Traiter par batch de 10
    const batchSize = 10
    const totalBatches = Math.ceil(incompleteCompetences.length / batchSize)

    for (let batch = 0; batch < totalBatches; batch++) {
      const startIdx = batch * batchSize
      const endIdx = Math.min(startIdx + batchSize, incompleteCompetences.length)
      const batchCompetences = incompleteCompetences.slice(startIdx, endIdx)
      
      console.log(`📦 Batch ${batch + 1}/${totalBatches} - Compétences ${startIdx + 1} à ${endIdx}`)
      
      for (const competence of batchCompetences) {
        try {
          totalProcessed++
          console.log(`🔄 Traitement ${competence.objectif_id}...`)
          
          // Extraire depuis UNESS en utilisant l'URL source
          const completedData = await extractFromUNESS(competence)
          
          if (completedData) {
            // Mettre à jour dans backup_oic_competences
            const { error: updateError } = await supabaseClient
              .from('backup_oic_competences')
              .update({
                intitule: completedData.intitule || competence.intitule,
                description: completedData.description || competence.description,
                extraction_status: 'completed',
                updated_at: new Date().toISOString()
              })
              .eq('objectif_id', competence.objectif_id)

            if (updateError) {
              console.error(`❌ Erreur mise à jour ${competence.objectif_id}:`, updateError)
              totalErrors++
            } else {
              console.log(`✅ Compétence ${competence.objectif_id} complétée`)
              totalCompleted++
            }
          } else {
            console.warn(`⚠️ Impossible de compléter ${competence.objectif_id}`)
            totalErrors++
          }
          
        } catch (error) {
          console.error(`💥 Erreur traitement ${competence.objectif_id}:`, error)
          totalErrors++
        }
        
        // Petite pause entre chaque compétence
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      console.log(`✅ Batch ${batch + 1} terminé - Complétées: ${totalCompleted}, Erreurs: ${totalErrors}`)
      
      // Pause entre les batches
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`🎉 Complétion terminée - Total traité: ${totalProcessed}, Complétées: ${totalCompleted}, Erreurs: ${totalErrors}`)

  } catch (error) {
    console.error('💥 Erreur critique complétion:', error)
    totalErrors++
  }

  // Mettre à jour les données des items EDN avec les nouvelles compétences complétées
  await updateEdnItemsWithCompletedData(supabaseClient)
}

/**
 * Extraire une compétence depuis UNESS
 */
async function extractFromUNESS(competence: any): Promise<any> {
  try {
    // Construire l'URL de la page UNESS
    const baseUrl = 'https://livret.uness.fr/lisa/2025/api.php'
    const pageTitle = competence.url_source ? 
      decodeURIComponent(competence.url_source.split('/').pop() || '') :
      competence.intitule || competence.objectif_id

    console.log(`🌐 Extraction depuis UNESS: ${pageTitle}`)

    // Requête API MediaWiki pour récupérer le contenu de la page
    const apiUrl = `${baseUrl}?action=query&titles=${encodeURIComponent(pageTitle)}&prop=revisions&rvprop=content&format=json`
    
    const response = await fetch(apiUrl)
    const data = await response.json()

    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages)
      const page = pages[0] as any

      if (page && page.revisions && page.revisions[0]) {
        const content = page.revisions[0].content || page.revisions[0]['*']
        
        // Parser le contenu wikitext pour extraire l'intitulé et la description
        const parsed = parseWikitextContent(content, competence.objectif_id)
        
        if (parsed.intitule || parsed.description) {
          console.log(`✅ Extraction réussie pour ${competence.objectif_id}`)
          return parsed
        }
      }
    }

    console.warn(`⚠️ Pas de contenu trouvé pour ${competence.objectif_id}`)
    return null

  } catch (error) {
    console.error(`❌ Erreur extraction UNESS pour ${competence.objectif_id}:`, error)
    return null
  }
}

/**
 * Parser le contenu wikitext pour extraire intitulé et description
 */
function parseWikitextContent(content: string, objectifId: string): any {
  try {
    const result = { intitule: '', description: '' }

    // Extraire l'intitulé depuis le titre de la page
    const titleMatch = content.match(/^=+\s*(.+?)\s*=+/m)
    if (titleMatch) {
      result.intitule = titleMatch[1].trim()
    }

    // Extraire la description depuis le premier paragraphe après les métadonnées
    const lines = content.split('\n')
    let description = ''
    let foundContent = false

    for (const line of lines) {
      const trimmed = line.trim()
      
      // Ignorer les métadonnées et les liens
      if (trimmed.startsWith('{{') || trimmed.startsWith('[[') || 
          trimmed.startsWith('=') || trimmed.startsWith('|') ||
          trimmed === '') {
        continue
      }
      
      // Premier contenu textuel significatif
      if (trimmed.length > 20 && !foundContent) {
        description = trimmed
        foundContent = true
        break
      }
    }

    // Nettoyer la description
    if (description) {
      result.description = description
        .replace(/\{\{[^}]*\}\}/g, '') // Retirer les templates
        .replace(/\[\[[^\]]*\]\]/g, '') // Retirer les liens internes
        .replace(/&nbsp;/g, ' ')
        .replace(/<[^>]*>/g, '') // Retirer les balises HTML
        .trim()
    }

    // Si pas d'intitulé extrait, utiliser celui de l'objectif_id
    if (!result.intitule && objectifId) {
      result.intitule = `Connaître ${objectifId.replace(/OIC-\d+-\d+-[AB]/, '').trim()}`
    }

    return result

  } catch (error) {
    console.error('❌ Erreur parsing wikitext:', error)
    return { intitule: '', description: '' }
  }
}

/**
 * Mettre à jour les items EDN avec les données complétées
 */
async function updateEdnItemsWithCompletedData(supabaseClient: any) {
  console.log('🔄 Mise à jour des items EDN avec les données complétées...')
  
  try {
    // Re-synchroniser edn_items_complete avec backup_oic_competences
    const { error } = await supabaseClient.rpc('sql', {
      query: `
        UPDATE edn_items_complete 
        SET 
          competences_oic_rang_a = (
            SELECT jsonb_agg(
              jsonb_build_object(
                'objectif_id', objectif_id,
                'intitule', intitule,
                'description', description,
                'rubrique', rubrique,
                'ordre', ordre,
                'url_source', url_source
              ) ORDER BY ordre
            )
            FROM backup_oic_competences 
            WHERE item_parent = LPAD(SUBSTRING(item_code FROM 'IC-([0-9]+)')::text, 3, '0')
            AND rang = 'A'
          ),
          competences_oic_rang_b = (
            SELECT jsonb_agg(
              jsonb_build_object(
                'objectif_id', objectif_id,
                'intitule', intitule,
                'description', description,
                'rubrique', rubrique,
                'ordre', ordre,
                'url_source', url_source
              ) ORDER BY ordre
            )
            FROM backup_oic_competences 
            WHERE item_parent = LPAD(SUBSTRING(item_code FROM 'IC-([0-9]+)')::text, 3, '0')
            AND rang = 'B'
          ),
          updated_at = now()
        WHERE item_code ~ '^IC-[0-9]+$'
      `
    })

    if (error) {
      console.error('❌ Erreur mise à jour EDN items:', error)
    } else {
      console.log('✅ Items EDN mis à jour avec les compétences complétées')
    }

  } catch (error) {
    console.error('❌ Erreur synchronisation EDN:', error)
  }
}

/**
 * Obtenir le statut de la complétion
 */
async function getCompletionStatus(supabaseClient: any) {
  // Compter les compétences incomplètes restantes
  const { count: incompleteCount, error } = await supabaseClient
    .from('backup_oic_competences')
    .select('*', { count: 'exact', head: true })
    .or('description.eq.&lt;br /&gt;,description.eq.<br />,description.eq.,description.ilike.%&nbsp; &nbsp; &nbsp;%,description.is.null,intitule.eq.,intitule.is.null')

  if (error) {
    throw new Error(`Erreur comptage: ${error.message}`)
  }

  const { count: totalCount } = await supabaseClient
    .from('backup_oic_competences')
    .select('*', { count: 'exact', head: true })

  const completionRate = totalCount ? ((totalCount - incompleteCount) / totalCount * 100).toFixed(2) : 0

  return new Response(
    JSON.stringify({
      total_competences: totalCount,
      competences_incompletes: incompleteCount,
      taux_completion: `${completionRate}%`,
      status: incompleteCount === 0 ? 'complete' : 'incomplete'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}