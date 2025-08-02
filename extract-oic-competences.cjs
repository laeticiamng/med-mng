/* eslint-disable no-console */
const puppeteer = require('puppeteer');
const fs = require('fs');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  CAS_USERNAME,
  CAS_PASSWORD,
  FORCE_UPDATE = 'false',
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !CAS_USERNAME || !CAS_PASSWORD) {
  console.error('❌ Variables d'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const API_ROOT = 'https://livret.uness.fr/lisa/2025';

function log(...a) { console.log('[OIC]', ...a); }
fs.mkdirSync('.cache', { recursive: true });

// Fonction de pagination complète pour récupérer TOUS les IDs de pages OIC
async function listAllPageIds(cookieStr) {
  const ids = [];
  const cat = encodeURIComponent('Catégorie:Objectif_de_connaissance');
  let cont = '';
  let pageCount = 0;
  
  log('🔄 Début récupération complète des IDs...');
  
  do {
    const url = `${API_ROOT}/api.php?action=query&list=categorymembers&cmtitle=${cat}&cmlimit=500&format=json${cont ? '&' + cont : ''}`;
    
    log(`📄 Lot ${++pageCount} - Récupération de 500 IDs...`);
    
    try {
      const response = await fetch(url, {
        headers: { 
          Cookie: cookieStr,
          'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor/2.0)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const j = await response.json();
      
      if (j.error) {
        throw new Error(`API Error: ${j.error.code} - ${j.error.info}`);
      }
      
      if (!j.query?.categorymembers) {
        log('⚠️ Pas de categorymembers dans la réponse');
        break;
      }
      
      const currentBatch = j.query.categorymembers.map(p => p.pageid);
      ids.push(...currentBatch);
      
      log(`✅ Lot ${pageCount}: ${currentBatch.length} IDs récupérés (total: ${ids.length})`);
      
      // Préparer la continuation
      if (j.continue?.cmcontinue) {
        cont = `cmcontinue=${encodeURIComponent(j.continue.cmcontinue)}`;
        log(`🔄 Continuation disponible...`);
      } else {
        cont = '';
        log(`🏁 Fin de pagination atteinte`);
      }
      
    } catch (error) {
      log(`❌ Erreur lot ${pageCount}: ${error.message}`);
      throw error;
    }
    
    // Délai de courtoisie entre les requêtes
    if (cont) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
  } while (cont && pageCount < 20); // Sécurité : max 20 lots = 10000 pages
  
  log(`🎉 Récupération terminée: ${ids.length} IDs au total en ${pageCount} lots`);
  
  if (pageCount >= 20) {
    log(`⚠️ Limite de sécurité atteinte (20 lots max)`);
  }
  
  return ids;
}

// Authentification CAS (inchangée)
async function loginCAS() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ]
  });
  const page = await browser.newPage();

  log('🔐 Navigation vers page CAS...');
  await page.goto('https://auth.uness.fr/cas/login', { waitUntil: 'networkidle2' });
  
  log('📧 Saisie email...');
  await page.waitForSelector('input[name="username"]', { timeout: 10000 });
  await page.type('input[name="username"]', CAS_USERNAME);
  
  log('🔄 Clic étape 1...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('button[type="submit"]'),
  ]);
  
  log('🔐 Saisie mot de passe...');
  await page.waitForSelector('input[type="password"]', { timeout: 10000 });
  await page.type('input[type="password"]', CAS_PASSWORD);
  
  log('🔄 Clic étape 2...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('button[type="submit"]'),
  ]);

  // Attendre redirection complète vers UNESS
  let redirectAttempts = 0;
  while (redirectAttempts < 10) {
    const currentUrl = page.url();
    if (currentUrl.includes('livret.uness.fr')) {
      log('✅ Redirection vers UNESS réussie');
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    redirectAttempts++;
  }

  const cookies = (await page.cookies())
    .filter(c => c.domain.includes('uness.fr'))
    .map(c => `${c.name}=${c.value}`)
    .join('; ');

  log(`🍪 ${(await page.cookies()).length} cookies récupérés`);
  fs.writeFileSync('.cache/cookies.txt', cookies);
  await browser.close();
  return cookies;
}

