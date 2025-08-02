// ✅ Edge Function utilisant la logique CAS de votre script extract-oic-competences.cjs
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { puppeteer } from "https://deno.land/x/puppeteer@16.2.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuration exactement comme votre script extract-oic-competences.cjs
const config = {
  cas: {
    username: 'laeticia.moto-ngane@etud.u-picardie.fr',
    password: 'Aiciteal1!'
  },
  urls: {
    base: 'https://livret.uness.fr/lisa/2025',
    category: 'https://livret.uness.fr/lisa/2025/Catégorie:Objectif_de_connaissance',
    api: 'https://livret.uness.fr/lisa/2025/api.php'
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 DÉMARRAGE EXTRACTION OIC - 4,872 COMPÉTENCES ATTENDUES')
    console.log('===============================================')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const stats = {
      startTime: Date.now(),
      totalFound: 0,
      totalProcessed: 0,
      totalInserted: 0,
      totalErrors: 0,
      errors: []
    }

    // Lancer Puppeteer avec les mêmes options que votre script
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    })

    try {
      const page = await browser.newPage()
      
      // 1. Authentification CAS exactement comme votre script
      console.log('🔐 Authentification CAS...')
      await authenticateCAS(page)
      
      // 2. Récupérer les cookies de session après authentification
      const cookies = await page.cookies()
      const cookieString = cookies
        .filter(c => c.domain.includes('uness.fr'))
        .map(c => `${c.name}=${c.value}`)
        .join('; ')
      console.log(`🍪 Cookies de session récupérés: ${cookies.length} cookies pour uness.fr`)
      
      // 3. Extraction via API MediaWiki avec cookies
      console.log('📊 Début extraction via API MediaWiki...')
      const allCompetences = await extractViaAPI(page, stats, cookieString)
      
      // 4. Insertion dans Supabase
      console.log(`💾 Insertion de ${allCompetences.length} compétences dans Supabase...`)
      await insertToSupabase(supabase, allCompetences, stats)
      
      // 5. Rapport final
      await generateFinalReport(supabase, stats)
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Extraction OIC avec méthode éprouvée terminée',
        statistics: {
          competences_found: stats.totalFound,
          competences_processed: stats.totalProcessed,
          competences_inserted: stats.totalInserted,
          errors: stats.totalErrors,
          duration_seconds: Math.round((Date.now() - stats.startTime) / 1000)
        },
        method: 'CAS + Puppeteer selon script extract-oic-competences.cjs',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })

    } finally {
      await browser.close()
    }

  } catch (error) {
    console.error('❌ ERREUR CRITIQUE:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

// Authentification CAS exactement comme dans votre script extract-oic-competences.cjs
async function authenticateCAS(page: any) {
  console.log('🌐 Navigation vers page protégée pour déclencher l\'authentification...')
  await page.goto(config.urls.category, { waitUntil: 'networkidle2', timeout: 30000 })
  
  const initialUrl = page.url()
  console.log(`🔍 URL initiale: ${initialUrl}`)
  
  // Si pas de redirection CAS, on est déjà authentifié
  if (!initialUrl.includes('cas/login') && !initialUrl.includes('auth.uness.fr')) {
    console.log('✅ Pas de redirection CAS - déjà authentifié')
    return
  }
  
  console.log('🔑 Authentification CAS requise - début du processus...')
  
  // Attendre que la page de login soit entièrement chargée
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Étape 1: Saisir l'email
  console.log('📧 Saisie de l\'email...')
  await page.waitForSelector('input[type="email"], input[name="email"], input[type="text"]', { timeout: 10000 })
  
  const emailInput = await page.$('input[type="email"]') || await page.$('input[name="email"]') || await page.$('input[type="text"]')
  if (!emailInput) {
    throw new Error('Champ email non trouvé')
  }
  
  await emailInput.type(config.cas.username)
  console.log(`✅ Email saisi: ${config.cas.username}`)
  
  // Cliquer sur le bouton de la première étape
  const submitButton1 = await page.$('button[type="submit"], input[type="submit"]')
  if (!submitButton1) {
    throw new Error('Bouton submit étape 1 non trouvé')
  }
  
  console.log('🔄 Clic sur le bouton de connexion étape 1...')
  await submitButton1.click()
  
  // Attendre la navigation vers l'étape 2
  try {
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
  } catch (e) {
    console.log('⚠️ Pas de navigation détectée, continuons...')
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Étape 2: Saisir le mot de passe
  console.log('🔐 Saisie du mot de passe...')
  await page.waitForSelector('input[type="password"]', { timeout: 10000 })
  
  const passwordInput = await page.$('input[type="password"]')
  if (!passwordInput) {
    throw new Error('Champ mot de passe non trouvé')
  }
  
  await passwordInput.type(config.cas.password)
  console.log('✅ Mot de passe saisi')
  
  // Cliquer sur le bouton de la deuxième étape
  const submitButton2 = await page.$('button[type="submit"], input[type="submit"]')
  if (!submitButton2) {
    throw new Error('Bouton submit étape 2 non trouvé')
  }
  
  console.log('🔄 Clic sur le bouton de connexion étape 2...')
  await submitButton2.click()
  
  // Attendre la redirection OAuth2 complète vers livret.uness.fr
  console.log('⏳ Attente de la redirection OAuth2 complète...')
  
  let redirectSuccess = false
  for (let attempt = 0; attempt < 12; attempt++) { // 12 tentatives = 2 minutes max
    await new Promise(resolve => setTimeout(resolve, 10000)) // Attendre 10 secondes
    
    const currentUrl = page.url()
    console.log(`🔍 Tentative ${attempt + 1} - URL actuelle: ${currentUrl.substring(0, 100)}...`)
    
    // Vérifier si on est arrivé sur livret.uness.fr
    if (currentUrl.includes('livret.uness.fr') && !currentUrl.includes('cas/login') && !currentUrl.includes('auth.uness.fr/cas')) {
      console.log('🎉 Redirection OAuth2 réussie !')
      redirectSuccess = true
      break
    }
    
    // Si on est toujours sur une page d'auth, continuer d'attendre
    if (currentUrl.includes('auth.uness.fr') || currentUrl.includes('cas/login')) {
      console.log(`⏳ Toujours en cours d'authentification, patience...`)
      continue
    }
    
    // Si on est sur une page inattendue, essayer de naviguer
    console.log(`⚠️ URL inattendue: ${currentUrl.substring(0, 100)}`)
  }
  
  if (!redirectSuccess) {
    console.log('❌ La redirection OAuth2 a échoué après 2 minutes d\'attente')
    throw new Error('Timeout OAuth2 - redirection vers livret.uness.fr échouée')
  }
  
  console.log(`✅ Authentification CAS terminée avec succès`)
}

// Extraction via API MediaWiki (copie exacte de votre script)
async function extractViaAPI(page: any, stats: any, cookieString: string) {
  const allCompetences = []
  let continueToken = ''
  let pageCount = 0
  
  console.log('📡 === EXTRACTION VIA API MEDIAWIKI ===')
  
  do {
    const apiUrl = new URL(config.urls.api)
    const categoryTitle = 'Catégorie:Objectif_de_connaissance'
    
    apiUrl.searchParams.set('action', 'query')
    apiUrl.searchParams.set('list', 'categorymembers')
    apiUrl.searchParams.set('cmtitle', categoryTitle)
    apiUrl.searchParams.set('cmlimit', '500')
    apiUrl.searchParams.set('format', 'json')
    if (continueToken) {
      apiUrl.searchParams.set('cmcontinue', continueToken)
    }
    
    let finalUrl = apiUrl.toString()
    if (finalUrl.includes('Catégorie%3AObjectif_de_connaissance')) {
      finalUrl = finalUrl.replace('Catégorie%3AObjectif_de_connaissance', 'Catégorie:Objectif_de_connaissance')
    }
    
    console.log(`🔗 URL API: ${finalUrl}`)
    
    // Tenter avec page.evaluate et cookies explicites
    const apiResponse = await page.evaluate(async (url: string, cookies: string) => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor/1.0)',
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
    }, finalUrl, cookieString)
    
    if (!apiResponse.ok) {
      throw new Error(`API request failed: ${apiResponse.error || apiResponse.status}`)
    }
    
    let apiData
    try {
      apiData = JSON.parse(apiResponse.text)
    } catch (parseError) {
      console.log(`❌ Erreur parsing JSON API: ${parseError.message}`)
      console.log(`📄 Réponse brute: ${apiResponse.text.substring(0, 500)}...`)
      throw new Error('Réponse API non-JSON')
    }
    
    if (apiData.error) {
      console.log(`❌ ERREUR API: ${JSON.stringify(apiData.error)}`)
      if (apiData.error.code === 'readapidenied') {
        throw new Error('API MediaWiki protégée - access denied')
      }
      throw new Error(`API Error: ${apiData.error.code} - ${apiData.error.info}`)
    }
    
    if (!apiData.query?.categorymembers) {
      throw new Error('Pas de categorymembers dans la réponse API')
    }
    
    const allMembers = apiData.query.categorymembers || []
    console.log(`📋 ${allMembers.length} membres trouvés dans la catégorie (API)`)
    
    // Filtrer les pages OIC avec pattern réel
    const oicPattern = /OIC-\d{3}-\d{2}-[AB]/
    const pageIds = allMembers
      .filter(p => p.title?.match(oicPattern))
      .map(p => p.pageid)
    
    stats.totalFound += pageIds.length
    console.log(`📄 Lot ${++pageCount}: ${pageIds.length}/${allMembers.length} compétences valides (Total: ${stats.totalFound})`)
    
    // Traiter par batches
    for (let i = 0; i < pageIds.length; i += 50) {
      const batch = pageIds.slice(i, i + 50)
      try {
        const competences = await getPageContents(page, batch)
        allCompetences.push(...competences)
        stats.totalProcessed += batch.length
        console.log(`   ✅ Batch ${Math.floor(i/50) + 1}: ${competences.length}/${batch.length} extraites`)
      } catch (error) {
        console.log(`   ❌ Erreur batch ${Math.floor(i/50) + 1}: ${error.message}`)
        stats.totalErrors += batch.length
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    continueToken = apiData.continue?.cmcontinue || ''
    
  } while (continueToken)
  
  console.log(`✅ API MediaWiki: ${allCompetences.length} compétences extraites`)
  return allCompetences
}

// Récupérer le contenu des pages (copie exacte)
async function getPageContents(page: any, pageIds: number[]) {
  console.log(`📥 === DÉBUT RÉCUPÉRATION CONTENU ${pageIds.length} PAGES ===`)
  
  const contentUrl = new URL(config.urls.api)
  contentUrl.searchParams.set('action', 'query')
  contentUrl.searchParams.set('pageids', pageIds.join('|'))
  contentUrl.searchParams.set('prop', 'revisions|info')
  contentUrl.searchParams.set('rvprop', 'content|ids|timestamp')
  contentUrl.searchParams.set('rvslots', 'main')
  contentUrl.searchParams.set('format', 'json')
  contentUrl.searchParams.set('formatversion', '2')
  
  console.log(`🔗 URL contenu: ${contentUrl.toString()}`)
  
  try {
    // Utiliser page.goto() pour préserver les cookies CAS
    const response = await page.goto(contentUrl.toString(), { waitUntil: 'networkidle2' })
    const responseText = await page.content()
    
    // Extraire le JSON de la réponse
    const jsonMatch = responseText.match(/<pre[^>]*>({.*})<\/pre>/s)
    if (!jsonMatch) {
      console.log(`❌ Format de réponse contenu inattendu: ${responseText.substring(0, 500)}`)
      throw new Error('Format de réponse contenu non JSON')
    }
    
    const contentData = JSON.parse(jsonMatch[1])
    console.log(`📄 Response status: ${response.status()}`)
    
    if (contentData.error) {
      console.log(`❌ ERREUR API CONTENU: ${JSON.stringify(contentData.error)}`)
      throw new Error(`Content API Error: ${contentData.error.code} - ${contentData.error.info}`)
    }
    
    if (!contentData.query?.pages) {
      throw new Error('Pas de pages dans la réponse contenu')
    }
    
    const pages = Object.values(contentData.query.pages)
    console.log(`📚 ${pages.length} pages reçues pour traitement`)
    
    const competences = []
    
    for (let i = 0; i < pages.length; i++) {
      const pageData = pages[i] as any
      console.log(`📖 Traitement page ${i+1}/${pages.length}: "${pageData.title}" (ID: ${pageData.pageid})`)
      
      const competence = parseCompetence(pageData)
      if (competence) {
        console.log(`✅ Compétence parsée: ${competence.objectif_id} - ${competence.intitule.substring(0, 50)}...`)
        competences.push(competence)
      } else {
        console.log(`❌ Échec parsing pour page "${pageData.title}"`)
      }
    }
    
    console.log(`📥 === FIN RÉCUPÉRATION CONTENU ===`)
    console.log(`✅ ${competences.length}/${pages.length} compétences extraites avec succès`)
    
    return competences
    
  } catch (error) {
    console.log(`❌ ERREUR CRITIQUE récupération contenu: ${error.message}`)
    throw error
  }
}

// Parser une compétence (copie exacte)
function parseCompetence(pageData: any) {
  try {
    const title = pageData.title || ''
    // Chercher le pattern OIC réel: OIC-XXX-XX-A
    const match = title.match(/OIC-(\d{3})-(\d{2})-([AB])/)
    
    if (!match) {
      console.log(`❌ Pattern OIC non trouvé dans: "${title}"`)
      return null
    }
    
    const [fullId, item, rubriqueCode, rang] = match
    const ordre = 1 // Valeur par défaut
    
    let content = ''
    if (pageData.revisions?.[0]?.slots?.main?.content) {
      content = pageData.revisions[0].slots.main.content
    } else if (pageData.revisions?.[0]?.content) {
      content = pageData.revisions[0].content
    }
    
    const rubriques = {
      '01': 'Génétique', '02': 'Immunopathologie', '03': 'Inflammation',
      '04': 'Cancérologie', '05': 'Pharmacologie', '06': 'Douleur',
      '07': 'Santé publique', '08': 'Thérapeutique', '09': 'Urgences',
      '10': 'Vieillissement', '11': 'Interprétation'
    }
    
    let intitule = title
    let description = ''
    
    const intituleMatch = content.match(/'''(.+?)'''|==\s*(.+?)\s*==/)
    if (intituleMatch) {
      intitule = (intituleMatch[1] || intituleMatch[2]).trim()
    }
    
    description = content
      .replace(/\[\[(.+?)\|(.+?)\]\]/g, '$2')
      .replace(/\[\[(.+?)\]\]/g, '$1')
      .replace(/'''(.+?)'''/g, '$1')
      .replace(/''(.+?)''/g, '$1')
      .replace(/{{.+?}}/gs, '')
      .replace(/<ref.*?\/>/g, '')
      .replace(/<.*?>/g, '')
      .trim()
    
    const firstPara = description.match(/\n\n(.+?)(?=\n\n|$)/s)
    if (firstPara) {
      description = firstPara[1].trim()
    }
    
    return {
      objectif_id: fullId,
      intitule: intitule.substring(0, 500),
      item_parent: item,
      rang: rang,
      rubrique: rubriques[rubriqueCode] || `Rubrique ${rubriqueCode}`,
      description: description.substring(0, 1000),
      ordre: parseInt(ordre),
      url_source: `${config.urls.base}/${encodeURIComponent(title)}`,
      extraction_status: 'complete',
      date_import: new Date().toISOString()
    }
    
  } catch (error) {
    console.log(`❌ Erreur parsing ${pageData.title}: ${error.message}`)
    return null
  }
}

// Insertion dans Supabase (copie exacte)
async function insertToSupabase(supabase: any, competences: any[], stats: any) {
  const validData = competences.filter(c => c && c.objectif_id)
  console.log(`✅ ${validData.length} compétences valides à insérer`)
  
  const chunks = []
  for (let i = 0; i < validData.length; i += 100) {
    chunks.push(validData.slice(i, i + 100))
  }
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    console.log(`💾 Insertion chunk ${i+1}/${chunks.length} (${chunk.length} items)...`)
    
    try {
      const { data, error } = await supabase
        .from('backup_oic_competences')
        .upsert(chunk, { 
          onConflict: 'objectif_id',
          ignoreDuplicates: false 
        })
        .select()
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }
      
      stats.totalInserted += data?.length || 0
      console.log(`✅ Chunk ${i+1} inséré avec succès (${data?.length || 0} records)`)
      
    } catch (error) {
      console.log(`❌ Erreur chunk ${i+1}: ${error.message}`)
      stats.errors.push({ 
        type: 'INSERT_ERROR', 
        chunk: i+1, 
        error: error.message, 
        timestamp: new Date().toISOString() 
      })
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
  }
}

// Rapport final (copie exacte)
async function generateFinalReport(supabase: any, stats: any) {
  console.log('\n📊 GÉNÉRATION RAPPORT FINAL...')
  console.log('===============================')
  
  try {
    const { count, error } = await supabase
      .from('backup_oic_competences')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      throw new Error(`Erreur comptage: ${error.message}`)
    }
    
    const duration = Math.round((Date.now() - stats.startTime) / 1000)
    const completeness = ((count / 4872) * 100).toFixed(2)
    
    console.log(`\n🎉 EXTRACTION TERMINÉE !`)
    console.log(`======================`)
    console.log(`⏱️  Durée totale: ${duration}s (${Math.round(duration/60)}min)`)
    console.log(`📊 Pages trouvées: ${stats.totalFound}`)
    console.log(`✅ Pages traitées: ${stats.totalProcessed}`)
    console.log(`💾 Compétences insérées: ${stats.totalInserted}`)
    console.log(`❌ Erreurs: ${stats.totalErrors}`)
    console.log(`📈 Total en base: ${count}/4872 (${completeness}%)`)
    
    if (count >= 4872) {
      console.log(`🎯 OBJECTIF ATTEINT ! Les 4,872 compétences ont été extraites avec succès !`)
    } else if (count > 4000) {
      console.log(`🔥 EXTRACTION QUASI-COMPLÈTE ! ${count} compétences extraites (${4872-count} manquantes)`)
    } else {
      console.log(`⚠️  EXTRACTION PARTIELLE : ${count} compétences extraites`)
    }
    
  } catch (error) {
    console.log(`❌ Erreur génération rapport: ${error.message}`)
  }
}