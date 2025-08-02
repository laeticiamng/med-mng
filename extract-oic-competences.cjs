// extract-oic-competences.cjs
// Script Node.js pour GitHub Actions - Extraction complète des 4,872 compétences OIC

const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration depuis les variables d'environnement GitHub Actions
const config = {
  cas: {
    username: process.env.CAS_USERNAME || 'laeticia.moto-ngane@etud.u-picardie.fr',
    password: process.env.CAS_PASSWORD || 'Aiciteal1!'
  },
  supabase: {
    url: 'https://yaincoxihiqdksxgrsrk.supabase.co',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  urls: {
    base: 'https://livret.uness.fr/lisa/2025',
    category: 'https://livret.uness.fr/lisa/2025/Catégorie:Objectif_de_connaissance',
    api: 'https://livret.uness.fr/lisa/2025/api.php'
  }
};

// Logging vers fichier et console
const logFile = `extraction-${new Date().toISOString().slice(0,10)}.log`;
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage + '\n');
}

// Initialiser Supabase
const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

// Fonction principale
async function extractAllCompetences() {
  log('🚀 DÉMARRAGE EXTRACTION OIC - 4,872 COMPÉTENCES ATTENDUES');
  log('===============================================');
  
  if (!config.supabase.serviceKey) {
    throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY manquant');
  }
  
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ]
  });
  
  const stats = {
    startTime: Date.now(),
    totalFound: 0,
    totalProcessed: 0,
    totalInserted: 0,
    totalErrors: 0,
    errors: []
  };
  
  try {
    const page = await browser.newPage();
    
    // 0. Vérifier d'abord les compétences incomplètes
    const incompleteIds = await getIncompleteCompetences();
    const completionMode = incompleteIds.size > 0;
    
    if (completionMode) {
      log(`🔄 MODE COMPLÉTION ACTIVÉ - ${incompleteIds.size} compétences à compléter`);
      stats.completionMode = true;
      stats.targetIds = incompleteIds;
    } else {
      log(`✅ TOUTES LES COMPÉTENCES SONT COMPLÈTES - Extraction classique`);
      stats.completionMode = false;
    }
    
    // 1. Authentification CAS
    log('🔐 Authentification CAS...');
    await authenticateCAS(page);
    
    // 2. Récupérer les cookies de session après authentification
    const cookies = await page.cookies();
    const cookieString = cookies
      .filter(c => c.domain.includes('uness.fr'))
      .map(c => `${c.name}=${c.value}`)
      .join('; ');
    log(`🍪 Cookies de session récupérés: ${cookies.length} cookies pour uness.fr`);
    
    // DEBUG: afficher les cookies pour voir s'ils sont du bon domaine
    if (cookies.length > 0) {
      log(`🔍 COOKIES DÉTAILLÉS:`);
      cookies.forEach((cookie, i) => {
        log(`   ${i+1}. ${cookie.name}=${cookie.value.substring(0, 20)}... (domain: ${cookie.domain})`);
      });
    } else {
      log(`⚠️ AUCUN COOKIE RÉCUPÉRÉ - PROBLÈME D'AUTHENTIFICATION PROBABLE`);
    }
    
    // TEST: essayer un appel API avec les cookies de session
    log('🧪 TEST API avec authentification et cookies...');
    try {
      // Créer une requête avec les cookies de session
      const testUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=1&format=json';
      
      const response = await page.evaluate(async (url, cookieStr) => {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Cookie': cookieStr,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Referer': 'https://livret.uness.fr/lisa/2025/',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'include'
        });
        
        const text = await response.text();
        return {
          status: response.status,
          ok: response.ok,
          text: text
        };
      }, testUrl, cookieString);
      
      log(`🧪 Réponse API test: status=${response.status}, ok=${response.ok}`);
      log(`🧪 Contenu API test (200 premiers chars): ${response.text.substring(0, 200)}...`);
      
      if (response.ok) {
        try {
          const data = JSON.parse(response.text);
          if (data.error) {
            log(`❌ ERREUR API: ${JSON.stringify(data.error)}`);
            if (data.error.code === 'readapidenied') {
              log(`⚠️ API toujours protégée - on continue avec navigation directe`);
            }
          } else if (data.query?.categorymembers?.length > 0) {
            log(`✅ TEST API RÉUSSI: ${data.query.categorymembers.length} membres trouvés`);
          } else {
            log(`📊 API accessible mais aucun membre trouvé`);
          }
        } catch (parseError) {
          log(`❌ Erreur parsing JSON: ${parseError.message}`);
        }
      }
    } catch (testError) {
      log(`❌ ERREUR TEST API: ${testError.message}`);
    }
    
  // 2. Vérifier l'authentification - ne pas naviguer, utiliser l'URL actuelle
  const currentUrl = page.url();
  log(`🔍 URL après authentification: ${currentUrl}`);
  
  // Si on est déjà sur livret.uness.fr, pas besoin de re-naviguer
  if (currentUrl.includes('livret.uness.fr')) {
    log('✅ Déjà sur livret.uness.fr après authentification');
  } else {
    log('⚠️ Pas encore sur livret.uness.fr, tentative de navigation...');
    await page.goto(config.urls.category, { waitUntil: 'networkidle2', timeout: 60000 });
  }
  
  // Attendre que la page se charge complètement
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const finalUrl = page.url();
  log(`🔍 URL finale pour vérification: ${finalUrl}`);
  
  const isAuthenticated = await page.evaluate(() => {
    // Vérifier plusieurs conditions d'authentification
    const url = window.location.href;
    const hasContent = document.body.innerText.includes('Objectif de connaissance') || 
                      document.body.innerText.includes('Catégorie') ||
                      document.querySelector('h1') ||
                      document.body.innerText.includes('Livret') ||
                      document.body.innerText.includes('UNESS');
    const notOnAuthPage = !url.includes('cas/login') && !url.includes('auth.uness.fr/cas');
    
    return notOnAuthPage && hasContent;
  });
  
  if (!isAuthenticated) {
    log(`❌ Authentification échouée - URL: ${finalUrl}`);
    const pageContent = await page.content();
    log(`🔍 Contenu page (500 premiers caractères): ${pageContent.substring(0, 500)}`);
    
    // Essayer une dernière fois avec une approche différente
    log('🔄 Tentative finale avec navigation directe vers API...');
    try {
      await page.goto(config.urls.api + '?action=query&meta=siteinfo&format=json', { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      const apiContent = await page.content();
      if (apiContent.includes('query') && !apiContent.includes('cas/login')) {
        log('✅ API accessible, authentification OK');
        return; // Success
      }
    } catch (e) {
      log(`❌ Test API échoué: ${e.message}`);
    }
    
    throw new Error('❌ Authentification CAS échouée');
  }
  log('✅ Authentification CAS réussie');
    
    // 3. Extraction via API MediaWiki avec cookies
    log('📊 Début extraction via API MediaWiki...');
    const allCompetences = await extractViaAPI(page, stats, cookieString);
    
    // 4. Insertion dans Supabase
    log(`💾 Insertion de ${allCompetences.length} compétences dans Supabase...`);
    await insertToSupabase(allCompetences, stats);
    
    // 5. Rapport final
    await generateFinalReport(stats);
    
  } catch (error) {
    log(`❌ ERREUR CRITIQUE: ${error.message}`);
    stats.errors.push({ type: 'CRITICAL', error: error.message, timestamp: new Date().toISOString() });
    throw error;
  } finally {
    await browser.close();
    
    // Sauvegarder le rapport JSON
    const reportFile = `rapport-${new Date().toISOString().slice(0,10)}.json`;
    fs.writeFileSync(reportFile, JSON.stringify({
      ...stats,
      duration: Date.now() - stats.startTime,
      success: stats.totalInserted > 0
    }, null, 2));
    
    log(`📊 Rapport sauvegardé: ${reportFile}`);
  }
}

