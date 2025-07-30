import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OICCompetence {
  objectif_id: string
  intitule: string
  item_parent: string
  rang: 'A' | 'B'
  rubrique?: string
  description?: string
  ordre: number
  url_source: string
  raw_json: any
  hash_content: string
}

interface LiSAPage {
  pageid: number
  title: string
  revisions?: Array<{
    content: string
    timestamp: string
  }>
}

class LiSAExtractor {
  private baseUrl = 'https://livret.uness.fr/lisa/2025'
  private cookies: string = ''
  private stats = {
    total: 0,
    success: 0,
    errors: 0,
    startTime: Date.now()
  }
  private supabase: any

  constructor(supabase: any) {
    this.supabase = supabase
  }

  log(message: string) {
    console.log(`${new Date().toISOString()} - ${message}`)
  }

  async diagnoseAccess(): Promise<{ [key: string]: any }> {
    this.log('🔍 DIAGNOSTIC D\'ACCÈS LiSA')
    const results: { [key: string]: any } = {}

    // Test 1: API MediaWiki publique
    try {
      const apiUrl = `${this.baseUrl}/api.php?action=query&meta=siteinfo&format=json`
      const apiResponse = await fetch(apiUrl)
      results.api_status = apiResponse.status
      
      if (apiResponse.status === 200) {
        const apiData = await apiResponse.json()
        results.site_info = {
          name: apiData.query?.general?.sitename || 'Inconnu',
          version: apiData.query?.general?.generator || 'Inconnu'
        }
      }
    } catch (error) {
      results.api_error = error.message
    }

    // Test 2: Accès catégorie sans auth
    try {
      const catUrl = `${this.baseUrl}/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=5&format=json`
      const catResponse = await fetch(catUrl)
      results.category_status = catResponse.status
      
      if (catResponse.status === 200) {
        const catData = await catResponse.json()
        const members = catData.query?.categorymembers || []
        results.category_members = members.length
        results.sample_titles = members.slice(0, 3).map((m: any) => m.title)
      }
    } catch (error) {
      results.category_error = error.message
    }

    return results
  }

  async getOICPagesList(): Promise<string[]> {
    this.log('📋 RÉCUPÉRATION LISTE DES PAGES OIC')
    const allPages: string[] = []
    let continueToken = ''

    try {
      do {
        const url = `${this.baseUrl}/api.php?` + new URLSearchParams({
          action: 'query',
          list: 'categorymembers',
          cmtitle: 'Catégorie:Objectif_de_connaissance',
          cmlimit: '100',
          format: 'json',
          ...(continueToken && { cmcontinue: continueToken })
        })

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'MED-MNG-Extractor/1.0'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        if (data.error) {
          throw new Error(`API Error: ${data.error.info}`)
        }

        const pages = data.query?.categorymembers || []
        this.log(`   → ${pages.length} pages dans ce batch`)

        for (const page of pages) {
          if (page.title && page.title.includes('Objectif_de_connaissance')) {
            allPages.push(page.title)
          }
        }

        continueToken = data.continue?.cmcontinue || ''
        
        if (continueToken) {
          await this.delay(1000)
        }

      } while (continueToken)

      this.log(`✅ Total: ${allPages.length} pages OIC trouvées`)
      return allPages

    } catch (error) {
      this.log(`❌ Erreur récupération liste: ${error.message}`)
      return []
    }
  }

  async extractBatch(titles: string[]): Promise<OICCompetence[]> {
    const url = `${this.baseUrl}/api.php`
    
    const params = new URLSearchParams({
      action: 'query',
      prop: 'revisions',
      rvprop: 'content|timestamp',
      titles: titles.join('|'),
      format: 'json',
      formatversion: '2'
    })

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'User-Agent': 'MED-MNG-Extractor/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.error) {
      throw new Error(`API Error: ${data.error.info}`)
    }

    const pages: LiSAPage[] = data.query?.pages || []
    const competences: OICCompetence[] = []

    for (const page of pages) {
      try {
        if (page.revisions && page.revisions.length > 0) {
          const competence = this.parseOICPage(page)
          if (competence) {
            competences.push(competence)
            this.stats.success++
          }
        } else {
          this.stats.errors++
        }
      } catch (error) {
        this.log(`❌ Erreur parsing ${page.title}: ${error.message}`)
        this.stats.errors++
      }
    }

