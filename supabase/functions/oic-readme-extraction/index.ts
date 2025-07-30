// ✅ Edge Function - Extraction OIC selon README-OIC-EXTRACTION.md
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mapping des rubriques selon README
const RUBRIQUES_MAP: Record<string, string> = {
  '01': 'Génétique',
  '02': 'Cancérologie', 
  '03': 'Cardiologie',
  '04': 'Pneumologie',
  '05': 'Gastroentérologie',
  '06': 'Neurologie',
  '07': 'Psychiatrie',
  '08': 'Gynécologie-Obstétrique',
  '09': 'Pédiatrie',
  '10': 'Endocrinologie',
  '11': 'Autres spécialités'
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    console.log('🚀 EXTRACTION API-FIRST DES 4,872 OBJECTIFS EDN')
    console.log('===============================================')

    // 1. Test API publique selon README
    console.log('🔍 Test d\'accès public à l\'API MediaWiki...')
    const testResponse = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=1&format=json&origin=*')
    
    if (!testResponse.ok) {
      throw new Error('API MediaWiki inaccessible')
    }
    console.log('✅ API MediaWiki publique accessible!')

    // 2. Récupération des IDs selon README
    console.log('📋 Récupération des IDs de pages de la catégorie...')
    const allPageIds: number[] = []
    let cmcontinue = ''
    
    do {
      const url = `https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=500&format=json&origin=*${cmcontinue ? '&cmcontinue=' + encodeURIComponent(cmcontinue) : ''}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.query?.categorymembers) {
        const oicPages = data.query.categorymembers.filter((page: any) => 
          /OIC-\d{3}-\d{2}-[AB]-\d{2}/.test(page.title)
        )
        allPageIds.push(...oicPages.map((p: any) => p.pageid))
        console.log(`   → ${oicPages.length} pages OIC trouvées dans ce batch...`)
      }
      
      cmcontinue = data.continue?.cmcontinue || ''
    } while (cmcontinue)

    console.log(`✅ ${allPageIds.length} pages OIC listées au total`)

    // 3. Extraction par batches de 50 selon README
    console.log('🔄 Traitement par batches de 50 pages...')
    const batchSize = 50
    const totalBatches = Math.ceil(allPageIds.length / batchSize)
    let totalInserted = 0
    let totalErrors = 0

    for (let i = 0; i < totalBatches; i++) {
      const batchStart = i * batchSize
      const batchEnd = Math.min(batchStart + batchSize, allPageIds.length)
      const batchIds = allPageIds.slice(batchStart, batchEnd)
      
      console.log(`📦 Batch ${i + 1}/${totalBatches} - Pages ${batchStart + 1} à ${batchEnd}`)

      try {
        // Récupération du contenu selon README
        const contentUrl = `https://livret.uness.fr/lisa/2025/api.php?action=query&prop=revisions&rvprop=content|timestamp&pageids=${batchIds.join('|')}&format=json&formatversion=2&origin=*`
        const contentResponse = await fetch(contentUrl)
        const contentData = await contentResponse.json()

        if (contentData.query?.pages) {
          const competences: any[] = []
          
          for (const page of contentData.query.pages) {
            const parsed = parseOICPage(page)
            if (parsed) {
              competences.push(parsed)
            } else {
              totalErrors++
            }
          }

          // Insertion en base selon README
          if (competences.length > 0) {
            const { error } = await supabase
              .from('backup_oic_competences')
              .upsert(competences, { 
                onConflict: 'objectif_id',
                ignoreDuplicates: false 
              })

            if (error) {
              console.error('❌ Erreur insertion batch:', error)
              totalErrors += competences.length
            } else {
              totalInserted += competences.length
              console.log(`   ✅ ${competences.length}/${batchIds.length} compétences insérées`)
            }
          }
        }

        // Pause pour éviter rate limiting selon README
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`❌ Erreur batch ${i + 1}:`, error)
        totalErrors += batchIds.length
      }
    }

    // 4. Rapport selon README
    const rapport = {
      summary: {
        total_expected: 4872,
        total_extracted: totalInserted,
        total_errors: totalErrors,
        completeness_pct: ((totalInserted / allPageIds.length) * 100).toFixed(2),
        extraction_method: 'API-first selon README'
      },
      generated_at: new Date().toISOString()
    }

    console.log('📊 RAPPORT FINAL:', rapport)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Extraction terminée selon README-OIC-EXTRACTION.md',
        ...rapport
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 Erreur critique:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        method: 'Edge Function selon README'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function parseOICPage(page: any) {
  try {
    const title = page.title
    const content = page.revisions?.[0]?.content || ''

    // Parsing selon format README: OIC-XXX-YY-R-ZZ
    const idMatch = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/)
    if (!idMatch) return null

    const [, itemParent, rubriqueCode, rang, ordre] = idMatch

    // Extraction intitulé selon README
    const intitulePatterns = [
      /\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/,
      /\|\s*[Tt]itre\s*=\s*([^\n\|]+)/
    ]
    
    let intitule = ''
    for (const pattern of intitulePatterns) {
      const match = content.match(pattern)
      if (match) {
        intitule = match[1].trim()
        break
      }
    }

    // Extraction description selon README
    const descriptionMatch = content.match(/\|\s*[Dd]escription\s*=\s*([^\n\|]+)/)
    let description = descriptionMatch ? descriptionMatch[1].trim() : ''
    
    if (!description) {
      const firstParagraph = content.split('\n').find((line: string) => 
        line.trim() && !line.startsWith('|') && !line.startsWith('{')
      )
      description = firstParagraph ? firstParagraph.trim() : ''
    }

    return {
      objectif_id: title,
      intitule: intitule || title,
      item_parent: itemParent.padStart(3, '0'),
      rang,
      rubrique: RUBRIQUES_MAP[rubriqueCode] || `Rubrique ${rubriqueCode}`,
      description: description.substring(0, 1000),
      ordre: parseInt(ordre),
      url_source: `https://livret.uness.fr/lisa/2025/index.php?title=${encodeURIComponent(title)}`,
      raw_json: { title, content: content.substring(0, 2000) },
      date_import: new Date().toISOString(),
      hash_content: btoa(content).substring(0, 50),
      extraction_status: 'completed'
    }

  } catch (error) {
    console.error('Erreur parsing page:', page.title, error)
    return null
  }
}