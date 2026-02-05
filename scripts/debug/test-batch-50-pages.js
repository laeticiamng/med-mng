// 📦 TEST BATCH 50 PAGES - Validation découpage et parsing
const fs = require('fs/promises');

async function testBatch50Pages() {
  console.log('📦 TEST BATCH 50 PAGES');
  console.log('=' .repeat(40));
  
  let cookieHeader = '';
  
  // Essayer de lire le cookie CAS s'il existe
  try {
    cookieHeader = await fs.readFile('.cookie', 'utf8');
    console.log(`🍪 Cookie CAS trouvé: ${cookieHeader.substring(0, 50)}...`);
  } catch (e) {
    console.log('🔓 Pas de cookie CAS - test en mode public');
  }
  
  try {
    // ÉTAPE 1: Récupérer la liste des IDs
    console.log('\n1️⃣ Récupération liste des IDs...');
    const listUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie%3AObjectif_de_connaissance&cmlimit=100&format=json&origin=*';
    
    const listResponse = await fetch(listUrl, {
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': 'Mozilla/5.0 (compatible; OIC-Test/1.0)',
        'Accept': 'application/json'
      }
    });
    
    console.log(`📊 Status liste: ${listResponse.status}`);
    
    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      throw new Error(`Erreur récupération liste: ${errorText.substring(0, 200)}`);
    }
    
    const listData = await listResponse.json();
    const allMembers = listData.query?.categorymembers || [];
    console.log(`📋 ${allMembers.length} membres trouvés`);
    
    if (allMembers.length === 0) {
      throw new Error('Aucun membre trouvé dans la catégorie');
    }
    
    // Filtrer les pages OIC
    const oicMembers = allMembers.filter(member => 
      member.title && member.title.match(/OIC-\d{3}-\d{2}-[AB]-\d{2}/)
    );
    console.log(`🎯 ${oicMembers.length} pages OIC identifiées`);
    
    if (oicMembers.length === 0) {
      throw new Error('Aucune page OIC trouvée');
    }
    
    // ÉTAPE 2: Prendre les 50 premiers IDs
    const first50Ids = oicMembers.slice(0, 50).map(member => member.pageid);
    console.log(`📦 Premier batch: ${first50Ids.length} IDs`);
    console.log(`📦 IDs: ${first50Ids.join(', ')}`);
    
    // ÉTAPE 3: Récupérer le contenu du batch
    console.log('\n2️⃣ Récupération contenu batch...');
    const contentUrl = new URL('https://livret.uness.fr/lisa/2025/api.php');
    contentUrl.searchParams.set('action', 'query');
    contentUrl.searchParams.set('prop', 'revisions');
    contentUrl.searchParams.set('rvprop', 'content|timestamp');
    contentUrl.searchParams.set('pageids', first50Ids.join('|'));
    contentUrl.searchParams.set('format', 'json');
    contentUrl.searchParams.set('formatversion', '2');
    contentUrl.searchParams.set('origin', '*');
    
    console.log(`📡 URL: ${contentUrl.toString()}`);
    
    const contentResponse = await fetch(contentUrl.toString(), {
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': 'Mozilla/5.0 (compatible; OIC-Test/1.0)',
        'Accept': 'application/json'
      }
    });
    
    console.log(`📊 Status contenu: ${contentResponse.status}`);
    
    if (!contentResponse.ok) {
      const errorText = await contentResponse.text();
      throw new Error(`Erreur récupération contenu: ${errorText.substring(0, 200)}`);
    }
    
    const contentData = await contentResponse.json();
    const pages = contentData.query?.pages || [];
    console.log(`📄 ${pages.length} pages récupérées`);
    
    // ÉTAPE 4: Analyser le contenu
    console.log('\n3️⃣ Analyse du contenu...');
    let validPages = 0;
    let emptyPages = 0;
    let parsedCompetences = [];
    
    pages.forEach((page, index) => {
      console.log(`\n📋 Page ${index + 1}/${pages.length}: ${page.title}`);
      console.log(`   ID: ${page.pageid}`);
      
      if (page.revisions?.[0]?.content) {
        const content = page.revisions[0].content;
        console.log(`   ✅ Contenu: ${content.length} caractères`);
        console.log(`   📄 Extrait: ${content.substring(0, 150)}...`);
        
        // Essayer de parser
        const competence = parseOICPage(page);
        if (competence) {
          parsedCompetences.push(competence);
          console.log(`   ✅ Parsé: ${competence.objectif_id} - ${competence.intitule}`);
        } else {
          console.log(`   ⚠️  Parsing échoué`);
        }
        
        validPages++;
      } else {
        console.log(`   ❌ Contenu vide`);
        emptyPages++;
      }
    });
    
    // ÉTAPE 5: Rapport final
    console.log('\n' + '=' .repeat(50));
    console.log('📊 RAPPORT BATCH 50 PAGES');
    console.log('=' .repeat(50));
    console.log(`📋 Pages demandées: ${first50Ids.length}`);
    console.log(`📄 Pages reçues: ${pages.length}`);
    console.log(`✅ Pages avec contenu: ${validPages}`);
    console.log(`❌ Pages vides: ${emptyPages}`);
    console.log(`🎯 Compétences parsées: ${parsedCompetences.length}`);
    
    if (parsedCompetences.length > 0) {
      console.log('\n📋 Première compétence parsée:');
      console.log(JSON.stringify(parsedCompetences[0], null, 2));
    }
    
    return {
      success: true,
      requested: first50Ids.length,
      received: pages.length,
      valid: validPages,
      empty: emptyPages,
      parsed: parsedCompetences.length,
      competences: parsedCompetences
    };
    
  } catch (error) {
    console.error('❌ Erreur test batch:', error.message);
    return { success: false, error: error.message };
  }
}

