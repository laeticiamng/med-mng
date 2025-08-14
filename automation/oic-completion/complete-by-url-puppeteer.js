// automation/oic-completion/complete-by-url-puppeteer.js
// Complète les OIC existantes à partir de url_source (LiSA).
// Auth CAS/OAuth2 avec Puppeteer pour gérer l'authentification complexe
// Source: API MediaWiki (revisions, rvslots=main) -> normalisation -> update Supabase si contenu substantiel.

import { createClient } from '@supabase/supabase-js';
import pLimit from 'p-limit';
import crypto from 'node:crypto';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Variables d\'environnement disponibles:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Définie' : '❌ Manquante');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Définie' : '❌ Manquante');
console.log('CAS_USERNAME:', process.env.CAS_USERNAME ? '✅ Définie' : '❌ Manquante');
console.log('CAS_PASSWORD:', process.env.CAS_PASSWORD ? '✅ Définie' : '❌ Manquante');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CAS_USERNAME = process.env.CAS_USERNAME;
const CAS_PASSWORD = process.env.CAS_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!CAS_USERNAME || !CAS_PASSWORD) {
  console.error('Missing CAS_USERNAME or CAS_PASSWORD');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { 
  auth: { persistSession: false } 
});

// CLI args
const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i+1] : def;
};
const BATCH = parseInt(arg('batch', '400'), 10);
const MAX_ITEMS = parseInt(arg('maxItems', '5000'), 10);
const CONCURRENCY = parseInt(arg('concurrency', '3'), 10);

console.log(`🎯 Configuration: batch=${BATCH}, maxCompetences=${MAX_ITEMS}, concurrency=${CONCURRENCY}`);

const hash = s => crypto.createHash('sha256').update(s || '').digest('hex');

// ===== Détection page de login =====
function looksLikeLogin(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  return t.includes('veuillez saisir votre adresse e-mail') || 
         t.includes('connexion') || 
         t.includes('authentification') ||
         t.includes('bienvenue !');
}

