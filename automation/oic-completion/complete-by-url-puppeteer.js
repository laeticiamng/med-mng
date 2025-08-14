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
        await casLoginWithPuppeteer();
        continue;
      }
      if (res.status !== 200) return { status: res.status };
      const pages = res.data?.query?.pages || [];
      if (!pages.length) return { status: 200, text: '' };

      const rev = pages[0]?.revisions?.[0];
      const wikitext = rev?.slots?.main?.content || '';
      return { status: 200, text: wikitext };
    } catch (e) {
      console.error(`Erreur API (tentative ${i+1}/3):`, e.message);
      if (i < 2) await sleep(1000 * (i + 1));
      else return { status: 0, error: String(e) };
    }
  }
}

function normalizeText(wikitext) {
  if (!wikitext) return '';
  
  // Stratégie d'extraction élargie pour récupérer TOUT le contenu utile
  let extractedContent = '';
  
  // 1. Essayer d'extraire le champ Description spécifique
  const descMatch = wikitext.match(/\|[Dd]escription\s*=\s*([\s\S]*?)(?:\n\||\n}})/);
  if (descMatch && descMatch[1].trim()) {
    extractedContent = descMatch[1].trim();
  }
  
  // 2. Si pas de Description, extraire le contenu principal de la page
  if (!extractedContent || extractedContent.length < 100) {
    // Chercher d'autres sections utiles
    const contentPatterns = [
      /\|[Cc]ontenu\s*=\s*([\s\S]*?)(?:\n\||\n}})/,         // Champ Contenu
      /\|[Tt]exte\s*=\s*([\s\S]*?)(?:\n\||\n}})/,           // Champ Texte  
      /\|[Dd]éfinition\s*=\s*([\s\S]*?)(?:\n\||\n}})/,      // Champ Définition
      /==\s*Description\s*==([\s\S]*?)(?:==|\{\{|$)/i,      // Section Description
      /==\s*Définition\s*==([\s\S]*?)(?:==|\{\{|$)/i,       // Section Définition
      /==\s*Contenu\s*==([\s\S]*?)(?:==|\{\{|$)/i,          // Section Contenu
      /==\s*Objectif\s*==([\s\S]*?)(?:==|\{\{|$)/i,         // Section Objectif
    ];
    
    for (const pattern of contentPatterns) {
      const match = wikitext.match(pattern);
      if (match && match[1].trim() && match[1].trim().length > extractedContent.length) {
        extractedContent = match[1].trim();
      }
    }
  }
  
  // 3. En dernier recours, prendre tout le wikitext si rien d'autre n'est trouvé
  if (!extractedContent || extractedContent.length < 50) {
    extractedContent = wikitext;
  }
  
  // 4. Nettoyage et conversion vers texte pur
  let cleanText = htmlToText(extractedContent, { 
    wordwrap: 0,
    preserveNewlines: true,
    formatters: {
      // Formatter personnalisé pour préserver certaines structures
      'anchor': function (elem, walk, builder) {
        const href = elem.attribs && elem.attribs.href;
        const text = elem.children && elem.children.length > 0 ? walk(elem.children, builder) : '';
        return text; // Garder juste le texte des liens
      }
    }
  }).trim();
  
  // 5. Nettoyages supplémentaires spécifiques au format MediaWiki
  cleanText = cleanText
    .replace(/\{\{[^}]*\}\}/g, '')                    // Enlever les templates MediaWiki
    .replace(/\[\[([^|\]]*\|)?([^\]]*)\]\]/g, '$2')   // Convertir les liens internes
    .replace(/'{2,}/g, '')                            // Enlever le markup bold/italic
    .replace(/^[\s\*\-\#]*/, '')                      // Enlever les bullets en début
    .replace(/\n\s*\n\s*\n/g, '\n\n')                // Normaliser les sauts de ligne multiples
    .replace(/^\s+|\s+$/g, '')                       // Trim
    .replace(/\s+/g, ' ')                            // Normaliser les espaces
    .trim();
  
  return cleanText;
}

async function mark(objId, patch) {
  await supabase
    .from('backup_oic_competences')
    .update({ ...patch, completion_updated_at: new Date().toISOString() })
    .eq('objectif_id', objId);
}

async function pickBatch(minChars) {
  console.log(`🔍 Recherche ÉLARGIE d'items à compléter pour 100% de complétude (lot de ${BATCH})...`);
  
  // Stratégie ULTRA élargie pour TOUTES les descriptions incomplètes
  const { data, error } = await supabase
    .from('backup_oic_competences')
    .select('objectif_id, url_source, description, source_etag, completion_status, intitule')
    .or([
      // === Descriptions clairement incomplètes ===
      `description.is.null`,                                           
      `description.eq.''`,                                            
      `char_length(description).lt.500`,                              // Descriptions < 500 chars = probablement incomplètes
      
      // === Status indiquant des échecs ou incomplets ===
      `completion_status.is.null`,                                    
      `completion_status.eq.error`,                                   
      `completion_status.eq.empty`,                                   
      `completion_status.eq.skipped_empty`,                           
      `completion_status.neq.updated`,                                // Tout ce qui n'est pas "updated" 
      
      // === Descriptions avec marqueurs d'incomplétude ===
      `description.ilike.*à compléter*`,                              
      `description.ilike.*Description de l'objectif*`,                
      `description.ilike.*\.\.\..*`,                                  // Points de suspension
      `description.ilike.*[truncated]*`,                              
      `description.ilike.*[incomplete]*`,                             
      `description.ilike.*voir aussi*`,                               // Souvent signe d'incomplétude
      `description.ilike.*à définir*`,                                
      `description.ilike.*à rédiger*`,                                
      
      // === Descriptions avec HTML mal formaté ===
      `description.ilike.*&nbsp;*`,                                   // HTML entities non converties  
      `description.ilike.*&amp;*`,                                    
      `description.ilike.*&lt;*`,                                     
      `description.ilike.*&gt;*`,                                     
      `description.ilike.*<br>*`,                                     // Tags HTML non convertis
      `description.ilike.*<div>*`,                                    
      `description.ilike.*<p>*`,                                      
      
      // === Descriptions très courtes ou répétitives ===
      `description.ilike.*Définition*`,                               // Souvent juste "Définition" sans contenu
      `description.ilike.*Objectif*`,                                 
      `description.ilike.*Compétence*`,                               
      `description.like.%=%`,                                         // Formules/signes mathématiques seuls
      `description.like.%--%`,                                        // Tirets seuls
      
      // === Force la re-vérification des anciennes extractions ===
      `and(completion_status.eq.updated,char_length(description).lt.800)`, // Même les "updated" courts
      `completion_updated_at.lt.2025-08-01T00:00:00Z`                // Re-check tout ce qui date d'avant août 2025
    ].join(','))
    .not('url_source', 'is', null)                                   // Doit avoir une URL source
    .not('url_source', 'eq', '')                                     // URL non vide
    .limit(BATCH)
    .order('completion_updated_at', { ascending: true, nullsFirst: true });

  if (error) throw error;
  
  console.log(`📊 ${data?.length || 0} items trouvés à COMPLÉTER INTÉGRALEMENT`);
  
  // Log détaillé des exemples pour debug
  if (data && data.length > 0) {
    console.log(`🔍 Exemples d'items à compléter:`);
    data.slice(0, 5).forEach((item, i) => {
      const descLength = item.description?.length || 0;
      const status = item.completion_status || 'non_traité';
      const preview = item.description ? item.description.substring(0, 150).replace(/\n/g, ' ') : 'VIDE';
      console.log(`   ${i+1}. [${item.objectif_id}] "${item.intitule?.substring(0, 60)}..."`);
      console.log(`      Status: ${status} | Length: ${descLength} chars`);
      console.log(`      Preview: "${preview}${descLength > 150 ? '...' : ''}"`);
      console.log(`      URL: ${item.url_source}`);
      console.log(`      ---`);
    });
  }
  
  return data || [];
}

async function run() {
  console.log('🚀 Début du processus de complétion OIC avec Puppeteer');
  
  await casLoginWithPuppeteer();

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
    
    // Critères rigoureux pour une description VRAIMENT complète
    const isSubstantial = text && (
      text.length >= MIN_CHARS &&                            // Au moins 500 caractères
      text.split(' ').length >= 50 &&                        // Au moins 50 mots
      !text.includes('à compléter') &&                       // Pas de marqueurs d'incomplétude
      !text.includes('...') &&                               // Pas de troncature
      !/^(Définition|Objectif|Description)\.?\s*$/.test(text.trim()) && // Pas juste un titre
      !/^[\s\-\*\.&;]+$/.test(text.trim()) &&               // Pas juste de la ponctuation
      text.replace(/\s+/g, '').length >= MIN_CHARS * 0.7     // Minimum de contenu réel (pas que des espaces)
    );
    
    if (!isSubstantial) {
      const reason = !text ? 'no_content' : 
                     text.length < MIN_CHARS ? `too_short_${text.length}_chars` :
                     text.split(' ').length < 50 ? `too_few_words_${text.split(' ').length}` :
                     'quality_insufficient';
      await mark(objId, { 
        completion_status: 'skipped_empty', 
        completion_last_http: 200,
        completion_last_error: reason
      });
      skippedEmpty++;
      console.log(`   ⚠️ ${objId}: Contenu insuffisant (${reason})`);
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