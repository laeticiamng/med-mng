import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractionRequest {
  action: 'start' | 'status' | 'stop';
  session_id?: string;
  extraction_type: 'edn' | 'oic' | 'ecos';
  batch_size?: number;
  max_concurrent?: number;
}

interface ExtractionSession {
  session_id: string;
  extraction_type: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  progress: {
    total: number;
    processed: number;
    errors: number;
    success_rate: number;
  };
  auth_token?: string;
  last_activity: string;
  error_message?: string;
}

// Cache global pour les sessions d'authentification
const authCache = new Map<string, { token: string, expires: number }>();
const activeSessions = new Map<string, ExtractionSession>();

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const requestData: ExtractionRequest = await req.json();
    const { action, session_id, extraction_type } = requestData;

    console.log(`🚀 Enhanced UNESS Extraction - Action: ${action}, Type: ${extraction_type}`);

    switch (action) {
      case 'start':
        return await startEnhancedExtraction(supabaseClient, requestData);
      case 'status':
        return await getExtractionStatus(session_id!);
      case 'stop':
        return await stopExtraction(session_id!);
      default:
        throw new Error(`Action non supportée: ${action}`);
    }

  } catch (error) {
    console.error("❌ Erreur extraction enhanced:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function startEnhancedExtraction(supabase: any, request: ExtractionRequest) {
  const session_id = crypto.randomUUID();
  const { extraction_type, batch_size = 50, max_concurrent = 5 } = request;

  console.log(`🎯 Démarrage extraction ${extraction_type} - Session: ${session_id}`);

  // Créer la session d'extraction
  const session: ExtractionSession = {
    session_id,
    extraction_type,
    status: 'running',
    progress: { total: 0, processed: 0, errors: 0, success_rate: 0 },
    last_activity: new Date().toISOString()
  };

  activeSessions.set(session_id, session);

  // Lancer l'extraction en arrière-plan
  const backgroundTask = runEnhancedExtraction(supabase, session, { batch_size, max_concurrent });
  
  if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
    EdgeRuntime.waitUntil(backgroundTask);
  } else {
    backgroundTask.catch(error => {
      console.error(`❌ Erreur tâche arrière-plan ${session_id}:`, error);
      session.status = 'failed';
      session.error_message = error.message;
    });
  }

  return new Response(JSON.stringify({
    success: true,
    session_id,
    extraction_type,
    message: `Extraction ${extraction_type} démarrée avec paramètres optimisés`,
    config: { batch_size, max_concurrent }
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function runEnhancedExtraction(supabase: any, session: ExtractionSession, config: any) {
  try {
    console.log(`🔄 Début extraction ${session.extraction_type}`);
    
    // 1. Authentification robuste avec cache
    const authToken = await getOrRefreshAuthToken();
    session.auth_token = authToken;

    // 2. Découverte intelligente du contenu
    const itemsToExtract = await discoverContentItems(session.extraction_type, authToken);
    session.progress.total = itemsToExtract.length;

    console.log(`📊 ${itemsToExtract.length} éléments découverts pour ${session.extraction_type}`);

    // 3. Extraction parallélisée par batches
    await processItemsInBatches(supabase, session, itemsToExtract, config, authToken);

    // 4. Finalisation
    session.status = 'completed';
    session.progress.success_rate = ((session.progress.processed - session.progress.errors) / session.progress.total) * 100;
    
    console.log(`✅ Extraction ${session.extraction_type} terminée - Taux de réussite: ${session.progress.success_rate.toFixed(1)}%`);

  } catch (error) {
    console.error(`❌ Erreur critique extraction ${session.session_id}:`, error);
    session.status = 'failed';
    session.error_message = error.message;
  } finally {
    session.last_activity = new Date().toISOString();
  }
}

async function getOrRefreshAuthToken(): Promise<string> {
  const cacheKey = 'UNESS_AUTH';
  const cached = authCache.get(cacheKey);
  
  // Vérifier si le token en cache est encore valide (avec marge de 5 minutes)
  if (cached && cached.expires > Date.now() + 300000) {
    console.log('🔄 Utilisation du token d\'authentification en cache');
    return cached.token;
  }

  console.log('🔐 Authentification CAS robuste...');
  
  const username = Deno.env.get("CAS_USERNAME");
  const password = Deno.env.get("CAS_PASSWORD");
  
  if (!username || !password) {
    throw new Error("Credentials CAS non configurés");
  }

  // Authentification avec retry et circuit breaker
  const token = await authenticateWithRetry(username, password, 3);
  
  // Mise en cache pour 30 minutes
  authCache.set(cacheKey, {
    token,
    expires: Date.now() + 1800000 // 30 minutes
  });

  return token;
}

async function authenticateWithRetry(username: string, password: string, maxRetries: number): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔑 Tentative d'authentification ${attempt}/${maxRetries}`);
      
      // Étape 1: Récupérer le formulaire CAS avec timeout
      const loginResponse = await fetchWithTimeout("https://auth.uness.fr/cas/login", {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      }, 10000);

      if (!loginResponse.ok) {
        throw new Error(`Accès CAS échoué: ${loginResponse.status}`);
      }

      const loginHTML = await loginResponse.text();
      const loginCookies = extractEnhancedCookies(loginResponse.headers);

      // Extraction robuste du token CSRF
      const executionToken = extractExecutionToken(loginHTML);
      if (!executionToken) {
        throw new Error("Token d'exécution CAS non trouvé");
      }

      // Étape 2: Authentification avec validation
      const authData = new URLSearchParams({
        'username': username,
        'password': password,
        'execution': executionToken,
        '_eventId': 'submit'
      });

      const authResponse = await fetchWithTimeout("https://auth.uness.fr/cas/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': loginCookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: authData,
        redirect: 'manual'
      }, 15000);

      // Validation du succès d'authentification
      if (authResponse.status === 302 || authResponse.status === 200) {
        const authCookies = extractEnhancedCookies(authResponse.headers);
        const consolidatedToken = `${loginCookies}; ${authCookies}`;
        
        // Test de validité du token
        await validateAuthToken(consolidatedToken);
        
        console.log(`✅ Authentification CAS réussie (tentative ${attempt})`);
        return consolidatedToken;
      }

      throw new Error(`Authentification échouée: ${authResponse.status}`);

    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ Tentative ${attempt} échouée:`, error.message);
      
      if (attempt < maxRetries) {
        // Délai exponentiel entre les tentatives
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`⏳ Attente ${delay}ms avant nouvelle tentative...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Authentification définitivement échouée après ${maxRetries} tentatives: ${lastError?.message}`);
}

async function discoverContentItems(extractionType: string, authToken: string): Promise<any[]> {
  console.log(`🔍 Découverte intelligente du contenu ${extractionType}...`);

  switch (extractionType) {
    case 'edn':
      return await discoverEdnItems(authToken);
    case 'oic': 
      return await discoverOicCompetences(authToken);
    case 'ecos':
      return await discoverEcosSituations(authToken);
    default:
      throw new Error(`Type d'extraction non supporté: ${extractionType}`);
  }
}

async function discoverEdnItems(authToken: string): Promise<any[]> {
  const items = [];
  
  // Navigation intelligente vers la page des items EDN
  const itemsPageResponse = await fetchWithTimeout("https://livret.uness.fr/lisa/2025/Item_de_connaissance_2C", {
    headers: {
      'Cookie': authToken,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }, 15000);

  if (!itemsPageResponse.ok) {
    throw new Error(`Accès page EDN échoué: ${itemsPageResponse.status}`);
  }

  // Découverte des items disponibles (au lieu de supposer 1-367)
  const pageHTML = await itemsPageResponse.text();
  const itemLinks = extractItemLinks(pageHTML, 'Item_de_connaissance_2C');

  console.log(`📋 ${itemLinks.length} items EDN découverts`);

  for (const link of itemLinks) {
    items.push({
      type: 'edn',
      id: extractItemIdFromUrl(link.url),
      url: link.url,
      title: link.title
    });
  }

  return items;
}

async function discoverOicCompetences(authToken: string): Promise<any[]> {
  const competences = [];
  
  try {
    // Test d'accès à l'API MediaWiki
    const apiUrl = 'https://livret.uness.fr/lisa/2025/api.php';
    const testResponse = await fetchWithTimeout(`${apiUrl}?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=10&format=json`, {
      headers: {
        'Cookie': authToken,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, 10000);

    const testData = await testResponse.json();
    
    if (testData.error) {
      throw new Error(`API MediaWiki inaccessible: ${testData.error.info}`);
    }

    console.log('✅ API MediaWiki accessible');

    // Récupération complète des compétences OIC par pagination
    let cmcontinue = '';
    let totalFound = 0;

    do {
      const paginationParam = cmcontinue ? `&cmcontinue=${encodeURIComponent(cmcontinue)}` : '';
      const response = await fetchWithTimeout(`${apiUrl}?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=500&format=json${paginationParam}`, {
        headers: {
          'Cookie': authToken,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, 15000);

      const data = await response.json();
      
      if (data.query && data.query.categorymembers) {
        for (const member of data.query.categorymembers) {
          competences.push({
            type: 'oic',
            id: member.pageid,
            title: member.title,
            url: `https://livret.uness.fr/lisa/2025/${encodeURIComponent(member.title)}`
          });
          totalFound++;
        }
      }

      cmcontinue = data.continue?.cmcontinue || '';
      
    } while (cmcontinue);

    console.log(`📊 ${totalFound} compétences OIC découvertes via API`);

  } catch (error) {
    console.warn('⚠️ Fallback sur scraping manuel pour OIC:', error.message);
    
    // Fallback: scraping manuel si API inaccessible
    const response = await fetchWithTimeout('https://livret.uness.fr/lisa/2025/Catégorie:Objectif_de_connaissance', {
      headers: {
        'Cookie': authToken,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, 15000);

    const html = await response.text();
    const oicLinks = extractItemLinks(html, 'OIC-');

    for (const link of oicLinks) {
      competences.push({
        type: 'oic',
        id: link.title,
        title: link.title,
        url: link.url
      });
    }

    console.log(`📊 ${competences.length} compétences OIC découvertes par scraping`);
  }

  return competences;
}

async function discoverEcosSituations(authToken: string): Promise<any[]> {
  const situations = [];
  
  const ecosResponse = await fetchWithTimeout("https://livret.uness.fr/lisa/2025/Situation_de_depart", {
    headers: {
      'Cookie': authToken,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }, 15000);

  if (!ecosResponse.ok) {
    throw new Error(`Accès page ECOS échoué: ${ecosResponse.status}`);
  }

  const pageHTML = await ecosResponse.text();
  const situationLinks = extractItemLinks(pageHTML, 'Situation_de_depart');

  console.log(`📋 ${situationLinks.length} situations ECOS découvertes`);

  for (const link of situationLinks) {
    situations.push({
      type: 'ecos',
      id: extractItemIdFromUrl(link.url),
      url: link.url,
      title: link.title
    });
  }

  return situations;
}

async function processItemsInBatches(supabase: any, session: ExtractionSession, items: any[], config: any, authToken: string) {
  const { batch_size, max_concurrent } = config;
  const batches = createBatches(items, batch_size);

  console.log(`📦 Traitement en ${batches.length} batches de ${batch_size} éléments (${max_concurrent} parallèles)`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`📦 Batch ${i + 1}/${batches.length} - ${batch.length} éléments`);

    // Traitement parallèle du batch avec limitation de concurrence
    const batchResults = await processItemsConcurrently(batch, max_concurrent, authToken, session.extraction_type);

    // Sauvegarde en base par batch
    const saveResults = await saveBatchResults(supabase, batchResults, session.extraction_type);

    // Mise à jour des statistiques
    session.progress.processed += batch.length;
    session.progress.errors += batchResults.filter(r => r.error).length;
    session.last_activity = new Date().toISOString();

    console.log(`✅ Batch ${i + 1} terminé - Réussite: ${saveResults.success}/${batch.length}, Erreurs: ${saveResults.errors}`);

    // Pause courte entre les batches pour éviter la surcharge
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

async function processItemsConcurrently(items: any[], maxConcurrent: number, authToken: string, extractionType: string): Promise<any[]> {
  const results = [];
  const processing = [];

  for (const item of items) {
    const promise = extractSingleItemEnhanced(item, authToken, extractionType)
      .then(result => ({ item, result }))
      .catch(error => ({ item, error: error.message }));

    processing.push(promise);

    // Limiter la concurrence
    if (processing.length >= maxConcurrent) {
      const completed = await Promise.race(processing);
      results.push(completed);
      
      // Retirer la promesse résolue
      const index = processing.findIndex(p => p === Promise.resolve(completed));
      if (index > -1) processing.splice(index, 1);
    }
  }

  // Attendre les dernières promesses
  const remaining = await Promise.allSettled(processing);
  remaining.forEach(settled => {
    if (settled.status === 'fulfilled') {
      results.push(settled.value);
    }
  });

  return results;
}

async function extractSingleItemEnhanced(item: any, authToken: string, extractionType: string): Promise<any> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      switch (extractionType) {
        case 'edn':
          return await extractEdnItemEnhanced(item, authToken);
        case 'oic':
          return await extractOicCompetenceEnhanced(item, authToken);
        case 'ecos':
          return await extractEcosSituationEnhanced(item, authToken);
        default:
          throw new Error(`Type d'extraction non supporté: ${extractionType}`);
      }
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        console.warn(`⚠️ Retry extraction ${item.id} (tentative ${attempt}):`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError || new Error('Extraction échouée');
}

async function extractEdnItemEnhanced(item: any, authToken: string): Promise<any> {
  // Récupérer le contenu principal
  const response = await fetchWithTimeout(item.url, {
    headers: {
      'Cookie': authToken,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }, 10000);

  if (!response.ok) {
    throw new Error(`Accès EDN item ${item.id} échoué: ${response.status}`);
  }

  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  if (!doc) {
    throw new Error('Parsing HTML échoué');
  }

  // Extraction intelligente avec multiple stratégies
  const extractedData = {
    item_id: item.id,
    intitule: extractTitle(doc, html),
    rangs_a: extractRangsEnhanced(doc, html, 'Rang A'),
    rangs_b: extractRangsEnhanced(doc, html, 'Rang B'),
    contenu_complet_html: ''
  };

  // Tentative de récupération de la version imprimable
  try {
    const printableUrl = `${item.url}/version_imprimable`;
    const printableResponse = await fetchWithTimeout(printableUrl, {
      headers: {
        'Cookie': authToken,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, 8000);

    if (printableResponse.ok) {
      extractedData.contenu_complet_html = await printableResponse.text();
    } else {
      extractedData.contenu_complet_html = html;
    }
  } catch {
    extractedData.contenu_complet_html = html;
  }

  return extractedData;
}

async function extractOicCompetenceEnhanced(item: any, authToken: string): Promise<any> {
  const response = await fetchWithTimeout(item.url, {
    headers: {
      'Cookie': authToken,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }, 10000);

  if (!response.ok) {
    throw new Error(`Accès OIC ${item.id} échoué: ${response.status}`);
  }

  const html = await response.text();
  
  // Parser OIC amélioré
  const competenceData = parseOicContentEnhanced(item.title, html, item.url);
  
  if (!competenceData) {
    throw new Error('Parsing OIC échoué');
  }

  return competenceData;
}

async function extractEcosSituationEnhanced(item: any, authToken: string): Promise<any> {
  const response = await fetchWithTimeout(item.url, {
    headers: {
      'Cookie': authToken,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }, 10000);

  if (!response.ok) {
    throw new Error(`Accès ECOS ${item.id} échoué: ${response.status}`);
  }

  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const situationData = {
    sd_id: item.id,
    intitule_sd: extractTitle(doc, html) || item.title,
    contenu_complet_html: html,
    competences_associees: extractCompetencesEnhanced(doc, html),
    url_source: item.url
  };

  return situationData;
}

// =====================
// FONCTIONS UTILITAIRES AMÉLIORÉES
// =====================

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function extractEnhancedCookies(headers: Headers): string {
  const cookies: string[] = [];
  headers.forEach((value, name) => {
    if (name.toLowerCase() === 'set-cookie') {
      const cookiePart = value.split(';')[0];
      if (cookiePart && !cookies.includes(cookiePart)) {
        cookies.push(cookiePart);
      }
    }
  });
  return cookies.join('; ');
}

function extractExecutionToken(html: string): string | null {
  const patterns = [
    /name="execution"\s+value="([^"]+)"/i,
    /value="([^"]+)"\s+name="execution"/i,
    /<input[^>]*name="execution"[^>]*value="([^"]+)"[^>]*>/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

async function validateAuthToken(token: string): Promise<void> {
  // Test simple d'accès à une page protégée
  const testResponse = await fetchWithTimeout("https://livret.uness.fr/lisa/2025/Item_de_connaissance_2C", {
    headers: {
      'Cookie': token,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }, 5000);

  if (!testResponse.ok || testResponse.url.includes('cas/login')) {
    throw new Error('Token d\'authentification invalide');
  }
}

function extractItemLinks(html: string, pattern: string): Array<{url: string, title: string}> {
  const links: Array<{url: string, title: string}> = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  if (doc) {
    // Utiliser le DOM pour une extraction plus fiable
    const linkElements = doc.querySelectorAll('a[href*="' + pattern + '"]');
    linkElements.forEach(element => {
      const href = element.getAttribute('href');
      const title = element.textContent?.trim();
      
      if (href && title) {
        const url = href.startsWith('http') ? href : `https://livret.uness.fr${href}`;
        if (!links.some(l => l.url === url)) {
          links.push({ url, title });
        }
      }
    });
  }

  // Fallback regex si DOM parsing échoue
  if (links.length === 0) {
    const regex = new RegExp(`<a[^>]+href="([^"]*${pattern}[^"]*)"[^>]*>([^<]+)</a>`, 'gi');
    let match;
    while ((match = regex.exec(html)) !== null) {
      const url = match[1].startsWith('http') ? match[1] : `https://livret.uness.fr${match[1]}`;
      const title = match[2].trim();
      if (!links.some(l => l.url === url)) {
        links.push({ url, title });
      }
    }
  }

  return links;
}

function extractItemIdFromUrl(url: string): number {
  const patterns = [
    /Item_(\d+)/,
    /SD_(\d+)/,
    /(\d+)$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
  }

  // Fallback: générer un ID basé sur l'URL
  return Math.abs(hashString(url)) % 10000;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

function extractTitle(doc: Document | null, html: string): string {
  if (doc) {
    // Stratégies DOM
    const titleSelectors = ['h1', 'h2', '.title', '.page-title', 'title'];
    for (const selector of titleSelectors) {
      const element = doc.querySelector(selector);
      if (element && element.textContent?.trim()) {
        return element.textContent.trim();
      }
    }
  }

  // Fallback regex
  const patterns = [
    /<h1[^>]*>([^<]+)<\/h1>/i,
    /<h2[^>]*>([^<]+)<\/h2>/i,
    /<title[^>]*>([^<]+)<\/title>/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }

  return 'Titre non trouvé';
}

function extractRangsEnhanced(doc: Document | null, html: string, rangType: string): string[] {
  const rangs: string[] = [];

  if (doc) {
    // Stratégies DOM avancées
    const strategies = [
      () => extractRangsByHeaders(doc, rangType),
      () => extractRangsByTables(doc, rangType),
      () => extractRangsByLists(doc, rangType),
      () => extractRangsByClasses(doc, rangType)
    ];

    for (const strategy of strategies) {
      const result = strategy();
      if (result.length > 0) {
        rangs.push(...result);
        break;
      }
    }
  }

  // Fallback regex si DOM échoue
  if (rangs.length === 0) {
    const regexResult = extractRangsByRegex(html, rangType);
    rangs.push(...regexResult);
  }

  // Nettoyage et validation
  return rangs
    .map(rang => cleanText(rang))
    .filter(rang => rang.length > 10 && rang.length < 1000)
    .slice(0, 50); // Limite raisonnable
}

function extractRangsByHeaders(doc: Document, rangType: string): string[] {
  const rangs: string[] = [];
  const headers = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  for (const header of headers) {
    if (header.textContent?.toLowerCase().includes(rangType.toLowerCase())) {
      let nextElement = header.nextElementSibling;
      while (nextElement) {
        if (nextElement.tagName === 'UL' || nextElement.tagName === 'OL') {
          const items = nextElement.querySelectorAll('li');
          items.forEach(item => {
            const text = item.textContent?.trim();
            if (text) rangs.push(text);
          });
          break;
        } else if (nextElement.tagName.startsWith('H')) {
          break;
        }
        nextElement = nextElement.nextElementSibling;
      }
    }
  }
  
  return rangs;
}

function extractRangsByTables(doc: Document, rangType: string): string[] {
  const rangs: string[] = [];
  const cells = doc.querySelectorAll('th, td');
  
  for (const cell of cells) {
    if (cell.textContent?.toLowerCase().includes(rangType.toLowerCase())) {
      // Chercher dans la même ligne ou colonne
      const row = cell.closest('tr');
      if (row) {
        const allCells = row.querySelectorAll('td, th');
        allCells.forEach(c => {
          if (c !== cell && c.textContent?.trim()) {
            const text = c.textContent.trim();
            if (text.length > 10) rangs.push(text);
          }
        });
      }
    }
  }
  
  return rangs;
}

function extractRangsByLists(doc: Document, rangType: string): string[] {
  const rangs: string[] = [];
  const lists = doc.querySelectorAll('ul, ol');
  
  for (const list of lists) {
    const listContext = list.previousElementSibling?.textContent?.toLowerCase() || '';
    if (listContext.includes(rangType.toLowerCase())) {
      const items = list.querySelectorAll('li');
      items.forEach(item => {
        const text = item.textContent?.trim();
        if (text && text.length > 10) rangs.push(text);
      });
    }
  }
  
  return rangs;
}

function extractRangsByClasses(doc: Document, rangType: string): string[] {
  const rangs: string[] = [];
  const classVariations = [
    rangType.toLowerCase().replace(' ', '-'),
    rangType.toLowerCase().replace(' ', '_'),
    `rang-${rangType.toLowerCase().charAt(rangType.length - 1)}`
  ];
  
  for (const className of classVariations) {
    const elements = doc.querySelectorAll(`[class*="${className}"], [id*="${className}"]`);
    elements.forEach(element => {
      const text = element.textContent?.trim();
      if (text && text.length > 10) rangs.push(text);
    });
  }
  
  return rangs;
}

function extractRangsByRegex(html: string, rangType: string): string[] {
  const rangs: string[] = [];
  
  const patterns = [
    new RegExp(`<h[2-6][^>]*>.*?${rangType}.*?</h[2-6]>\\s*<ul[^>]*>([\\s\\S]*?)</ul>`, 'i'),
    new RegExp(`<th[^>]*>.*?${rangType}.*?</th>\\s*<td[^>]*>([\\s\\S]*?)</td>`, 'i'),
    new RegExp(`${rangType}[^<]*</h[^>]+>([\\s\\S]*?)(?=<h[^>]+>|Rang\\s+[AB]|$)`, 'i')
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const listMatches = Array.from(match[1].matchAll(/<li[^>]*>([^<]+)<\/li>/gi));
      listMatches.forEach(m => {
        if (m[1]) {
          const cleanText = m[1].replace(/<[^>]+>/g, '').trim();
          if (cleanText.length > 10) rangs.push(cleanText);
        }
      });
    }
  }

  return rangs;
}

function extractCompetencesEnhanced(doc: Document | null, html: string): string[] {
  const competences: string[] = [];

  if (doc) {
    // Recherche dans les éléments de liste
    const listItems = doc.querySelectorAll('li');
    listItems.forEach(item => {
      const text = item.textContent?.trim();
      if (text && (text.toLowerCase().includes('compétenc') || text.toLowerCase().includes('objectif'))) {
        if (text.length > 10 && text.length < 500) {
          competences.push(text);
        }
      }
    });

    // Recherche dans les paragraphes
    const paragraphs = doc.querySelectorAll('p');
    paragraphs.forEach(p => {
      const text = p.textContent?.trim();
      if (text && (text.toLowerCase().includes('compétenc') || text.toLowerCase().includes('objectif'))) {
        if (text.length > 20 && text.length < 500) {
          competences.push(text);
        }
      }
    });
  }

  // Fallback regex
  if (competences.length === 0) {
    const patterns = [
      /compétence[^<]*<\/[^>]+>([^<]+)/gi,
      /objectif[^<]*<\/[^>]+>([^<]+)/gi,
      /<li[^>]*>([^<]*compétence[^<]*)<\/li>/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const text = match[1]?.trim();
        if (text && text.length > 10 && !competences.includes(text)) {
          competences.push(text);
        }
      }
    });
  }

  return competences.slice(0, 20); // Limite raisonnable
}

function parseOicContentEnhanced(title: string, html: string, url: string): any | null {
  // Extraction du format OIC
  const oicMatch = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/);
  if (!oicMatch) {
    return null;
  }

  const [, item_parent, rubrique_code, rang, ordre_str] = oicMatch;
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  return {
    objectif_id: title,
    intitule: extractTitle(doc, html),
    item_parent,
    rang,
    rubrique: `Rubrique ${rubrique_code}`,
    description: extractDescription(doc, html),
    ordre: parseInt(ordre_str),
    url_source: url,
    date_import: new Date().toISOString(),
    extraction_status: 'enhanced'
  };
}

function extractDescription(doc: Document | null, html: string): string {
  if (doc) {
    const paragraphs = doc.querySelectorAll('p');
    for (const p of paragraphs) {
      const text = p.textContent?.trim();
      if (text && text.length > 50 && text.length < 1000) {
        return text;
      }
    }
  }

  // Fallback regex
  const match = html.match(/<p[^>]*>([^<]{50,1000})<\/p>/);
  return match ? match[1].trim() : '';
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

async function saveBatchResults(supabase: any, results: any[], extractionType: string): Promise<{success: number, errors: number}> {
  let success = 0;
  let errors = 0;

  const tableName = getTableName(extractionType);
  const validResults = results.filter(r => r.result && !r.error);

  if (validResults.length > 0) {
    try {
      const dataToInsert = validResults.map(r => ({
        ...r.result,
        date_import: new Date().toISOString()
      }));

      const { error } = await supabase
        .from(tableName)
        .upsert(dataToInsert);

      if (error) {
        console.error(`❌ Erreur sauvegarde batch ${extractionType}:`, error);
        errors = validResults.length;
      } else {
        success = validResults.length;
      }
    } catch (error) {
      console.error(`❌ Erreur critique sauvegarde:`, error);
      errors = validResults.length;
    }
  }

  errors += results.filter(r => r.error).length;

  return { success, errors };
}

function getTableName(extractionType: string): string {
  switch (extractionType) {
    case 'edn': return 'edn_items_uness';
    case 'oic': return 'oic_competences';
    case 'ecos': return 'ecos_situations_uness';
    default: throw new Error(`Type d'extraction non supporté: ${extractionType}`);
  }
}

async function getExtractionStatus(session_id: string) {
  const session = activeSessions.get(session_id);
  
  if (!session) {
    return new Response(JSON.stringify({ 
      error: 'Session non trouvée' 
    }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(session), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function stopExtraction(session_id: string) {
  const session = activeSessions.get(session_id);
  
  if (!session) {
    return new Response(JSON.stringify({ 
      error: 'Session non trouvée' 
    }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  session.status = 'paused';
  session.last_activity = new Date().toISOString();

  return new Response(JSON.stringify({
    success: true,
    message: 'Extraction arrêtée',
    session
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}