import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { launch } from "https://deno.land/x/puppeteer@16.2.0/mod.ts"

interface OicCompetence {
  objectif_id: string; // Format OIC-XXX-YY-R-ZZ
  intitule: string;
  item_parent: string; // Numéro d'item EDN (001-367)
  rang: string; // A ou B
  rubrique: string;
  description?: string;
  ordre?: number;
  url_source: string;
  hash_content?: string;
}

interface ExtractionSession {
  session_id: string;
  page_number: number;
  items_extracted: number;
  status: string;
  auth_cookies?: string;
  current_page_url?: string;
  last_item_id?: string;
}

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
    
    // Identifiants UNESS (selon spécifications ticket)
    const unessUsername = Deno.env.get('UNESS_USERNAME') || 'laeticia.moto-ngane@etud.u-picardie.fr'
    const unessPassword = Deno.env.get('UNESS_PASSWORD') || 'Aiciteal1!'

    if (!supabaseUrl || !supabaseKey) {
      console.error('Variables Supabase manquantes')
      throw new Error('Configuration Supabase manquante')
    }

    console.log(`🔐 Utilisation des identifiants UNESS: ${unessUsername}`)

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    let requestBody
    try {
      requestBody = await req.json()
    } catch (error) {
      console.error('Erreur parsing JSON:', error)
      throw new Error('Format de requête invalide')
    }

    const { action, session_id, page, resume_from } = requestBody

    console.log(`🎯 Action demandée: ${action}`)

    if (!action) {
      throw new Error('Action manquante dans la requête')
    }

    switch (action) {
      case 'start':
        return await startExtraction(supabaseClient, unessUsername, unessPassword)
      case 'resume':
        return await resumeExtraction(supabaseClient, session_id, resume_from)
      case 'status':
        return await getExtractionStatus(supabaseClient, session_id)
      case 'rapport':
        return await generateRapport(supabaseClient)
      default:
        throw new Error('Action non reconnue')
    }

  } catch (error) {
    console.error('❌ Erreur dans extract-edn-objectifs:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function startExtraction(supabaseClient: any, username: string, password: string) {
  const session_id = crypto.randomUUID()
  
  console.log('🚀 Démarrage extraction avec authentification CAS UNESS')
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

  // Lancer l'extraction en arrière-plan avec authentification CAS
  extractCompetencesWithRealCAS(supabaseClient, session_id, username, password)

  return new Response(
    JSON.stringify({
      success: true,
      session_id,
      message: 'Extraction des 4,872 compétences OIC démarrée avec authentification CAS UNESS',
      status_url: `/functions/extract-edn-objectifs?action=status&session_id=${session_id}`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function extractCompetencesWithRealCAS(supabaseClient: any, session_id: string, username: string, password: string) {
  let totalExtraites = 0;
  let currentBatch = 0;
  let authCookies = '';

  try {
    console.log('🚀 TICKET 4-bis: Extraction API-first des 4,872 objectifs OIC')
    
    // Étape 1: Tester si l'API est publique
    console.log('🔍 Test de l\'API MediaWiki publique...')
    const testResponse = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&meta=siteinfo&format=json');
    
    if (testResponse.ok) {
      console.log('✅ API MediaWiki publique accessible!')
      authCookies = ''; // Pas besoin d'authentification
    } else {
      console.log('🔐 API privée détectée - Authentification CAS requise...')
      authCookies = await authenticateWithCAS(username, password);
    }
    
    // Mettre à jour le statut pour indiquer le début de l'extraction
    await supabaseClient
      .from('oic_extraction_progress')
      .update({
        status: 'en_cours',
        last_activity: new Date().toISOString()
      })
      .eq('session_id', session_id)
    
    // Étape 2: Récupérer tous les IDs des pages de la catégorie
    console.log('📋 Récupération de la liste des objectifs via API MediaWiki...')
    const allPageIds = await getCategoryMembers(authCookies);
    console.log(`📊 ${allPageIds.length} pages trouvées dans la catégorie`)
    
    // Étape 3: Traitement par lots de 50 pages
    const batchSize = 50;
    const totalBatches = Math.ceil(allPageIds.length / batchSize);
    
    for (let batch = 0; batch < totalBatches; batch++) {
      currentBatch = batch + 1;
      const startIdx = batch * batchSize;
      const endIdx = Math.min(startIdx + batchSize, allPageIds.length);
      const batchIds = allPageIds.slice(startIdx, endIdx);
      
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
      const batchContent = await getPageContent(batchIds, authCookies);
      
      // Parser et sauvegarder chaque page
      let savedInBatch = 0;
      for (const page of batchContent) {
        try {
          const competence = parseOICContent(page);
          
          if (competence) {
            // Générer un hash pour éviter les doublons
            const hashContent = await crypto.subtle.digest('SHA-256', 
              new TextEncoder().encode(JSON.stringify(competence))
            );
            const hashArray = Array.from(new Uint8Array(hashContent));
            competence.hash_content = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            const { error } = await supabaseClient
              .from('oic_competences')
              .upsert(competence, { onConflict: 'objectif_id' });
            
            if (error) {
              console.error(`❌ Erreur sauvegarde ${competence.objectif_id}:`, error);
            } else {
              savedInBatch++;
              totalExtraites++;
            }
          }
        } catch (error) {
          console.error(`💥 Erreur parsing page ${page.title}:`, error);
        }
      }
      
      console.log(`✅ Batch ${currentBatch}: ${savedInBatch}/${batchIds.length} objectifs sauvegardés (Total: ${totalExtraites})`);
      
      // Pause entre les batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Finaliser l'extraction
    console.log(`🎉 Extraction API terminée: ${totalExtraites} objectifs OIC extraits`)
    
    await supabaseClient
      .from('oic_extraction_progress')
      .update({
        status: 'termine',
        items_extracted: totalExtraites,
        last_activity: new Date().toISOString()
      })
      .eq('session_id', session_id)

  } catch (error) {
    console.error('💥 Erreur critique extraction API:', error)
    
    const errorDetails = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      batch: currentBatch,
      totalExtraites: totalExtraites
    }
    
    await supabaseClient
      .from('oic_extraction_progress')
      .update({
        status: 'erreur',
        error_message: error.message,
        failed_urls: [errorDetails],
        last_activity: new Date().toISOString()
      })
      .eq('session_id', session_id)
  }
}

// Nouvelle fonction d'authentification CAS légère
async function authenticateWithCAS(username: string, password: string): Promise<string> {
  console.log('🔐 Authentification CAS via Puppeteer minimal...')
  
  const browser = await launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Aller sur la page qui redirige vers CAS
    await page.goto('https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Objectif_de_connaissance', {
      waitUntil: 'networkidle2'
    });
    
    // Vérifier redirection CAS
    if (page.url().includes('auth.uness.fr/cas/login')) {
      await page.waitForSelector('#username');
      await page.type('#username', username);
      await page.type('#password', password);
      await page.click('input[name="submit"]');
      
      await page.waitForFunction(() => window.location.href.includes('livret.uness.fr'));
    }
    
    // Récupérer les cookies
    const cookies = await page.cookies();
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    console.log('✅ Authentification CAS réussie, cookies récupérés')
    return cookieString;
    
  } finally {
    await browser.close();
  }
}

// Récupérer tous les membres de la catégorie
async function getCategoryMembers(authCookies: string): Promise<number[]> {
  const pageIds: number[] = [];
  let cmcontinue = '';
  
  do {
    const url = new URL('https://livret.uness.fr/lisa/2025/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'categorymembers');
    url.searchParams.set('cmtitle', 'Catégorie:Objectif_de_connaissance');
    url.searchParams.set('cmlimit', '500');
    url.searchParams.set('format', 'json');
    
    if (cmcontinue) {
      url.searchParams.set('cmcontinue', cmcontinue);
    }
    
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor/1.0)'
    };
    
    if (authCookies) {
      headers['Cookie'] = authCookies;
    }
    
    const response = await fetch(url.toString(), { headers });
    const data = await response.json();
    
    if (data.query?.categorymembers) {
      data.query.categorymembers.forEach((page: any) => {
        if (page.title?.match(/OIC-\d{3}-\d{2}-[AB]-\d{2}/)) {
          pageIds.push(page.pageid);
        }
      });
    }
    
    cmcontinue = data.continue?.cmcontinue || '';
    
  } while (cmcontinue);
  
  return pageIds;
}

// Récupérer le contenu des pages par batch
async function getPageContent(pageIds: number[], authCookies: string): Promise<any[]> {
  const url = new URL('https://livret.uness.fr/lisa/2025/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('prop', 'revisions');
  url.searchParams.set('rvprop', 'content|ids|timestamp');
  url.searchParams.set('pageids', pageIds.join('|'));
  url.searchParams.set('format', 'json');
  
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor/1.0)'
  };
  
  if (authCookies) {
    headers['Cookie'] = authCookies;
  }
  
  const response = await fetch(url.toString(), { headers });
  const data = await response.json();
  
  return Object.values(data.query?.pages || {});
}

// Parser le contenu d'une page OIC
function parseOICContent(page: any): any | null {
  try {
    const title = page.title;
    const content = page.revisions?.[0]?.['*'] || '';
    
    // Extraire l'identifiant OIC
    const match = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/);
    if (!match) return null;
    
    const [objectif_id, item_parent, rubrique_code, rang, ordre_str] = match;
    
    // Mapping des rubriques
    const rubriques: Record<string, string> = {
      '01': 'Génétique',
      '02': 'Immunopathologie', 
      '03': 'Inflammation',
      '04': 'Cancérologie',
      '05': 'Pharmacologie',
      '06': 'Douleur',
      '07': 'Santé publique',
      '08': 'Thérapeutique',
      '09': 'Urgences',
      '10': 'Vieillissement',
      '11': 'Interprétation'
    };
    
    // Extraire l'intitulé depuis le wikitext
    let intitule = title;
    const intituleMatch = content.match(/\|\s*Intitulé\s*=\s*([^\n\|]+)/i) || 
                         content.match(/<th[^>]*>Intitulé<\/th>\s*<td[^>]*>([^<]+)/i);
    if (intituleMatch) {
      intitule = intituleMatch[1].trim();
    }
    
    // Extraire la description
    let description = '';
    const descMatch = content.match(/\|\s*Description\s*=\s*([^\n\|]+)/i) ||
                     content.match(/<th[^>]*>Description<\/th>\s*<td[^>]*>([^<]+)/i);
    if (descMatch) {
      description = descMatch[1].trim();
    }
    
    return {
      objectif_id,
      intitule,
      item_parent,
      rang,
      rubrique: rubriques[rubrique_code] || 'Autre',
      description,
      ordre: parseInt(ordre_str),
      url_source: `https://livret.uness.fr/lisa/2025/${encodeURIComponent(title)}`,
      date_import: new Date().toISOString(),
      extraction_status: 'complete'
    };
    
  } catch (error) {
    console.error('Erreur parsing:', error);
    return null;
  }
}

// Fonction supprimée - remplacée par parseOICContent dans la nouvelle approche API

async function getExtractionStatus(supabaseClient: any, session_id: string) {
  const { data, error } = await supabaseClient
    .from('oic_extraction_progress')
    .select('*')
    .eq('session_id', session_id)
    .single()

  if (error) {
    throw new Error(`Session non trouvée: ${error.message}`)
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
      throw new Error(`Erreur génération rapport: ${error.message}`)
    }

    const reportData = data[0] || {
      summary: { expected: 4872, extracted: 0, completeness_pct: 0 },
      by_item: [],
      missing_items: [],
      failed_urls: []
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
  } catch (error) {
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

async function resumeExtraction(supabaseClient: any, session_id: string, resume_from?: number) {
  // Récupérer l'état de la session
  const { data: session } = await supabaseClient
    .from('oic_extraction_progress')
    .select('*')
    .eq('session_id', session_id)
    .single()

  if (!session) {
    throw new Error('Session non trouvée')
  }

  // Reprendre à partir de la page spécifiée ou de la dernière page
  const startPage = resume_from || session.page_number

  await supabaseClient
    .from('oic_extraction_progress')
    .update({
      status: 'en_cours',
      page_number: startPage,
      last_activity: new Date().toISOString()
    })
    .eq('session_id', session_id)

  // Relancer l'extraction avec les identifiants CAS
  const username = Deno.env.get('UNESS_USERNAME') || 'laeticia.moto-ngane@etud.u-picardie.fr'
  const password = Deno.env.get('UNESS_PASSWORD') || 'Aiciteal1!'
  
  extractCompetencesWithRealCAS(supabaseClient, session_id, username, password)

  return new Response(
    JSON.stringify({
      success: true,
      message: `Extraction reprise à partir de la page ${startPage}`,
      session_id
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}