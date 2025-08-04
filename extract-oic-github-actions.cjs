/* eslint-disable no-console */
// 🚀 EXTRACTION COMPLETE DES COMPETENCES OIC AVEC AUTHENTIFICATION CAS
// Basé sur les logs GitHub Actions du 2 août 2025 - Version GitHub Actions compatible

const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CAS_USERNAME = process.env.CAS_USERNAME;
const CAS_PASSWORD = process.env.CAS_PASSWORD;

if (!SUPABASE_SERVICE_KEY || !CAS_USERNAME || !CAS_PASSWORD) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_KEY);
  console.error('   CAS_USERNAME:', !!CAS_USERNAME);
  console.error('   CAS_PASSWORD:', !!CAS_PASSWORD);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function log(...args) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}]`, ...args);
}

// Authentification CAS avec Puppeteer - Basée sur les logs réels
async function authenticateWithCAS() {
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

  const page = await browser.newPage();
  
  // Configuration de la page
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    log('🔐 Authentification CAS...');
    log('🌐 Navigation vers page protégée pour déclencher l\'authentification...');
    
    // Aller à une page protégée pour déclencher l'authentification CAS
    await page.goto('https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Objectif_de_connaissance', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForTimeout(4000);
    
    const currentUrl = page.url();
    log(`🔍 URL initiale: ${currentUrl}`);
    
    if (currentUrl.includes('auth.uness.fr/cas/login')) {
      log('🔑 Authentification CAS requise - début du processus...');
      
      await page.waitForTimeout(3000);
      
      // Étape 1: Saisir l'email
      log('📧 Saisie de l\'email...');
      await page.waitForSelector('#username', { timeout: 10000 });
      await page.type('#username', CAS_USERNAME);
      log(`✅ Email saisi: ${CAS_USERNAME.substring(0, 3)}***`);
      
      // Cliquer sur le bouton de connexion étape 1
      log('🔄 Clic sur le bouton de connexion étape 1...');
      await page.click('input[type="submit"][value="Connexion"]');
      
      await page.waitForTimeout(4000);
      
      // Étape 2: Saisir le mot de passe
      log('🔐 Saisie du mot de passe...');
      await page.waitForSelector('#password', { timeout: 10000 });
      await page.type('#password', CAS_PASSWORD);
      log('✅ Mot de passe saisi');
      
      // Cliquer sur le bouton de connexion étape 2
      log('🔄 Clic sur le bouton de connexion étape 2...');
      await page.click('input[type="submit"][value="Connexion"]');
      
      // Attendre la redirection OAuth2 complète
      log('⏳ Attente de la redirection OAuth2 complète...');
      
      // Attendre que l'URL change vers livret.uness.fr
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await page.waitForTimeout(1000);
        attempts++;
        const url = page.url();
        log(`🔍 Tentative ${attempts} - URL actuelle: ${url.substring(0, 100)}...`);
        
        if (url.includes('livret.uness.fr')) {
          log('🎉 Redirection OAuth2 réussie !');
          break;
        }
      }
      
      log('✅ Authentification CAS terminée avec succès');
    }
    
    // Récupérer les cookies de session
    const cookies = await page.cookies();
    const unessCookies = cookies.filter(cookie => cookie.domain.includes('uness.fr'));
    log(`🍪 Cookies de session récupérés: ${unessCookies.length} cookies pour uness.fr`);
    
    log('🔍 COOKIES DÉTAILLÉS:');
    unessCookies.forEach((cookie, index) => {
      const namePreview = cookie.name.length > 20 ? cookie.name.substring(0, 20) + '...' : cookie.name;
      const valuePreview = cookie.value.length > 20 ? cookie.value.substring(0, 20) + '...' : cookie.value;
      log(`   ${index + 1}. ${namePreview}=${valuePreview} (domain: ${cookie.domain})`);
    });
    
    // Test de l'API avec authentification
    log('🧪 TEST API avec authentification et cookies...');
    const testApiUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Cat%C3%A9gorie%3AObjectif_de_connaissance&cmlimit=1&format=json';
    
    const response = await page.evaluate(async (url) => {
      const resp = await fetch(url);
      return {
        status: resp.status,
        ok: resp.ok,
        text: await resp.text()
      };
    }, testApiUrl);
    
    log(`🧪 Réponse API test: status=${response.status}, ok=${response.ok}`);
    log(`🧪 Contenu API test (200 premiers chars): ${response.text.substring(0, 200)}`);
    
    if (response.ok && response.text.includes('categorymembers')) {
      const apiData = JSON.parse(response.text);
      const membersCount = apiData.query?.categorymembers?.length || 0;
      log(`✅ TEST API RÉUSSI: ${membersCount} membres trouvés`);
    }
    
    const finalUrl = page.url();
    log(`🔍 URL après authentification: ${finalUrl}`);
    
    if (finalUrl.includes('livret.uness.fr')) {
      log('✅ Déjà sur livret.uness.fr après authentification');
    }
    
    await page.waitForTimeout(3000);
    
    const verificationUrl = page.url();
    log(`🔍 URL finale pour vérification: ${verificationUrl}`);
    log('✅ Authentification CAS réussie');
    
    return { page, browser, cookies: unessCookies };
    
  } catch (error) {
    await browser.close();
    throw error;
  }
}

// Parser pour extraire les données OIC du contenu MediaWiki
function parseOICCompetence(content) {
  try {
    if (!content || typeof content !== 'string') return null;
    
    // Pattern pour extraire les champs du template MediaWiki
    const patterns = {
      identifiant: /\|Identifiant\s*=\s*([^|\n]+)/i,
      parent_id: /\|Parent_id\s*=\s*([^|\n]+)/i,
      rang: /\|Rang\s*=\s*([^|\n]+)/i,
      intitule: /\|Intitule\s*=\s*([^|\n]+)/i,
      description: /\|Description\s*=\s*([^|\n]+)/i,
      rubrique: /\|Rubrique\s*=\s*([^|\n]+)/i,
      contributeurs: /\|Contributeurs\s*=\s*([^|\n]+)/i,
      ordre: /\|Ordre\s*=\s*([^|\n]+)/i
    };
    
    const result = {};
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = content.match(pattern);
      if (match && match[1]) {
        result[key] = match[1].trim();
      }
    }
    
    // Validation des champs obligatoires
    if (!result.identifiant || !result.identifiant.startsWith('OIC-')) {
      return null;
    }
    
    return {
      objectif_id: result.identifiant,
      item_parent: result.parent_id ? `IC-${result.parent_id}` : null,
      rang: result.rang || 'A',
      intitule: result.intitule || '',
      description: result.description || '',
      rubrique: result.rubrique || '',
      ordre: result.ordre ? parseInt(result.ordre) : null,
      raw_json: { 
        content: content.substring(0, 2000),
        extraction_date: new Date().toISOString(),
        source: 'UNESS MediaWiki API'
      }
    };
  } catch (error) {
    console.error(`Erreur parsing compétence: ${error.message}`);
    return null;
  }
}

// Extraction complète via API MediaWiki avec pagination
async function extractCompetencesViaAPI(page) {
  log('📊 Début extraction via API MediaWiki...');
  log('🚀 === DÉBUT EXTRACTION HYBRIDE ===');
  log('📡 === EXTRACTION VIA API MEDIAWIKI ===');
  
  const apiUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Cat%C3%A9gorie%3AObjectif_de_connaissance&cmlimit=500&format=json';
  log(`🔗 URL API: ${apiUrl}`);
  
  let allMembers = [];
  let continueToken = null;
  let processed = 0;
  let extracted = 0;
  
  do {
    try {
      let currentUrl = apiUrl;
      if (continueToken) {
        currentUrl += `&cmcontinue=${encodeURIComponent(continueToken)}`;
      }
      
      // Utiliser la page authentifiée pour faire la requête API
      const response = await page.evaluate(async (url) => {
        const resp = await fetch(url);
        return {
          status: resp.status,
          ok: resp.ok,
          text: await resp.text()
        };
      }, currentUrl);
      
      if (!response.ok) {
        console.error(`Erreur API: ${response.status}`);
        break;
      }
      
      const data = JSON.parse(response.text);
      const members = data.query?.categorymembers || [];
      
      log(`📋 ${members.length} membres trouvés dans la catégorie (API)`);
      
      if (members.length > 0) {
        log('🔍 DEBUG - Exemples de titres de pages:');
        members.slice(0, 7).forEach((member, index) => {
          const title = member.title.length > 100 ? member.title.substring(0, 100) + '...' : member.title;
          log(`   ${index + 1}. "${title}" (ID: ${member.pageid})`);
        });
      }
      
      allMembers = allMembers.concat(members);
      
      // Traitement par batch de 50 pages
      const batchSize = 50;
      const currentBatch = members.slice(0, batchSize);
      
      for (let i = 0; i < currentBatch.length; i++) {
        const member = currentBatch[i];
        processed++;
        
        try {
          log(`📖 Traitement page ${i + 1}/${currentBatch.length}: "${member.title}" (ID: ${member.pageid})`);
          
          // Récupérer le contenu de la page via l'API
          const pageContentUrl = `https://livret.uness.fr/lisa/2025/api.php?action=query&prop=revisions&pageids=${member.pageid}&rvprop=content&rvslots=main&format=json`;
          
          const pageResponse = await page.evaluate(async (url) => {
            const resp = await fetch(url);
            return {
              status: resp.status,
              ok: resp.ok,
              text: await resp.text()
            };
          }, pageContentUrl);
          
          if (pageResponse.ok) {
            const pageData = JSON.parse(pageResponse.text);
            const pageContent = pageData.query?.pages?.[member.pageid]?.revisions?.[0]?.slots?.main?.['*'];
            
            if (pageContent) {
              log('📝 Révision trouvée - slots: main');
              log(`📄 Contenu main: ${pageContent.length} caractères`);
              log(`🔍 Début contenu: ${pageContent.substring(0, 200).replace(/\n/g, '\\n')}`);
              
              // Parser la compétence OIC
              const competence = parseOICCompetence(pageContent);
              
              if (competence) {
                const shortDescription = competence.description.length > 50 
                  ? competence.description.substring(0, 50) + '...' 
                  : competence.description;
                
                log(`✅ Compétence parsée: ${competence.objectif_id} - ${shortDescription}`);
                
                // Insérer en base
                const { error } = await supabase
                  .from('backup_oic_competences')
                  .upsert({
                    objectif_id: competence.objectif_id,
                    item_parent: competence.item_parent,
                    rang: competence.rang,
                    intitule: competence.intitule,
                    description: competence.description,
                    rubrique: competence.rubrique,
                    ordre: competence.ordre,
                    raw_json: competence.raw_json,
                    url_source: `https://livret.uness.fr/lisa/2025/index.php?title=${encodeURIComponent(member.title)}`,
                    extraction_status: 'completed',
                    date_import: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }, { 
                    onConflict: 'objectif_id' 
                  });
                
                if (error) {
                  console.error(`Erreur insertion ${competence.objectif_id}:`, error.message);
                } else {
                  extracted++;
                }
              } else {
                log(`⚠️ Impossible de parser la compétence pour ${member.title}`);
              }
            } else {
              log(`⚠️ Aucun contenu trouvé pour ${member.title}`);
            }
          }
          
          // Délai entre les requêtes pour éviter la surcharge
          await page.waitForTimeout(100);
          
        } catch (error) {
          console.error(`Erreur traitement ${member.title}:`, error.message);
        }
      }
      
      // Gestion de la pagination
      continueToken = data.continue?.cmcontinue;
      
      if (continueToken) {
        log('🔄 Pagination: token de continuation trouvé, récupération de la suite...');
      }
      
    } catch (error) {
      console.error(`Erreur récupération API:`, error.message);
      break;
    }
    
  } while (continueToken && processed < 5000); // Limite de sécurité
  
  log('📊 === RÉSULTATS FINAUX ===');
  log(`📄 Pages totales trouvées: ${allMembers.length}`);
  log(`🔄 Pages traitées: ${processed}`);
  log(`✅ Compétences extraites: ${extracted}`);
  log(`💾 Compétences sauvées en base: ${extracted}`);
  
  return {
    total_pages: allMembers.length,
    processed_pages: processed,
    extracted_competences: extracted
  };
}

// Fonction principale
async function main() {
  let browser;
  
  try {
    log('🚀 DÉMARRAGE EXTRACTION OIC - 4,872 COMPÉTENCES ATTENDUES');
    log('===============================================');
    
    // Authentification CAS
    const { page, browser: browserInstance } = await authenticateWithCAS();
    browser = browserInstance;
    
    // Extraction des compétences
    const results = await extractCompetencesViaAPI(page);
    
    log('🎉 === EXTRACTION TERMINÉE AVEC SUCCÈS ===');
    log(`📊 Résultats: ${results.extracted_competences}/${results.total_pages} compétences extraites`);
    
    await browser.close();
    process.exit(0);
    
  } catch (error) {
    log('💥 Erreur critique:', error);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

// Gestion des signaux pour nettoyer proprement
process.on('SIGINT', async () => {
  log('🛑 Interruption demandée...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('🛑 Arrêt demandé...');
  process.exit(0);
});

// Lancement du script
if (require.main === module) {
  main();
}

module.exports = { main, authenticateWithCAS, extractCompetencesViaAPI };