function parseOICPage(page) {
  try {
    const title = page.title;
    const content = page.revisions?.[0]?.content || '';
    
    // Extraction de l'identifiant OIC
    const oicMatch = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/);
    if (!oicMatch) {
      return null;
    }
    
    const [objectif_id, item_parent, rubrique_code, rang, ordre_str] = oicMatch;
    
    // Extraction de l'intitulé depuis le contenu
    let intitule = title;
    const intitulePatterns = [
      /\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/,
      /\|\s*[Tt]itre\s*=\s*([^\n\|]+)/,
      /'''([^']+)'''/,
      /==\s*([^=]+)\s*==/
    ];
    
    for (const pattern of intitulePatterns) {
      const match = content.match(pattern);
      if (match && match[1].trim()) {
        intitule = match[1].trim();
        break;
      }
    }
    
    // Mapping des rubriques
    const RUBRIQUES_MAP = {
      '01': 'Génétique',
      '02': 'Immunopathologie', 
      '03': 'Inflammation',
      '04': 'Cancérologie',
      '05': 'Pharmacologie',
      '06': 'Douleur',
      '07': 'Santé publique',
      '08': 'Thérapeutique',
      '09': 'Urgences',
      '10': 'Vieillissement',
      '11': 'Interprétation'
    };
    
    return {
      objectif_id,
      intitule: intitule || title,
      item_parent,
      rang: rang,
      rubrique: RUBRIQUES_MAP[rubrique_code] || 'Autre',
      ordre: parseInt(ordre_str),
      url_source: `https://livret.uness.fr/lisa/2025/${encodeURIComponent(title)}`,
      date_import: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`Erreur parsing ${page.title}:`, error);
    return null;
  }
}

// Lancer si script appelé directement
if (require.main === module) {
  testBatch50Pages().then(result => {
    if (result.success && result.parsed > 0) {
      console.log('\n🎉 BATCH TEST RÉUSSI - Prêt pour insertion Supabase');
    } else {
      console.log('\n❌ BATCH TEST ÉCHOUÉ - Vérifier la configuration');
      process.exit(1);
    }
  }).catch(console.error);
}

module.exports = { testBatch50Pages, parseOICPage };