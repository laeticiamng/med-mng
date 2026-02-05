// 🎯 ORCHESTRATEUR DIAGNOSTIC OIC - Exécution complète du plan
console.log('🚀 ORCHESTRATEUR DIAGNOSTIC OIC');
console.log('===============================');

const fs = require('fs/promises');

// Configuration
const EDGE_FUNCTION_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/debug-oic-extraction';
const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
};

// Résultats globaux
const DIAGNOSTIC_RESULTS = {
  apiStatus: null,
  categoryTest: null,
  cookieGenerated: false,
  batchTest: null,
  insertionTest: null
};

async function step1_testCurlMinimal() {
  console.log('\n🧪 ÉTAPE 1: Test curl minimal');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&meta=siteinfo&format=json&origin=*');
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📊 Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
    
    if (response.status === 200) {
      const text = await response.text();
      console.log(`✅ Réponse JSON: ${text.substring(0, 200)}...`);
      
      try {
        const json = JSON.parse(text);
        if (json.query?.general) {
          console.log('✅ API PUBLIQUE confirmée');
          DIAGNOSTIC_RESULTS.apiStatus = 'public';
          return true;
        }
      } catch (e) {
        console.log('⚠️  Réponse non-JSON valide');
      }
    } else if (response.status === 302) {
      console.log('🔐 REDIRECTION CAS - API protégée');
      DIAGNOSTIC_RESULTS.apiStatus = 'protected';
      return false;
    } else if (response.status === 403) {
      console.log('🚫 ACCÈS INTERDIT - API protégée');
      DIAGNOSTIC_RESULTS.apiStatus = 'protected';
      return false;
    }
    
    console.log('❌ Statut API inconnu');
    DIAGNOSTIC_RESULTS.apiStatus = 'unknown';
    return false;
    
  } catch (error) {
    console.log(`❌ Erreur curl: ${error.message}`);
    DIAGNOSTIC_RESULTS.apiStatus = 'error';
    return false;
  }
}

async function step2_launchDiagnosticScript() {
  console.log('\n🔍 ÉTAPE 2: Lancement script diagnostic');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ step: 'all' })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Diagnostic edge function terminé');
      
      data.results.forEach(result => {
        if (result.includes('✅')) {
          console.log(`✅ ${result}`);
        } else if (result.includes('❌')) {
          console.log(`❌ ${result}`);
        } else if (result.startsWith('===')) {
          console.log(`\n📋 ${result}`);
        } else {
          console.log(`   ${result}`);
        }
      });
      
      // Analyser les résultats
      const resultText = data.results.join(' ');
      if (resultText.includes('membres trouvés dans la catégorie')) {
        DIAGNOSTIC_RESULTS.categoryTest = 'success';
        console.log('\n✅ CATÉGORIE OIC TROUVÉE');
      } else {
        DIAGNOSTIC_RESULTS.categoryTest = 'empty';
        console.log('\n❌ CATÉGORIE OIC VIDE');
      }
      
      return data;
    } else {
      console.log(`❌ Erreur edge function: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Exception: ${error.message}`);
    return null;
  }
}

