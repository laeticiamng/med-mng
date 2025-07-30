import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔧 Démarrage de la correction des compétences OIC tronquées...')

    // 1. Identifier les compétences tronquées
    const { data: truncatedCompetences, error: fetchError } = await supabase
      .from('backup_oic_competences')
      .select('objectif_id, intitule, description, url_source, item_parent, rang')
      .or('char_length(description).eq.1000,description.ilike.%politiq,description.ilike.%...')
      .order('objectif_id')

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des compétences tronquées:', fetchError)
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`📊 ${truncatedCompetences?.length || 0} compétences tronquées identifiées`)

    let fixedCount = 0
    let errorCount = 0
    const batchSize = 5 // Traitement par petits lots pour éviter les timeouts

    // Traitement par lots
    for (let i = 0; i < (truncatedCompetences?.length || 0); i += batchSize) {
      const batch = truncatedCompetences!.slice(i, i + batchSize)
      console.log(`📦 Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil((truncatedCompetences?.length || 0)/batchSize)} - Compétences ${i + 1} à ${Math.min(i + batchSize, truncatedCompetences?.length || 0)}`)

      for (const competence of batch) {
        try {
          console.log(`🔄 Traitement ${competence.objectif_id}...`)
          
          // Construire l'URL de la page UNESS pour cette compétence
          let unessUrl = competence.url_source
          if (!unessUrl) {
          // Construire l'URL LiSA depuis l'objectif_id
            const urlParts = competence.objectif_id.split('-')
            if (urlParts.length >= 4) {
              const rubrique = urlParts[1]
              const item = urlParts[2] 
              const rang = urlParts[3]
              const numero = urlParts[4]
              unessUrl = `https://livret.uness.fr/lisa/2025/index.php/OIC-${rubrique}-${item}-${rang}-${numero}`
            } else {
              unessUrl = `https://livret.uness.fr/lisa/2025/index.php/${competence.objectif_id}`
            }
          }

          console.log(`🌐 Extraction depuis LiSA: ${unessUrl}`)

          // Récupérer les identifiants UNESS depuis les secrets Supabase
          const unessUsername = Deno.env.get('UNESS_USERNAME')
          const unessPassword = Deno.env.get('UNESS_PASSWORD')
          
          if (!unessUsername || !unessPassword) {
            console.warn('⚠️ Identifiants UNESS manquants, tentative sans authentification')
          }

          // Extraire le contenu complet depuis LiSA avec authentification CAS si disponible
          const response = await fetch(unessUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
              'Cache-Control': 'no-cache',
              ...(unessUsername && unessPassword ? {
                'Authorization': `Basic ${btoa(`${unessUsername}:${unessPassword}`)}`
              } : {})
            }
          })

          if (!response.ok) {
            console.warn(`⚠️ Impossible d'accéder à ${unessUrl} pour ${competence.objectif_id}`)
            errorCount++
            continue
          }

          const html = await response.text()
          
          // Extraire le contenu complet de la description
          // Rechercher le contenu entre les balises appropriées
          let fullDescription = competence.description
          
          // Patterns pour extraire le contenu complet
          const patterns = [
            // Pattern pour objectifs spécifiques
            new RegExp(`${competence.objectif_id}[\\s\\S]*?</div>`, 'gi'),
            // Pattern pour sections de contenu
            /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
            // Pattern pour paragraphes de texte
            /<p[^>]*>([\s\S]*?)<\/p>/gi
          ]

          for (const pattern of patterns) {
            const matches = html.match(pattern)
            if (matches) {
              for (const match of matches) {
                // Nettoyer le HTML et extraire le texte
                const cleanText = match
                  .replace(/<[^>]*>/g, ' ')
                  .replace(/&nbsp;/g, ' ')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&amp;/g, '&')
                  .replace(/\s+/g, ' ')
                  .trim()

                // Si ce texte contient notre compétence et est plus long
                if (cleanText.toLowerCase().includes(competence.intitule?.toLowerCase() || '') && 
                    cleanText.length > fullDescription.length) {
                  fullDescription = cleanText
                }
              }
            }
          }

          // Si on n'a pas trouvé de contenu plus long, essayer d'autres méthodes
          if (fullDescription.length <= 1000) {
            // Rechercher dans tout le contenu de la page
            const pageText = html
              .replace(/<script[\s\S]*?<\/script>/gi, '')
              .replace(/<style[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]*>/g, ' ')
              .replace(/&nbsp;/g, ' ')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/\s+/g, ' ')

            // Chercher des paragraphes contenant notre intitulé
            const sentences = pageText.split(/[.!?]+/)
            let bestMatch = fullDescription
            
            for (let j = 0; j < sentences.length - 1; j++) {
              const segment = sentences.slice(j, j + 3).join('.').trim()
              if (segment.toLowerCase().includes(competence.intitule?.toLowerCase() || '') && 
                  segment.length > bestMatch.length && 
                  segment.length < 5000) { // Limite raisonnable
                bestMatch = segment
              }
            }
            
            fullDescription = bestMatch
          }

          // Mettre à jour si on a une description plus complète
          if (fullDescription.length > competence.description.length) {
            const { error: updateError } = await supabase
              .from('backup_oic_competences')
              .update({
                description: fullDescription,
                extraction_status: 'completed',
                updated_at: new Date().toISOString()
              })
              .eq('objectif_id', competence.objectif_id)

            if (updateError) {
              console.error(`❌ Erreur mise à jour ${competence.objectif_id}:`, updateError)
              errorCount++
            } else {
              console.log(`✅ ${competence.objectif_id} corrigé (${competence.description.length} → ${fullDescription.length} caractères)`)
              fixedCount++
            }
          } else {
            console.log(`ℹ️ ${competence.objectif_id} - pas d'amélioration trouvée`)
          }

          // Petite pause pour éviter de surcharger UNESS
          await new Promise(resolve => setTimeout(resolve, 100))

        } catch (error) {
          console.error(`❌ Erreur lors du traitement de ${competence.objectif_id}:`, error)
          errorCount++
        }
      }

      // Pause entre les lots
      if (i + batchSize < (truncatedCompetences?.length || 0)) {
        console.log('⏳ Pause entre les lots...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`🎉 Correction terminée - Corrigées: ${fixedCount}, Erreurs: ${errorCount}`)

    // Synchroniser avec edn_items_complete si des corrections ont été apportées
    if (fixedCount > 0) {
      console.log('🔄 Synchronisation avec edn_items_complete...')
      
      // Mettre à jour les compétences dans edn_items_complete
      const { data: itemsToUpdate } = await supabase
        .from('edn_items_complete')
        .select('item_code, competences_oic_rang_a, competences_oic_rang_b')

      for (const item of itemsToUpdate || []) {
        let updated = false
        
        // Mettre à jour rang A
        if (item.competences_oic_rang_a && Array.isArray(item.competences_oic_rang_a)) {
          const { data: rangACompetences } = await supabase
            .from('backup_oic_competences')
            .select('*')
            .eq('item_parent', item.item_code)
            .eq('rang', 'A')
            .order('ordre')

          if (rangACompetences && rangACompetences.length > 0) {
            await supabase
              .from('edn_items_complete')
              .update({ competences_oic_rang_a: rangACompetences })
              .eq('item_code', item.item_code)
            updated = true
          }
        }

        // Mettre à jour rang B
        if (item.competences_oic_rang_b && Array.isArray(item.competences_oic_rang_b)) {
          const { data: rangBCompetences } = await supabase
            .from('backup_oic_competences')
            .select('*')
            .eq('item_parent', item.item_code)
            .eq('rang', 'B')
            .order('ordre')

          if (rangBCompetences && rangBCompetences.length > 0) {
            await supabase
              .from('edn_items_complete')
              .update({ competences_oic_rang_b: rangBCompetences })
              .eq('item_code', item.item_code)
            updated = true
          }
        }

        if (updated) {
          console.log(`✅ ${item.item_code} synchronisé`)
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Correction terminée - ${fixedCount} compétences corrigées, ${errorCount} erreurs`,
      fixedCount,
      errorCount,
      totalProcessed: truncatedCompetences?.length || 0
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return new Response(JSON.stringify({
      error: 'Erreur lors de la correction des compétences tronquées',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})