// Authentification CAS complètement refaite
async function authenticateCAS(page) {
  log('🌐 Navigation vers page protégée pour déclencher l\'authentification...');
  await page.goto(config.urls.category, { waitUntil: 'networkidle2', timeout: 30000 });
  
  const initialUrl = page.url();
  log(`🔍 URL initiale: ${initialUrl}`);
  
  // Si pas de redirection CAS, on est déjà authentifié
  if (!initialUrl.includes('cas/login') && !initialUrl.includes('auth.uness.fr')) {
    log('✅ Pas de redirection CAS - déjà authentifié');
    return;
  }
  
  log('🔑 Authentification CAS requise - début du processus...');
  
  // Attendre que la page de login soit entièrement chargée
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Étape 1: Saisir l'email
  log('📧 Saisie de l\'email...');
  await page.waitForSelector('input[type="email"], input[name="email"], input[type="text"]', { timeout: 10000 });
  
  const emailInput = await page.$('input[type="email"]') || await page.$('input[name="email"]') || await page.$('input[type="text"]');
  if (!emailInput) {
    throw new Error('Champ email non trouvé');
  }
  
  await emailInput.type(config.cas.username);
  log(`✅ Email saisi: ${config.cas.username}`);
  
  // Cliquer sur le bouton de la première étape
  const submitButton1 = await page.$('button[type="submit"], input[type="submit"]');
  if (!submitButton1) {
    throw new Error('Bouton submit étape 1 non trouvé');
  }
  
  log('🔄 Clic sur le bouton de connexion étape 1...');
  await submitButton1.click();
  
  // Attendre la navigation vers l'étape 2
  try {
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
  } catch (e) {
    log('⚠️ Pas de navigation détectée, continuons...');
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Étape 2: Saisir le mot de passe
  log('🔐 Saisie du mot de passe...');
  await page.waitForSelector('input[type="password"]', { timeout: 10000 });
  
  const passwordInput = await page.$('input[type="password"]');
  if (!passwordInput) {
    throw new Error('Champ mot de passe non trouvé');
  }
  
  await passwordInput.type(config.cas.password);
  log('✅ Mot de passe saisi');
  
  // Cliquer sur le bouton de la deuxième étape
  const submitButton2 = await page.$('button[type="submit"], input[type="submit"]');
  if (!submitButton2) {
    throw new Error('Bouton submit étape 2 non trouvé');
  }
  
  log('🔄 Clic sur le bouton de connexion étape 2...');
  await submitButton2.click();
  
  // Attendre la redirection OAuth2 complète vers livret.uness.fr
  log('⏳ Attente de la redirection OAuth2 complète...');
  
  let redirectSuccess = false;
  for (let attempt = 0; attempt < 12; attempt++) { // 12 tentatives = 2 minutes max
    await new Promise(resolve => setTimeout(resolve, 10000)); // Attendre 10 secondes
    
    const currentUrl = page.url();
    log(`🔍 Tentative ${attempt + 1} - URL actuelle: ${currentUrl.substring(0, 100)}...`);
    
    // Vérifier si on est arrivé sur livret.uness.fr
    if (currentUrl.includes('livret.uness.fr') && !currentUrl.includes('cas/login') && !currentUrl.includes('auth.uness.fr/cas')) {
      log('🎉 Redirection OAuth2 réussie !');
      redirectSuccess = true;
      break;
    }
    
    // Si on est toujours sur une page d'auth, continuer d'attendre
    if (currentUrl.includes('auth.uness.fr') || currentUrl.includes('cas/login')) {
      log(`⏳ Toujours en cours d'authentification, patience...`);
      continue;
    }
    
    // Si on est sur une page inattendue, essayer de naviguer
    log(`⚠️ URL inattendue: ${currentUrl.substring(0, 100)}`);
  }
  
  if (!redirectSuccess) {
    log('❌ La redirection OAuth2 a échoué après 2 minutes d\'attente');
    throw new Error('Timeout OAuth2 - redirection vers livret.uness.fr échouée');
  }
  
  log(`✅ Authentification CAS terminée avec succès`);
}

// Extraction hybride : API MediaWiki + scraping de secours
async function extractViaAPI(page, stats, cookieString) {
  const allCompetences = [];
  let continueToken = '';
  let pageCount = 0;
  let useAPIFallback = false;
  
  log('🚀 === DÉBUT EXTRACTION HYBRIDE ===');
  
  // Première tentative avec l'API
  try {
    return await extractViaMediaWikiAPI(page, stats, cookieString);
  } catch (error) {
    log(`❌ API MediaWiki échouée: ${error.message}`);
    log(`🔄 BASCULEMENT vers scraping HTML direct...`);
    return await extractViaCategoryScraping(page, stats);
  }
}

// Méthode API MediaWiki classique
async function extractViaMediaWikiAPI(page, stats, cookieString) {
  const allCompetences = [];
  let continueToken = '';
  let pageCount = 0;
  
  log('📡 === EXTRACTION VIA API MEDIAWIKI ===');
  
  do {
    const apiUrl = new URL(config.urls.api);
    const categoryTitle = 'Catégorie:Objectif_de_connaissance';
    
    apiUrl.searchParams.set('action', 'query');
    apiUrl.searchParams.set('list', 'categorymembers');
    apiUrl.searchParams.set('cmtitle', categoryTitle);
    apiUrl.searchParams.set('cmlimit', '500');
    apiUrl.searchParams.set('format', 'json');
    if (continueToken) {
      apiUrl.searchParams.set('cmcontinue', continueToken);
    }
    
    let finalUrl = apiUrl.toString();
    if (finalUrl.includes('Catégorie%3AObjectif_de_connaissance')) {
      finalUrl = finalUrl.replace('Catégorie%3AObjectif_de_connaissance', 'Catégorie:Objectif_de_connaissance');
    }
    
    log(`🔗 URL API: ${finalUrl}`);
    
    // Tenter avec page.evaluate et cookies explicites
    const apiResponse = await page.evaluate(async (url, cookies) => {
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
        });
        
        const text = await response.text();
        return {
          ok: response.ok,
          status: response.status,
          text: text
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message
        };
      }
    }, finalUrl, cookieString);
    
    if (!apiResponse.ok) {
      throw new Error(`API request failed: ${apiResponse.error || apiResponse.status}`);
    }
    
    let apiData;
    try {
      apiData = JSON.parse(apiResponse.text);
    } catch (parseError) {
      log(`❌ Erreur parsing JSON API: ${parseError.message}`);
      log(`📄 Réponse brute: ${apiResponse.text.substring(0, 500)}...`);
      throw new Error('Réponse API non-JSON');
    }
    
    if (apiData.error) {
      log(`❌ ERREUR API: ${JSON.stringify(apiData.error)}`);
      if (apiData.error.code === 'readapidenied') {
        throw new Error('API MediaWiki protégée - access denied');
      }
      throw new Error(`API Error: ${apiData.error.code} - ${apiData.error.info}`);
    }
    
    if (!apiData.query?.categorymembers) {
      throw new Error('Pas de categorymembers dans la réponse API');
    }
    
    const allMembers = apiData.query.categorymembers || [];
    log(`📋 ${allMembers.length} membres trouvés dans la catégorie (API)`);
    
    // DEBUG: Afficher les premiers titres pour comprendre le format
    if (pageCount === 0 && allMembers.length > 0) {
      log(`🔍 DEBUG - Exemples de titres de pages:`);
      allMembers.slice(0, 10).forEach((page, i) => {
        log(`   ${i+1}. "${page.title}" (ID: ${page.pageid})`);
      });
    }
    
    // Tester différents patterns de filtrage - format réel OIC-XXX-XX-A
    const oicPattern1 = /OIC-\d{3}-\d{2}-[AB]/;
    const oicPattern2 = /OIC[\s_-]\d{3}[\s_-]\d{2}[\s_-][AB]/;
    const oicPattern3 = /OIC.*\d{3}.*\d{2}.*[AB]/;
    
    let validPages = allMembers.filter(p => p.title?.match(oicPattern1));
    
    if (validPages.length === 0) {
      log(`⚠️ Pattern strict ne trouve rien, test pattern flexible...`);
      validPages = allMembers.filter(p => p.title?.match(oicPattern2));
    }
    
    if (validPages.length === 0) {
      log(`⚠️ Pattern avec espaces ne trouve rien, test pattern très flexible...`);
      validPages = allMembers.filter(p => p.title?.match(oicPattern3));
    }
    
    if (validPages.length === 0) {
      log(`🔍 PATTERN DEBUG - Test si les pages contiennent "OIC":`);
      const oicPages = allMembers.filter(p => p.title?.includes('OIC'));
      log(`   → ${oicPages.length} pages contiennent "OIC"`);
      if (oicPages.length > 0) {
        oicPages.slice(0, 5).forEach((page, i) => {
          log(`     ${i+1}. "${page.title}"`);
        });
      }
      
      // Si aucun pattern ne fonctionne, prendre toutes les pages pour debug
      if (allMembers.length > 0) {
        log(`🚨 TAKING ALL PAGES FOR DEBUG - Will extract content to see actual format`);
        validPages = allMembers.slice(0, 10); // Prendre seulement 10 pour debug
      }
    }
    
    // FILTRAGE MODE COMPLÉTION : ne traiter que les pages à compléter
    let pageIds;
    if (stats.completionMode && stats.targetIds) {
      const pagesToProcess = validPages.filter(page => {
        const match = page.title?.match(/OIC-(\d{3})-(\d{2})-([AB])/);
        if (match) {
          const fullId = match[0];
          return stats.targetIds.has(fullId);
        }
        return false;
      });
      
      pageIds = pagesToProcess.map(p => p.pageid);
      log(`🔄 MODE COMPLÉTION: ${pageIds.length}/${validPages.length} pages sélectionnées pour complétion`);
      
      if (pageIds.length === 0) {
        log(`✅ Aucune page à compléter dans ce lot - toutes les descriptions sont complètes !`);
        continueToken = '';
        break;
      }
    } else {
      pageIds = validPages.map(p => p.pageid);
      log(`📊 MODE EXTRACTION COMPLÈTE: ${pageIds.length} pages à traiter`);
    }
    
    stats.totalFound += pageIds.length;
    log(`📄 Lot ${++pageCount}: ${pageIds.length}/${allMembers.length} compétences valides (Total: ${stats.totalFound})`);
    
    // Traiter par batches
    for (let i = 0; i < pageIds.length; i += 50) {
      const batch = pageIds.slice(i, i + 50);
      try {
        const competences = await getPageContents(page, batch);
        allCompetences.push(...competences);
        stats.totalProcessed += batch.length;
        log(`   ✅ Batch ${Math.floor(i/50) + 1}: ${competences.length}/${batch.length} extraites`);
      } catch (error) {
        log(`   ❌ Erreur batch ${Math.floor(i/50) + 1}: ${error.message}`);
        stats.totalErrors += batch.length;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    continueToken = apiData.continue?.cmcontinue || '';
    
  } while (continueToken);
  
  log(`✅ API MediaWiki: ${allCompetences.length} compétences extraites`);
  return allCompetences;
}

