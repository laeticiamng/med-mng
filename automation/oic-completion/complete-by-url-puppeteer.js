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

console.log(`🎯 Configuration: batch=${BATCH}, maxItems=${MAX_ITEMS}, concurrency=${CONCURRENCY}`);

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
    
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(600); // stabilisation
    
    // Si redirigé vers auth, ou si on voit la page de login → relogin
    const urlNow = page.url();
    if (urlNow.includes('auth.uness.fr')) {
      console.log(`🔐 Redirection CAS détectée (tentative ${i + 1})`);
      if (i === attempts) throw new Error('auth_loop');
      await reloginFn(browser);
      continue;
    }
    
    // Si contenu ressemble à la page de login
    const txtHead = await page.evaluate(() => (document.body && document.body.innerText || '').slice(0, 500));
    if (looksLikeLogin(txtHead)) {
      console.log(`🔐 Page de login détectée dans le contenu (tentative ${i + 1})`);
      if (i === attempts) throw new Error('login_page_detected_after_attempts');
      await reloginFn(browser);
      continue;
    }
    
    // OK, on reste sur livret
    await page.waitForNetworkIdle({ timeout: 15000 }).catch(() => {});
    console.log(`✅ Navigation réussie vers ${url}`);
    return;
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

// ===== Traitement d'une compétence avec retry auto =====
async function processOneCompetence(browser, row) {
  const objId = row.objectif_id;
  const url = (row.url_source || '').trim();
  
  if (!url) {
    await mark(objId, { completion_status: 'skipped_error', completion_last_error: 'missing_url' });
    return { updated: 0, skippedEmpty: 0, skippedError: 1 };
  }

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);
  
  try {
    await ensureLoggedAndOpen(browser, page, url, casLoginWithPuppeteer, 2);
    
    // Extraction du contenu complet
    const text = (await page.evaluate(buildExtractor())) || '';
    
    // Idempotence : éviter les réécritures inutiles
    const newHash = hash(text);
    if (newHash === row.source_etag) {
      return { updated: 0, skippedEmpty: 0, skippedError: 0 }; // déjà à jour
    }

    // MISE À JOUR SYSTÉMATIQUE (même si vide)
    const { error: upErr } = await supabase
      .from('backup_oic_competences')
      .update({
        description: text,
        completion_status: 'updated',
        completion_last_http: 200,
        completion_last_error: null,
        source_etag: newHash
      })
      .eq('objectif_id', objId);

    if (upErr) throw upErr;
    
    const preview = text.length > 80 ? text.substring(0, 80) + '...' : text;
    console.log(`   ✅ ${objId}: ${text.length} caractères copiés - "${preview}"`);
    
    return { updated: 1, skippedEmpty: 0, skippedError: 0 };
    
  } catch (e) {
    await mark(objId, {
      completion_status: 'skipped_error',
      completion_last_http: 0,
      completion_last_error: String(e).substring(0, 500)
    });
    console.log(`   ❌ ${objId}: ${e.message}`);
    return { updated: 0, skippedEmpty: 0, skippedError: 1 };
  } finally {
    try { await page.close(); } catch {}
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
  console.log(`🎯 Paramètres: batch=${BATCH}, maxItems=${MAX_ITEMS}, concurrency=${CONCURRENCY}`);
  
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
      
      const workers = Array.from({ length: CONCURRENCY }, () => (async () => {
        while (idx < rows.length && processedTotal + idx < MAX_ITEMS) {
          const row = rows[idx++];
          const result = await processOneCompetence(browser, row);
          updated += result.updated;
          skippedError += result.skippedError;
          unchanged += (result.updated === 0 && result.skippedError === 0) ? 1 : 0;
          
          // Micro-pause pour ménager le site
          await new Promise(r => setTimeout(r, 80));
        }
      }));

      await Promise.all(workers);

      processedTotal += rows.length;
      updatedTotal += updated;
      skippedErrorTotal += skippedError;
      unchangedTotal += unchanged;

      console.log(`📈 Lot traité: updated=${updated} | unchanged=${unchanged} | skipped_error=${skippedError}`);
      console.log(`➡️  Cumul: ${processedTotal}/${MAX_ITEMS} items parcourus | updated_total=${updatedTotal} | error_total=${skippedErrorTotal}`);

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
    console.log(`   📊 Total traité: ${processedTotal} items`);
    
  } finally {
    await browser.close();
  }
}

run().catch(e => { 
  console.error('❌ Erreur fatale:', e); 
  process.exit(1); 
});