// extract-oic-competences.js
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
    
    // 2. Vérifier l'authentification
    await page.goto(config.urls.category, { waitUntil: 'networkidle2' });
    const isAuthenticated = await page.evaluate(() => {
      return !window.location.href.includes('cas/login');
    });
    
    if (!isAuthenticated) {
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

// Authentification CAS
async function authenticateCAS(page) {
  await page.goto(config.urls.category, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Vérifier si redirection vers CAS
  if (page.url().includes('cas/login') || page.url().includes('uness.fr')) {
    log('🔑 Début du processus d\'authentification UNESS (2 étapes)...');
    
    // ÉTAPE 1 : Saisir l'email
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    log('📧 ÉTAPE 1 : Saisie de l\'adresse email...');
    const html1 = await page.content();
    log(`🔍 URL étape 1: ${page.url()}`);
    
    // Chercher le champ email (première étape)
    let emailField = null;
    const emailSelectors = [
      'input[type="email"]', 
      'input[name="email"]', 
      'input[placeholder*="email"]',
      'input[placeholder*="adresse"]',
      '#email',
      'input[type="text"]' // fallback
    ];
    
    for (const selector of emailSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          emailField = selector;
          log(`✅ Champ email trouvé avec: ${selector}`);
          break;
        }
      } catch (e) {
        log(`⚠️ Sélecteur email ${selector} non trouvé`);
      }
    }
    
    if (!emailField) {
      log(`❌ Champ email non trouvé`);
      log(`🔍 Contenu page 1 (1000 premiers caractères):`);
      log(html1.substring(0, 1000));
      throw new Error('Champ email non trouvé');
    }
    
    // Saisir l'email
    await page.type(emailField, config.cas.username);
    log(`✅ Email saisi: ${config.cas.username}`);
    
    // Chercher le bouton "SE CONNECTER" de la première étape
    let connectButton1 = null;
    const connectSelectors1 = [
      'button:contains("SE CONNECTER")',
      'input[value*="CONNECTER"]',
      'button[type="submit"]',
      'input[type="submit"]',
      'button'
    ];
    
    for (const selector of connectSelectors1) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate(el => el.textContent || el.value, element);
          if (text && text.includes('CONNECTER')) {
            connectButton1 = selector;
            log(`✅ Bouton connexion étape 1 trouvé avec: ${selector}`);
            break;
          }
        }
      } catch (e) {
        // Continuer
      }
    }
    
    if (!connectButton1) {
      // Essayer un sélecteur générique
      connectButton1 = 'button, input[type="submit"]';
      log(`⚠️ Utilisation du bouton générique pour étape 1`);
    }
    
    // Cliquer sur SE CONNECTER (étape 1)
    log('🔄 Clic sur SE CONNECTER (étape 1)...');
    try {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }),
        page.click(connectButton1)
      ]);
    } catch (navError) {
      log(`⚠️ Timeout navigation étape 1, continuons quand même...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // ÉTAPE 2 : Saisir le mot de passe
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    log('🔐 ÉTAPE 2 : Saisie du mot de passe...');
    const html2 = await page.content();
    log(`🔍 URL étape 2: ${page.url()}`);
    
    // Chercher le champ password (deuxième étape)
    let passwordField = null;
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="mot de passe"]',
      'input[placeholder*="password"]',
      '#password'
    ];
    
    for (const selector of passwordSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          passwordField = selector;
          log(`✅ Champ password trouvé avec: ${selector}`);
          break;
        }
      } catch (e) {
        log(`⚠️ Sélecteur password ${selector} non trouvé`);
      }
    }
    
    if (!passwordField) {
      log(`❌ Champ password non trouvé`);
      log(`🔍 Contenu page 2 (1000 premiers caractères):`);
      log(html2.substring(0, 1000));
      throw new Error('Champ password non trouvé');
    }
    
    // Saisir le mot de passe
    await page.type(passwordField, config.cas.password);
    log(`✅ Mot de passe saisi`);
    
    // Chercher le bouton "SE CONNECTER" de la deuxième étape
    let connectButton2 = null;
    const connectSelectors2 = [
      'button:contains("SE CONNECTER")',
      'input[value*="CONNECTER"]',
      'button[type="submit"]',
      'input[type="submit"]',
      'button'
    ];
    
    for (const selector of connectSelectors2) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate(el => el.textContent || el.value, element);
          if (text && text.includes('CONNECTER')) {
            connectButton2 = selector;
            log(`✅ Bouton connexion étape 2 trouvé avec: ${selector}`);
            break;
          }
        }
      } catch (e) {
        // Continuer
      }
    }
    
    if (!connectButton2) {
      connectButton2 = 'button, input[type="submit"]';
      log(`⚠️ Utilisation du bouton générique pour étape 2`);
    }
    
    // Cliquer sur SE CONNECTER (étape 2)
    log('🔄 Clic sur SE CONNECTER (étape 2)...');
    try {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }),
        page.click(connectButton2)
      ]);
    } catch (navError) {
      log(`⚠️ Timeout navigation étape 2, continuons quand même...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    log(`✅ Authentification terminée. URL finale: ${page.url()}`);
  }
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