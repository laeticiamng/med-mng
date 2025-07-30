// ✅ Edge Function avec Puppeteer - Solution définitive pour CAS UNESS
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuration identique à votre script .cjs
const config = {
  cas: {
    username: Deno.env.get('CAS_USERNAME') || 'laeticia.moto-ngane@etud.u-picardie.fr',
    password: Deno.env.get('CAS_PASSWORD') || 'Aiciteal1!'
  },
  urls: {
    base: 'https://livret.uness.fr/lisa/2025',
    category: 'https://livret.uness.fr/lisa/2025/Catégorie:Objectif_de_connaissance',
    api: 'https://livret.uness.fr/lisa/2025/api.php'
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  function log(message: string) {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${message}`)
  }

  try {
    log('🚀 EXTRACTION OIC AVEC PUPPETEER - SOLUTION DÉFINITIVE')
    log('=====================================================')
    
    // Import Puppeteer dynamiquement
    const { default: puppeteer } = await import('https://deno.land/x/puppeteer@16.2.0/mod.ts')
    
    const stats = {
      startTime: Date.now(),
      totalFound: 0,
      totalProcessed: 0,
      totalInserted: 0,
      totalErrors: 0
    }
    
    // Lancer Puppeteer
    log('🌐 Lancement de Puppeteer...')
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    })
    
    try {
      const page = await browser.newPage()
      
      // 1. Authentification CAS avec Puppeteer (votre méthode éprouvée)
      log('🔐 Authentification CAS avec Puppeteer...')
      await authenticateCASWithPuppeteer(page)
      
      // 2. Récupérer les cookies de session
      const cookies = await page.cookies()
      const cookieString = cookies
        .filter(c => c.domain.includes('uness.fr'))
        .map(c => `${c.name}=${c.value}`)
        .join('; ')
      
      log(`🍪 Cookies de session récupérés: ${cookies.length} cookies`)
      
      // 3. Extraction via API avec cookies
      log('📡 Extraction via API MediaWiki avec session Puppeteer...')
      const allCompetences = await extractViaAPIWithPuppeteer(page, cookieString, stats)
      
      // 4. Insertion en base
      log(`💾 Insertion de ${allCompetences.length} compétences dans Supabase...`)
      const { error } = await supabase
        .from('backup_oic_competences')
        .upsert(allCompetences, { 
          onConflict: 'objectif_id',
          ignoreDuplicates: false 
        })

      if (error) {
        throw new Error(`Erreur insertion: ${error.message}`)
      }

      stats.totalInserted = allCompetences.length
      
      const rapport = {
        success: true,
        totalExtracted: stats.totalInserted,
        totalErrors: stats.totalErrors,
        duration: `${Math.round((Date.now() - stats.startTime) / 1000)}s`,
        completionRate: ((stats.totalInserted / 4872) * 100).toFixed(2) + '%',
        method: 'Puppeteer + CAS Authentication (Edge Function)',
        timestamp: new Date().toISOString()
      }
      
      log('🎉 EXTRACTION TERMINÉE AVEC SUCCÈS !')
      log(`📊 RAPPORT: ${JSON.stringify(rapport, null, 2)}`)
      
      return new Response(
        JSON.stringify(rapport),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
      
    } finally {
      await browser.close()
    }
    
  } catch (error) {
    log(`❌ ERREUR CRITIQUE: ${error.message}`)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        method: 'Puppeteer Edge Function'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }

  // Authentification CAS avec Puppeteer (reprise de votre logique .cjs)
  async function authenticateCASWithPuppeteer(page: any) {
    log('🌐 Navigation vers page protégée pour déclencher authentification...')
    await page.goto(config.urls.category, { waitUntil: 'networkidle2', timeout: 30000 })
    
    const initialUrl = page.url()
    log(`🔍 URL initiale: ${initialUrl}`)
    
    // Si pas de redirection CAS, déjà authentifié
    if (!initialUrl.includes('cas/login') && !initialUrl.includes('auth.uness.fr')) {
      log('✅ Pas de redirection CAS - déjà authentifié')
      return
    }
    
    log('🔑 Authentification CAS requise - début du processus...')
    
    // Attendre que la page de login soit chargée
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Étape 1: Saisir l'email
    log('📧 Saisie de l\'email...')
    await page.waitForSelector('input[type="email"], input[name="email"], input[type="text"]', { timeout: 10000 })
    
    const emailInput = await page.$('input[type="email"]') || await page.$('input[name="email"]') || await page.$('input[type="text"]')
    if (!emailInput) {
      throw new Error('Champ email non trouvé')
    }
    
    await emailInput.type(config.cas.username)
    log(`✅ Email saisi: ${config.cas.username}`)
    
    // Cliquer sur le bouton de la première étape
    const submitButton1 = await page.$('button[type="submit"], input[type="submit"]')
    if (!submitButton1) {
      throw new Error('Bouton submit étape 1 non trouvé')
    }
    
    log('🔄 Clic sur le bouton de connexion étape 1...')
    await submitButton1.click()
    
    // Attendre la navigation vers l'étape 2
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
    } catch (e) {
      log('⚠️ Pas de navigation détectée, continuons...')
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Étape 2: Saisir le mot de passe
    log('🔐 Saisie du mot de passe...')
    await page.waitForSelector('input[type="password"]', { timeout: 10000 })
    
    const passwordInput = await page.$('input[type="password"]')
    if (!passwordInput) {
      throw new Error('Champ mot de passe non trouvé')
    }
    
    await passwordInput.type(config.cas.password)
    log('✅ Mot de passe saisi')
    
    // Cliquer sur le bouton de la deuxième étape
    const submitButton2 = await page.$('button[type="submit"], input[type="submit"]')
    if (!submitButton2) {
      throw new Error('Bouton submit étape 2 non trouvé')
    }
    
    log('🔄 Clic sur le bouton de connexion étape 2...')
    await submitButton2.click()
    
    // Attendre la redirection OAuth2 complète (votre logique éprouvée)
    log('⏳ Attente de la redirection OAuth2 complète...')
    
    let redirectSuccess = false
    for (let attempt = 0; attempt < 12; attempt++) { // 2 minutes max
      await new Promise(resolve => setTimeout(resolve, 10000)) // 10 secondes
      
      const currentUrl = page.url()
      log(`🔍 Tentative ${attempt + 1} - URL: ${currentUrl.substring(0, 100)}...`)
      
      // Vérifier si on est arrivé sur livret.uness.fr
      if (currentUrl.includes('livret.uness.fr') && !currentUrl.includes('cas/login') && !currentUrl.includes('auth.uness.fr/cas')) {
        log('🎉 Redirection OAuth2 réussie avec Puppeteer !')
        redirectSuccess = true
        break
      }
      
      // Si toujours en cours d'auth, continuer
      if (currentUrl.includes('auth.uness.fr') || currentUrl.includes('cas/login')) {
        log(`⏳ Toujours en cours d'authentification...`)
        continue
      }
      
      log(`⚠️ URL inattendue: ${currentUrl.substring(0, 100)}`)
    }
    
    if (!redirectSuccess) {
      throw new Error('Timeout OAuth2 - redirection échouée après 2 minutes')
    }
    
    log(`✅ Authentification CAS terminée avec succès via Puppeteer`)
  }

  // Extraction via API avec Puppeteer
  async function extractViaAPIWithPuppeteer(page: any, cookieString: string, stats: any): Promise<any[]> {
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
      
      log(`🔗 Requête API via Puppeteer: ${apiUrl.toString()}`)
      
      // Utiliser page.evaluate pour faire la requête avec les cookies de session
      const apiResponse = await page.evaluate(async (url: string, cookies: string) => {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Cookie': cookies,
              'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor-Puppeteer/1.0)',
              'Accept': 'application/json',
              'Referer': 'https://livret.uness.fr/lisa/2025/'
            },
            credentials: 'include'
          })
          
          const text = await response.text()
          return {
            ok: response.ok,
            status: response.status,
            text: text
          }
        } catch (error) {
          return {
            ok: false,
            error: error.message
          }
        }
      }, apiUrl.toString(), cookieString)
      
      if (!apiResponse.ok) {
        throw new Error(`API request failed: ${apiResponse.error || apiResponse.status}`)
      }
      
      const apiData = JSON.parse(apiResponse.text)
      
      if (apiData.error) {
        throw new Error(`API Error: ${apiData.error.code} - ${apiData.error.info}`)
      }
      
      const allMembers = apiData.query?.categorymembers || []
      log(`📋 ${allMembers.length} membres trouvés via Puppeteer`)
      
      // Filtrer les pages OIC (votre pattern exact)
      const oicPattern = /OIC-\d{3}-\d{2}-[AB]/
      const pageIds = allMembers
        .filter((p: any) => p.title?.match(oicPattern))
        .map((p: any) => p.pageid)
      
      log(`🎯 ${pageIds.length} pages OIC trouvées`)
      stats.totalFound += pageIds.length
      
      // Récupérer le contenu par batches de 50 (votre méthode)
      for (let i = 0; i < pageIds.length; i += 50) {
        const batch = pageIds.slice(i, i + 50)
        const contentUrl = new URL(config.urls.api)
        contentUrl.searchParams.set('action', 'query')
        contentUrl.searchParams.set('prop', 'revisions')
        contentUrl.searchParams.set('rvprop', 'content|timestamp')
        contentUrl.searchParams.set('pageids', batch.join('|'))
        contentUrl.searchParams.set('format', 'json')
        contentUrl.searchParams.set('formatversion', '2')
        
        const contentResponse = await page.evaluate(async (url: string, cookies: string) => {
          const response = await fetch(url, {
            headers: {
              'Cookie': cookies,
              'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor-Puppeteer/1.0)',
              'Accept': 'application/json'
            }
          })
          return response.text()
        }, contentUrl.toString(), cookieString)
        
        const contentData = JSON.parse(contentResponse)
        
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
        
        log(`✅ Batch ${Math.floor(i/50) + 1} traité via Puppeteer - ${allCompetences.length} compétences`)
        
        // Pause
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      continueToken = apiData.continue?.cmcontinue || ''
      
    } while (continueToken)
    
    return allCompetences
  }

  // Parse OIC (votre logique exacte)
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
})