// Ajout : détection des compétences incomplètes
async function getIncompleteIds() {
  const { data, error } = await supabase
    .from('backup_oic_competences')
    .select('objectif_id')
    .or('description.is.null,description.eq.');

  if (error) throw error;
  return new Set(data.map(d => d.objectif_id));
}

// Extraction d'une page
function titleToId(title) {
  // Objectif_de_connaissance_OIC-123-01-A-04 → OIC-123-01-A-04
  const m = title.match(/OIC-\d{3}-\d{2}-[AB]-\d{2}/);
  return m ? m[0] : null;
}

async function fetchPage(pageId, cookieStr) {
  const url = `${API_ROOT}/api.php?action=query&prop=revisions&rvprop=content&format=json&formatversion=2&pageids=${pageId}`;
  const res = await fetch(url, { headers: { Cookie: cookieStr, 'User-Agent': 'Mozilla/5.0' } });
  return res.json();
}

function parsePage(pageJson, title) {
  const wiki = pageJson.query.pages[0].revisions?.[0]?.content ?? '';
  const id = titleToId(title);
  if (!id) return null;

  const intitule = wiki.match(/'''(.*?)'''/)?.[1] ?? title;
  const rubrique = wiki.match(/\[\[Catégorie:(.*?)\]\]/)?.[1] ?? '';
  const description = wiki.split('\n')
    .filter(l => l.trim() && !l.startsWith('=') && !l.startsWith('{{') && !l.startsWith('[['))
    .join(' ')
    .slice(0, 500);

  return {
    objectif_id: id,
    intitule,
    item_parent: id.slice(4, 7),
    rang: id.includes('-A-') ? 'A' : 'B',
    rubrique,
    description,
    ordre: Number(id.split('-').pop()),
    url_source: `https://livret.uness.fr/lisa/2025/${encodeURIComponent(title)}`,
    raw_json: pageJson,
    extraction_status: 'complete',
    date_import: new Date().toISOString(),
  };
}

// Boucle principale avec mode complétion
async function main() {
  try {
    const cookies = await loginCAS();           // 1️⃣ Auth CAS
    const incompleteSet = (FORCE_UPDATE === 'true') ? new Set() : await getIncompleteIds();
    const completionMode = incompleteSet.size > 0 && FORCE_UPDATE !== 'true';

    log(completionMode
        ? `🔄 Mode complétion : ${incompleteSet.size} descriptions manquantes`
        : '📥 Mode extraction complète (FORCE_UPDATE activé ou aucune incomplète)');

    // 2️⃣ lister toutes les pages OIC avec pagination complète
    log('📡 Récupération de TOUS les IDs de pages via pagination...');
    const pageIds = await listAllPageIds(cookies);
    log(`📊 Total pages trouvées: ${pageIds.length}`);

    let processed = 0, updated = 0, skipped = 0, errors = 0;
    
    log(`🚀 Début traitement des pages...`);
    for (const pid of pageIds) {
      try {
        const pageJson = await fetchPage(pid, cookies);
        
        if (!pageJson.query?.pages?.[0]) {
          log(`⚠️ Page ${pid}: pas de contenu trouvé`);
          continue;
        }
        
        const title = pageJson.query.pages[0].title;
        const objectifId = titleToId(title);

        if (!objectifId) {
          // Page non-OIC, skip silencieusement
          continue;
        }

        if (completionMode && !incompleteSet.has(objectifId)) {
          skipped++;
          continue;  // skip - déjà complète
        }

        const comp = parsePage(pageJson, title);
        if (!comp) {
          log(`⚠️ Parsing échoué pour ${title}`);
          continue;
        }

        processed++;
        
        // Optimisation: réduire la taille du raw_json
        const slimRawJson = {
          query: {
            pages: [{
              pageid: pageJson.query.pages[0].pageid,
              title: title,
              revisions: pageJson.query.pages[0].revisions ? [{
                contentformat: pageJson.query.pages[0].revisions[0].contentformat,
                contentmodel: pageJson.query.pages[0].revisions[0].contentmodel
              }] : []
            }]
          }
        };
        comp.raw_json = slimRawJson;

        const { error } = await supabase.from('backup_oic_competences')
          .upsert([comp], { onConflict: 'objectif_id', ignoreDuplicates: false });
        
        if (error) {
          log(`❌ Erreur Supabase pour ${objectifId}: ${error.message}`);
          errors++;
        } else {
          updated++;
          if (processed % 50 === 0) {
            log(`📊 Progression: ${processed} traités, ${updated} mis à jour, ${skipped} ignorés`);
          }
        }
        
        // Délai entre les pages pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (pageError) {
        log(`❌ Erreur page ${pid}: ${pageError.message}`);
        errors++;
      }
    }

    const report = { 
      timestamp: new Date().toISOString(), 
      completionMode, 
      totalPages: pageIds.length,
      processed, 
      updated, 
      skipped,
      errors,
      success: errors === 0
    };
    
    fs.writeFileSync('.cache/extraction-success.json', JSON.stringify(report, null, 2));
    log('✅ Terminé :', report);
    
  } catch (error) {
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    };
    fs.writeFileSync('.cache/extraction-error.json', JSON.stringify(errorReport, null, 2));
    throw error;
  }
}

