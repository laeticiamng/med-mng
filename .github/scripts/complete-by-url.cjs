// .github/scripts/complete-by-url.cjs
// Parcourt les OIC à compléter, ouvre chaque url_source LiSA,
// extrait un texte propre et met à jour 'description' si le contenu est substantiel.
// Traçabilité via completion_status / codes HTTP / erreurs / hash.

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const pLimit = require('p-limit');
const crypto = require('crypto');
const { htmlToText } = require('html-to-text');

// Authentification CAS réutilisée du projet
let casLogin;
try {
  const casModule = require('../../oic-scripts/cas-login.cjs');
  casLogin = casModule.casLogin;
  console.log('✅ CAS module loaded successfully');
} catch (error) { 
  console.log('⚠️ CAS module not found, using fallback auth. Error:', error.message); 
  casLogin = null;
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.findIndex(a => a === `--${name}`);
  return i >= 0 ? argv[i+1] : def;
};
const BATCH = parseInt(arg('batch', '400'), 10);
const MIN_CHARS = parseInt(arg('minChars', '200'), 10);
const CONCURRENCY = parseInt(arg('concurrency', '6'), 10);

const jar = new CookieJar();
const http = wrapper(axios.create({
  jar,
  timeout: 20000,
  maxRedirects: 5,
  // on évite les throw sur HTTP non-200 : on gère nous-mêmes
  validateStatus: () => true
}));

const sleep = ms => new Promise(r => setTimeout(r, ms));
const hash = s => crypto.createHash('sha256').update(s || '').digest('hex');

// Fallback casLogin basique si non fourni par le repo
async function fallbackCasLogin() {
  console.log('⚠️ CAS login function not found, attempting basic auth...');
  const casUrl = 'https://cas.uness.fr/cas/login';
  const username = process.env.CAS_USERNAME;
  const password = process.env.CAS_PASSWORD;
  
  if (!username || !password) {
    console.warn('CAS credentials missing');
    return;
  }

  try {
    // Basic CAS authentication
    const loginPage = await http.get(casUrl);
    const ltMatch = loginPage.data.match(/name="lt" value="([^"]+)"/);
    const executionMatch = loginPage.data.match(/name="execution" value="([^"]+)"/);
    
    if (ltMatch && executionMatch) {
      await http.post(casUrl, {
        username,
        password,
        lt: ltMatch[1],
        execution: executionMatch[1],
        _eventId: 'submit'
      });
      console.log('✅ CAS authentication completed');
    }
  } catch (e) {
    console.warn('CAS auth failed:', e.message);
  }
}

async function ensureCas() {
  try {
    if (typeof casLogin === 'function') {
      console.log('🔐 Utilisation du module CAS principal...');
      await casLogin({ http, jar });
    } else {
      console.log('🔐 Utilisation du fallback CAS...');
      await fallbackCasLogin();
    }
  } catch (error) {
    console.warn('⚠️ Erreur lors de l\'authentification CAS:', error.message);
    // Continue sans bloquer le processus
  }
}

async function fetchText(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await http.get(url);
      if (res.status === 401 || res.status === 403) {
        // besoin de session CAS
        await ensureCas();
        continue;
      }
      if (res.status !== 200) return { status: res.status };
      const text = htmlToText(res.data, {
        wordwrap: 0,
        selectors: [
          { selector: 'script, style, nav, footer', format: 'skip' },
          { selector: 'th', format: 'skip' },
          { selector: 'td', format: 'block' }
        ]
      }).trim();
      return { status: 200, text };
    } catch (e) {
      if (i < 2) await sleep(1000 * (i + 1));
      else return { status: 0, error: String(e) };
    }
  }
}

async function pickBatch() {
  console.log(`🔍 Recherche de ${BATCH} items à compléter...`);
  
  // On cible : description absente/trop courte OU jamais traitée
  const { data, error } = await supabase
    .from('backup_oic_competences')
    .select('objectif_id, url_source, description, source_etag')
    .or(`description.is.null,description.eq.,char_length(description).lt.${MIN_CHARS},completion_status.is.null`)
    .limit(BATCH);

  if (error) {
    console.error('❌ Erreur lors de la sélection:', error);
    throw error;
  }
  
  console.log(`📋 ${data?.length || 0} items trouvés`);
  return data || [];
}

async function mark(objId, patch) {
  await supabase
    .from('backup_oic_competences')
    .update({ ...patch, completion_updated_at: new Date().toISOString() })
    .eq('objectif_id', objId);
}

async function run() {
  console.log(`🚀 Démarrage complétion OIC - batch=${BATCH}, minChars=${MIN_CHARS}, concurrency=${CONCURRENCY}`);
  
  // Debug environment
  console.log('Environment check:');
  console.log('- SUPABASE_URL:', SUPABASE_URL ? '✅ Present' : '❌ Missing');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing');
  console.log('- CAS_USERNAME:', process.env.CAS_USERNAME ? '✅ Present' : '❌ Missing');
  console.log('- CAS_PASSWORD:', process.env.CAS_PASSWORD ? '✅ Present' : '❌ Missing');
  
  const rows = await pickBatch();
  if (!rows.length) {
    console.log('✅ Aucun item à compléter (lot vide).');
    return;
  }

  console.log(`📝 ${rows.length} items à traiter`);
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

    const res = await fetchText(url);
    if (res?.status !== 200) {
      await mark(objId, {
        completion_status: 'skipped_error',
        completion_last_http: res?.status || 0,
        completion_last_error: res?.error || `HTTP ${res?.status}`
      });
      skippedError++;
      return;
    }

    const text = res.text;
    const substantial = text && (text.length >= MIN_CHARS || /\n- |\n\d+\./.test(text));
    if (!substantial) {
      await mark(objId, { completion_status: 'skipped_empty', completion_last_http: 200 });
      skippedEmpty++;
      return;
    }

    const newHash = hash(text);
    if (newHash === row.source_etag) {
      // Déjà à jour → rien à faire
      return;
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
      console.log(`✅ ${objId} updated (${text.length} chars)`);
    }
  })));

  console.log('\n📊 RÉSULTATS:');
  console.log(`🟢 updated=${updated} | 🟡 skipped_empty=${skippedEmpty} | 🔴 skipped_error=${skippedError}`);
  console.log(`🎯 Taux de réussite: ${Math.round((updated / rows.length) * 100)}%`);
}

run().catch(e => { 
  console.error('❌ Erreur:', e); 
  process.exit(1); 
});