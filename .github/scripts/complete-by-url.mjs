// .github/scripts/complete-by-url.cjs
// Complète les OIC existantes à partir de url_source (LiSA).
// Authentification CAS/OAuth2 "comme dans le log":
//  1) visite d'une page protégée -> redirection vers auth.uness.fr
//  2) saisie email + mdp (+ champs hidden: lt/execution si présents)
//  3) suivi des redirections jusqu'au retour sur livret.uness.fr
//  4) cookies conservés dans un CookieJar
//
// Ensuite: priorité à l'API MediaWiki (prop=revisions, rvslots=main, formatversion=2).
// Si vide/non substantiel -> pas d'update; consigne completion_status + logs en base.

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import puppeteer from 'puppeteer';
import pLimit from 'p-limit';
import crypto from 'node:crypto';
import { htmlToText } from 'html-to-text';

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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// ---- CLI args
const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i+1] : def;
};
const BATCH = parseInt(arg('batch', '400'), 10);
const MIN_CHARS = parseInt(arg('minChars', '200'), 10);
const CONCURRENCY = parseInt(arg('concurrency', '6'), 10);

// ---- HTTP client et browser Puppeteer
let browser = null;
let page = null;
const http = axios.create({
  timeout: 20000,
  maxRedirects: 5,
  validateStatus: () => true
});

const sleep = ms => new Promise(r => setTimeout(r, ms));
const hash = s => crypto.createHash('sha256').update(s || '').digest('hex');

// ==== AUTH CAS/OAUTH2 avec Puppeteer ====
async function casLogin() {
  if (!browser) {
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ]
    });
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  }

  try {
    // 1) Aller sur une page protégée pour déclencher l'auth CAS
    const protectedUrl = 'https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Objectif_de_connaissance';
    await page.goto(protectedUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Vérifier si déjà authentifié
    const currentUrl = page.url();
    if (currentUrl.includes('livret.uness.fr')) {
      console.log('✅ Déjà authentifié');
      return;
    }

    // 2) Attendre et remplir le formulaire CAS
    try {
      await page.waitForSelector('input[name="username"], input[name="email"]', { timeout: 15000 });
    } catch (e) {
      console.log('Aucun formulaire de connexion trouvé - peut-être déjà authentifié');
      return;
    }
    
    // Remplir les champs de connexion
    const usernameField = await page.$('input[name="username"]') || await page.$('input[name="email"]');
    if (usernameField) {
      await usernameField.click({ clickCount: 3 }); // Sélectionner tout
      await usernameField.type(CAS_USERNAME);
    }

    const passwordField = await page.$('input[name="password"]');
    if (passwordField) {
      await passwordField.click({ clickCount: 3 }); // Sélectionner tout
      await passwordField.type(CAS_PASSWORD);
    }

    // 3) Soumettre le formulaire - approche simplifiée
    console.log('🔑 Soumission du formulaire CAS...');
    
    // Essayer de cliquer sur un bouton submit
    try {
      const submitButton = await page.$('input[type="submit"], button[type="submit"], input[value*="LOGIN"], input[name="submit"], button[name="submit"]');
      if (submitButton) {
        await submitButton.click();
      } else {
        // Fallback: appuyer sur Enter
        await passwordField.press('Enter');
      }
      
      // Attendre la navigation
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
    } catch (navError) {
      console.log('Navigation timeout, mais continuons...');
    }

    // 4) Attendre le retour sur LiSA après les redirections OAuth2
    let attempts = 0;
    while (attempts < 15) { // Augmenté de 10 à 15
      const url = page.url();
      console.log(`🔍 URL actuelle (tentative ${attempts + 1}): ${url}`);
      if (url.includes('livret.uness.fr')) {
        console.log('✅ Authentification CAS réussie');
        return;
      }
      await page.waitForTimeout(2000);
      attempts++;
    }

    throw new Error('Authentification CAS échouée - pas de retour sur livret.uness.fr après 30s');
  } catch (error) {
    console.error('❌ Erreur authentification CAS:', error.message);
    console.error('URL actuelle:', page ? page.url() : 'page non disponible');
    throw error;
  }
}

