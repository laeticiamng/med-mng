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
  
  console.log(`📄 Parsing contenu de ${content.length} caractères...`);
  
  // 1. Extraire tout le contenu principal (sans métadonnées wiki)
  let cleanContent = content
    // Supprimer les directives MediaWiki
    .replace(/{{[^}]*}}/gs, '')
    .replace(/__[A-Z_]+__/g, '')
    .replace(/\[\[Category:[^\]]*\]\]/gi, '')
    .replace(/\[\[Catégorie:[^\]]*\]\]/gi, '')
    // Nettoyer les liens wiki mais garder le texte
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')  // [[lien|texte]] -> texte
    .replace(/\[\[([^\]]+)\]\]/g, '$1')              // [[lien]] -> lien
    // Supprimer les balises de mise en forme
    .replace(/'''([^']+)'''/g, '$1')                 // gras
    .replace(/''([^']+)''/g, '$1')                   // italique
    .replace(/<[^>]*>/g, '')                         // balises HTML
    // Nettoyer les caractères spéciaux
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  // 2. Extraire par sections (approche plus complète)
  const sections = [];
  
  // Rechercher les patterns de contenu structuré
  const contentPatterns = [
    // Définitions et descriptions
    /(?:définition|description|présentation)[^:]*:\s*([^.\n]{30,})/gi,
    // Objectifs pédagogiques
    /(?:objectifs?|buts?|finalités?)[^:]*:\s*([^.\n]{30,})/gi,
    // Éléments de contenu principaux
    /(?:contenu|éléments?|points?)[^:]*:\s*([^.\n]{30,})/gi,
    // Compétences attendues
    /(?:compétences?|capacités?|savoir)[^:]*:\s*([^.\n]{30,})/gi,
    // Connaissances
    /(?:connaissances?|notions?)[^:]*:\s*([^.\n]{30,})/gi
  ];

  contentPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(cleanContent)) !== null) {
      const section = match[1].trim();
      if (section.length > 20 && section.length < 1000) {
        sections.push(section);
      }
    }
  });

  // 3. Si pas de sections structurées, extraire les paragraphes significatifs
  if (sections.length === 0) {
    const paragraphs = cleanContent.split(/\n\s*\n/);
    
    for (const paragraph of paragraphs) {
      const cleaned = paragraph
        .replace(/^\s*[*-]\s*/, '')  // Puces
        .replace(/^\s*\d+\.\s*/, '') // Numérotation
        .trim();
      
      if (cleaned.length >= 50 && cleaned.length <= 1000 && 
          !cleaned.includes('{{') && 
          !cleaned.includes('[[') && 
          !cleaned.match(/^[A-Z_][A-Z_\s]*$/)) {  // Éviter les titres en majuscules
        sections.push(cleaned);
      }
    }
  }

  // 4. Combiner les sections en description complète
  if (sections.length > 0) {
    let fullDescription = sections.join(' • ');
    
    // Limiter la taille mais garder plus de contenu
    if (fullDescription.length > 2000) {
      fullDescription = fullDescription.substring(0, 1997) + '...';
    }
    
    console.log(`✅ Description extraite: ${fullDescription.length} caractères`);
    return fullDescription;
  }

  // 5. Fallback : premier contenu significatif
  const lines = cleanContent.split('\n');
  for (const line of lines) {
    const cleaned = line.trim();
    if (cleaned.length >= 100 && cleaned.length <= 500 && 
        !cleaned.startsWith('=') && 
        !cleaned.includes('{{')) {
      console.log(`⚠️ Fallback description: ${cleaned.length} caractères`);
      return cleaned;
    }
  }
  
  console.log(`❌ Aucune description extraite du contenu`);
  return null;
}

// Lancement
main().catch(console.error);