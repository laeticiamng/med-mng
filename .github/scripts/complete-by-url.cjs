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
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
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

// ---- HTTP client avec CookieJar (session CAS)
const jar = new CookieJar();
const http = wrapper(axios.create({
  jar,
  timeout: 20000,
  maxRedirects: 5,
  validateStatus: () => true
}));

const sleep = ms => new Promise(r => setTimeout(r, ms));
const hash = s => crypto.createHash('sha256').update(s || '').digest('hex');

// ==== AUTH CAS/OAUTH2 ====
// On reproduit le déroulé observé dans le log: visite d'une page protégée, puis formulaire CAS.
async function casLogin() {
  // Étape 0: aller sur une page protégée LiSA pour déclencher la redirection CAS
  // (exactement comme dans le log: catégorie OIC)
  const protectedUrl = 'https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Objectif_de_connaissance';
  let res = await http.get(protectedUrl);
  // On devrait être redirigé(e) vers auth.uness.fr (OAuth2 CAS)
  // Selon config, l'URL peut contenir des params client_name=CasOAuthClient etc.
  // Si on est déjà authentifié, on sera peut-être déjà 200 sur livret.uness.fr
  if (res.status === 200 && res.request?.res?.responseUrl?.includes('livret.uness.fr')) {
    return; // déjà en session
  }

  // S'il reste un formulaire CAS, on va l'envoyer.
  // 1) GET page de login (l'URL actuelle de redirection)
  const loginUrl = res.request?.res?.responseUrl || res.headers?.location || res.config?.url;
  if (!loginUrl) return;

  // charge le formulaire CAS
  res = await http.get(loginUrl);
  if (res.status >= 300 && res.status < 400 && res.headers.location) {
    // suivre redirection éventuelle
    res = await http.get(res.headers.location);
  }

  // Chercher les champs 'lt' / 'execution' si présents
  const body = res.data || '';
  const hidden = {};
  for (const name of ['lt', 'execution', '_eventId', 'csrf_token']) {
    const m = body.match(new RegExp(`name=["']${name}["']\\s+value=["']([^"']+)["']`, 'i'));
    if (m) hidden[name] = m[1];
  }

  // 2) POST identifiants CAS
  const form = new URLSearchParams({
    username: CAS_USERNAME,
    email: CAS_USERNAME,
    password: CAS_PASSWORD,
    ...hidden,
    _eventId: hidden._eventId || 'submit',
    submit: 'LOGIN'
  });

  // Normalement, cette POST renvoie une redirection OAuth2 en chaîne
  const postRes = await http.post(res.request?.res?.responseUrl || loginUrl, form.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  // Suivre les redirections jusqu'à retour sur livret.uness.fr
  // axios suit déjà `maxRedirects`, mais on vérifie l'URL finale
  let finalUrl = postRes.request?.res?.responseUrl || postRes.headers?.location;
  if (finalUrl && !String(finalUrl).includes('livret.uness.fr')) {
    // tenter de GET la location finale
    const follow = await http.get(finalUrl);
    finalUrl = follow.request?.res?.responseUrl || follow.headers?.location || finalUrl;
  }

  // Vérifier que l'on peut (re)visiter une page LiSA en 200 authentifié
  const check = await http.get(protectedUrl);
  if (check.status !== 200) {
    throw new Error(`CAS login seems incomplete (status=${check.status})`);
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
  // priorité API par titre (plus simple que par pageid quand on part d'un url_source)
  const title = extractTitleFromUrl(url);
  if (!title) return { status: 0, error: 'cannot_extract_title' };

  const apiUrl = 'https://livret.uness.fr/lisa/api.php';
  // on suit la config du log: revisions rvslots=main, formatversion=2
  const params = new URLSearchParams({
    action: 'query',
    prop: 'revisions',
    rvprop: 'content|ids|timestamp',
    rvslots: 'main',
    format: 'json',
    formatversion: '2',
    titles: title
  });

  for (let i = 0; i < 3; i++) {
    try {
      const res = await http.get(`${apiUrl}?${params.toString()}`);
      if (res.status === 401 || res.status === 403) {
        await casLogin();
        continue;
      }
      if (res.status !== 200) return { status: res.status };
      const pages = res.data?.query?.pages || [];
      if (!pages.length) return { status: 200, text: '' };

      // Wikitext du slot main
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
  // On cible: description absente/trop courte, ou jamais traitée
  const { data, error } = await supabase
    .from('backup_oic_competences')
    .select('objectif_id, url_source, description, source_etag')
    .or(`description.is.null,description.eq.,char_length(description).lt.${minChars},completion_status.is.null`)
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
    const substantial = text && (text.length >= MIN_CHARS || /\n- |\n\d+\./.test(text));
    if (!substantial) {
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
}

run().catch(e => { console.error(e); process.exit(1); });