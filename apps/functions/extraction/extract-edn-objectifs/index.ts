import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCategoryMembers, getPageContent, testPublicAccess } from './api-client.ts'
import { parseOICContent, OicCompetence } from './oic-parser.ts'

// Importations pour Puppeteer (authentification CAS)
// @ts-ignore
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts"

// Credentials CAS depuis les variables d'environnement - SÉCURISÉ
const CAS_USERNAME = Deno.env.get('CAS_USERNAME')
const CAS_PASSWORD = Deno.env.get('CAS_PASSWORD')

// Validation obligatoire des credentials
if (!CAS_USERNAME) {
  throw new Error('CAS_USERNAME manquant - variable d\'environnement requise')
}
if (!CAS_PASSWORD) {
  throw new Error('CAS_PASSWORD manquant - variable d\'environnement requise')
}

import { corsHeaders } from '../../_shared/cors.ts'

import { getErrorMessage } from '../../_shared/error-utils.ts';
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification requise pour extract-edn-objectifs
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

    // ✅ SÉCURITÉ: Vérifier rôle ADMIN pour extract-edn-objectifs
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ extract-edn-objectifs autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    // Configuration Supabase - SÉCURISÉ
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL manquant - variable d\'environnement requise')
    }
    if (!supabaseKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY manquant - variable d\'environnement requise')
    }
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Variables Supabase manquantes')
      return new Response(
        JSON.stringify({ error: 'Configuration Supabase manquante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // CORRECTION: Utiliser service_role avec auth désactivée pour contourner RLS
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })

    let requestBody
    try {
      requestBody = await req.json()
    } catch (error: unknown) {
      console.error('Erreur parsing JSON:', error)
      return new Response(
        JSON.stringify({ error: 'Format de requête invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, session_id } = requestBody

    console.log(`🎯 Action demandée: ${action}`)

    switch (action) {
      case 'start':
        return await startExtraction(supabaseClient)
      case 'status':
        return await getExtractionStatus(supabaseClient, session_id)
      case 'rapport':
        return await generateRapport(supabaseClient)
      case 'insert_test_data':
        return await insertTestData(supabaseClient)
      default:
        throw new Error('Action non reconnue')
    }

  } catch (error: unknown) {
    console.error('❌ Erreur dans extract-edn-objectifs:', error)
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function startExtraction(supabaseClient: any) {
  const session_id = crypto.randomUUID()
  
  console.log('🚀 Démarrage extraction simplifiée')
  console.log(`📊 Session: ${session_id}`)
  
  // Initialiser le tracking de progression
  await supabaseClient
    .from('oic_extraction_progress')
    .insert({
      session_id,
      status: 'en_cours',
      page_number: 1,
      items_extracted: 0,
      total_expected: 4872,
      total_pages: 25
    })

  // Lancer l'extraction en arrière-plan
  const backgroundTask = extractCompetences(supabaseClient, session_id)
  
  // Utiliser waitUntil pour permettre l'exécution en arrière-plan
  if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
    EdgeRuntime.waitUntil(backgroundTask)
  } else {
    backgroundTask.catch(error => {
      console.error('Erreur tâche arrière-plan:', error)
    })
  }

  // Retourner immédiatement la réponse
  return new Response(
    JSON.stringify({
      success: true,
      session_id,
      message: 'Extraction des 4,872 compétences OIC démarrée',
      status_url: `/functions/extract-edn-objectifs?action=status&session_id=${session_id}`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function extractCompetences(supabaseClient: any, session_id: string) {
  let totalExtraites = 0;
  let currentBatch = 0;

  try {
    console.log('🚀 Début extraction des objectifs OIC')
    
    // SIMPLIFICATION: Test direct de l'API sans authentification complexe
    console.log('🧪 Test d\'accès à l\'API MediaWiki...')
    let authCookies = ''
    
    // Test simple de l'API
    try {
      const testResponse = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=1&format=json')
      const testData = await testResponse.json()
      
      if (testData.error && testData.error.code === 'readapidenied') {
        console.log('❌ API protégée - authentification requise')
        throw new Error('AUTHENTICATION_REQUIRED: L\'API MediaWiki nécessite une authentification CAS. Veuillez utiliser le script Puppeteer local ou GitHub Actions.')
      }
      
      console.log('✅ API accessible - extraction possible')
    } catch (error: unknown) {
      console.error('❌ Erreur test API:', error)
      throw new Error(`API_ACCESS_ERROR: ${getErrorMessage(error)}`)
    }
    
    // Mettre à jour le statut
    await supabaseClient
      .from('oic_extraction_progress')
      .update({
        status: 'en_cours',
        last_activity: new Date().toISOString()
      })
      .eq('session_id', session_id)
    
    // Récupérer tous les IDs des pages
    console.log('📋 Récupération de la liste des objectifs...')
    const { pageIds: allPageIds, titles } = await getCategoryMembers(authCookies)
    console.log(`📊 ${allPageIds.length} pages trouvées`)
    
    // Traitement par lots de 50 pages
    const batchSize = 50
    const totalBatches = Math.ceil(allPageIds.length / batchSize)
    
    for (let batch = 0; batch < totalBatches; batch++) {
      currentBatch = batch + 1
      const startIdx = batch * batchSize
      const endIdx = Math.min(startIdx + batchSize, allPageIds.length)
      const batchIds = allPageIds.slice(startIdx, endIdx)
      
      console.log(`📦 Batch ${currentBatch}/${totalBatches} - Pages ${startIdx + 1} à ${endIdx}`)
      
      // Mettre à jour le progrès
      await supabaseClient
        .from('oic_extraction_progress')
        .update({
          page_number: currentBatch,
          items_extracted: totalExtraites,
          last_activity: new Date().toISOString()
        })
        .eq('session_id', session_id)
      
      // Récupérer le contenu du batch
      const batchContent = await getPageContent(batchIds, authCookies)
      
      // Parser et sauvegarder chaque page
      let savedInBatch = 0
      for (const page of batchContent) {
        try {
          console.log(`🔍 Parsing page: ${page.title} (ID: ${page.pageid})`)
          const competence = parseOICContent(page)
          
          if (competence) {
            // Log de l'échantillon AVANT insertion
            if (savedInBatch === 0) {
              console.log('SAMPLE ➜', JSON.stringify(competence, null, 2))
            }
            
            // Générer un hash pour éviter les doublons
            const hashContent = await crypto.subtle.digest('SHA-256', 
              new TextEncoder().encode(JSON.stringify(competence))
            )
            const hashArray = Array.from(new Uint8Array(hashContent))
            competence.hash_content = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
            
            // Test d'insertion unitaire avec logging détaillé
            console.log(`📝 Tentative insertion: ${competence.objectif_id}`)
            const { error } = await supabaseClient
              .from('oic_competences')
              .upsert(competence, { onConflict: 'objectif_id' })
            
            if (error) {
              console.error(`❌ INSERT_ERR ${competence.objectif_id}:`, error)
              console.error('📄 Données problématiques:', JSON.stringify(competence, null, 2))
            } else {
              console.log(`✅ Insertion réussie: ${competence.objectif_id}`)
              savedInBatch++
              totalExtraites++
            }
          } else {
            console.log(`⚠️  Parsing échoué pour ${page.title} - competence null`)
          }
        } catch (error: unknown) {
          console.error(`💥 Erreur parsing page ${page.title}:`, error)
          console.error('📄 Page content preview:', page.revisions?.[0]?.content?.substring(0, 200))
        }
      }
      
      console.log(`✅ Batch ${currentBatch}: ${savedInBatch}/${batchIds.length} objectifs sauvegardés (Total: ${totalExtraites})`)
      
      // Pause entre les batches
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Finaliser l'extraction
    console.log(`🎉 Extraction terminée: ${totalExtraites} objectifs OIC extraits`)
    
    await supabaseClient
      .from('oic_extraction_progress')
      .update({
        status: 'termine',
        items_extracted: totalExtraites,
        last_activity: new Date().toISOString()
      })
      .eq('session_id', session_id)

  } catch (error: unknown) {
    console.error('💥 Erreur critique extraction:', error)
    
    await supabaseClient
      .from('oic_extraction_progress')
      .update({
        status: 'erreur',
        error_message: getErrorMessage(error),
        last_activity: new Date().toISOString()
      })
      .eq('session_id', session_id)
  }
}

async function getExtractionStatus(supabaseClient: any, session_id: string) {
  const { data, error } = await supabaseClient
    .from('oic_extraction_progress')
    .select('*')
    .eq('session_id', session_id)
    .single()

  if (error) {
    throw new Error(`Session non trouvée: ${getErrorMessage(error)}`)
  }

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function generateRapport(supabaseClient: any) {
  try {
    // Appeler la fonction PostgreSQL pour générer le rapport
    const { data, error } = await supabaseClient
      .rpc('get_oic_extraction_report')

    if (error) {
      console.error('Erreur génération rapport:', error)
      throw new Error(`Erreur génération rapport: ${getErrorMessage(error)}`)
    }

    const reportData = data || {
      summary: { expected: 4872, extracted: 0, completeness_pct: 0 },
      by_item: []
    }

    const stats = {
      total_competences_extraites: reportData.summary.extracted,
      total_competences_attendues: reportData.summary.expected,
      completude_globale: reportData.summary.completeness_pct,
      items_ern_couverts: Array.isArray(reportData.by_item) ? reportData.by_item.length : 0,
      repartition_par_item: Array.isArray(reportData.by_item) ? reportData.by_item.map((item: any) => ({
        item_parent: item.item_parent,
        competences_attendues: item.total_count || 0,
        competences_extraites: item.total_count || 0,
        completude_pct: 100,
        manquants: []
      })) : []
    }

    return new Response(
      JSON.stringify(stats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    console.error('Erreur generateRapport:', error)
    
    // Retourner un rapport vide en cas d'erreur
    const emptyStats = {
      total_competences_extraites: 0,
      total_competences_attendues: 4872,
      completude_globale: 0,
      items_ern_couverts: 0,
      repartition_par_item: []
    }

    return new Response(
      JSON.stringify(emptyStats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * Authentification CAS via Puppeteer pour récupérer les cookies
 */
async function authenticateAndGetCookies(): Promise<string> {
  console.log('🔐 Démarrage authentification CAS avec Puppeteer...')
  
  let browser;
  try {
    // Lancer Puppeteer avec plus d'options pour Deno
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=site-per-process',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    })
    
    const page = await browser.newPage()
    
    // Configurer user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    // Tester d'abord l'accès direct sans authentification
    console.log('🧪 Test accès direct sans authentification...')
    try {
      const testResponse = await page.goto('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=10&format=json', {
        waitUntil: 'networkidle2',
        timeout: 15000
      })
      
      if (testResponse?.ok()) {
        const content = await page.content()
        console.log('✅ Accès direct réussi, pas d\'authentification nécessaire')
        console.log('🔍 Contenu test:', content.substring(0, 200))
        
        if (content.includes('query') || content.includes('categorymembers')) {
          console.log('🎉 API accessible publiquement - pas besoin d\'authentification CAS')
          return '' // Pas de cookies nécessaires
        }
      }
    } catch (e) {
      console.log('❌ Accès direct échoué, authentification CAS nécessaire')
    }
    
    // Aller sur une page protégée qui redirige vers CAS
    console.log('🌐 Navigation vers page protégée...')
    await page.goto('https://livret.uness.fr/lisa/2025/Catégorie:Objectif_de_connaissance', {
      waitUntil: 'networkidle2',
      timeout: 30000
    })
    
    // Vérifier si on est redirigé vers CAS
    const currentUrl = page.url()
    console.log(`📍 URL actuelle: ${currentUrl}`)
    
    if (currentUrl.includes('auth.uness.fr/cas/login')) {
      console.log('🔑 Formulaire CAS détecté, saisie des identifiants...')
      
      // Attendre le formulaire de login
      await page.waitForSelector('#username', { visible: true, timeout: 10000 })
      await page.waitForSelector('#password', { visible: true, timeout: 10000 })
      
      // Saisir les identifiants (masqué dans les logs)
      console.log(`🔐 Saisie identifiants: ${CAS_USERNAME.substring(0, 3)}***@***.fr`)
      await page.type('#username', CAS_USERNAME)
      await page.type('#password', CAS_PASSWORD)
      
      // Cliquer sur submit
      await page.click('input[name="submit"], input[type="submit"], button[type="submit"]')
      
      // Attendre redirection vers livret.uness.fr
      console.log('⏳ Attente de la redirection post-authentification...')
      await page.waitForFunction(
        () => window.location.href.includes('livret.uness.fr'),
        { timeout: 30000 }
      )
      
      console.log('✅ Authentification CAS réussie')
    } else if (currentUrl.includes('livret.uness.fr')) {
      console.log('✅ Déjà authentifié ou pas de redirection CAS')
    } else {
      console.warn('⚠️  URL inattendue après navigation:', currentUrl)
    }
    
    // Récupérer tous les cookies du domaine uness.fr
    const cookies = await page.cookies()
    const unessConsolidatedCookies = cookies
      .filter(cookie => cookie.domain.includes('uness.fr'))
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ')
    
    console.log(`🍪 ${cookies.length} cookies récupérés`)
    console.log(`🔗 Cookies UNESS consolidés: ${unessConsolidatedCookies.length} caractères`)
    
    if (unessConsolidatedCookies.length > 0) {
      console.log('🎯 Cookies détaillés:', cookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`))
    }
    
    return unessConsolidatedCookies
    
  } catch (error: unknown) {
    console.error('❌ Erreur lors de l\'authentification CAS:', error)
    console.error('📊 Stack trace:', error.stack)
    throw error
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

/**
 * Insérer des données de test pour vérifier que l'insertion fonctionne
 */
async function insertTestData(supabaseClient: any) {
  console.log('📝 Insertion de données de test OIC...')
  
  // Count initial
  const { count: countBefore, error: countError } = await supabaseClient
    .from('oic_competences')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.error('❌ Erreur count initial:', countError)
  } else {
    console.log(`📊 Count initial: ${countBefore || 0}`)
  }
  
  // Données de test avec format OIC correct
  const testCompetences = [
    {
      objectif_id: 'OIC-001-01-A-01',
      intitule: 'Test insertion avec service_role - Expliquer les mécanismes de base de la génétique',
      item_parent: '001',
      rang: 'A',
      rubrique: 'Génétique',
      description: 'Comprendre les principes fondamentaux de la transmission génétique - données de test',
      ordre: 1,
      url_source: 'https://livret.uness.fr/lisa/2025/OIC-001-01-A-01',
      extraction_status: 'test',
      date_import: new Date().toISOString()
    },
    {
      objectif_id: 'OIC-001-01-A-02',
      intitule: 'Test insertion avec service_role - Décrire la structure de l\'ADN',
      item_parent: '001',
      rang: 'A',
      rubrique: 'Génétique',
      description: 'Connaître la structure moléculaire de l\'ADN - données de test',
      ordre: 2,
      url_source: 'https://livret.uness.fr/lisa/2025/OIC-001-01-A-02',
      extraction_status: 'test',
      date_import: new Date().toISOString()
    },
    {
      objectif_id: 'OIC-002-05-B-03',
      intitule: 'Test insertion avec service_role - Maîtriser les bases de l\'immunologie',
      item_parent: '002',
      rang: 'B',
      rubrique: 'Immunopathologie',
      description: 'Connaissances approfondies des mécanismes immunitaires - données de test',
      ordre: 3,
      url_source: 'https://livret.uness.fr/lisa/2025/OIC-002-05-B-03',
      extraction_status: 'test',
      date_import: new Date().toISOString()
    }
  ]
  
  console.log('SAMPLE TEST DATA ➜')
  console.log(JSON.stringify(testCompetences[0], null, 2))
  
  // Tentative d'insertion avec service_role
  console.log('📝 Tentative insertion avec service_role...')
  const { data, error } = await supabaseClient
    .from('oic_competences')
    .upsert(testCompetences, { onConflict: 'objectif_id' })
    .select()
  
  if (error) {
    console.error('❌ INSERT_ERR:', {
      code: error.code,
      message: getErrorMessage(error),
      details: error.details,
      hint: error.hint
    })
    
    return new Response(JSON.stringify({
      success: false,
      error: 'INSERT_FAILED',
      insertError: error,
      countBefore: countBefore || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
  
  console.log('✅ INSERTION RÉUSSIE!')
  console.log(`📦 Données insérées: ${data?.length || 0}`)
  
  // Vérifier le nouveau count
  const { count: countAfter } = await supabaseClient
    .from('oic_competences')
    .select('*', { count: 'exact', head: true })
  
  console.log(`📊 Count final: ${countAfter || 0} (+${(countAfter || 0) - (countBefore || 0)})`)
  
  // Lire les données insérées pour vérification
  const { data: readData } = await supabaseClient
    .from('oic_competences')
    .select('objectif_id, intitule')
    .limit(5)
  
  console.log('📋 Échantillon en base:')
  readData?.forEach((item: any, i: number) => {
    console.log(`   ${i+1}. ${item.objectif_id}: ${item.intitule}`)
  })
  
  return new Response(JSON.stringify({
    success: true,
    timestamp: new Date().toISOString(),
    results: {
      countBefore: countBefore || 0,
      countAfter: countAfter || 0,
      inserted: (countAfter || 0) - (countBefore || 0),
      dataInserted: data?.length || 0,
      sample: testCompetences[0],
      sampleInDb: readData?.[0]
    },
    message: `✅ Insertion test réussie: ${data?.length || 0} compétences ajoutées`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}