async function step3_generateCASCookie() {
  console.log('\n🔐 ÉTAPE 3: Génération cookie CAS');
  console.log('-'.repeat(40));
  
  if (DIAGNOSTIC_RESULTS.apiStatus === 'public') {
    console.log('⏭️  API publique - cookie CAS non nécessaire');
    return true;
  }
  
  try {
    console.log('🔄 Génération cookie avec Puppeteer...');
    
    // Simuler génération cookie (en pratique, lancer Puppeteer)
    const { generateCASCookie } = require('./generate-cas-cookie.js');
    const cookie = await generateCASCookie();
    
    if (cookie && cookie.length > 0) {
      console.log('✅ Cookie CAS généré avec succès');
      DIAGNOSTIC_RESULTS.cookieGenerated = true;
      return true;
    } else {
      console.log('❌ Échec génération cookie');
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur génération cookie: ${error.message}`);
    console.log('⚠️  Continuation avec tests publics uniquement');
    return false;
  }
}

async function step4_testBatch50() {
  console.log('\n📦 ÉTAPE 4: Test batch 50 pages');
  console.log('-'.repeat(40));
  
  if (DIAGNOSTIC_RESULTS.categoryTest !== 'success' && 
      DIAGNOSTIC_RESULTS.apiStatus === 'protected' && 
      !DIAGNOSTIC_RESULTS.cookieGenerated) {
    console.log('⏭️  Prérequis non remplis - skip batch test');
    return false;
  }
  
  try {
    const { testBatch50Pages } = require('./test-batch-50-pages.js');
    const result = await testBatch50Pages();
    
    if (result.success && result.parsed > 0) {
      console.log(`✅ Batch test réussi: ${result.parsed} compétences parsées`);
      DIAGNOSTIC_RESULTS.batchTest = result;
      return true;
    } else {
      console.log(`❌ Batch test échoué: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur batch test: ${error.message}`);
    return false;
  }
}

async function step5_testSupabaseInsertion() {
  console.log('\n💾 ÉTAPE 5: Test insertion Supabase');
  console.log('-'.repeat(40));
  
  if (!DIAGNOSTIC_RESULTS.batchTest || DIAGNOSTIC_RESULTS.batchTest.parsed === 0) {
    console.log('⏭️  Pas de compétences parsées - skip insertion');
    return false;
  }
  
  try {
    const competences = DIAGNOSTIC_RESULTS.batchTest.competences.slice(0, 3); // Prendre 3 premiers
    console.log(`📤 Insertion de ${competences.length} compétences test...`);
    
    // Simuler insertion (en pratique, appeler edge function d'insertion)
    const insertResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({ 
        action: 'test_insert',
        competences: competences
      })
    });
    
    if (insertResponse.ok) {
      console.log('✅ Test insertion réussi');
      DIAGNOSTIC_RESULTS.insertionTest = true;
      return true;
    } else {
      console.log('❌ Test insertion échoué');
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur insertion: ${error.message}`);
    return false;
  }
}