// Méthode scraping HTML de secours
async function extractViaCategoryScraping(page, stats) {
  const allCompetences = [];
  let currentPage = 0;
  
  log('🕷️ === EXTRACTION PAR SCRAPING HTML ===');
  
  do {
    const categoryUrl = currentPage === 0 
      ? config.urls.category
      : `${config.urls.category}?pagefrom=${currentPage}`;
      
    log(`🌐 Navigation vers: ${categoryUrl}`);
    
    try {
      await page.goto(categoryUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Attendre que le contenu se charge
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Extraire les liens OIC de la page de catégorie
      const oicPages = await page.evaluate(() => {
        const links = [];
        const allLinks = document.querySelectorAll('a[href*="OIC-"]');
        
        allLinks.forEach(link => {
          const href = link.getAttribute('href');
          const title = link.textContent || link.getAttribute('title') || '';
          
          if (title.match(/OIC-\d{3}-\d{2}-[AB]/)) {
            // Extraire l'ID de page depuis l'URL si possible
            const pageIdMatch = href.match(/[?&]curid=(\d+)/);
            const pageId = pageIdMatch ? parseInt(pageIdMatch[1]) : Math.random() * 1000000; // Fallback
            
            links.push({
              title: title,
              href: href,
              pageid: pageId
            });
          }
        });
        
        return links;
      });
      
      log(`🔍 Scraping HTML: ${oicPages.length} pages OIC trouvées`);
      stats.totalFound += oicPages.length;
      
      if (oicPages.length === 0) {
        log(`❌ Aucune page OIC trouvée - fin du scraping`);
        break;
      }
      
      // Traiter chaque page individuellement
      for (let i = 0; i < oicPages.length; i++) {
        const oicPage = oicPages[i];
        log(`📖 Scraping page ${i+1}/${oicPages.length}: ${oicPage.title}`);
        
        try {
          // Naviguer vers la page individuelle
          const fullUrl = oicPage.href.startsWith('http') 
            ? oicPage.href 
            : `https://livret.uness.fr${oicPage.href}`;
          
          await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Extraire le contenu de la page
          const pageContent = await page.evaluate(() => {
            return {
              title: document.title || '',
              content: document.body.innerText || ''
            };
          });
          
          // Simuler une structure de page pour parseCompetence
          const simulatedPageData = {
            title: oicPage.title,
            pageid: oicPage.pageid,
            revisions: [{
              slots: {
                main: {
                  content: pageContent.content
                }
              }
            }]
          };
          
          const competence = parseCompetence(simulatedPageData);
          if (competence) {
            allCompetences.push(competence);
            stats.totalProcessed++;
            log(`   ✅ Compétence parsée: ${competence.objectif_id}`);
          } else {
            log(`   ❌ Échec parsing: ${oicPage.title}`);
            stats.totalErrors++;
          }
          
        } catch (pageError) {
          log(`   ❌ Erreur page ${oicPage.title}: ${pageError.message}`);
          stats.totalErrors++;
        }
        
        // Pause entre pages
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      currentPage++;
      
      // Vérifier s'il y a une page suivante
      const hasNextPage = await page.evaluate(() => {
        return document.querySelector('a:contains("suivant")') !== null ||
               document.querySelector('a[href*="pagefrom="]') !== null;
      });
      
      if (!hasNextPage || currentPage > 20) { // Limite de sécurité
        log(`📄 Fin du scraping - page ${currentPage} ou limite atteinte`);
        break;
      }
      
    } catch (error) {
      log(`❌ Erreur scraping page ${currentPage}: ${error.message}`);
      break;
    }
    
  } while (true);
  
  log(`✅ Scraping HTML: ${allCompetences.length} compétences extraites`);
  return allCompetences;
}

// Récupérer le contenu des pages avec DEBUG INTENSIF
async function getPageContents(page, pageIds) {
  log(`📥 === DÉBUT RÉCUPÉRATION CONTENU ${pageIds.length} PAGES ===`);
  log(`🔢 Page IDs: ${pageIds.join(', ')}`);
  
  const contentUrl = new URL(config.urls.api);
  contentUrl.searchParams.set('action', 'query');
  contentUrl.searchParams.set('pageids', pageIds.join('|'));
  contentUrl.searchParams.set('prop', 'revisions|info');
  contentUrl.searchParams.set('rvprop', 'content|ids|timestamp');
  contentUrl.searchParams.set('rvslots', 'main');
  contentUrl.searchParams.set('format', 'json');
  contentUrl.searchParams.set('formatversion', '2');
  
  log(`🔗 URL contenu: ${contentUrl.toString()}`);
  
  try {
    // Utiliser page.goto() pour préserver les cookies CAS
    const response = await page.goto(contentUrl.toString(), { waitUntil: 'networkidle2' });
    const responseText = await page.content();
    
    // Extraire le JSON de la réponse
    const jsonMatch = responseText.match(/<pre[^>]*>({.*})<\/pre>/s);
    if (!jsonMatch) {
      log(`❌ Format de réponse contenu inattendu: ${responseText.substring(0, 500)}`);
      throw new Error('Format de réponse contenu non JSON');
    }
    
    const contentData = JSON.parse(jsonMatch[1]);
    log(`📄 Response status: ${response.status()}`);
    log(`📄 Response data keys: ${Object.keys(contentData)}`);
    if (contentData.query && contentData.query.pages) {
      log(`📄 Pages count: ${Object.keys(contentData.query.pages).length}`);
    }
    
    log(`📄 Réponse contenu reçue - Keys: ${Object.keys(contentData)}`);
    
    if (contentData.error) {
      log(`❌ ERREUR API CONTENU: ${JSON.stringify(contentData.error)}`);
      throw new Error(`Content API Error: ${contentData.error.code} - ${contentData.error.info}`);
    }
    
    if (!contentData.query) {
      log(`❌ PAS DE QUERY dans réponse contenu`);
      log(`📄 Réponse complète: ${JSON.stringify(contentData)}`);
      throw new Error('Pas de section query dans la réponse contenu');
    }
    
    if (!contentData.query.pages) {
      log(`❌ PAS DE PAGES dans query contenu`);
      log(`📄 Query keys: ${Object.keys(contentData.query)}`);
      throw new Error('Pas de pages dans la réponse contenu');
    }
    
    const pages = Object.values(contentData.query.pages);
    log(`📚 ${pages.length} pages reçues pour traitement`);
    
    const competences = [];
    
    for (let i = 0; i < pages.length; i++) {
      const pageData = pages[i];
      log(`📖 Traitement page ${i+1}/${pages.length}: "${pageData.title}" (ID: ${pageData.pageid})`);
      
      // Debug du contenu de la page
      if (pageData.revisions && pageData.revisions.length > 0) {
        const revision = pageData.revisions[0];
        log(`📝 Révision trouvée - slots: ${Object.keys(revision.slots || {})}`);
        if (revision.slots && revision.slots.main) {
          const contentLength = revision.slots.main.content?.length || 0;
          log(`📄 Contenu main: ${contentLength} caractères`);
          if (contentLength > 0) {
            log(`🔍 Début contenu: ${revision.slots.main.content.substring(0, 200)}...`);
          }
        }
      } else {
        log(`❌ Aucune révision trouvée pour page "${pageData.title}"`);
      }
      
      const competence = parseCompetence(pageData);
      if (competence) {
        log(`✅ Compétence parsée: ${competence.objectif_id} - ${competence.intitule.substring(0, 50)}...`);
        competences.push(competence);
      } else {
        log(`❌ Échec parsing pour page "${pageData.title}"`);
      }
    }
    
    log(`📥 === FIN RÉCUPÉRATION CONTENU ===`);
    log(`✅ ${competences.length}/${pages.length} compétences extraites avec succès`);
    
    return competences;
    
  } catch (error) {
    log(`❌ ERREUR CRITIQUE récupération contenu: ${error.message}`);
    log(`📄 Stack trace: ${error.stack}`);
    throw error;
  }
}

// Parser une compétence
function parseCompetence(pageData) {
  try {
    const title = pageData.title || '';
    // Chercher le pattern OIC réel: OIC-XXX-XX-A (sans partie finale)
    const match = title.match(/OIC-(\d{3})-(\d{2})-([AB])/);
    
    if (!match) {
      log(`❌ Pattern OIC non trouvé dans: "${title}"`);
      return null;
    }
    
    const [fullId, item, rubriqueCode, rang] = match;
    const ordre = 1; // Valeur par défaut
    
    let content = '';
    if (pageData.revisions?.[0]?.slots?.main?.content) {
      content = pageData.revisions[0].slots.main.content;
    } else if (pageData.revisions?.[0]?.content) {
      content = pageData.revisions[0].content;
    }
    
    const rubriques = {
      '01': 'Génétique', '02': 'Immunopathologie', '03': 'Inflammation',
      '04': 'Cancérologie', '05': 'Pharmacologie', '06': 'Douleur',
      '07': 'Santé publique', '08': 'Thérapeutique', '09': 'Urgences',
      '10': 'Vieillissement', '11': 'Interprétation'
    };
    
    let intitule = title;
    let description = '';
    
    const intituleMatch = content.match(/'''(.+?)'''|==\s*(.+?)\s*==/);
    if (intituleMatch) {
      intitule = (intituleMatch[1] || intituleMatch[2]).trim();
    }
    
    description = content
      .replace(/\[\[(.+?)\|(.+?)\]\]/g, '$2')
      .replace(/\[\[(.+?)\]\]/g, '$1')
      .replace(/'''(.+?)'''/g, '$1')
      .replace(/''(.+?)''/g, '$1')
      .replace(/{{.+?}}/gs, '')
      .replace(/<ref.*?\/>/g, '')
      .replace(/<.*?>/g, '')
      .trim();
    
    const firstPara = description.match(/\n\n(.+?)(?=\n\n|$)/s);
    if (firstPara) {
      description = firstPara[1].trim();
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
    };
    
  } catch (error) {
    log(`❌ Erreur parsing ${pageData.title}: ${error.message}`);
    return null;
  }
}

// Vérifier les compétences incomplètes en base (logique avancée)
async function getIncompleteCompetences() {
  log('🔍 Vérification avancée des compétences incomplètes...');
  
  try {
    const { data: allCompetences, error } = await supabase
      .from('backup_oic_competences')
      .select('objectif_id, description, intitule');
    
    if (error) {
      throw new Error(`Erreur récupération compétences: ${error.message}`);
    }
    
    // Logique avancée de détection d'incomplétude
    const incompletes = allCompetences.filter(comp => {
      const desc = comp.description?.trim() || '';
      const titre = comp.intitule?.trim() || '';
      
      // Cas 1: Description vide ou null
      if (!desc) return true;
      
      // Cas 2: Description trop courte (< 40 caractères)
      if (desc.length < 40) return true;
      
      // Cas 3: Extraction HTML mal parsée
      if (/==|Titre:|{{\||<br\s*\/?>/i.test(desc)) return true;
      
      // Cas 4: Fragments incomplets (commence par - ou *)
      if (/^[-*]\s/.test(desc)) return true;
      
      // Cas 5: Entités HTML non décodées
      if (/&lt;|&gt;|&amp;|&nbsp;/.test(desc)) return true;
      
      // Cas 6: Titre corrompu avec balises MediaWiki
      if (/\[\[.*\]\]/.test(titre)) return true;
      
      return false;
    });
    
    log(`📊 ${incompletes.length} compétences incomplètes détectées (sur ${allCompetences.length} total)`);
    log(`🔍 Critères: descriptions vides, < 40 chars, HTML corrompu, fragments, entités HTML, titres corrompus`);
    
    if (incompletes.length > 0) {
      log(`🔍 Exemples de compétences incomplètes:`);
      incompletes.slice(0, 5).forEach((comp, i) => {
        const reason = !comp.description?.trim() ? 'vide' : 
                     comp.description.length < 40 ? 'trop courte' :
                     /==|Titre:|{{\||<br\s*\/?>/i.test(comp.description) ? 'HTML corrompu' :
                     /^[-*]\s/.test(comp.description) ? 'fragment' :
                     /&lt;|&gt;|&amp;|&nbsp;/.test(comp.description) ? 'entités HTML' :
                     /\[\[.*\]\]/.test(comp.intitule) ? 'titre corrompu' : 'autre';
        log(`   ${i+1}. ${comp.objectif_id} - ${comp.intitule || 'Sans titre'} (${reason})`);
      });
    }
    
    return new Set(incompletes.map(comp => comp.objectif_id));
    
  } catch (error) {
    log(`❌ Erreur vérification incomplètes: ${error.message}`);
    return new Set();
  }
}

// Insertion dans Supabase avec mode complétion
async function insertToSupabase(competences, stats) {
  const validData = competences.filter(c => c && c.objectif_id);
  log(`✅ ${validData.length} compétences valides à insérer`);
  
  const chunks = [];
  for (let i = 0; i < validData.length; i += 100) {
    chunks.push(validData.slice(i, i + 100));
  }
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    log(`💾 Insertion chunk ${i+1}/${chunks.length} (${chunk.length} items)...`);
    
    try {
      const { data, error } = await supabase
        .from('backup_oic_competences')
        .upsert(chunk, { 
          onConflict: 'objectif_id',
          ignoreDuplicates: false 
        })
        .select();
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      stats.totalInserted += data?.length || 0;
      log(`✅ Chunk ${i+1} inséré avec succès (${data?.length || 0} records)`);
      
    } catch (error) {
      log(`❌ Erreur chunk ${i+1}: ${error.message}`);
      stats.errors.push({ 
        type: 'INSERT_ERROR', 
        chunk: i+1, 
        error: error.message, 
        timestamp: new Date().toISOString() 
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

// Rapport final avec statistiques de complétion
async function generateFinalReport(stats) {
  log('\n📊 GÉNÉRATION RAPPORT FINAL...');
  log('===============================');
  
  try {
    // Compter le total de compétences
    const { count: totalCount, error: countError } = await supabase
      .from('backup_oic_competences')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw new Error(`Erreur comptage total: ${countError.message}`);
    }
    
    // Compter les compétences avec descriptions vides
    const { count: incompleteCount, error: incompleteError } = await supabase
      .from('backup_oic_competences')
      .select('*', { count: 'exact', head: true })
      .or('description.is.null,description.eq.');
    
    if (incompleteError) {
      throw new Error(`Erreur comptage incomplètes: ${incompleteError.message}`);
    }
    
    const duration = Math.round((Date.now() - stats.startTime) / 1000);
    const totalCompleteness = ((totalCount / 4872) * 100).toFixed(2);
    const completeCount = totalCount - incompleteCount;
    const descriptionCompleteness = totalCount > 0 ? ((completeCount / totalCount) * 100).toFixed(2) : 0;
    
    if (stats.completionMode) {
      log(`\n🔄 RAPPORT COMPLÉTION TERMINÉ !`);
      log(`============================`);
      log(`⏱️  Durée totale: ${duration}s (${Math.round(duration/60)}min)`);
      log(`🎯 Compétences ciblées: ${stats.targetIds?.size || 0}`);
      log(`📊 Pages trouvées: ${stats.totalFound}`);
      log(`✅ Pages traitées: ${stats.totalProcessed}`);
      log(`💾 Compétences mises à jour: ${stats.totalInserted}`);
      log(`❌ Erreurs: ${stats.totalErrors}`);
      log(`📈 Compétences complètes: ${completeCount}/${totalCount} (${descriptionCompleteness}%)`);
      log(`🔢 Compétences incomplètes restantes: ${incompleteCount}`);
      
      if (incompleteCount === 0) {
        log(`🎉 MISSION ACCOMPLIE ! Toutes les descriptions sont maintenant complètes !`);
      } else if (incompleteCount < 100) {
        log(`🔥 QUASI-TERMINÉ ! Seulement ${incompleteCount} descriptions manquantes`);
      } else {
        log(`⚠️  PROGRÈS RÉALISÉ : ${stats.totalInserted} descriptions complétées`);
      }
    } else {
      log(`\n🎉 EXTRACTION TERMINÉE !`);
      log(`======================`);
      log(`⏱️  Durée totale: ${duration}s (${Math.round(duration/60)}min)`);
      log(`📊 Pages trouvées: ${stats.totalFound}`);
      log(`✅ Pages traitées: ${stats.totalProcessed}`);
      log(`💾 Compétences insérées: ${stats.totalInserted}`);
      log(`❌ Erreurs: ${stats.totalErrors}`);
      log(`📈 Total en base: ${totalCount}/4872 (${totalCompleteness}%)`);
      log(`🧩 Descriptions complètes: ${completeCount}/${totalCount} (${descriptionCompleteness}%)`);
      
      if (totalCount >= 4872) {
        log(`🎯 OBJECTIF ATTEINT ! Les 4,872 compétences ont été extraites avec succès !`);
      } else if (totalCount > 4000) {
        log(`🔥 EXTRACTION QUASI-COMPLÈTE ! ${totalCount} compétences extraites (${4872-totalCount} manquantes)`);
      } else {
        log(`⚠️  EXTRACTION PARTIELLE : ${totalCount} compétences extraites`);
      }
    }
    
    if (stats.errors.length > 0) {
      log(`\n⚠️  ERREURS DÉTECTÉES (${stats.errors.length}):`);
      stats.errors.slice(0, 10).forEach((err, i) => {
        log(`   ${i+1}. [${err.type}] ${err.error}`);
      });
      if (stats.errors.length > 10) {
        log(`   ... et ${stats.errors.length - 10} autres erreurs`);
      }
    }
    
    // Sauvegarder les statistiques de complétion
    if (stats.completionMode) {
      // Créer le dossier .cache s'il n'existe pas
      if (!fs.existsSync('.cache')) {
        fs.mkdirSync('.cache');
      }
      
      fs.writeFileSync('.cache/extraction-success.json', JSON.stringify({
        mode: 'completion',
        timestamp: new Date().toISOString(),
        duration: duration,
        targetCompetences: stats.targetIds?.size || 0,
        processed: stats.totalProcessed,
        updated: stats.totalInserted,
        errors: stats.totalErrors,
        totalInDatabase: totalCount,
        completeDescriptions: completeCount,
        incompleteDescriptions: incompleteCount,
        completenessPercentage: parseFloat(descriptionCompleteness),
        success: incompleteCount === 0
      }, null, 2));
      log(`💾 Rapport de complétion sauvegardé: .cache/extraction-success.json`);
    }
    
  } catch (error) {
    log(`❌ Erreur génération rapport: ${error.message}`);
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Unhandled Rejection: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`❌ Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Lancement
extractAllCompetences()
  .then(() => {
    log('✅ Extraction terminée avec succès');
    process.exit(0);
  })
  .catch((error) => {
    log(`❌ Extraction échouée: ${error.message}`);
    process.exit(1);
  });