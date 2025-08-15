import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OicCompetence {
  objectif_id: string
  intitule: string
  description: string
  url_source: string
  item_parent: string
  rang: string
}

async function extractContentFromUrl(url: string): Promise<string | null> {
  try {
    console.log(`🌐 Extraction depuis: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      console.log(`❌ Erreur HTTP ${response.status} pour ${url}`)
      return null
    }
    
    const html = await response.text()
    
    // Nettoyer le contenu HTML et extraire le texte pertinent
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Supprimer scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Supprimer styles
      .replace(/<[^>]*>/g, ' ') // Supprimer balises HTML
      .replace(/\s+/g, ' ') // Normaliser espaces
      .trim()
    
    // Filtrer le contenu non pertinent (pages de login, erreurs, etc.)
    const invalidContent = [
      'bienvenue',
      'login',
      'mot de passe',
      'connexion',
      'erreur',
      'page non trouvée',
      'javascript',
      'cookies'
    ]
    
    const contentLower = content.toLowerCase()
    if (invalidContent.some(invalid => contentLower.includes(invalid))) {
      console.log(`⚠️ Contenu invalide détecté pour ${url}`)
      return null
    }
    
    // Garder seulement un contenu de taille raisonnable (entre 50 et 2000 caractères)
    if (content.length < 50 || content.length > 2000) {
      console.log(`⚠️ Contenu de taille invalide (${content.length} chars) pour ${url}`)
      return null
    }
    
    console.log(`✅ Contenu extrait (${content.length} chars) pour ${url}`)
    return content
    
  } catch (error) {
    console.log(`❌ Erreur extraction ${url}:`, error)
    return null
  }
}

function shouldUpdateContent(currentDescription: string, newContent: string): boolean {
  // Vérifier si le contenu actuel est problématique
  const invalidSigns = [
    'lisa',
    'bienvenue',
    'login',
    'connexion',
    'javascript',
    'votre adresse email',
    '<',
    'OIC-' // Éviter les descriptions qui ne contiennent que l'ID
  ]
  
  const currentLower = currentDescription.toLowerCase()
  const hasInvalidContent = invalidSigns.some(sign => currentLower.includes(sign))
  
  // Vérifier si le nouveau contenu est meilleur
  const isNewContentValid = newContent.length > 50 && 
                           newContent.length > currentDescription.length * 1.5 &&
                           !invalidSigns.some(sign => newContent.toLowerCase().includes(sign))
  
  return hasInvalidContent || isNewContentValid
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=====================================')
    console.log('🔄 COMPLÉTION PAR URL - DÉMARRAGE')
    console.log('=====================================')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Récupérer toutes les compétences avec URL
    console.log('📥 Récupération des compétences OIC avec URL...')
    
    const { data: competences, error } = await supabase
      .from('backup_oic_competences')
      .select('objectif_id, intitule, description, url_source, item_parent, rang')
      .not('url_source', 'is', null)
      .neq('url_source', '')
    
    if (error) {
      console.error('❌ Erreur récupération compétences:', error)
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📊 ${competences?.length || 0} compétences avec URL trouvées`)

    let processedCount = 0
    let updatedCount = 0
    let errorCount = 0

    // 2. Traiter chaque compétence
    for (const competence of competences || []) {
      try {
        processedCount++
        console.log(`\n🔍 [${processedCount}/${competences?.length}] ${competence.objectif_id}`)
        
        // Extraire le contenu de l'URL
        const newContent = await extractContentFromUrl(competence.url_source)
        
        if (!newContent) {
          console.log(`⚠️ Impossible d'extraire le contenu pour ${competence.objectif_id}`)
          continue
        }
        
        // Vérifier si une mise à jour est nécessaire
        if (!shouldUpdateContent(competence.description || '', newContent)) {
          console.log(`✅ Contenu déjà correct pour ${competence.objectif_id}`)
          continue
        }
        
        // Mettre à jour la compétence
        const { error: updateError } = await supabase
          .from('backup_oic_competences')
          .update({ 
            description: newContent,
            updated_at: new Date().toISOString()
          })
          .eq('objectif_id', competence.objectif_id)
        
        if (updateError) {
          console.error(`❌ Erreur mise à jour ${competence.objectif_id}:`, updateError)
          errorCount++
        } else {
          console.log(`✅ Mis à jour: ${competence.objectif_id}`)
          updatedCount++
        }
        
        // Pause pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`❌ Erreur traitement ${competence.objectif_id}:`, error)
        errorCount++
      }
    }

    // 3. Statistiques finales
    console.log('\n=====================================')
    console.log('📊 STATISTIQUES FINALES:')
    console.log(`   - Compétences traitées: ${processedCount}`)
    console.log(`   - Compétences mises à jour: ${updatedCount}`)
    console.log(`   - Erreurs: ${errorCount}`)
    console.log(`   - Taux de réussite: ${processedCount > 0 ? Math.round((updatedCount / processedCount) * 100) : 0}%`)
    console.log('=====================================')

    const result = {
      success: true,
      statistics: {
        competences_traitees: processedCount,
        competences_mises_a_jour: updatedCount,
        erreurs: errorCount,
        taux_reussite: processedCount > 0 ? Math.round((updatedCount / processedCount) * 100) : 0
      },
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Erreur globale:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    )
  }
})