async function generateFinalReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT FINAL DIAGNOSTIC OIC');
  console.log('='.repeat(60));
  
  // Statut API
  console.log('\n1️⃣ STATUT API MediaWiki:');
  switch (DIAGNOSTIC_RESULTS.apiStatus) {
    case 'public':
      console.log('   ✅ API publique - accessible sans authentification');
      break;
    case 'protected':
      console.log('   🔐 API protégée - authentification CAS requise');
      break;
    case 'error':
      console.log('   ❌ API inaccessible - erreur de connexion');
      break;
    default:
      console.log('   ⚠️  Statut API inconnu');
  }
  
  // Catégorie
  console.log('\n2️⃣ CATÉGORIE OIC:');
  if (DIAGNOSTIC_RESULTS.categoryTest === 'success') {
    console.log('   ✅ Catégorie trouvée avec membres');
  } else {
    console.log('   ❌ Catégorie vide ou inaccessible');
  }
  
  // Cookie CAS
  console.log('\n3️⃣ AUTHENTIFICATION CAS:');
  if (DIAGNOSTIC_RESULTS.apiStatus === 'public') {
    console.log('   ⏭️  Non nécessaire (API publique)');
  } else if (DIAGNOSTIC_RESULTS.cookieGenerated) {
    console.log('   ✅ Cookie généré et fonctionnel');
  } else {
    console.log('   ❌ Génération cookie échouée');
  }
  
  // Batch test
  console.log('\n4️⃣ TEST BATCH 50 PAGES:');
  if (DIAGNOSTIC_RESULTS.batchTest) {
    console.log(`   ✅ ${DIAGNOSTIC_RESULTS.batchTest.parsed} compétences parsées`);
    console.log(`   📊 ${DIAGNOSTIC_RESULTS.batchTest.received}/${DIAGNOSTIC_RESULTS.batchTest.requested} pages récupérées`);
  } else {
    console.log('   ❌ Test batch non effectué ou échoué');
  }
  
  // Insertion
  console.log('\n5️⃣ TEST INSERTION SUPABASE:');
  if (DIAGNOSTIC_RESULTS.insertionTest) {
    console.log('   ✅ Insertion test réussie');
  } else {
    console.log('   ❌ Insertion test échouée ou non effectuée');
  }
  
  // CONCLUSION FINALE
  console.log('\n' + '='.repeat(60));
  console.log('🎯 CONCLUSION ET PROCHAINES ÉTAPES');
  console.log('='.repeat(60));
  
  const allOk = DIAGNOSTIC_RESULTS.categoryTest === 'success' && 
                (DIAGNOSTIC_RESULTS.apiStatus === 'public' || DIAGNOSTIC_RESULTS.cookieGenerated) &&
                DIAGNOSTIC_RESULTS.batchTest && 
                DIAGNOSTIC_RESULTS.batchTest.parsed > 0;
  
  if (allOk) {
    console.log('✅ DIAGNOSTIC COMPLET RÉUSSI');
    console.log('🚀 PRÊT POUR EXTRACTION COMPLÈTE DES 4,872 COMPÉTENCES');
    console.log('\nActions à effectuer:');
    console.log('1. Remettre le cron automatique');
    console.log('2. Lancer extraction complète');
    console.log('3. Surveiller progression');
    
    return {
      success: true,
      readyForFullExtraction: true,
      apiStatus: DIAGNOSTIC_RESULTS.apiStatus,
      competencesParsed: DIAGNOSTIC_RESULTS.batchTest?.parsed || 0
    };
  } else {
    console.log('❌ DIAGNOSTIC INCOMPLET - PROBLÈMES À RÉSOUDRE');
    console.log('\nProblèmes identifiés:');
    
    if (DIAGNOSTIC_RESULTS.categoryTest !== 'success') {
      console.log('- Catégorie OIC vide ou inaccessible');
    }
    if (DIAGNOSTIC_RESULTS.apiStatus === 'protected' && !DIAGNOSTIC_RESULTS.cookieGenerated) {
      console.log('- Authentification CAS requise mais non fonctionnelle');
    }
    if (!DIAGNOSTIC_RESULTS.batchTest || DIAGNOSTIC_RESULTS.batchTest.parsed === 0) {
      console.log('- Parsing des compétences échoué');
    }
    
    return {
      success: false,
      readyForFullExtraction: false,
      issues: 'Voir rapport détaillé ci-dessus'
    };
  }
}

async function main() {
  console.log('🚀 LANCEMENT DIAGNOSTIC COMPLET');
  console.log(`⏰ Début: ${new Date().toISOString()}`);
  
  try {
    // Exécution séquentielle des étapes
    const step1Result = await step1_testCurlMinimal();
    const step2Result = await step2_launchDiagnosticScript();
    const step3Result = await step3_generateCASCookie();
    const step4Result = await step4_testBatch50();
    const step5Result = await step5_testSupabaseInsertion();
    
    // Génération du rapport final
    const finalReport = await generateFinalReport();
    
    console.log(`\n⏰ Fin: ${new Date().toISOString()}`);
    
    // Sauvegarder le rapport
    await fs.writeFile('diagnostic-oic-report.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      results: DIAGNOSTIC_RESULTS,
      conclusion: finalReport
    }, null, 2));
    
    console.log('💾 Rapport sauvegardé: diagnostic-oic-report.json');
    
    return finalReport;
    
  } catch (error) {
    console.error('💥 Erreur critique orchestrateur:', error);
    process.exit(1);
  }
}

// Lancer si script appelé directement
if (require.main === module) {
  main();
}

module.exports = { main, DIAGNOSTIC_RESULTS };