// ===== Assurer auth et navigation avec retry =====
async function ensureLoggedAndOpen(browser, page, url, reloginFn, attempts = 2) {
  for (let i = 0; i <= attempts; i++) {
    console.log(`🔗 Tentative ${i + 1}/${attempts + 1} pour ${url}`);
    
    try {
      // Vérifier que la page n'est pas fermée avant de naviguer
      if (page.isClosed()) {
        console.log(`⚠️ Page fermée détectée, création d'une nouvelle page`);
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      }
      
      const resp = await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 45000 
      });
      
      // Attendre que la page soit stable
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Si redirigé vers auth, ou si on voit la page de login → relogin
      const urlNow = page.url();
      if (urlNow.includes('auth.uness.fr') || urlNow.includes('cas.uness.fr')) {
        console.log(`🔐 Redirection CAS détectée (tentative ${i + 1})`);
        if (i === attempts) throw new Error('auth_loop');
        await reloginFn();
        // Attendre que l'auth soit complète avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }
      
      // Vérifier le contenu de la page
      let txtHead = '';
      try {
        txtHead = await page.evaluate(() => {
          if (!document.body) return '';
          const text = document.body.innerText || '';
          return text.slice(0, 1000).toLowerCase();
        });
      } catch (evalError) {
        console.log(`⚠️ Erreur lors de l'évaluation du contenu: ${evalError.message}`);
        if (i === attempts) throw evalError;
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      // Si contenu ressemble à la page de login
      if (looksLikeLogin(txtHead)) {
        console.log(`🔐 Page de login détectée dans le contenu (tentative ${i + 1})`);
        console.log(`🔍 Extrait du contenu: "${txtHead.slice(0, 200)}"`);
        if (i === attempts) throw new Error('login_page_content_detected');
        await reloginFn();
        // Attendre que l'auth soit complète avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }
      
      // OK, on reste sur livret avec contenu valide
      try {
        await page.waitForNetworkIdle({ timeout: 5000 });
      } catch (networkIdleError) {
        console.log(`⚠️ Network idle timeout pour ${url}, mais on continue`);
      }
      
      console.log(`✅ Navigation réussie vers ${url}`);
      return;
      
    } catch (navigationError) {
      console.log(`❌ Erreur navigation (tentative ${i + 1}): ${navigationError.message}`);
      
      // Cas spéciaux des frames détachés
      if (navigationError.message.includes('detached') || navigationError.message.includes('Detached')) {
        console.log(`🔄 Frame détaché détecté, nouvelle tentative avec authentification`);
        if (i < attempts) {
          await reloginFn();
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
      }
      
      if (i === attempts) throw navigationError;
      
      // Essayer une réauth avant la prochaine tentative
      if (navigationError.message.includes('auth') || i > 0) {
        await reloginFn();
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
}

// ===== AUTH CAS/OAuth2 avec Puppeteer =====
async function casLoginWithPuppeteer(browser) {
  console.log('🔐 Démarrage authentification CAS avec Puppeteer...');
  
  // Si pas de browser fourni, en créer un
  let ownBrowser = false;
  if (!browser) {
    ownBrowser = true;
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }
  
  // Fermer toutes les pages existantes sauf une pour éviter les conflits de cookies
  const pages = await browser.pages();
  for (let i = 1; i < pages.length; i++) {
    await pages[i].close().catch(() => {});
  }

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    const protectedUrl = 'https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Objectif_de_connaissance';
    
    console.log('🌐 Navigation vers la page protégée...');
    await page.goto(protectedUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Vérifier si on est déjà sur LiSA (pas de redirection CAS)
    const currentUrl = page.url();
    if (currentUrl.includes('livret.uness.fr/lisa')) {
      console.log('✅ Déjà authentifié ou accès direct');
      await page.close();
      if (ownBrowser) await browser.close();
      return browser;
    }
    
    // On est sur la page CAS - procéder à l'authentification
    console.log('🔑 Détection de la page CAS, authentification...');
    
    // Prendre une capture d'écran pour debug
    await page.screenshot({ path: '/tmp/cas-debug.png', fullPage: true });
    console.log('📸 Capture d\'écran CAS sauvegardée');
    
    // Essayer de trouver les champs d'authentification avec plusieurs sélecteurs
    const possibleUserSelectors = [
      'input[name="username"]',
      'input[name="email"]', 
      'input[type="email"]',
      'input[id="username"]',
      'input[id="email"]',
      '#username',
      '#email'
    ];
    
    let usernameField = null;
    for (const selector of possibleUserSelectors) {
      try {
        usernameField = await page.$(selector);
        if (usernameField) {
          console.log(`✅ Champ username trouvé avec: ${selector}`);
          break;
        }
      } catch (e) {
        // Ignore et continue
      }
    }
    
    if (!usernameField) {
      console.error('❌ Aucun champ username trouvé');
      throw new Error('Champ username/email non trouvé');
    }
    
    // Remplir le champ username
    await usernameField.type(CAS_USERNAME);
    console.log('📝 Username saisi');
    
    // Chercher le champ password (peut ne pas être visible immédiatement)
    const possiblePasswordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      'input[id="password"]',
      '#password'
    ];
    
    let passwordField = null;
    let submitButton = null;
    
    // Essayer de trouver le champ password ou un bouton pour continuer
    for (let attempt = 0; attempt < 3; attempt++) {
      console.log(`🔍 Tentative ${attempt + 1}/3 de recherche du champ password...`);
      
      for (const selector of possiblePasswordSelectors) {
        try {
          passwordField = await page.$(selector);
          if (passwordField) {
            console.log(`✅ Champ password trouvé avec: ${selector}`);
            break;
          }
        } catch (e) {
          // Ignore et continue
        }
      }
      
      if (passwordField) break;
      
      // Si pas de champ password, chercher un bouton "Continuer" ou "Suivant"
      const continueButtons = await page.$$('button, input[type="submit"]');
      if (continueButtons.length > 0) {
        console.log('🔄 Pas de champ password, tentative de clic sur bouton continuer...');
        await continueButtons[0].click();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre que la page se charge
        continue;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Si on a trouvé le champ password
    if (passwordField) {
      await passwordField.type(CAS_PASSWORD);
      console.log('🔑 Password saisi');
    } else {
      console.warn('⚠️ Champ password non trouvé, tentative de soumission directe...');
    }
    
    // Chercher et cliquer sur le bouton de soumission
    const possibleSubmitSelectors = [
      'input[type="submit"]',
      'button[type="submit"]', 
      'button[name="submit"]',
      'button:contains("Connexion")',
      'button:contains("Se connecter")',
      'button:contains("Login")',
      'form button'
    ];
    
    for (const selector of possibleSubmitSelectors) {
      try {
        submitButton = await page.$(selector);
        if (submitButton) {
          console.log(`✅ Bouton submit trouvé avec: ${selector}`);
          break;
        }
      } catch (e) {
        // Ignore et continue
      }
    }
    
    if (submitButton) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
        submitButton.click()
      ]);
    } else {
      console.warn('⚠️ Pas de bouton submit trouvé, tentative de soumission par Enter...');
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    }
    
    // Vérifier que nous sommes bien arrivés sur LiSA
    const finalUrl = page.url();
    if (!finalUrl.includes('livret.uness.fr/lisa')) {
      console.error('❌ URL finale inattendue:', finalUrl);
      throw new Error('Authentification CAS semble avoir échoué');
    }
    
    console.log('✅ Authentification CAS réussie avec Puppeteer');
    
    // Vérifier que les cookies sont bien stockés dans le browser context
    const cookies = await page.cookies();
    console.log(`🍪 ${cookies.length} cookies récupérés après authentification`);
    
    await page.close();
    
    if (ownBrowser) await browser.close();
    return browser;
    
  } catch (error) {
    if (ownBrowser) await browser.close();
    throw error;
  }
}

// ===== Extraction directe avec Puppeteer =====
function buildExtractor() {
  return `
(() => {
  // Extraction "copier-coller" intégrale du contenu visible
  // Prend la zone centrale MediaWiki et préserve la structure
  const pickText = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return '';
    
    // Remplacer <br> par \\n avant d'interroger innerText
    el.querySelectorAll('br').forEach(br => br.replaceWith(document.createTextNode('\\n')));
    
    // Nettoyer les éléments de navigation/menu
    const toRemove = el.querySelectorAll('#toc, .navigation, .mw-navigation, .sidebar, .navbox');
    toRemove.forEach(elem => elem.remove());
    
    const txt = (el.innerText || '').replace(/\\u00A0/g, ' ').trim();
    return txt;
  };

  // Essayer plusieurs sélecteurs par ordre de préférence
  const candidates = ['#mw-content-text', '.mw-parser-output', 'article', 'main', '#content'];
  for (const c of candidates) {
    const t = pickText(c);
    if (t && t.length >= 1) return t;
  }
  
  // Dernier recours : tout le body
  return (document.body && document.body.innerText || '').replace(/\\u00A0/g, ' ').trim();
})()
`;
}

// ===== Helper pour extraire le code item depuis objectif_id =====
function itemCodeFromObjectif(objectifId = '') {
  // "OIC-351-03-A" -> "351"
  const m = objectifId.match(/^OIC-(\d{3})-/);
  return m ? m[1] : null;
}

// ===== Mise à jour Supabase avec RETURNING pour vérification =====
async function updateDescription(objectifId, text, httpCode) {
  const newHash = hash(text || '');
  
  console.log(`   🔄 ${objectifId}: UPDATE avec ${text.length} caractères, hash=${newHash.substring(0,8)}...`);
  
  const { data, error } = await supabase
    .from('backup_oic_competences')
    .update({
      description: text ?? '',
      completion_status: 'updated',
      completion_last_http: httpCode ?? 200,
      completion_last_error: null,
      source_etag: newHash,
      completion_updated_at: new Date().toISOString()
    })
    .eq('objectif_id', objectifId.trim())
    .select('objectif_id'); // RETURNING pour forcer la vérification

  if (error) {
    console.log(`   ❌ ${objectifId}: Erreur Supabase: ${error.message}`);
    throw new Error(`supabase_update_error: ${error.message}`);
  }
  
  if (!data || data.length !== 1) {
    console.log(`   ❌ ${objectifId}: Aucune ligne mise à jour (data.length=${data?.length || 0})`);
    throw new Error('no_row_updated');
  }
  
  console.log(`   ✅ ${objectifId}: LIGNE MISE À JOUR CONFIRMÉE`);
  return true;
}

// ===== Traitement d'une compétence avec trace complète =====
async function processOne(browser, row) {
  const objId = row.objectif_id?.trim();
  const url = (row.url_source || '').trim();
  
  console.log(`   🔍 DÉBUT ${objId}: URL=${url}`);
  
  if (!url) {
    console.log(`   ❌ ${objId}: URL manquante`);
    await mark(objId, { completion_status: 'skipped_error', completion_last_error: 'missing_url' });
    return { updated: 0, skippedError: 1, unchanged: 0 };
  }

  let page = null;
  try {
    // Créer une nouvelle page avec configuration robuste
    page = await browser.newPage();
    page.setDefaultTimeout(45000);
    
    // Configuration anti-détection et stabilité
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });
    
    // Bloquer les ressources non essentielles pour éviter les timeouts
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });
    
    console.log(`   🌐 ${objId}: Navigation vers la page...`);
    
    // Fonction de relogin qui utilise le même browser mais une nouvelle page
    const reloginFn = async () => {
      console.log(`🔐 Démarrage authentification CAS avec Puppeteer...`);
      const authPage = await browser.newPage();
      try {
        await authPage.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        const protectedUrl = 'https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Objectif_de_connaissance';
        
        console.log('🌐 Navigation vers la page protégée...');
        await authPage.goto(protectedUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Vérifier si on est déjà sur LiSA (pas de redirection CAS)
        const currentUrl = authPage.url();
        if (currentUrl.includes('livret.uness.fr/lisa')) {
          console.log('✅ Déjà authentifié');
          return;
        }
        
        // On est sur la page CAS - procéder à l'authentification
        console.log('🔑 Détection de la page CAS, authentification...');
        
        // Authentification CAS
        const usernameField = await authPage.$('input[name="username"]');
        if (usernameField) {
          await usernameField.type(CAS_USERNAME);
          console.log('📝 Username saisi');
        }
        
        // Attendre et remplir le password
        await new Promise(resolve => setTimeout(resolve, 1000));
        const passwordField = await authPage.$('input[name="password"]');
        if (passwordField) {
          await passwordField.type(CAS_PASSWORD);
          console.log('🔑 Password saisi');
        }
        
        const submitButton = await authPage.$('button[type="submit"]');
        if (submitButton) {
          await Promise.all([
            authPage.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
            submitButton.click()
          ]);
        }
        
        console.log('✅ Authentification CAS réussie');
        
      } finally {
        await authPage.close().catch(() => {});
      }
    };
    
    await ensureLoggedAndOpen(browser, page, url, reloginFn, 2);
    
    console.log(`   📄 ${objId}: Extraction du contenu...`);
    
    // Attendre que le contenu soit chargé
    await page.waitForSelector('body', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const text = (await page.evaluate(buildExtractor())) || '';
    const preview = text.length > 80 ? text.substring(0, 80) + '...' : text;
    
    console.log(`   📊 ${objId}: Contenu extrait (${text.length} car): "${preview}"`);
    
    // Vérifier si on a récupéré une page de login au lieu du contenu
    if (looksLikeLogin(text)) {
      console.log(`   ⚠️ ${objId}: Page de login détectée dans le contenu extrait`);
      throw new Error('login_page_content_detected');
    }
    
    // Vérifier que le contenu est substantiel
    if (text.length < 100) {
      console.log(`   ⚠️ ${objId}: Contenu trop court (${text.length} caractères)`);
      throw new Error('content_too_short');
    }
    
    // FORCER L'UPDATE avec vérification
    console.log(`   💾 ${objId}: Mise à jour en base...`);
    await updateDescription(objId, text, 200);
    
    console.log(`   ✅ ${objId}: TRAITEMENT RÉUSSI - ${text.length} caractères copiés`);
    return { updated: 1, skippedError: 0, unchanged: 0 };
    
  } catch (e) {
    console.log(`   ❌ ${objId}: ERREUR - ${e.message}`);
    
    // Marquer l'erreur en base
    await mark(objId, {
      completion_status: 'skipped_error',
      completion_last_http: 0,
      completion_last_error: String(e).substring(0, 500)
    });
    
    return { updated: 0, skippedError: 1, unchanged: 0 };
  } finally {
    if (page) {
      try { 
        await page.removeAllListeners();
        await page.close(); 
      } catch {}
    }
  }
}

async function mark(objId, patch) {
  await supabase
    .from('backup_oic_competences')
    .update({ ...patch, completion_updated_at: new Date().toISOString() })
    .eq('objectif_id', objId);
}

async function getBatch() {
  console.log(`🔍 Récupération d'un lot de ${BATCH} compétences à traiter...`);
  
  // Priorité aux non-traitées, puis celles avec hash différent ou status null
  const { data, error } = await supabase
    .from('backup_oic_competences')
    .select('objectif_id, url_source, description, source_etag, completion_status, intitule')
    .not('url_source', 'is', null)
    .not('url_source', 'eq', '')
    .or('completion_status.is.null,source_etag.is.null')
    .limit(BATCH)
    .order('completion_updated_at', { ascending: true, nullsFirst: true });

  if (error) throw error;
  
  console.log(`📊 ${data?.length || 0} compétences récupérées dans ce lot`);
  
  // Log des exemples si disponibles
  if (data && data.length > 0) {
    console.log(`🔍 Exemples de compétences à traiter:`);
    data.slice(0, 2).forEach((item, i) => {
      const status = item.completion_status || 'jamais_traité';
      console.log(`   ${i+1}. [${item.objectif_id}] "${item.intitule?.substring(0, 60)}..."`);
      console.log(`      Status: ${status}`);
    });
  }
  
  return data || [];
}

async function run() {
console.log('🚀 Début du processus de COPIE INTÉGRALE avec boucle automatique');
  console.log(`🎯 Paramètres: batch=${BATCH}, maxCompetences=${MAX_ITEMS}, concurrency=${CONCURRENCY}`);
  
  // Lancer un browser Puppeteer pour l'authentification et extraction
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  try {
    // Authentification initiale
    await casLoginWithPuppeteer(browser);
    
    let processedTotal = 0;
    let updatedTotal = 0, skippedErrorTotal = 0, unchangedTotal = 0;
    let iteration = 0;

    while (processedTotal < MAX_ITEMS) {
      iteration++;
      console.log(`\n🔁 Itération ${iteration} — récupération d'un lot (batch=${BATCH})...`);
      
      const rows = await getBatch();
      if (!rows || rows.length === 0) {
        console.log('✅ Plus rien à traiter (batch vide). Fin de la boucle.');
        break;
      }

      console.log(`⚡ Traitement de ${rows.length} compétences avec concurrence ${CONCURRENCY}`);
      
      // Traiter le lot courant avec pool de workers
      let idx = 0;
      let updated = 0, skippedError = 0, unchanged = 0;
      
      console.log(`🔧 DEBUG: Création de ${CONCURRENCY} workers pour traiter ${rows.length} compétences`);
      console.log(`🔧 DEBUG: idx initial = ${idx}`);
      
      const workers = Array.from({ length: CONCURRENCY }, (_, workerIndex) => {
        console.log(`🔧 DEBUG: Création worker ${workerIndex + 1}`);
        return (async () => {
          console.log(`🚀 Worker ${workerIndex + 1} DÉMARRE MAINTENANT`);
          let processedByWorker = 0;
          let workerUpdated = 0, workerSkippedError = 0, workerUnchanged = 0;
          
          try {
            while (true) {
              const rowIndex = idx++;
              console.log(`🔍 Worker ${workerIndex + 1}: rowIndex=${rowIndex}, rows.length=${rows.length}`);
              
              if (rowIndex >= rows.length) {
                console.log(`🛑 Worker ${workerIndex + 1}: Plus de compétences à traiter (index ${rowIndex} >= ${rows.length})`);
                break;
              }
              
              const row = rows[rowIndex];
              console.log(`👷 Worker ${workerIndex + 1} TRAITE MAINTENANT ${row.objectif_id} (${rowIndex + 1}/${rows.length})`);
              console.log(`📋 Worker ${workerIndex + 1}: URL = ${row.url_source}`);
              
              try {
                console.log(`🔄 Worker ${workerIndex + 1}: Appel processOne pour ${row.objectif_id}`);
                const result = await processOne(browser, row);
                console.log(`📊 Worker ${workerIndex + 1}: Résultat de ${row.objectif_id}:`, result);
                
                // Vérifier le format du résultat
                if (!result || typeof result !== 'object') {
                  console.error(`❌ Worker ${workerIndex + 1}: Résultat invalide pour ${row.objectif_id}:`, result);
                  workerSkippedError++;
                  continue;
                }
                
                workerUpdated += result.updated || 0;
                workerSkippedError += result.skippedError || 0;
                workerUnchanged += result.unchanged || 0;
                processedByWorker++;
                
                console.log(`✅ Worker ${workerIndex + 1} TERMINÉ ${row.objectif_id}: updated=${result.updated || 0}, skippedError=${result.skippedError || 0}, unchanged=${result.unchanged || 0}`);
              } catch (e) {
                console.error(`❌ Worker ${workerIndex + 1} ERREUR sur ${row.objectif_id}:`, e.message);
                console.error(`❌ Worker ${workerIndex + 1} Stack:`, e.stack);
                workerSkippedError++;
              }
              
              // Micro-pause pour ménager le site
              await new Promise(r => setTimeout(r, 80));
            }
          } catch (workerError) {
            console.error(`💥 Worker ${workerIndex + 1} ERREUR GLOBALE:`, workerError.message);
            console.error(`💥 Worker ${workerIndex + 1} Stack:`, workerError.stack);
          }
          
          console.log(`🏁 Worker ${workerIndex + 1} TERMINÉ DÉFINITIVEMENT: ${processedByWorker} compétences traitées`);
          console.log(`🏁 Worker ${workerIndex + 1} Compteurs: updated=${workerUpdated}, skippedError=${workerSkippedError}, unchanged=${workerUnchanged}`);
          
          // Mettre à jour les compteurs globaux
          updated += workerUpdated;
          skippedError += workerSkippedError;
          unchanged += workerUnchanged;
          
          return processedByWorker;
        })();
      });

      console.log(`⏳ Attente de la fin des ${workers.length} workers...`);
      const workerResults = await Promise.all(workers);
      console.log(`✅ Tous les workers terminés. Résultats:`, workerResults);

      processedTotal += rows.length;
      updatedTotal += updated;
      skippedErrorTotal += skippedError;
      unchangedTotal += unchanged;

      console.log(`📈 Lot traité: updated=${updated} | unchanged=${unchanged} | skipped_error=${skippedError}`);
      console.log(`➡️  Cumul: ${processedTotal}/${MAX_ITEMS} compétences parcourues | updated_total=${updatedTotal} | error_total=${skippedErrorTotal}`);
      
      // PROTECTION CONTRE BOUCLE INFINIE
      if (updated === 0 && skippedError === 0 && unchanged === 0) {
        console.log(`🚨 ALERTE: Aucune compétence traitée dans ce lot - arrêt pour éviter boucle infinie`);
        break;
      }

      // Relogin entre les lots pour maintenir la session SSO
      if (processedTotal < MAX_ITEMS && rows.length === BATCH) {
        try {
          console.log('🔄 Relogin préventif entre les lots...');
          await casLoginWithPuppeteer(browser);
        } catch (e) {
          console.warn('⚠️ Relogin préventif échoué, continuons:', e.message);
        }
      }
    }

    console.log(`\n✅ TERMINÉ — TOTAL GLOBAL:`);
    console.log(`   ✅ Mis à jour: ${updatedTotal}`);
    console.log(`   ⚪ Inchangés: ${unchangedTotal}`);
    console.log(`   ❌ Erreurs: ${skippedErrorTotal}`);
    console.log(`   📊 Total traité: ${processedTotal} compétences`);
    
  } finally {
    await browser.close();
  }
}

run().catch(e => { 
  console.error('❌ Erreur fatale:', e); 
  process.exit(1); 
});