// ✅ Script d'extraction API-first des 4,872 objectifs EDN
// Basé sur README-OIC-EXTRACTION.md

import { createClient } from '@supabase/supabase-js';

// Configuration - ALL CREDENTIALS MUST BE SET VIA ENVIRONMENT VARIABLES
const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// SECURITY: NO HARDCODED CREDENTIALS - Environment variables are required
const CAS_USER = process.env.CAS_USER;
const CAS_PASS = process.env.CAS_PASS;

// Validate required environment variables
if (!CAS_USER) {
  throw new Error('❌ SECURITY ERROR: CAS_USER environment variable is required');
}
if (!CAS_PASS) {
  throw new Error('❌ SECURITY ERROR: CAS_PASS environment variable is required');
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('❌ SECURITY ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

// Initialisation Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Mapping des rubriques selon le README
const RUBRIQUES_MAP = {
  '01': 'Génétique',
  '02': 'Cancérologie',
  '03': 'Cardiologie',
  '04': 'Pneumologie',
  '05': 'Gastroentérologie',
  '06': 'Neurologie',
  '07': 'Psychiatrie',
  '08': 'Gynécologie-Obstétrique',
  '09': 'Pédiatrie',
  '10': 'Endocrinologie',
  '11': 'Autres spécialités'
};

async function extractOICCompetences() {
  console.log('🚀 EXTRACTION API-FIRST DES 4,872 OBJECTIFS EDN');
  console.log('===============================================');

  try {
    // 1. Test API publique
    console.log('🔍 Test d\'accès public à l\'API MediaWiki...');
    const testResponse = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=1&format=json&origin=*');
    
    if (!testResponse.ok) {
      throw new Error('API MediaWiki inaccessible');
    }
    console.log('✅ API MediaWiki publique accessible!');

    // 2. Récupération des IDs de pages
    console.log('📋 Récupération des IDs de pages de la catégorie...');
    const allPageIds = [];
    let cmcontinue = '';
    
    do {
      const url = `https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=500&format=json&origin=*${cmcontinue ? '&cmcontinue=' + encodeURIComponent(cmcontinue) : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.query?.categorymembers) {
        const oicPages = data.query.categorymembers.filter(page => 
          /OIC-\d{3}-\d{2}-[AB]-\d{2}/.test(page.title)
        );
        allPageIds.push(...oicPages.map(p => p.pageid));
        console.log(`   → ${oicPages.length} pages OIC trouvées dans ce batch...`);
      }
      
      cmcontinue = data.continue?.cmcontinue || '';
    } while (cmcontinue);

    console.log(`✅ ${allPageIds.length} pages OIC listées au total`);

    // 3. Extraction par batches de 50
    console.log('🔄 Traitement par batches de 50 pages...');
    const batchSize = 50;
    const totalBatches = Math.ceil(allPageIds.length / batchSize);
    let totalInserted = 0;
    let totalErrors = 0;

    for (let i = 0; i < totalBatches; i++) {
      const batchStart = i * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, allPageIds.length);
      const batchIds = allPageIds.slice(batchStart, batchEnd);
      
      console.log(`📦 Batch ${i + 1}/${totalBatches} - Pages ${batchStart + 1} à ${batchEnd}`);

      try {
        // Récupération du contenu
        const contentUrl = `https://livret.uness.fr/lisa/2025/api.php?action=query&prop=revisions&rvprop=content|timestamp&pageids=${batchIds.join('|')}&format=json&formatversion=2&origin=*`;
        const contentResponse = await fetch(contentUrl);
        const contentData = await contentResponse.json();

        if (contentData.query?.pages) {
          const competences = [];
          
          for (const page of contentData.query.pages) {
            const parsed = parseOICPage(page);
            if (parsed) {
              competences.push(parsed);
            } else {
              totalErrors++;
            }
          }

          // Insertion en base
          if (competences.length > 0) {
            const { data, error } = await supabase
              .from('backup_oic_competences')
              .upsert(competences, { 
                onConflict: 'objectif_id',
                ignoreDuplicates: false 
              });

            if (error) {
              console.error('❌ Erreur insertion batch:', error);
              totalErrors += competences.length;
            } else {
              totalInserted += competences.length;
              console.log(`   ✅ ${competences.length}/${batchIds.length} compétences insérées (${batchIds.length - competences.length} erreurs)`);
            }
          }
        }

        // Pause pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Erreur batch ${i + 1}:`, error);
        totalErrors += batchIds.length;
      }
    }

    // 4. Rapport de complétude
    console.log('\n📊 RAPPORT DE COMPLÉTION');
    console.log('========================');
    console.log(`✅ Total inséré: ${totalInserted}`);
    console.log(`❌ Total erreurs: ${totalErrors}`);
    console.log(`📊 Taux de réussite: ${((totalInserted / allPageIds.length) * 100).toFixed(2)}%`);

    // Générer le rapport JSON
    const rapport = await generateCompletionReport();
    console.log('\n📈 Rapport détaillé généré:', rapport);

  } catch (error) {
    console.error('💥 Erreur critique:', error);
  }
}

function parseOICPage(page) {
  try {
    const title = page.title;
    const content = page.revisions?.[0]?.content || '';

    // Parsing de l'identifiant selon le format OIC-XXX-YY-R-ZZ
    const idMatch = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/);
    if (!idMatch) return null;

    const [, itemParent, rubriqueCode, rang, ordre] = idMatch;

    // Extraction de l'intitulé
    const intitulePatterns = [
      /\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/,
      /\|\s*[Tt]itre\s*=\s*([^\n\|]+)/
    ];
    
    let intitule = '';
    for (const pattern of intitulePatterns) {
      const match = content.match(pattern);
      if (match) {
        intitule = match[1].trim();
        break;
      }
    }

    // Extraction de la description
    const descriptionMatch = content.match(/\|\s*[Dd]escription\s*=\s*([^\n\|]+)/);
    let description = descriptionMatch ? descriptionMatch[1].trim() : '';
    
    // Si pas de description, prendre le premier paragraphe
    if (!description) {
      const firstParagraph = content.split('\n').find(line => 
        line.trim() && !line.startsWith('|') && !line.startsWith('{')
      );
      description = firstParagraph ? firstParagraph.trim() : '';
    }

    return {
      objectif_id: title,
      intitule: intitule || title,
      item_parent: itemParent.padStart(3, '0'),
      rang,
      rubrique: RUBRIQUES_MAP[rubriqueCode] || `Rubrique ${rubriqueCode}`,
      description: description.substring(0, 1000), // Limite longueur
      ordre: parseInt(ordre),
      url_source: `https://livret.uness.fr/lisa/2025/index.php?title=${encodeURIComponent(title)}`,
      raw_json: { title, content: content.substring(0, 2000) },
      date_import: new Date().toISOString(),
      hash_content: btoa(content).substring(0, 50),
      extraction_status: 'completed'
    };

  } catch (error) {
    console.error('Erreur parsing page:', page.title, error);
    return null;
  }
}

async function generateCompletionReport() {
  const { data: stats } = await supabase
    .from('backup_oic_competences')
    .select('item_parent, rang')
    .eq('extraction_status', 'completed');

  const byItem = {};
  stats?.forEach(comp => {
    if (!byItem[comp.item_parent]) {
      byItem[comp.item_parent] = { rang_a_count: 0, rang_b_count: 0 };
    }
    if (comp.rang === 'A') byItem[comp.item_parent].rang_a_count++;
    if (comp.rang === 'B') byItem[comp.item_parent].rang_b_count++;
  });

  return {
    summary: {
      total_expected: 4872,
      total_extracted: stats?.length || 0,
      completeness_pct: ((stats?.length / 4872) * 100).toFixed(2),
      items_covered: Object.keys(byItem).length
    },
    by_item: Object.entries(byItem).map(([item, counts]: [string, any]) => ({
      item_parent: item,
      rang_a_count: counts.rang_a_count,
      rang_b_count: counts.rang_b_count,
      total_count: counts.rang_a_count + counts.rang_b_count
    })),
    generated_at: new Date().toISOString()
  };
}

// Lancement de l'extraction
extractOICCompetences();