main().catch(e => {
  fs.writeFileSync('.cache/extraction-error.log', e.stack);
  console.error(e);
  process.exit(1);
});
  const allCompetences = [];
  let continueToken = '';
  let pageCount = 0;
  
  log('📡 === EXTRACTION VIA API MEDIAWIKI ===');
  
  do {
    const apiUrl = new URL(config.urls.api);
    const categoryTitle = 'Catégorie:Objectif_de_connaissance';
    
    apiUrl.searchParams.set('action', 'query');
    apiUrl.searchParams.set('list', 'categorymembers');
    apiUrl.searchParams.set('cmtitle', categoryTitle);
    apiUrl.searchParams.set('cmlimit', '500');
    apiUrl.searchParams.set('format', 'json');
    if (continueToken) {
      apiUrl.searchParams.set('cmcontinue', continueToken);
    }
    
    let finalUrl = apiUrl.toString();
    if (finalUrl.includes('Catégorie%3AObjectif_de_connaissance')) {
      finalUrl = finalUrl.replace('Catégorie%3AObjectif_de_connaissance', 'Catégorie:Objectif_de_connaissance');
    }
    
    log(`🔗 URL API: ${finalUrl}`);
    
    // Tenter avec page.evaluate et cookies explicites
    const apiResponse = await page.evaluate(async (url, cookies) => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor/1.0)',
            'Accept': 'application/json',
            'Referer': 'https://livret.uness.fr/lisa/2025/'
          },
          credentials: 'include'
        });
        
        const text = await response.text();
        return {
          ok: response.ok,
          status: response.status,
          text: text
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message
        };
      }
    }, finalUrl, cookieString);
    
    if (!apiResponse.ok) {
      throw new Error(`API request failed: ${apiResponse.error || apiResponse.status}`);
    }
    
    let apiData;
    try {
      apiData = JSON.parse(apiResponse.text);
    } catch (parseError) {
      log(`❌ Erreur parsing JSON API: ${parseError.message}`);
      log(`📄 Réponse brute: ${apiResponse.text.substring(0, 500)}...`);
      throw new Error('Réponse API non-JSON');
    }
    
    if (apiData.error) {
      log(`❌ ERREUR API: ${JSON.stringify(apiData.error)}`);
      if (apiData.error.code === 'readapidenied') {
        throw new Error('API MediaWiki protégée - access denied');
      }
      throw new Error(`API Error: ${apiData.error.code} - ${apiData.error.info}`);
    }
    
    if (!apiData.query?.categorymembers) {
      throw new Error('Pas de categorymembers dans la réponse API');
    }
    
    const allMembers = apiData.query.categorymembers || [];
    log(`📋 ${allMembers.length} membres trouvés dans la catégorie (API)`);
    
    // DEBUG: Afficher les premiers titres pour comprendre le format
    if (pageCount === 0 && allMembers.length > 0) {
      log(`🔍 DEBUG - Exemples de titres de pages:`);
      allMembers.slice(0, 10).forEach((page, i) => {
        log(`   ${i+1}. "${page.title}" (ID: ${page.pageid})`);
      });
    }
    
    // Tester différents patterns de filtrage - format réel OIC-XXX-XX-A
    const oicPattern1 = /OIC-\d{3}-\d{2}-[AB]/;
    const oicPattern2 = /OIC[\s_-]\d{3}[\s_-]\d{2}[\s_-][AB]/;
    const oicPattern3 = /OIC.*\d{3}.*\d{2}.*[AB]/;
    
    let validPages = allMembers.filter(p => p.title?.match(oicPattern1));
    
    if (validPages.length === 0) {
      log(`⚠️ Pattern strict ne trouve rien, test pattern flexible...`);
      validPages = allMembers.filter(p => p.title?.match(oicPattern2));
    }
    
    if (validPages.length === 0) {
      log(`⚠️ Pattern avec espaces ne trouve rien, test pattern très flexible...`);
      validPages = allMembers.filter(p => p.title?.match(oicPattern3));
    }
    
    if (validPages.length === 0) {
      log(`🔍 PATTERN DEBUG - Test si les pages contiennent "OIC":`);
      const oicPages = allMembers.filter(p => p.title?.includes('OIC'));
      log(`   → ${oicPages.length} pages contiennent "OIC"`);
      if (oicPages.length > 0) {
        oicPages.slice(0, 5).forEach((page, i) => {
          log(`     ${i+1}. "${page.title}"`);
        });
      }
      
      // Si aucun pattern ne fonctionne, prendre toutes les pages pour debug
      if (allMembers.length > 0) {
        log(`🚨 TAKING ALL PAGES FOR DEBUG - Will extract content to see actual format`);
        validPages = allMembers.slice(0, 10); // Prendre seulement 10 pour debug
      }
    }
    
    // FILTRAGE MODE COMPLÉTION : ne traiter que les pages à compléter
    let pageIds;
    if (stats.completionMode && stats.targetIds) {
      const pagesToProcess = validPages.filter(page => {
        const match = page.title?.match(/OIC-(\d{3})-(\d{2})-([AB])/);
        if (match) {
          const fullId = match[0];
          return stats.targetIds.has(fullId);
        }
        return false;
      });
      
      pageIds = pagesToProcess.map(p => p.pageid);
      log(`🔄 MODE COMPLÉTION: ${pageIds.length}/${validPages.length} pages sélectionnées pour complétion`);
      
      if (pageIds.length === 0) {
        log(`✅ Aucune page à compléter dans ce lot - toutes les descriptions sont complètes !`);
        continueToken = '';
        break;
      }
    } else {
      pageIds = validPages.map(p => p.pageid);
      log(`📊 MODE EXTRACTION COMPLÈTE: ${pageIds.length} pages à traiter`);
    }
    
    stats.totalFound += pageIds.length;
    log(`📄 Lot ${++pageCount}: ${pageIds.length}/${allMembers.length} compétences valides (Total: ${stats.totalFound})`);
    
    // Traiter par batches
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
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    continueToken = apiData.continue?.cmcontinue || '';
    
  } while (continueToken);
  
  log(`✅ API MediaWiki: ${allCompetences.length} compétences extraites`);
  return allCompetences;
}