    return competences
  }

  parseOICPage(page: LiSAPage): OICCompetence | null {
    const content = page.revisions?.[0]?.content || ''
    const title = page.title || ''

    // Pattern d'extraction amélioré
    const idMatch = title.match(/Objectif_de_connaissance_(\d{3})_(\d{2})_([AB])_(\d{2})/i)
    if (!idMatch) {
      return null
    }

    const [, itemParent, rubriqueCode, rang, ordre] = idMatch
    const objectifId = `OIC-${itemParent}-${rubriqueCode}-${rang}-${ordre}`

    // Extraction de l'intitulé
    const intitulePatterns = [
      /\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/,
      /\|\s*[Tt]itre\s*=\s*([^\n\|]+)/,
      /===?\s*([^=\n]+)\s*===?/
    ]

    let intitule = ''
    for (const pattern of intitulePatterns) {
      const match = content.match(pattern)
      if (match && match[1]?.trim()) {
        intitule = match[1].trim()
        break
      }
    }

    if (!intitule) {
      intitule = title.replace(/Objectif_de_connaissance_/g, '')
        .replace(/_/g, ' ')
        .trim()
    }

    // Extraction de la description
    const descPatterns = [
      /\|\s*[Dd]escription\s*=\s*([^\n\|]+)/,
      /\|\s*[Cc]ontenu\s*=\s*([^\n\|]+)/
    ]

    let description = ''
    for (const pattern of descPatterns) {
      const match = content.match(pattern)
      if (match && match[1]?.trim()) {
        description = match[1].trim()
        break
      }
    }

    // Mapping des rubriques
    const rubriquesMap: Record<string, string> = {
      '01': 'Génétique',
      '02': 'Hématologie', 
      '03': 'Cancérologie',
      '04': 'Maladies infectieuses',
      '05': 'Immunologie',
      '06': 'Endocrinologie',
      '07': 'Cardiologie',
      '08': 'Pneumologie',
      '09': 'Gastroentérologie',
      '10': 'Néphrologie',
      '11': 'Neurologie'
    }

    const competence: OICCompetence = {
      objectif_id: objectifId,
      intitule: intitule || `Objectif ${objectifId}`,
      item_parent: `IC-${itemParent}`,
      rang: rang as 'A' | 'B',
      rubrique: rubriquesMap[rubriqueCode] || `Rubrique ${rubriqueCode}`,
      description: description || null,
      ordre: parseInt(ordre),
      url_source: `${this.baseUrl}/${title}`,
      raw_json: { title, content: content.substring(0, 1000) },
      hash_content: this.hashContent(content)
    }

    return competence
  }

  hashContent(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  async saveToSupabase(competences: OICCompetence[]): Promise<{ inserted: number, errors: number }> {
    this.log(`💾 SAUVEGARDE SUPABASE (${competences.length} compétences)`)

    if (competences.length === 0) {
      return { inserted: 0, errors: 0 }
    }

    let inserted = 0
    let errors = 0
    const batchSize = 50

    for (let i = 0; i < competences.length; i += batchSize) {
      const batch = competences.slice(i, i + batchSize)
      
      try {
        const { data, error } = await this.supabase
          .from('oic_competences')
          .upsert(batch, { onConflict: 'objectif_id' })
          .select('objectif_id')

        if (error) {
          this.log(`❌ Erreur batch: ${error.message}`)
          errors += batch.length
        } else {
          const count = data?.length || 0
          inserted += count
        }
      } catch (batchError) {
        this.log(`❌ Erreur batch: ${batchError.message}`)
        errors += batch.length
      }

      await this.delay(500)
    }

    return { inserted, errors }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async run(testMode: boolean = false): Promise<any> {
    this.log('🚀 EXTRACTION API-FIRST DES COMPÉTENCES EDN')
    
    // Diagnostic
    const diagnosis = await this.diagnoseAccess()

    // Récupération de la liste
    const pages = await this.getOICPagesList()
    
    if (pages.length === 0) {
      return {
        success: false,
        error: 'Aucune page OIC trouvée',
        diagnosis
      }
    }

    this.stats.total = pages.length

    // Extraction du contenu (limité en mode test)
    const pagesToProcess = testMode ? pages.slice(0, 10) : pages
    const competences: OICCompetence[] = []
    
    const batchSize = 10
    for (let i = 0; i < pagesToProcess.length; i += batchSize) {
      const batch = pagesToProcess.slice(i, i + batchSize)
      try {
        const batchCompetences = await this.extractBatch(batch)
        competences.push(...batchCompetences)
        await this.delay(1000)
      } catch (error) {
        this.log(`❌ Erreur batch: ${error.message}`)
        this.stats.errors += batch.length
      }
    }

    // Sauvegarde
    const saveResult = await this.saveToSupabase(competences)

    const duration = (Date.now() - this.stats.startTime) / 1000

    return {
      success: true,
      statistics: {
        duration: `${duration.toFixed(1)}s`,
        total_pages: this.stats.total,
        processed_pages: pagesToProcess.length,
        extracted_competences: competences.length,
        saved_competences: saveResult.inserted,
        errors: this.stats.errors,
        completion_rate: `${((saveResult.inserted / pagesToProcess.length) * 100).toFixed(1)}%`
      },
      diagnosis,
      sample_competences: competences.slice(0, 5).map(c => ({
        objectif_id: c.objectif_id,
        intitule: c.intitule,
        item_parent: c.item_parent,
        rang: c.rang
      }))
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { testMode = false } = await req.json()

    const extractor = new LiSAExtractor(supabaseClient)
    const result = await extractor.run(testMode)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('💥 Erreur critique:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})