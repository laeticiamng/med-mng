// automation/oic-completion/complete-by-url-puppeteer.js
// Complète les OIC existantes à partir de url_source (LiSA).
// Auth CAS/OAuth2 avec Puppeteer pour gérer l'authentification complexe
// Source: API MediaWiki (revisions, rvslots=main) -> normalisation -> update Supabase si contenu substantiel.

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import pLimit from 'p-limit';
import crypto from 'node:crypto';
import { htmlToText } from 'html-to-text';
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
const BATCH = parseInt(arg('batch', '200'), 10);
const MIN_CHARS = parseInt(arg('minChars', '500'), 10);  // Seuil plus élevé pour descriptions complètes
const CONCURRENCY = parseInt(arg('concurrency', '4'), 10);

console.log(`🎯 Configuration: batch=${BATCH}, minChars=${MIN_CHARS}, concurrency=${CONCURRENCY}`);

// HTTP client avec CookieJar (session CAS)
const jar = new CookieJar();
const http = wrapper(axios.create({
  jar,
  timeout: 30000,
  maxRedirects: 5,
  validateStatus: () => true
}));

const sleep = ms => new Promise(r => setTimeout(r, ms));
const hash = s => crypto.createHash('sha256').update(s || '').digest('hex');

// ===== AUTH CAS/OAuth2 avec Puppeteer =====
async function casLoginWithPuppeteer() {
  console.log('🔐 Démarrage authentification CAS avec Puppeteer...');
  
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
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    const protectedUrl = 'https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Objectif_de_connaissance';
    
    console.log('🌐 Navigation vers la page protégée...');
    await page.goto(protectedUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Vérifier si on est déjà sur LiSA (pas de redirection CAS)
    const currentUrl = page.url();
    if (currentUrl.includes('livret.uness.fr/lisa')) {
      console.log('✅ Déjà authentifié ou accès direct');
      const cookies = await page.cookies();
      await browser.close();
      return extractCookiesForAxios(cookies);
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
    
    // Extraire les cookies pour axios
    const cookies = await page.cookies();
    await browser.close();
    
    return extractCookiesForAxios(cookies);
    
  } catch (error) {
    await browser.close();
    throw error;
  }
}

function extractCookiesForAxios(puppeteerCookies) {
  const cookieHeader = puppeteerCookies
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');
  
  // Configurer axios avec les cookies
  http.defaults.headers.Cookie = cookieHeader;
  
  console.log(`🍪 ${puppeteerCookies.length} cookies configurés pour axios`);
  return cookieHeader;
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

async function fetchContentWithPuppeteer(browser, url) {
  const page = await browser.newPage();
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const statusCode = resp?.status() || 0;
    
    if (statusCode === 401 || statusCode === 403) {
      await page.close();
      throw new Error(`auth_required_${statusCode}`);
    }
    
    if (statusCode < 200 || statusCode >= 400) {
      await page.close();
      return { status: statusCode, text: '' };
    }
    
    // Extraction du contenu complet
    const text = (await page.evaluate(buildExtractor())) || '';
    await page.close();
    
    return { status: 200, text };
    
  } catch (error) {
    await page.close();
    throw error;
  }
}

async function mark(objId, patch) {
  await supabase
    .from('backup_oic_competences')
    .update({ ...patch, completion_updated_at: new Date().toISOString() })
    .eq('objectif_id', objId);
}

async function pickBatch() {
  console.log(`🔍 Sélection de TOUTES les compétences à copier intégralement (lot de ${BATCH})...`);
  
  // Pas de filtre - on prend toutes les lignes avec une URL valide pour copie intégrale
  const { data, error } = await supabase
    .from('backup_oic_competences')
    .select('objectif_id, url_source, description, source_etag, completion_status, intitule')
    .not('url_source', 'is', null)
    .not('url_source', 'eq', '')
    .limit(BATCH)
    .order('completion_updated_at', { ascending: true, nullsFirst: true });

  if (error) throw error;
  
  console.log(`📊 ${data?.length || 0} compétences sélectionnées pour COPIE INTÉGRALE`);
  
  // Log des exemples
  if (data && data.length > 0) {
    console.log(`🔍 Exemples de compétences à traiter:`);
    data.slice(0, 3).forEach((item, i) => {
      const status = item.completion_status || 'jamais_traité';
      console.log(`   ${i+1}. [${item.objectif_id}] "${item.intitule?.substring(0, 80)}..."`);
      console.log(`      Status actuel: ${status}`);
      console.log(`      URL: ${item.url_source}`);
      console.log(`      ---`);
    });
  }
  
  return data || [];
}

async function run() {
  console.log('🚀 Début du processus de COPIE INTÉGRALE de toutes les compétences OIC');
  
  await casLoginWithPuppeteer();
  
  // Lancer un browser Puppeteer pour l'extraction
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
    const rows = await pickBatch();
    if (!rows.length) {
      console.log('✅ Aucune compétence à traiter (lot vide).');
      return;
    }

    console.log(`⚡ COPIE INTÉGRALE de ${rows.length} compétences avec ${CONCURRENCY} requêtes concurrentes`);
    
    const limit = pLimit(CONCURRENCY);
    let updated = 0, skippedError = 0, unchanged = 0;

    await Promise.all(rows.map(row => limit(async () => {
      const objId = row.objectif_id;
      const url = (row.url_source || '').trim();
      if (!url) {
        await mark(objId, { completion_status: 'skipped_error', completion_last_error: 'missing_url' });
        skippedError++;
        return;
      }

      try {
        // Extraction avec Puppeteer
        const result = await fetchContentWithPuppeteer(browser, url);
        
        if (result.status !== 200) {
          await mark(objId, {
            completion_status: 'skipped_error',
            completion_last_http: result.status,
            completion_last_error: `http_${result.status}`
          });
          skippedError++;
          return;
        }

        // COPIE INTÉGRALE : pas de filtrage, on prend tout
        const text = result.text || '';
        
        // Idempotence : éviter les réécritures inutiles
        const newHash = hash(text);
        if (newHash === row.source_etag) {
          unchanged++;
          return; // déjà à jour
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

        if (upErr) {
          await mark(objId, { completion_status: 'skipped_error', completion_last_error: String(upErr) });
          skippedError++;
          return;
        }

        updated++;
        const preview = text.length > 80 ? text.substring(0, 80) + '...' : text;
        console.log(`   ✅ ${objId}: ${text.length} caractères copiés - "${preview}"`);
        
      } catch (error) {
        if (error.message.includes('auth_required')) {
          console.log('🔑 Réauthentification nécessaire pour', objId);
          await casLoginWithPuppeteer();
          skippedError++; // À relancer plus tard
        } else {
          await mark(objId, { 
            completion_status: 'skipped_error', 
            completion_last_error: error.message.substring(0, 500) 
          });
          skippedError++;
        }
      }
    })));

    console.log(`\n🎯 RÉSULTATS COPIE INTÉGRALE:`);
    console.log(`   ✅ Copiés: ${updated}`);
    console.log(`   ⚪ Inchangés: ${unchanged}`);
    console.log(`   ❌ Erreurs: ${skippedError}`);
    
  } finally {
    await browser.close();
  }
}

run().catch(e => { 
  console.error('❌ Erreur fatale:', e); 
  process.exit(1); 
});