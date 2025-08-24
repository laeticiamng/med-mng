// 🚀 Edge Function Deno - Version exécutable du script extract-oic-deno.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuration sécurisée avec secrets Supabase
const config = {
  cas: {
    username: Deno.env.get('CAS_USERNAME'),
    password: Deno.env.get('CAS_PASSWORD')
  },
  urls: {
    base: 'https://livret.uness.fr/lisa/2025',
    category: 'https://livret.uness.fr/lisa/2025/Catégorie:Objectif_de_connaissance',
    api: 'https://livret.uness.fr/lisa/2025/api.php'
  }
}

// Validation des secrets requis
if (!config.cas.username || !config.cas.password) {
  throw new Error('❌ ERREUR: Variables CAS_USERNAME et CAS_PASSWORD requises dans les secrets Supabase')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Fonction de log
  function log(message: string) {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${message}`)
  }

  try {
    log('🚀 DÉMARRAGE EXTRACTION OIC AVEC DENO - 4,872 COMPÉTENCES ATTENDUES')
    log('=================================================================')
    
    const stats = {
      startTime: Date.now(),
      totalFound: 0,
      totalProcessed: 0,
      totalInserted: 0,
      totalErrors: 0,
      errors: [] as any[]
    }
    
    // 1. Authentification CAS avec Deno
    log('🔐 Authentification CAS avec Deno...')
    const sessionCookies = await authenticateCASWithDeno()
    
    if (!sessionCookies) {
      throw new Error('❌ Authentification CAS échouée')
    }
    
    log('✅ Cookies de session récupérés avec Deno')
    
    // 2. Extraction via API MediaWiki
    log('📡 Début extraction via API MediaWiki avec session...')
    const allCompetences = await extractViaAPIWithDeno(sessionCookies, stats)
    
    // 3. Insertion dans Supabase
    log(`💾 Insertion de ${allCompetences.length} compétences dans Supabase...`)
    const { error } = await supabase
      .from('backup_oic_competences')
      .upsert(allCompetences, { 
        onConflict: 'objectif_id',
        ignoreDuplicates: false 
      })

    if (error) {
      throw new Error(`Erreur insertion Supabase: ${error.message}`)
    }

    stats.totalInserted = allCompetences.length
    
    // 4. Rapport final
    const duration = Date.now() - stats.startTime
    const rapport = {
      success: true,
      totalExtracted: stats.totalInserted,
      totalErrors: stats.totalErrors,
      duration: `${Math.round(duration / 1000)}s`,
      completionRate: ((stats.totalInserted / 4872) * 100).toFixed(2) + '%',
      method: 'Deno Edge Function + CAS Authentication',
      timestamp: new Date().toISOString()
    }
    
    log('🎉 EXTRACTION TERMINÉE AVEC SUCCÈS !')
    log(`📊 RAPPORT FINAL: ${JSON.stringify(rapport, null, 2)}`)
    
    return new Response(
      JSON.stringify(rapport),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error(`❌ ERREUR CRITIQUE: ${error.message}`)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        method: 'Deno Edge Function'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }

  // Authentification CAS avec Deno (sans Puppeteer)
  async function authenticateCASWithDeno(): Promise<string | null> {
    log('🌐 Navigation vers page protégée pour déclencher authentification CAS...')
    
    try {
      // Étape 1: Accéder à la page protégée pour déclencher redirection CAS
      const initialResponse = await fetch(config.urls.category, {
        redirect: 'manual'
      })
      
      let currentUrl = initialResponse.headers.get('location') || config.urls.category
      log(`🔍 URL après redirection: ${currentUrl}`)
      
      // Si pas de redirection CAS, déjà authentifié
      if (!currentUrl.includes('cas/login') && !currentUrl.includes('auth.uness.fr')) {
        log('✅ Pas de redirection CAS - déjà authentifié')
        return extractCookiesFromHeaders(initialResponse.headers)
      }
      
      log('🔑 Authentification CAS requise - début du processus...')
      
      // Étape 2: Récupérer la page de login CAS
      const loginPageResponse = await fetch(currentUrl)
      const loginPageHtml = await loginPageResponse.text()
      
      // Extraire le token d'exécution
      const executionMatch = loginPageHtml.match(/name="execution" value="([^"]+)"/)
      const execution = executionMatch ? executionMatch[1] : 'e1s1'
      log(`🎫 Token d'exécution CAS: ${execution}`)
      
      // Étape 3: Soumettre les identifiants
      log('📧 Saisie des identifiants complets...')
      const formData = new URLSearchParams({
        'username': config.cas.username,
        'password': config.cas.password,
        'execution': execution,
        '_eventId': 'submit',
        'geolocation': ''
      })
      
      const authResponse = await fetch(currentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': currentUrl
        },
        body: formData,
        redirect: 'manual'
      })
      
      // Étape 4: Suivre toutes les redirections OAuth2
      log('⏳ Suivi des redirections OAuth2...')
      let finalResponse = authResponse
      let redirectCount = 0
      
      while (finalResponse.headers.get('location') && redirectCount < 10) {
        const nextUrl = finalResponse.headers.get('location')!
        log(`↗️ Redirection ${redirectCount + 1}: ${nextUrl.substring(0, 100)}...`)
        
        finalResponse = await fetch(nextUrl, { 
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        redirectCount++
        
        // Si on arrive sur livret.uness.fr, c'est bon
        if (nextUrl.includes('livret.uness.fr')) {
          log('🎉 Arrivé sur livret.uness.fr !')
          break
        }
      }
      
      // Extraire les cookies de session
      const sessionCookies = extractCookiesFromHeaders(finalResponse.headers)
      if (!sessionCookies) {
        throw new Error('Aucun cookie de session récupéré')
      }
      
      log('✅ Authentification CAS terminée avec succès')
      return sessionCookies
      
    } catch (error) {
      log(`❌ Erreur authentification CAS: ${error.message}`)
      return null
    }
  }

  // Extraction via API avec Deno
  async function extractViaAPIWithDeno(cookies: string, stats: any): Promise<any[]> {
    const allCompetences: any[] = []
    let continueToken = ''
    
    do {
      const apiUrl = new URL(config.urls.api)
      apiUrl.searchParams.set('action', 'query')
      apiUrl.searchParams.set('list', 'categorymembers')
      apiUrl.searchParams.set('cmtitle', 'Catégorie:Objectif_de_connaissance')
      apiUrl.searchParams.set('cmlimit', '500')
      apiUrl.searchParams.set('format', 'json')
      
      if (continueToken) {
        apiUrl.searchParams.set('cmcontinue', continueToken)
      }
      
      log(`🔗 Requête API: ${apiUrl.toString()}`)
      
      const apiResponse = await fetch(apiUrl.toString(), {
        headers: {
          'Cookie': cookies,
          'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor-Deno/1.0)',
          'Accept': 'application/json',
          'Referer': config.urls.base
        }
      })
      
      if (!apiResponse.ok) {
        throw new Error(`API request failed: ${apiResponse.status}`)
      }
      
      const apiData = await apiResponse.json()
      
      if (apiData.error) {
        throw new Error(`API Error: ${apiData.error.code} - ${apiData.error.info}`)
      }
      
      const allMembers = apiData.query?.categorymembers || []
      log(`📋 ${allMembers.length} membres trouvés dans la catégorie`)
      
      // Filtrer les pages OIC
      const oicPattern = /OIC-\d{3}-\d{2}-[AB]/
      const pageIds = allMembers
        .filter((p: any) => p.title?.match(oicPattern))
        .map((p: any) => p.pageid)
      
      log(`🎯 ${pageIds.length} pages OIC trouvées`)
      stats.totalFound += pageIds.length
      
      // Récupérer le contenu par batches de 50
      for (let i = 0; i < pageIds.length; i += 50) {
        const batch = pageIds.slice(i, i + 50)
        const contentUrl = new URL(config.urls.api)
        contentUrl.searchParams.set('action', 'query')
        contentUrl.searchParams.set('prop', 'revisions')
        contentUrl.searchParams.set('rvprop', 'content|timestamp')
        contentUrl.searchParams.set('pageids', batch.join('|'))
        contentUrl.searchParams.set('format', 'json')
        contentUrl.searchParams.set('formatversion', '2')
        
        const contentResponse = await fetch(contentUrl.toString(), {
          headers: {
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor-Deno/1.0)',
            'Accept': 'application/json'
          }
        })
        
        const contentData = await contentResponse.json()
        
        if (contentData.query?.pages) {
          for (const page of contentData.query.pages) {
            const competence = parseOICCompetence(page)
            if (competence) {
              allCompetences.push(competence)
              stats.totalProcessed++
            } else {
              stats.totalErrors++
            }
          }
        }
        
        log(`✅ Batch ${Math.floor(i/50) + 1} traité - ${allCompetences.length} compétences extraites`)
        
        // Pause pour éviter surcharge
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      continueToken = apiData.continue?.cmcontinue || ''
      
    } while (continueToken)
    
    return allCompetences
  }

  // Parse OIC
  function parseOICCompetence(page: any) {
    try {
      const title = page.title
      const content = page.revisions?.[0]?.content || ''

      const idMatch = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/)
      if (!idMatch) return null

      const [, itemParent, rubriqueCode, rang, ordre] = idMatch

      const rubriques: Record<string, string> = {
        '01': 'Génétique', '02': 'Cancérologie', '03': 'Cardiologie',
        '04': 'Pneumologie', '05': 'Gastroentérologie', '06': 'Neurologie',
        '07': 'Psychiatrie', '08': 'Gynécologie-Obstétrique', '09': 'Pédiatrie',
        '10': 'Endocrinologie', '11': 'Autres spécialités'
      }

      const intituleMatch = content.match(/\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/)
      const descriptionMatch = content.match(/\|\s*[Dd]escription\s*=\s*([^\n\|]+)/)
      
      let description = descriptionMatch ? descriptionMatch[1].trim() : ''
      if (!description) {
        const firstPara = content.split('\n').find((line: string) => 
          line.trim() && !line.startsWith('|') && !line.startsWith('{')
        )
        description = firstPara ? firstPara.trim() : ''
      }

      return {
        objectif_id: title,
        intitule: intituleMatch ? intituleMatch[1].trim() : title,
        item_parent: itemParent,
        rang,
        rubrique: rubriques[rubriqueCode] || `Rubrique ${rubriqueCode}`,
        description: description.substring(0, 1000),
        ordre: parseInt(ordre),
        url_source: `${config.urls.base}/index.php?title=${encodeURIComponent(title)}`,
        raw_json: { title, content: content.substring(0, 2000) },
        date_import: new Date().toISOString(),
        hash_content: btoa(content).substring(0, 50),
        extraction_status: 'completed'
      }

    } catch (error) {
      console.error('Erreur parsing:', page.title, error)
      return null
    }
  }

  // Utilitaire pour extraire les cookies
  function extractCookiesFromHeaders(headers: Headers): string {
    const cookies = headers.get('set-cookie')
    return cookies || ''
  }
})