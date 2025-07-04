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
    
    // 1. Authentification CAS
    log('🔐 Authentification CAS...');
    await authenticateCAS(page);
    
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
    
    // 3. Extraction via API MediaWiki
    log('📊 Début extraction via API MediaWiki...');
    const allCompetences = await extractViaAPI(page, stats);
    
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

// Extraction via API MediaWiki
async function extractViaAPI(page, stats) {
  const allCompetences = [];
  let continueToken = '';
  let pageCount = 0;
  
  do {
    const apiUrl = new URL(config.urls.api);
    apiUrl.searchParams.set('action', 'query');
    apiUrl.searchParams.set('list', 'categorymembers');
    apiUrl.searchParams.set('cmtitle', 'Catégorie:Objectif_de_connaissance');
    apiUrl.searchParams.set('cmlimit', '500');
    apiUrl.searchParams.set('format', 'json');
    if (continueToken) {
      apiUrl.searchParams.set('cmcontinue', continueToken);
    }
    
    try {
      const apiData = await page.evaluate(async (url) => {
        const response = await fetch(url);
        return await response.json();
      }, apiUrl.toString());
      
      if (apiData.error) {
        throw new Error(`API Error: ${apiData.error.code} - ${apiData.error.info}`);
      }
      
      const pageIds = apiData.query?.categorymembers
        ?.filter(p => p.title?.match(/OIC-\d{3}-\d{2}-[AB]-\d{2}/))
        ?.map(p => p.pageid) || [];
      
      stats.totalFound += pageIds.length;
      log(`📄 Lot ${++pageCount}: ${pageIds.length} compétences trouvées (Total: ${stats.totalFound})`);
      
      // Traiter par batches de 50
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
          stats.errors.push({ 
            type: 'BATCH_ERROR', 
            batch: Math.floor(i/50) + 1, 
            error: error.message, 
            timestamp: new Date().toISOString() 
          });
        }
        
        // Pause entre batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      continueToken = apiData.continue?.cmcontinue || '';
      
    } catch (error) {
      log(`❌ Erreur page API ${pageCount}: ${error.message}`);
      stats.errors.push({ 
        type: 'API_ERROR', 
        page: pageCount, 
        error: error.message, 
        timestamp: new Date().toISOString() 
      });
      break;
    }
    
  } while (continueToken);
  
  return allCompetences;
}

// Récupérer le contenu des pages
async function getPageContents(page, pageIds) {
  const contentUrl = new URL(config.urls.api);
  contentUrl.searchParams.set('action', 'query');
  contentUrl.searchParams.set('pageids', pageIds.join('|'));
  contentUrl.searchParams.set('prop', 'revisions|info');
  contentUrl.searchParams.set('rvprop', 'content|ids|timestamp');
  contentUrl.searchParams.set('rvslots', 'main');
  contentUrl.searchParams.set('format', 'json');
  contentUrl.searchParams.set('formatversion', '2');
  
  const contentData = await page.evaluate(async (url) => {
    const response = await fetch(url);
    return await response.json();
  }, contentUrl.toString());
  
  const competences = [];
  
  for (const pageData of Object.values(contentData.query?.pages || {})) {
    const competence = parseCompetence(pageData);
    if (competence) {
      competences.push(competence);
    }
  }
  
  return competences;
}

// Parser une compétence
function parseCompetence(pageData) {
  try {
    const title = pageData.title || '';
    const match = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/);
    
    if (!match) return null;
    
    const [fullId, item, rubriqueCode, rang, ordre] = match;
    
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

// Insertion dans Supabase
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
        .from('oic_competences')
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

// Rapport final
async function generateFinalReport(stats) {
  log('\n📊 GÉNÉRATION RAPPORT FINAL...');
  log('===============================');
  
  try {
    const { count, error } = await supabase
      .from('oic_competences')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      throw new Error(`Erreur comptage: ${error.message}`);
    }
    
    const duration = Math.round((Date.now() - stats.startTime) / 1000);
    const completeness = ((count / 4872) * 100).toFixed(2);
    
    log(`\n🎉 EXTRACTION TERMINÉE !`);
    log(`======================`);
    log(`⏱️  Durée totale: ${duration}s (${Math.round(duration/60)}min)`);
    log(`📊 Pages trouvées: ${stats.totalFound}`);
    log(`✅ Pages traitées: ${stats.totalProcessed}`);
    log(`💾 Compétences insérées: ${stats.totalInserted}`);
    log(`❌ Erreurs: ${stats.totalErrors}`);
    log(`📈 Total en base: ${count}/4872 (${completeness}%)`);
    
    if (count >= 4872) {
      log(`🎯 OBJECTIF ATTEINT ! Les 4,872 compétences ont été extraites avec succès !`);
    } else if (count > 4000) {
      log(`🔥 EXTRACTION QUASI-COMPLÈTE ! ${count} compétences extraites (${4872-count} manquantes)`);
    } else {
      log(`⚠️  EXTRACTION PARTIELLE : ${count} compétences extraites`);
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