// Méthode scraping HTML de secours
async function extractViaCategoryScraping(page, stats) {
  const allCompetences = [];
  let currentPage = 0;
  
  log('🕷️ === EXTRACTION PAR SCRAPING HTML ===');
  
  do {
    const categoryUrl = currentPage === 0 
      ? config.urls.category
      : `${config.urls.category}?pagefrom=${currentPage}`;
      
    log(`🌐 Navigation vers: ${categoryUrl}`);
    
    try {
      await page.goto(categoryUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Attendre que le contenu se charge
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Extraire les liens OIC de la page de catégorie
      const oicPages = await page.evaluate(() => {
        const links = [];
        const allLinks = document.querySelectorAll('a[href*="OIC-"]');
        
        allLinks.forEach(link => {
          const href = link.getAttribute('href');
          const title = link.textContent || link.getAttribute('title') || '';
          
          if (title.match(/OIC-\d{3}-\d{2}-[AB]/)) {
            // Extraire l'ID de page depuis l'URL si possible
            const pageIdMatch = href.match(/[?&]curid=(\d+)/);
            const pageId = pageIdMatch ? parseInt(pageIdMatch[1]) : Math.random() * 1000000; // Fallback
            
            links.push({
              title: title,
              href: href,
              pageid: pageId
            });
          }
        });
        
        return links;
      });
      
      log(`🔍 Scraping HTML: ${oicPages.length} pages OIC trouvées`);
      stats.totalFound += oicPages.length;
      
      if (oicPages.length === 0) {
        log(`❌ Aucune page OIC trouvée - fin du scraping`);
        break;
      }
      
      // Traiter chaque page individuellement
      for (let i = 0; i < oicPages.length; i++) {
        const oicPage = oicPages[i];
        log(`📖 Scraping page ${i+1}/${oicPages.length}: ${oicPage.title}`);
        
        try {
          // Naviguer vers la page individuelle
          const fullUrl = oicPage.href.startsWith('http') 
            ? oicPage.href 
            : `https://livret.uness.fr${oicPage.href}`;
          
          await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Extraire le contenu de la page
          const pageContent = await page.evaluate(() => {
            return {
              title: document.title || '',
              content: document.body.innerText || ''
            };
          });
          
          // Simuler une structure de page pour parseCompetence
          const simulatedPageData = {
            title: oicPage.title,
            pageid: oicPage.pageid,
            revisions: [{
              slots: {
                main: {
                  content: pageContent.content
                }
              }
            }]
          };
          
          const competence = parseCompetence(simulatedPageData);
          if (competence) {
            allCompetences.push(competence);
            stats.totalProcessed++;
            log(`   ✅ Compétence parsée: ${competence.objectif_id}`);
          } else {
            log(`   ❌ Échec parsing: ${oicPage.title}`);
            stats.totalErrors++;
          }
          
        } catch (pageError) {
          log(`   ❌ Erreur page ${oicPage.title}: ${pageError.message}`);
          stats.totalErrors++;
        }
        
        // Pause entre pages
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      currentPage++;
      
      // Vérifier s'il y a une page suivante
      const hasNextPage = await page.evaluate(() => {
        return document.querySelector('a:contains("suivant")') !== null ||
               document.querySelector('a[href*="pagefrom="]') !== null;
      });
      
      if (!hasNextPage || currentPage > 20) { // Limite de sécurité
        log(`📄 Fin du scraping - page ${currentPage} ou limite atteinte`);
        break;
      }
      
    } catch (error) {
      log(`❌ Erreur scraping page ${currentPage}: ${error.message}`);
      break;
    }
    
  } while (true);
  
  log(`✅ Scraping HTML: ${allCompetences.length} compétences extraites`);
  return allCompetences;
}

// Récupérer le contenu des pages avec DEBUG INTENSIF
async function getPageContents(page, pageIds) {
  log(`📥 === DÉBUT RÉCUPÉRATION CONTENU ${pageIds.length} PAGES ===`);
  log(`🔢 Page IDs: ${pageIds.join(', ')}`);
  
  const contentUrl = new URL(config.urls.api);
  contentUrl.searchParams.set('action', 'query');
  contentUrl.searchParams.set('pageids', pageIds.join('|'));
  contentUrl.searchParams.set('prop', 'revisions|info');
  contentUrl.searchParams.set('rvprop', 'content|ids|timestamp');
  contentUrl.searchParams.set('rvslots', 'main');
  contentUrl.searchParams.set('format', 'json');
  contentUrl.searchParams.set('formatversion', '2');
  
  log(`🔗 URL contenu: ${contentUrl.toString()}`);
  
  try {
    // Utiliser page.goto() pour préserver les cookies CAS
    const response = await page.goto(contentUrl.toString(), { waitUntil: 'networkidle2' });
    const responseText = await page.content();
    
    // Extraire le JSON de la réponse
    const jsonMatch = responseText.match(/<pre[^>]*>({.*})<\/pre>/s);
    if (!jsonMatch) {
      log(`❌ Format de réponse contenu inattendu: ${responseText.substring(0, 500)}`);
      throw new Error('Format de réponse contenu non JSON');
    }
    
    const contentData = JSON.parse(jsonMatch[1]);
    log(`📄 Response status: ${response.status()}`);
    log(`📄 Response data keys: ${Object.keys(contentData)}`);
    if (contentData.query && contentData.query.pages) {
      log(`📄 Pages count: ${Object.keys(contentData.query.pages).length}`);
    }
    
    log(`📄 Réponse contenu reçue - Keys: ${Object.keys(contentData)}`);
    
    if (contentData.error) {
      log(`❌ ERREUR API CONTENU: ${JSON.stringify(contentData.error)}`);
      throw new Error(`Content API Error: ${contentData.error.code} - ${contentData.error.info}`);
    }
    
    if (!contentData.query) {
      log(`❌ PAS DE QUERY dans réponse contenu`);
      log(`📄 Réponse complète: ${JSON.stringify(contentData)}`);
      throw new Error('Pas de section query dans la réponse contenu');
    }
    
    if (!contentData.query.pages) {
      log(`❌ PAS DE PAGES dans query contenu`);
      log(`📄 Query keys: ${Object.keys(contentData.query)}`);
      throw new Error('Pas de pages dans la réponse contenu');
    }
    
    const pages = Object.values(contentData.query.pages);
    log(`📚 ${pages.length} pages reçues pour traitement`);
    
    const competences = [];
    
    for (let i = 0; i < pages.length; i++) {
      const pageData = pages[i];
      log(`📖 Traitement page ${i+1}/${pages.length}: "${pageData.title}" (ID: ${pageData.pageid})`);
      
      // Debug du contenu de la page
      if (pageData.revisions && pageData.revisions.length > 0) {
        const revision = pageData.revisions[0];
        log(`📝 Révision trouvée - slots: ${Object.keys(revision.slots || {})}`);
        if (revision.slots && revision.slots.main) {
          const contentLength = revision.slots.main.content?.length || 0;
          log(`📄 Contenu main: ${contentLength} caractères`);
          if (contentLength > 0) {
            log(`🔍 Début contenu: ${revision.slots.main.content.substring(0, 200)}...`);
          }
        }
      } else {
        log(`❌ Aucune révision trouvée pour page "${pageData.title}"`);
      }
      
      const competence = parseCompetence(pageData);
      if (competence) {
        log(`✅ Compétence parsée: ${competence.objectif_id} - ${competence.intitule.substring(0, 50)}...`);
        competences.push(competence);
      } else {
        log(`❌ Échec parsing pour page "${pageData.title}"`);
      }
    }
    
    log(`📥 === FIN RÉCUPÉRATION CONTENU ===`);
    log(`✅ ${competences.length}/${pages.length} compétences extraites avec succès`);
    
    return competences;
    
  } catch (error) {
    log(`❌ ERREUR CRITIQUE récupération contenu: ${error.message}`);
    log(`📄 Stack trace: ${error.stack}`);
    throw error;
  }
}

// Parser une compétence
function parseCompetence(pageData) {
  try {
    const title = pageData.title || '';
    // Chercher le pattern OIC réel: OIC-XXX-XX-A (sans partie finale)
    const match = title.match(/OIC-(\d{3})-(\d{2})-([AB])/);
    
    if (!match) {
      log(`❌ Pattern OIC non trouvé dans: "${title}"`);
      return null;
    }
    
    const [fullId, item, rubriqueCode, rang] = match;
    const ordre = 1; // Valeur par défaut
    
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

// Vérifier les compétences incomplètes en base (logique avancée)
async function getIncompleteCompetences() {
  log('🔍 Vérification avancée des compétences incomplètes...');
  
  try {
    const { data: allCompetences, error } = await supabase
      .from('backup_oic_competences')
      .select('objectif_id, description, intitule');
    
    if (error) {
      throw new Error(`Erreur récupération compétences: ${error.message}`);
    }
    
    // Logique avancée de détection d'incomplétude
    const incompletes = allCompetences.filter(comp => {
      const desc = comp.description?.trim() || '';
      const titre = comp.intitule?.trim() || '';
      
      // Cas 1: Description vide ou null
      if (!desc) return true;
      
      // Cas 2: Description trop courte (< 40 caractères)
      if (desc.length < 40) return true;
      
      // Cas 3: Extraction HTML mal parsée
      if (/==|Titre:|{{\||<br\s*\/?>/i.test(desc)) return true;
      
      // Cas 4: Fragments incomplets (commence par - ou *)
      if (/^[-*]\s/.test(desc)) return true;
      
      // Cas 5: Entités HTML non décodées
      if (/&lt;|&gt;|&amp;|&nbsp;/.test(desc)) return true;
      
      // Cas 6: Titre corrompu avec balises MediaWiki
      if (/\[\[.*\]\]/.test(titre)) return true;
      
      return false;
    });
    
    log(`📊 ${incompletes.length} compétences incomplètes détectées (sur ${allCompetences.length} total)`);
    log(`🔍 Critères: descriptions vides, < 40 chars, HTML corrompu, fragments, entités HTML, titres corrompus`);
    
    if (incompletes.length > 0) {
      log(`🔍 Exemples de compétences incomplètes:`);
      incompletes.slice(0, 5).forEach((comp, i) => {
        const reason = !comp.description?.trim() ? 'vide' : 
                     comp.description.length < 40 ? 'trop courte' :
                     /==|Titre:|{{\||<br\s*\/?>/i.test(comp.description) ? 'HTML corrompu' :
                     /^[-*]\s/.test(comp.description) ? 'fragment' :
                     /&lt;|&gt;|&amp;|&nbsp;/.test(comp.description) ? 'entités HTML' :
                     /\[\[.*\]\]/.test(comp.intitule) ? 'titre corrompu' : 'autre';
        log(`   ${i+1}. ${comp.objectif_id} - ${comp.intitule || 'Sans titre'} (${reason})`);
      });
    }
    
    return new Set(incompletes.map(comp => comp.objectif_id));
    
  } catch (error) {
    log(`❌ Erreur vérification incomplètes: ${error.message}`);
    return new Set();
  }
}

// Insertion dans Supabase avec mode complétion
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
        .from('backup_oic_competences')
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

// Rapport final avec statistiques de complétion
async function generateFinalReport(stats) {
  log('\n📊 GÉNÉRATION RAPPORT FINAL...');
  log('===============================');
  
  try {
    // Compter le total de compétences
    const { count: totalCount, error: countError } = await supabase
      .from('backup_oic_competences')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw new Error(`Erreur comptage total: ${countError.message}`);
    }
    
    // Compter les compétences avec descriptions vides
    const { count: incompleteCount, error: incompleteError } = await supabase
      .from('backup_oic_competences')
      .select('*', { count: 'exact', head: true })
      .or('description.is.null,description.eq.');
    
    if (incompleteError) {
      throw new Error(`Erreur comptage incomplètes: ${incompleteError.message}`);
    }
    
    const duration = Math.round((Date.now() - stats.startTime) / 1000);
    const totalCompleteness = ((totalCount / 4872) * 100).toFixed(2);
    const completeCount = totalCount - incompleteCount;
    const descriptionCompleteness = totalCount > 0 ? ((completeCount / totalCount) * 100).toFixed(2) : 0;
    
    if (stats.completionMode) {
      log(`\n🔄 RAPPORT COMPLÉTION TERMINÉ !`);
      log(`============================`);
      log(`⏱️  Durée totale: ${duration}s (${Math.round(duration/60)}min)`);
      log(`🎯 Compétences ciblées: ${stats.targetIds?.size || 0}`);
      log(`📊 Pages trouvées: ${stats.totalFound}`);
      log(`✅ Pages traitées: ${stats.totalProcessed}`);
      log(`💾 Compétences mises à jour: ${stats.totalInserted}`);
      log(`❌ Erreurs: ${stats.totalErrors}`);
      log(`📈 Compétences complètes: ${completeCount}/${totalCount} (${descriptionCompleteness}%)`);
      log(`🔢 Compétences incomplètes restantes: ${incompleteCount}`);
      
      if (incompleteCount === 0) {
        log(`🎉 MISSION ACCOMPLIE ! Toutes les descriptions sont maintenant complètes !`);
      } else if (incompleteCount < 100) {
        log(`🔥 QUASI-TERMINÉ ! Seulement ${incompleteCount} descriptions manquantes`);
      } else {
        log(`⚠️  PROGRÈS RÉALISÉ : ${stats.totalInserted} descriptions complétées`);
      }
    } else {
      log(`\n🎉 EXTRACTION TERMINÉE !`);
      log(`======================`);
      log(`⏱️  Durée totale: ${duration}s (${Math.round(duration/60)}min)`);
      log(`📊 Pages trouvées: ${stats.totalFound}`);
      log(`✅ Pages traitées: ${stats.totalProcessed}`);
      log(`💾 Compétences insérées: ${stats.totalInserted}`);
      log(`❌ Erreurs: ${stats.totalErrors}`);
      log(`📈 Total en base: ${totalCount}/4872 (${totalCompleteness}%)`);
      log(`🧩 Descriptions complètes: ${completeCount}/${totalCount} (${descriptionCompleteness}%)`);
      
      if (totalCount >= 4872) {
        log(`🎯 OBJECTIF ATTEINT ! Les 4,872 compétences ont été extraites avec succès !`);
      } else if (totalCount > 4000) {
        log(`🔥 EXTRACTION QUASI-COMPLÈTE ! ${totalCount} compétences extraites (${4872-totalCount} manquantes)`);
      } else {
        log(`⚠️  EXTRACTION PARTIELLE : ${totalCount} compétences extraites`);
      }
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
    
    // Sauvegarder les statistiques de complétion
    if (stats.completionMode) {
      // Créer le dossier .cache s'il n'existe pas
      if (!fs.existsSync('.cache')) {
        fs.mkdirSync('.cache');
      }
      
      fs.writeFileSync('.cache/extraction-success.json', JSON.stringify({
        mode: 'completion',
        timestamp: new Date().toISOString(),
        duration: duration,
        targetCompetences: stats.targetIds?.size || 0,
        processed: stats.totalProcessed,
        updated: stats.totalInserted,
        errors: stats.totalErrors,
        totalInDatabase: totalCount,
        completeDescriptions: completeCount,
        incompleteDescriptions: incompleteCount,
        completenessPercentage: parseFloat(descriptionCompleteness),
        success: incompleteCount === 0
      }, null, 2));
      log(`💾 Rapport de complétion sauvegardé: .cache/extraction-success.json`);
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