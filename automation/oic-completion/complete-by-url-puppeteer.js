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

// ===== Détection page de login et contenu générique LiSA =====
function looksLikeLogin(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  
  // PRIORITÉ 1: Détecter le contenu générique LiSA (page d'accueil)
  const genericLiSAIndicators = [
    'bienvenue sur lisa edn 2025',
    'items de connaissances',
    'les items de connaissances (fiche lisa)',
    'la conférence des doyens a retenu sept compétences génériques',
    'consultez la charte d\'utilisation de la plateforme lisa',
    'fiches lisa sont attribuées aux collèges',
    'liste des fiches lisa communes par collège'
  ];
  
  const hasGenericLiSAContent = genericLiSAIndicators.some(indicator => 
    t.includes(indicator)
  );
  
  if (hasGenericLiSAContent) {
    console.log(`   🚫 Contenu générique LiSA détecté (page d'accueil au lieu de la fiche)`);
    return true;
  }
  
  // PRIORITÉ 2: Vérifier si c'est du contenu OIC valide (signes positifs)
  const validOICIndicators = [
    'objectif de connaissance',
    'oic-',
    'version novembre 2024',
    'item parent',
    'rang',
    'fibrillation atriale',
    'syndrome vestibulaire',
    'bilan hormonal',
    'vulnérabilité',
    'éléments clés nécessaires',
    'physiopathologie',
    'prescrire un bilan',
    'définition de la',
    'principes de l\'intégration',
    'enjeux éthiques',
    'prévention des erreurs',
    'drainage pleural',
    'étiologies des',
    'sources de données'
  ];
  
  // Si on trouve des indicateurs OIC ET que le contenu est substantiel
  const hasValidOICContent = validOICIndicators.some(indicator => t.includes(indicator));
  const isSubstantial = t.length > 500;
  
  if (hasValidOICContent && isSubstantial) {
    console.log(`   ✅ Contenu OIC valide détecté: ${t.length} caractères`);
    return false; // C'est du contenu valide, pas une page de login
  }
  
  // PRIORITÉ 3: Détecter les vraies pages de login (signes négatifs)
  const loginIndicators = [
    'veuillez saisir votre adresse e-mail',
    'cas d\'authentification',
    'bienvenue !',
    'connexion à',
    'authentification',
    'se connecter'
  ];
  
  const hasLoginIndicators = loginIndicators.some(indicator => t.includes(indicator));
  const isShort = t.length < 1000;
  
  // Si c'est court ET contient des indicateurs de login
  if (hasLoginIndicators && isShort) {
    console.log(`   🚫 Page de login détectée: ${t.length} caractères`);
    return true;
  }
  
  // Par défaut, considérer comme contenu valide si substantiel
  return false;
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
      
      // Si contenu ressemble à la page de login OU contient des erreurs d'auth
      if (looksLikeLogin(txtHead) || 
          txtHead.includes('state parameter') ||
          txtHead.includes('erreur fatale') ||
          txtHead.includes('mwexception')) {
        console.log(`🔐 Page de login/erreur détectée dans le contenu (tentative ${i + 1})`);
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
  
  try {
    // Fermer toutes les pages existantes pour repartir à zéro
    const existingPages = await browser.pages();
    for (const existingPage of existingPages) {
      await existingPage.close();
    }
    
    // Créer une nouvelle page propre
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Aller directement sur la page de login CAS
    const casLoginUrl = 'https://auth.uness.fr/cas/login?service=https%3A%2F%2Flivret.uness.fr%2Flisa%2F2025%2FCat%25C3%25A9gorie%3AObjectif_de_connaissance';
    
    console.log('🌐 Navigation directe vers CAS login...');
    await page.goto(casLoginUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    // Attendre que la page soit complètement chargée
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🔑 Saisie des identifiants CAS...');
    
    // Attendre et remplir le champ username
    try {
      await page.waitForSelector('input[name="username"], input[type="email"], input[id="username"]', { timeout: 10000 });
      await page.type('input[name="username"], input[type="email"], input[id="username"]', CAS_USERNAME);
      console.log('📝 Username saisi');
    } catch (e) {
      console.error('❌ Impossible de trouver le champ username');
      throw new Error('Champ username non trouvé');
    }
    
    // Vérifier si le champ password est présent (auth en 1 ou 2 étapes)
    let passwordPresent = false;
    try {
      await page.waitForSelector('input[name="password"], input[type="password"], input[id="password"]', { timeout: 2000 });
      passwordPresent = true;
    } catch (e) {
      console.log('🔄 Champ password pas encore visible, authentification en 2 étapes détectée');
    }
    
    if (passwordPresent) {
      // Auth en 1 étape - saisir le password directement
      await page.type('input[name="password"], input[type="password"], input[id="password"]', CAS_PASSWORD);
      console.log('🔑 Password saisi (auth 1 étape)');
    } else {
      // Auth en 2 étapes - cliquer sur suivant d'abord
      console.log('🔄 Clic sur "Suivant" pour auth 2 étapes...');
      try {
        await page.click('button[type="submit"], input[type="submit"], button:contains("Suivant")');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Maintenant saisir le password
        await page.waitForSelector('input[name="password"], input[type="password"], input[id="password"]', { timeout: 10000 });
        await page.type('input[name="password"], input[type="password"], input[id="password"]', CAS_PASSWORD);
        console.log('🔑 Password saisi (auth 2 étapes)');
      } catch (e) {
        console.error('❌ Erreur dans l\'auth 2 étapes:', e.message);
        throw e;
      }
    }
    
    // Soumettre le formulaire
    console.log('📤 Soumission du formulaire d\'authentification...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }),
      page.click('button[type="submit"], input[type="submit"]')
    ]);
    
    // Attendre stabilisation complète
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Vérifier le résultat de l'authentification
    const finalUrl = page.url();
    console.log(`🔍 URL finale après auth: ${finalUrl}`);
    
    if (finalUrl.includes('livret.uness.fr/lisa')) {
      console.log('✅ Authentification CAS réussie - arrivé sur LiSA');
    } else if (finalUrl.includes('auth.uness.fr') || finalUrl.includes('cas.uness.fr')) {
      console.error('❌ Encore sur la page d\'auth - échec probable');
      throw new Error('Authentification CAS échouée - toujours sur page auth');
    } else {
      console.log('🤔 URL inattendue mais pas d\'erreur - on continue');
    }
    
    // Vérifier que les cookies sont bien stockés
    const cookies = await page.cookies();
    console.log(`🍪 ${cookies.length} cookies récupérés après authentification`);
    
    // Garder la page ouverte pour maintenir la session
    console.log('✅ Authentification CAS complète avec succès');
    
    if (ownBrowser) await browser.close();
    return browser;
    
  } catch (error) {
    console.error('❌ Erreur dans casLoginWithPuppeteer:', error.message);
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
    
    // Fonction de relogin simplifiée pour réutiliser la logique principale
    const reloginFn = async () => {
      console.log(`🔐 Ré-authentification CAS...`);
      try {
        await casLoginWithPuppeteer(browser);
        console.log('✅ Ré-authentification CAS réussie');
      } catch (error) {
        console.error('❌ Erreur lors de la ré-authentification:', error.message);
        throw error;
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
    
    // Détecter les erreurs spécifiques d'authentification ou de serveur
    if (text.includes('State parameter of callback does not match original state') ||
        text.includes('Erreur fatale de type') ||
        text.includes('MWException') ||
        text.includes('callback does not match')) {
      console.log(`   🔐 ${objId}: Erreur d'authentification détectée, nouvelle tentative...`);
      throw new Error('auth_callback_error');
    }
    
    // Vérifier si on a récupéré une page de login au lieu du contenu
    if (looksLikeLogin(text)) {
      console.log(`   ⚠️ ${objId}: Page de login détectée dans le contenu extrait`);
      throw new Error('login_page_content_detected');
    }
    
    // VÉRIFICATION: Comparer avec le contenu actuel en base
    const currentDescription = row.description || '';
    const contentChanged = currentDescription !== text;
    
    if (contentChanged) {
      console.log(`   💾 ${objId}: MISE À JOUR NÉCESSAIRE - Contenu différent détecté`);
      console.log(`   📊 ${objId}: Ancien: ${currentDescription.length} car -> Nouveau: ${text.length} car`);
      await updateDescription(objId, text, 200);
      console.log(`   ✅ ${objId}: CONTENU MIS À JOUR - ${text.length} caractères copiés`);
      return { updated: 1, skippedError: 0, unchanged: 0 };
    } else {
      console.log(`   ✓ ${objId}: Contenu identique - Pas de mise à jour nécessaire (${text.length} car)`);
      await mark(objId, { completion_status: 'verified_unchanged' });
      return { updated: 0, skippedError: 0, unchanged: 1 };
    }
    
  } catch (e) {
    console.log(`   ❌ ${objId}: ERREUR - ${e.message}`);
    
    // Si c'est une erreur d'authentification, essayer une nouvelle auth complète
    if (e.message.includes('auth_callback_error') || 
        e.message.includes('login_page_content_detected')) {
      console.log(`   🔄 ${objId}: Tentative de ré-authentification...`);
      
      try {
        // Ré-authentification complète
        await reloginFn();
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Nouvelle tentative de navigation
        await ensureLoggedAndOpen(browser, page, url, reloginFn, 1);
        
        // Nouvelle extraction
        const retryText = (await page.evaluate(buildExtractor())) || '';
        console.log(`   🔄 ${objId}: Nouvelle extraction (${retryText.length} car)`);
        
        if (!retryText.includes('State parameter') && !looksLikeLogin(retryText)) {
          await updateDescription(objId, retryText, 200);
          console.log(`   ✅ ${objId}: RÉCUPÉRATION RÉUSSIE - ${retryText.length} caractères copiés`);
          return { updated: 1, skippedError: 0, unchanged: 0 };
        }
      } catch (retryError) {
        console.log(`   ❌ ${objId}: Échec de la récupération après ré-auth: ${retryError.message}`);
      }
    }
    
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

// Fonction pour détecter si une compétence a du contenu corrompu en base
function hasCorruptedContent(description) {
  if (!description || description.length < 200) return true;
  
  const lower = description.toLowerCase();
  const corruptionIndicators = [
    'state parameter of callback does not match',
    'erreur fatale de type',
    'mwexception',
    'callback does not match',
    'vous devez vous connecter',
    'session expirée',
    'authentification requise',
    'accès non autorisé',
    'connexion nécessaire',
    'identifiant',
    'mot de passe',
    'se connecter',
    'login',
    'cas d\'authentification',
    // Contenu générique LiSA
    'bienvenue sur lisa edn 2025',
    'items de connaissances',
    'les items de connaissances (fiche lisa)',
    'la conférence des doyens a retenu sept compétences génériques',
    'consultez la charte d\'utilisation de la plateforme lisa'
  ];
  
  return corruptionIndicators.some(indicator => lower.includes(indicator));
}

async function getBatch() {
  console.log(`🔍 Récupération d'un lot de ${BATCH} compétences à vérifier et mettre à jour...`);
  
  // NOUVELLE LOGIQUE: Récupérer TOUTES les compétences pour vérifier leur contenu
  // Sans filtrer par statut - on veut tout retraiter pour s'assurer de la cohérence
  const { data: allData, error: allError } = await supabase
    .from('backup_oic_competences')
    .select('objectif_id, url_source, description, source_etag, completion_status, intitule')
    .not('url_source', 'is', null)
    .not('url_source', 'eq', '')
    .limit(BATCH)
    .order('objectif_id'); // Trier par ID pour un traitement prévisible

  if (allError) throw allError;
  
  console.log(`🔍 ${allData.length} compétences récupérées (traitement intégral)`);
  
  let finalData = [...allData];
  
  console.log(`📊 ${finalData.length} compétences récupérées dans ce lot`);
  
  // Log des exemples si disponibles
  if (finalData.length > 0) {
    console.log(`🔍 Exemples de compétences à retraiter:`);
    finalData.slice(0, 3).forEach((item, i) => {
      const currentDescLength = item.description ? item.description.length : 0;
      console.log(`   ${i+1}. [${item.objectif_id}] "${item.intitule?.substring(0, 60)}..."`);
      console.log(`      Description actuelle: ${currentDescLength} caractères`);
      console.log(`      URL: ${item.url_source}`);
    });
  }
  
  return finalData;
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