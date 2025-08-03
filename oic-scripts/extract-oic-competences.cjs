require('dotenv').config();

const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const supabaseUrl = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const casUsername = process.env.CAS_USERNAME;
const casPassword = process.env.CAS_PASSWORD;
const forceUpdate = process.env.FORCE_UPDATE === 'true';

if (!supabaseKey || !casUsername || !casPassword) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Logs avec timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Fonction principale
async function main() {
  let browser;
  const startTime = Date.now();
  
  try {
    log('🚀 Démarrage extraction/complétion OIC');
    
    // Créer le dossier cache
    if (!fs.existsSync('.cache')) {
      fs.mkdirSync('.cache');
    }

    // Mode complétion : récupérer les compétences incomplètes
    let competencesToProcess = [];
    
    if (!forceUpdate) {
      log('🔍 Mode complétion : recherche des compétences incomplètes...');
      const { data: incompleteCompetences, error } = await supabase
        .from('oic_competences')
        .select('code_competence')
        .or('description.is.null,description.eq.');
        
      if (error) {
        log(`❌ Erreur lors de la récupération des compétences incomplètes: ${error.message}`);
        throw error;
      }
      
      competencesToProcess = incompleteCompetences.map(c => c.code_competence);
      log(`📊 ${competencesToProcess.length} compétences à compléter`);
      
      if (competencesToProcess.length === 0) {
        log('✅ Toutes les compétences sont déjà complètes');
        return;
      }
    } else {
      log('🔄 Mode FORCE_UPDATE : traitement de toutes les compétences');
    }

    // Authentification CAS
    log('🔐 Démarrage authentification CAS...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // Connexion CAS
    await page.goto('https://cas.uness.fr/login');
    await page.waitForSelector('#username');
    
    await page.type('#username', casUsername);
    await page.type('#password', casPassword);
    await page.click('input[type="submit"]');
    
    await page.waitForNavigation();
    log('✅ Authentification CAS réussie');

    // Exporter les cookies
    const cookies = await page.cookies();
    const unessCookies = cookies.filter(cookie => 
      cookie.domain.includes('uness.fr')
    );
    
    const cookieString = unessCookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');
    
    fs.writeFileSync('.cache/cookies.txt', cookieString);
    log(`🍪 ${unessCookies.length} cookies exportés`);

    await browser.close();

    // Extraction via API MediaWiki
    log('📚 Démarrage extraction MediaWiki...');
    
    const baseUrl = 'https://sides.uness.fr/livret/api.php';
    let cmcontinue = null;
    let totalProcessed = 0;
    let batchCount = 0;
    const maxBatches = 20;

    do {
      batchCount++;
      if (batchCount > maxBatches) {
        log(`⚠️ Limite de ${maxBatches} lots atteinte`);
        break;
      }

      log(`📦 Traitement lot ${batchCount}...`);

      const params = new URLSearchParams({
        action: 'query',
        list: 'categorymembers',
        cmtitle: 'Catégorie:Compétences OIC',
        cmlimit: '50',
        format: 'json'
      });

      if (cmcontinue) {
        params.append('cmcontinue', cmcontinue);
      }

      const response = await fetch(`${baseUrl}?${params}`, {
        headers: {
          'Cookie': cookieString,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      const members = data.query?.categorymembers || [];
      
      log(`📄 ${members.length} pages trouvées dans ce lot`);

      // Traitement des compétences
      for (const member of members) {
        const title = member.title;
        
        // Extraire le code compétence
        const match = title.match(/^OIC\s*[\-\s]*(\d+(?:\.\d+)*)/i);
        if (!match) continue;

        const codeCompetence = `OIC-${match[1]}`;
        
        // Filtrer selon le mode
        if (!forceUpdate && !competencesToProcess.includes(codeCompetence)) {
          continue;
        }

        try {
          // Récupérer le contenu de la page
          const pageParams = new URLSearchParams({
            action: 'query',
            prop: 'revisions',
            titles: title,
            rvprop: 'content',
            format: 'json'
          });

          const pageResponse = await fetch(`${baseUrl}?${pageParams}`, {
            headers: {
              'Cookie': cookieString,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          const pageData = await pageResponse.json();
          const pages = pageData.query?.pages || {};
          const pageContent = Object.values(pages)[0]?.revisions?.[0]?.['*'] || '';

          // Extraction des données
          const competenceData = {
            code_competence: codeCompetence,
            titre: title,
            description: extractDescription(pageContent),
            raw_content: pageContent.substring(0, 5000), // Limiter pour éviter les quotas
            url: `https://sides.uness.fr/livret/index.php?title=${encodeURIComponent(title)}`,
            extracted_at: new Date().toISOString()
          };

          // Insertion en base
          const { error: upsertError } = await supabase
            .from('oic_competences')
            .upsert(competenceData, {
              onConflict: 'code_competence'
            });

          if (upsertError) {
            log(`❌ Erreur insertion ${codeCompetence}: ${upsertError.message}`);
          } else {
            log(`✅ ${codeCompetence} traité`);
            totalProcessed++;
          }

          // Délai entre les requêtes
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (err) {
          log(`❌ Erreur traitement ${codeCompetence}: ${err.message}`);
        }
      }

      // Pagination
      cmcontinue = data.continue?.cmcontinue;
      
      if (cmcontinue) {
        log(`➡️ Continuation: ${cmcontinue}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } while (cmcontinue);

    // Rapport final
    const duration = Math.round((Date.now() - startTime) / 1000);
    const report = {
      timestamp: new Date().toISOString(),
      mode: forceUpdate ? 'FORCE_UPDATE' : 'COMPLETION',
      batches_processed: batchCount,
      competences_processed: totalProcessed,
      duration_seconds: duration,
      success: true
    };

    fs.writeFileSync('extraction-success.json', JSON.stringify(report, null, 2));
    log(`🎉 Extraction terminée: ${totalProcessed} compétences en ${duration}s`);

  } catch (error) {
    log(`❌ Erreur: ${error.message}`);
    
    // Rapport d'erreur
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: error.message,
      success: false
    };
    
    fs.writeFileSync('extraction-error.json', JSON.stringify(errorReport, null, 2));
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Fonction d'extraction de description
function extractDescription(content) {
  if (!content) return null;
  
  // Rechercher différents patterns de description
  const patterns = [
    /'''Description[^:]*:?\s*'''?\s*([^'\n]+)/i,
    /{{[^}]*description[^}]*\|\s*([^|}]+)/i,
    /\|description\s*=\s*([^|\n]+)/i,
    /description\s*[:=]\s*([^.\n]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim().replace(/{{[^}]*}}/g, '').trim();
    }
  }
  
  // Fallback: premier paragraphe non vide
  const lines = content.split('\n');
  for (const line of lines) {
    const cleaned = line.trim().replace(/[{}|]/g, '');
    if (cleaned.length > 20 && !cleaned.startsWith('[[') && !cleaned.startsWith('{{')) {
      return cleaned.substring(0, 200);
    }
  }
  
  return null;
}

// Lancement
main().catch(console.error);