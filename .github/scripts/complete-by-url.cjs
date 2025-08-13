// .github/scripts/complete-by-url.cjs
// Complète les OIC existantes à partir de url_source (LiSA).
// Auth CAS/OAuth2 "comme dans la technique": page protégée -> auth.uness.fr -> cookies.
// Source: API MediaWiki (revisions, rvslots=main) -> normalisation -> update Supabase si contenu substantiel.

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

// CLI args
const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i+1] : def;
};
const BATCH = parseInt(arg('batch', '400'), 10);
const MIN_CHARS = parseInt(arg('minChars', '200'), 10);
const CONCURRENCY = parseInt(arg('concurrency', '6'), 10);

console.log(`🎯 Configuration: batch=${BATCH}, minChars=${MIN_CHARS}, concurrency=${CONCURRENCY}`);

// HTTP client avec CookieJar (session CAS)
const jar = new CookieJar();
const http = wrapper(axios.create({
  jar,
  timeout: 20000,
  maxRedirects: 5,
  validateStatus: () => true
}));

const sleep = ms => new Promise(r => setTimeout(r, ms));
const hash = s => crypto.createHash('sha256').update(s || '').digest('hex');

// ===== AUTH CAS/OAuth2 =====
async function casLogin() {
  console.log('🔐 Démarrage authentification CAS...');
  const protectedUrl = 'https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Objectif_de_connaissance';

  let res = await http.get(protectedUrl);
  if (res.status === 200 && res.request?.res?.responseUrl?.includes('livret.uness.fr')) {
    console.log('✅ Déjà authentifié');
    return; // déjà authentifié
  }

  const loginUrl = res.request?.res?.responseUrl || res.headers?.location || res.config?.url;
  if (!loginUrl) {
    throw new Error('Impossible de déterminer l\'URL de login CAS');
  }

  console.log('🌐 Accès à la page de login CAS...');
  res = await http.get(loginUrl);
  if (res.status >= 300 && res.status < 400 && res.headers.location) {
    res = await http.get(res.headers.location);
  }

  const body = res.data || '';
  const hidden = {};
  for (const name of ['lt', 'execution', '_eventId', 'csrf_token']) {
    const m = body.match(new RegExp(`name=["']${name}["']\\s+value=["']([^"']+)["']`, 'i'));
    if (m) hidden[name] = m[1];
  }

  console.log('📝 Soumission des identifiants...');
  const form = new URLSearchParams({
    username: CAS_USERNAME,
    email: CAS_USERNAME,
    password: CAS_PASSWORD,
    ...hidden,
    _eventId: hidden._eventId || 'submit',
    submit: 'LOGIN'
  });

  const postRes = await http.post(res.request?.res?.responseUrl || loginUrl, form.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  let finalUrl = postRes.request?.res?.responseUrl || postRes.headers?.location;
  if (finalUrl && !String(finalUrl).includes('livret.uness.fr')) {
    const follow = await http.get(finalUrl);
    finalUrl = follow.request?.res?.responseUrl || follow.headers?.location || finalUrl;
  }

  console.log('🔍 Vérification de l\'authentification...');
  const check = await http.get(protectedUrl);
  if (check.status !== 200) {
    throw new Error(`CAS login seems incomplete (status=${check.status})`);
  }
  
  console.log('✅ Authentification CAS réussie');
}

// ===== MediaWiki API =====
function extractTitleFromUrl(url) {
  try {
    const idx = url.indexOf('/lisa/');
    if (idx < 0) return null;
    const path = url.slice(idx + 6); // ex "2025/Titre"
    return decodeURIComponent(path).replace(/^2025\//, '');
  } catch {
    return null;
  }
}

async function fetchTextFromApi(url) {
  const title = extractTitleFromUrl(url);
  if (!title) return { status: 0, error: 'cannot_extract_title' };

  const apiUrl = 'https://livret.uness.fr/lisa/api.php';
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
        console.log('🔑 Réauthentification nécessaire...');
        await casLogin();
        continue;
      }
      if (res.status !== 200) return { status: res.status };
      const pages = res.data?.query?.pages || [];
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

function normalizeText(wikitext) {
  if (!wikitext) return '';
  const m = wikitext.match(/\|[Dd]escription\s*=\s*([\s\S]*?)(?:\n\||\n}})/);
  const raw = (m ? m[1] : wikitext).trim();
  return htmlToText(raw, { wordwrap: 0 }).trim();
}

async function mark(objId, patch) {
  await supabase
    .from('backup_oic_competences')
    .update({ ...patch, completion_updated_at: new Date().toISOString() })
    .eq('objectif_id', objId);
}

async function pickBatch(minChars) {
  console.log(`🔍 Recherche d'items à compléter (lot de ${BATCH})...`);
  const { data, error } = await supabase
    .from('backup_oic_competences')
    .select('objectif_id, url_source, description, source_etag')
    .or(`description.is.null,description.eq.,char_length(description).lt.${minChars},completion_status.is.null`)
    .limit(BATCH);

  if (error) throw error;
  console.log(`📊 ${data?.length || 0} items trouvés à traiter`);
  return data || [];
}

async function run() {
  console.log('🚀 Début du processus de complétion OIC');
  
  await casLogin();

  const rows = await pickBatch(MIN_CHARS);
  if (!rows.length) {
    console.log('✅ Aucun item à compléter (lot vide).');
    return;
  }

  console.log(`⚡ Traitement de ${rows.length} items avec ${CONCURRENCY} requêtes concurrentes`);
  
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

  console.log(`\n📈 RÉSULTATS FINAUX:`);
  console.log(`🟢 updated=${updated} | 🟡 skipped_empty=${skippedEmpty} | 🔴 skipped_error=${skippedError}`);
  console.log(`✅ Traitement terminé avec succès`);
}

run().catch(e => { 
  console.error('❌ Erreur fatale:', e); 
  process.exit(1); 
});