// ==== MEDIAWIKI API ====
// Extraction via API (fidèle à la technique du log: prop=revisions, rvslots=main, formatversion=2)
function extractTitleFromUrl(url) {
  try {
    // Partie après /lisa/2025/…; utiliser le segment/chemin complet encodé
    const idx = url.indexOf('/lisa/');
    if (idx < 0) return null;
    // on prend tout après /lisa/ (l'API accepte "titles" encodés)
    const path = url.slice(idx + 6); // "2025/Connaître_..."
    // L'API "titles" attend un titre MediaWiki (remplacer les espaces par underscores si besoin)
    return decodeURIComponent(path).replace(/^2025\//, '');
  } catch {
    return null;
  }
}

async function fetchTextFromApi(url) {
  const title = extractTitleFromUrl(url);
  if (!title) return { status: 0, error: 'cannot_extract_title' };

  // Utiliser Puppeteer pour l'API (session partagée)
  for (let i = 0; i < 3; i++) {
    try {
      const apiUrl = `https://livret.uness.fr/lisa/api.php?action=query&prop=revisions&rvprop=content|ids|timestamp&rvslots=main&format=json&formatversion=2&titles=${encodeURIComponent(title)}`;
      
      const response = await page.evaluate(async (url) => {
        const res = await fetch(url);
        return {
          status: res.status,
          data: await res.json()
        };
      }, apiUrl);

      if (response.status === 401 || response.status === 403) {
        await casLogin();
        continue;
      }
      if (response.status !== 200) return { status: response.status };

      const pages = response.data?.query?.pages || [];
      if (!pages.length) return { status: 200, text: '' };

      const rev = pages[0]?.revisions?.[0];
      const wikitext = rev?.slots?.main?.content || '';
      return { status: 200, text: wikitext };
    } catch (e) {
      if (i < 2) await sleep(1000 * (i + 1));
      else return { status: 0, error: String(e) };
    }
  }
}

// Nettoyage/validation: on convertit le wikitext → texte simple (on garde du contenu substantiel)
function normalizeText(wikitext) {
  if (!wikitext) return '';
  // On retire la machinerie du template et on garde la Description principalement.
  // Extraction naïve de "|Description=...": on coupe jusqu'à la fin du template / ou double saut de ligne
  const descMatch = wikitext.match(/\|[Dd]escription\s*=\s*([\s\S]*?)(?:\n\||\n}})/);
  const raw = (descMatch ? descMatch[1] : wikitext).trim();
  const text = htmlToText(raw, { wordwrap: 0 }).trim();
  return text;
}

async function mark(objId, patch) {
  await supabase
    .from('backup_oic_competences')
    .update({ ...patch, completion_updated_at: new Date().toISOString() })
    .eq('objectif_id', objId);
}

async function pickBatch(minChars) {
  // On cible: description absente ou jamais traitée (plus de filtre par longueur)
  const { data, error } = await supabase
    .from('backup_oic_competences')
    .select('objectif_id, url_source, description, source_etag')
    .or(`description.is.null,description.eq.,completion_status.is.null`)
    .limit(BATCH);

  if (error) throw error;
  return data || [];
}

async function run() {
  // 1) S'assurer session CAS active (comme dans le log)
  await casLogin();

  // 2) Récupérer un lot d'items à compléter
  const rows = await pickBatch(MIN_CHARS);
  if (!rows.length) {
    console.log('✅ Aucun item à compléter (lot vide).');
    return;
  }

  const limit = pLimit(CONCURRENCY);
  let updated = 0, skippedEmpty = 0, skippedError = 0;

  await Promise.all(rows.map(row => limit(async () => {
    const objId = row.objectif_id;
    const url = (row.url_source || '').trim();
    if (!url) {
      await mark(objId, { completion_status: 'skipped_error', completion_last_error: 'missing_url' });
      skippedError++;
      return;
    }

    // 3) Contenu via API (avec session CAS prête)
    const api = await fetchTextFromApi(url);
    if (api?.status !== 200) {
      await mark(objId, {
        completion_status: 'skipped_error',
        completion_last_http: api?.status || 0,
        completion_last_error: api?.error || null
      });
      skippedError++;
      return;
    }

    const text = normalizeText(api.text);
    // Prendre tout contenu non-vide, peu importe la longueur
    if (!text || text.trim().length === 0) {
      await mark(objId, { completion_status: 'skipped_empty', completion_last_http: 200 });
      skippedEmpty++;
      return;
    }

    const newHash = hash(text);
    if (newHash === row.source_etag) {
      return; // déjà à jour
    }

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
    } else {
      updated++;
    }
  })));

  console.log(`🟢 updated=${updated} | 🟡 skipped_empty=${skippedEmpty} | 🔴 skipped_error=${skippedError}`);
  
  // Fermer le browser Puppeteer
  if (browser) {
    await browser.close();
  }
}

run().catch(async (e) => { 
  console.error(e); 
  if (browser) await browser.close();
  process.exit(1); 
});