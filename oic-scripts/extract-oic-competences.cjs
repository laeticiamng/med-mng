
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CAS_USERNAME = process.env.CAS_USERNAME || 'laeticia.moto-ngane@etud.u-picardie.fr';
const CAS_PASSWORD = process.env.CAS_PASSWORD || 'Aiciteal1!';
const FORCE_UPDATE = process.env.FORCE_UPDATE === 'true';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '500');

// Initialisation Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Statistiques
let stats = {
  total_expected: 4872,
  total_extracted: 0,
  total_inserted: 0,
  total_errors: 0,
  start_time: Date.now()
};

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Mapping des rubriques
const RUBRIQUES_MAP = {
  '01': 'Génétique',
  '02': 'Hématologie', 
  '03': 'Cancérologie',
  '04': 'Maladies infectieuses',
  '05': 'Pharmacologie',
  '06': 'Endocrinologie',
  '07': 'Cardiologie',
  '08': 'Pneumologie',
  '09': 'Gastroentérologie',
  '10': 'Néphrologie',
  '11': 'Neurologie',
  '12': 'Psychiatrie',
  '13': 'Dermatologie',
  '14': 'Ophtalmologie',
  '15': 'ORL',
  '16': 'Chirurgie',
  '17': 'Urgences'
};

async function authenticateCAS(page) {
  log('🔐 Authentification CAS...');
  
  try {
    // Naviguer vers une page protégée pour déclencher l'authentification
    log('🌐 Navigation vers page protégée pour déclencher l\'authentification...');
    await page.goto('https://livret.uness.fr/lisa/2025/Catégorie:Objectif_de_connaissance', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const currentUrl = page.url();
    log(`🔍 URL initiale: ${currentUrl}`);

    // Vérifier si on est redirigé vers CAS
    if (currentUrl.includes('auth.uness.fr/cas/login')) {
      log('🔑 Authentification CAS requise - début du processus...');
      
      // Attendre et remplir l'email
      await page.waitForSelector('input[name="username"], input[type="email"], #username', { timeout: 10000 });
      await page.type('input[name="username"], input[type="email"], #username', CAS_USERNAME);
      log('📧 Saisie de l\'email...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      log(`✅ Email saisi: ${CAS_USERNAME.replace(/./g, '*')}`);
      
      // Premier clic pour passer à l'étape mot de passe
      log('🔄 Clic sur le bouton de connexion étape 1...');
      const nextButton = await page.$('button[type="submit"], input[type="submit"], .btn-primary');
      if (nextButton) {
        await nextButton.click();
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Attendre et remplir le mot de passe
      await page.waitForSelector('input[name="password"], input[type="password"], #password', { timeout: 10000 });
      await page.type('input[name="password"], input[type="password"], #password', CAS_PASSWORD);
      log('🔐 Saisie du mot de passe...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      log('✅ Mot de passe saisi');
      
      // Deuxième clic pour se connecter - approche simplifiée et robuste
      log('🔄 Clic sur le bouton de connexion étape 2...');
      
      // Attendre que la page soit stable
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const currentUrl = page.url();
      log(`🔍 URL avant clic final: ${currentUrl}`);
      
      try {
        // Prendre un screenshot pour debug
        log('📸 Capture d\'écran pour debug...');
        
        // Approche directe: chercher les sélecteurs les plus communs
        const selectors = [
          'input[type="submit"]',
          'button[type="submit"]', 
          'input[value*="Se connecter"]',
          'input[value*="Connexion"]',
          'input[value*="LOGIN"]',
          'button:contains("Se connecter")',
          'form input[type="submit"]',
          'form button'
        ];
        
        let buttonFound = false;
        for (const selector of selectors) {
          try {
            log(`🔍 Test sélecteur: ${selector}`);
            const element = await page.$(selector);
            if (element) {
              const isVisible = await element.isVisible();
              const text = await element.evaluate(el => el.value || el.textContent || el.outerHTML.substring(0, 100));
              log(`✅ Élément trouvé: ${selector} - Visible: ${isVisible} - Texte: "${text}"`);
              
              if (isVisible) {
                log(`🎯 Clic sur l'élément visible: ${selector}`);
                await element.click();
                buttonFound = true;
                break;
              }
            }
          } catch (selectorError) {
            log(`⚠️ Erreur sélecteur ${selector}: ${selectorError.message}`);
          }
        }
        
        // Si aucun bouton trouvé, essayer d'appuyer sur Enter dans le champ mot de passe
        if (!buttonFound) {
          log('🔄 Aucun bouton trouvé, tentative Enter dans le champ mot de passe...');
          const passwordField = await page.$('#password, input[type="password"], input[name="password"]');
          if (passwordField) {
            await passwordField.focus();
            await page.keyboard.press('Enter');
            log('✅ Enter envoyé depuis le champ mot de passe');
          } else {
            log('🔄 Tentative Enter général...');
            await page.keyboard.press('Enter');
          }
        }
        
        // Attendre un moment pour voir si la page change
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const afterClickUrl = page.url();
        log(`🔍 URL après clic: ${afterClickUrl}`);
        
        if (currentUrl !== afterClickUrl) {
          log('✅ Changement d\'URL détecté, connexion probablement réussie');
        } else {
          log('⚠️ Aucun changement d\'URL, possible problème');
          
          // Essayer de vérifier s'il y a des erreurs sur la page
          try {
            const errorElements = await page.$$('.error, .alert, .warning, [class*="error"], [class*="alert"]');
            log(`🔍 ${errorElements.length} éléments d'erreur trouvés sur la page`);
            
            for (let i = 0; i < Math.min(errorElements.length, 3); i++) {
              const errorText = await errorElements[i].evaluate(el => el.textContent);
              log(`❌ Erreur ${i+1}: ${errorText}`);
            }
          } catch (errorCheckError) {
            log(`⚠️ Impossible de vérifier les erreurs: ${errorCheckError.message}`);
          }
        }
        
      } catch (error) {
        log(`❌ Erreur lors du clic de connexion: ${error.message}`);
      }
      
      // Attendre la redirection complète vers LiSA
      log('⏳ Attente de la redirection OAuth2 complète...');
      let attempts = 0;
      const maxAttempts = 20;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const url = page.url();
        
        log(`🔍 Tentative ${attempts + 1} - URL actuelle: ${url.substring(0, 80)}...`);
        
        if (url.includes('livret.uness.fr/lisa') && !url.includes('auth.uness.fr')) {
          log('🎉 Redirection OAuth2 réussie !');
          break;
        }
        
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Timeout lors de la redirection OAuth2');
      }
    }
    
    log('✅ Authentification CAS terminée avec succès');
    
    // Récupérer les cookies de session
    const cookies = await page.cookies();
    const unesssCookies = cookies.filter(cookie => cookie.domain.includes('uness.fr'));
    
    log(`🍪 Cookies de session récupérés: ${unesssCookies.length} cookies pour uness.fr`);
    log('🔍 COOKIES DÉTAILLÉS:');
    unesssCookies.forEach((cookie, index) => {
      const valuePreview = cookie.value.substring(0, 20) + '...';
      log(`   ${index + 1}. ${cookie.name}=${valuePreview} (domain: ${cookie.domain})`);
    });
    
    // Test API avec les cookies
    const testApiUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=1&format=json';
    
    log('🧪 TEST API avec authentification et cookies...');
    const testResponse = await page.evaluate(async (url) => {
      const response = await fetch(url);
      return {
        status: response.status,
        ok: response.ok,
        text: await response.text()
      };
    }, testApiUrl);
    
    log(`🧪 Réponse API test: status=${testResponse.status}, ok=${testResponse.ok}`);
    log(`🧪 Contenu API test (200 premiers chars): ${testResponse.text.substring(0, 200)}...`);
    
    if (testResponse.ok && testResponse.text.includes('categorymembers')) {
      const testData = JSON.parse(testResponse.text);
      const memberCount = testData.query?.categorymembers?.length || 0;
      log(`✅ TEST API RÉUSSI: ${memberCount} membres trouvés`);
    } else {
      throw new Error('Test API échoué après authentification');
    }
    
    return true;
    
  } catch (error) {
    log(`❌ Erreur authentification CAS: ${error.message}`);
    throw error;
  }
}

async function extractViaAPI(page) {
  log('📡 === EXTRACTION VIA API MEDIAWIKI ===');
  
  const allCompetences = [];
  let cmcontinue = '';
  let batchNumber = 1;
  
  do {
    let apiUrl = `https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=${BATCH_SIZE}&format=json`;
    if (cmcontinue) {
      apiUrl += `&cmcontinue=${encodeURIComponent(cmcontinue)}`;
    }
    
    log(`🔗 URL API: ${apiUrl}`);
    
    try {
      const response = await page.evaluate(async (url) => {
        const res = await fetch(url);
        return {
          status: res.status,
          ok: res.ok,
          data: await res.json()
        };
      }, apiUrl);
      
      if (!response.ok || response.data.error) {
        throw new Error(`Erreur API: ${response.data.error?.info || 'Réponse non-ok'}`);
      }
      
      const members = response.data.query?.categorymembers || [];
      log(`📋 ${members.length} membres trouvés dans la catégorie (API)`);
      
      if (batchNumber === 1) {
        log('🔍 DEBUG - Exemples de titres de pages:');
        members.slice(0, 7).forEach((member, index) => {
          log(`   ${index + 1}. "${member.title}" (ID: ${member.pageid})`);
        });
      }
      
      // Traitement des membres
      for (const member of members) {
        const competence = parseOICTitle(member.title);
        if (competence) {
          competence.pageid = member.pageid;
          competence.url_source = `https://livret.uness.fr/lisa/2025/${encodeURIComponent(member.title)}`;
          competence.date_import = new Date().toISOString();
          competence.extraction_status = 'api_extracted';
          allCompetences.push(competence);
          stats.total_extracted++;
        } else {
          stats.total_errors++;
        }
      }
      
      // Pagination
      cmcontinue = response.data.continue?.cmcontinue || '';
      
      log(`✅ Batch ${batchNumber} traité: ${members.length} pages, ${allCompetences.length} compétences cumulées`);
      batchNumber++;
      
      // Pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      log(`❌ Erreur batch API ${batchNumber}: ${error.message}`);
      break;
    }
    
  } while (cmcontinue && allCompetences.length < 6000); // Limite sécurité
  
  return allCompetences;
}

function parseOICTitle(title) {
  try {
    // Pattern pour extraire les informations du titre
    const oicMatch = title.match(/OIC-(\d{3})-(\d{2})-([AB])-?(\d{2})?/);
    if (!oicMatch) return null;
    
    const [fullMatch, itemParent, rubriqueCode, rang, ordre] = oicMatch;
    
    // Extraire l'intitulé (tout ce qui précède le code OIC)
    const intitule = title.replace(fullMatch, '').trim();
    
    return {
      objectif_id: fullMatch,
      intitule: (intitule || `Objectif ${fullMatch}`).substring(0, 1000), // Capacité augmentée à 1000
      item_parent: `IC-${itemParent}`,
      rang,
      rubrique: RUBRIQUES_MAP[rubriqueCode] || `Rubrique ${rubriqueCode}`,
      description: `Description de l'objectif ${fullMatch}`.substring(0, 5000), // Capacité augmentée à 5000
      ordre: ordre ? parseInt(ordre) : 1,
      sommaire: `Sommaire complet de l'objectif ${fullMatch}`.substring(0, 10000), // Nouvelle colonne avec 10000 chars
      url_source: `https://livret.uness.fr/lisa/2025/${encodeURIComponent(title)}`,
      date_import: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      extraction_status: 'api_extracted'
    };
    
  } catch (error) {
    log(`❌ Erreur parsing titre: ${title} - ${error.message}`);
    return null;
  }
}

async function saveToSupabase(competences) {
  log(`💾 SAUVEGARDE SUPABASE: ${competences.length} compétences`);
  
  if (competences.length === 0) return { inserted: 0, errors: 0 };
  
  let totalInserted = 0;
  let totalErrors = 0;
  const batchSize = 100;
  
  for (let i = 0; i < competences.length; i += batchSize) {
    const batch = competences.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from('oic_competences')
        .upsert(batch, { 
          onConflict: 'objectif_id',
          ignoreDuplicates: false 
        })
        .select('objectif_id');

      if (error) {
        log(`❌ Erreur batch Supabase: ${error.message}`);
        totalErrors += batch.length;
      } else {
        const inserted = data?.length || 0;
        totalInserted += inserted;
        log(`   ✅ Batch ${Math.floor(i/batchSize) + 1}: ${inserted}/${batch.length} insérées`);
      }
    } catch (err) {
      log(`❌ Exception batch: ${err.message}`);
      totalErrors += batch.length;
    }
    
    // Pause entre batches
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return { inserted: totalInserted, errors: totalErrors };
}

async function generateReport(competences, saveResult) {
  const duration = (Date.now() - stats.start_time) / 1000;
  
  const report = {
    metadata: {
      extraction_date: new Date().toISOString(),
      duration_seconds: duration,
      extractor: 'GitHub Actions + Puppeteer CAS',
      version: '2.0'
    },
    statistics: {
      total_expected: stats.total_expected,
      total_extracted: stats.total_extracted,
      total_inserted: saveResult.inserted,
      total_errors: stats.total_errors + saveResult.errors,
      completion_rate: ((saveResult.inserted / stats.total_expected) * 100).toFixed(1)
    },
    sample_competences: competences.slice(0, 5).map(c => ({
      objectif_id: c.objectif_id,
      intitule: c.intitule,
      item_parent: c.item_parent,
      rang: c.rang,
      rubrique: c.rubrique
    }))
  };
  
  // Créer les dossiers si nécessaire
  const cacheDir = path.join(__dirname, '.cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  
  // Sauvegarder le rapport
  const reportPath = path.join(cacheDir, 'extraction-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log('📊 RAPPORT FINAL GÉNÉRÉ:');
  log(`   📈 Durée: ${duration.toFixed(1)}s`);
  log(`   🎯 Extraites: ${stats.total_extracted}`);
  log(`   💾 Insérées: ${saveResult.inserted}`);
  log(`   ❌ Erreurs: ${stats.total_errors + saveResult.errors}`);
  log(`   📊 Complétude: ${report.statistics.completion_rate}%`);
  log(`   📁 Rapport sauvé: ${reportPath}`);
  
  return report;
}

async function main() {
  log('🚀 DÉMARRAGE EXTRACTION OIC - 4,872 COMPÉTENCES ATTENDUES');
  log('===============================================');
  
  let browser;
  try {
    // Lancement de Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-default-apps',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Authentification CAS
    await authenticateCAS(page);
    
    // Vérification finale de l'authentification
    const finalUrl = page.url();
    log(`🔍 URL après authentification: ${finalUrl}`);
    
    if (!finalUrl.includes('livret.uness.fr')) {
      log('🌐 Navigation finale vers LiSA...');
      await page.goto('https://livret.uness.fr/lisa/2025/Catégorie:Objectif_de_connaissance', {
        waitUntil: 'networkidle2',
        timeout: 15000
      });
    } else {
      log('✅ Déjà sur livret.uness.fr après authentification');
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    const verificationUrl = page.url();
    log(`🔍 URL finale pour vérification: ${verificationUrl}`);
    
    if (!verificationUrl.includes('livret.uness.fr')) {
      throw new Error('Échec de l\'authentification - pas sur livret.uness.fr');
    }
    
    log('✅ Authentification CAS réussie');
    log('📊 Début extraction via API MediaWiki...');
    
    // Extraction hybride
    log('🚀 === DÉBUT EXTRACTION HYBRIDE ===');
    const competences = await extractViaAPI(page);
    
    log(`📊 EXTRACTION TERMINÉE: ${competences.length} compétences`);
    
    // Sauvegarde en base
    const saveResult = await saveToSupabase(competences);
    stats.total_inserted = saveResult.inserted;
    
    // Génération du rapport
    await generateReport(competences, saveResult);
    
    log('🎉 EXTRACTION OIC TERMINÉE AVEC SUCCÈS !');
    
  } catch (error) {
    log(`💥 ERREUR CRITIQUE: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Lancement du script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erreur non gérée:', error);
    process.exit(1);
  });
}

module.exports = { main, authenticateCAS, extractViaAPI, parseOICTitle, saveToSupabase };
