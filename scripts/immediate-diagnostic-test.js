// 🔧 TEST DIAGNOSTIC IMMÉDIAT - Analyse des résultats OIC
console.log('🚀 DIAGNOSTIC OIC - Tests immédiat des 3 étapes');
console.log('=' .repeat(60));

const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

async function executeDiagnosticSteps() {
  const results = {};
  
  try {
    // 🧪 ÉTAPE 3.1: Test API curl
    console.log('\n🧪 ÉTAPE 3.1: Test API MediaWiki anonyme...');
    const curlResponse = await fetch(`${SUPABASE_URL}/functions/v1/test-oic-curl`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const curlResult = await curlResponse.json();
    results.step31_curl = curlResult;
    console.log('📊 CURL Result Status:', curlResponse.status);
    console.log('📄 CURL Result (tronqué):', JSON.stringify(curlResult).substring(0, 500) + '...');
    
    // 🔐 ÉTAPE 3.2: Test génération cookie CAS
    console.log('\n🔐 ÉTAPE 3.2: Test génération cookie CAS...');
    const casResponse = await fetch(`${SUPABASE_URL}/functions/v1/generate-cas-cookie`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const casResult = await casResponse.json();
    results.step32_cas = casResult;
    console.log('📊 CAS Result Status:', casResponse.status);
    
    // Hash SHA-256 du cookie pour sécurité
    if (casResult.cookieHash) {
      console.log('🍪 Cookie Hash (SHA-256):', casResult.cookieHash.substring(0, 20) + '...');
    }
    
    // 📦 ÉTAPE 3.3: Test batch 50 pages
    console.log('\n📦 ÉTAPE 3.3: Test batch 50 pages...');
    const batchResponse = await fetch(`${SUPABASE_URL}/functions/v1/test-batch-50`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const batchResult = await batchResponse.json();
    results.step33_batch = batchResult;
    console.log('📊 BATCH Result Status:', batchResponse.status);
    console.log('📄 BATCH Stats:', {
      success: batchResult.success,
      totalMembers: batchResult.stats?.totalMembers,
      oicMembers: batchResult.stats?.oicMembers,
      validPages: batchResult.stats?.validPages
    });
    
    // Afficher les premiers échantillons de pages
    if (batchResult.samplePages?.length > 0) {
      console.log('\n📋 ÉCHANTILLONS DE PAGES:');
      batchResult.samplePages.slice(0, 3).forEach((page, i) => {
        console.log(`   ${i+1}. ${page.title} (ID: ${page.pageid}, ${page.contentLength} chars)`);
        console.log(`      Extrait: ${page.excerpt}...`);
      });
    }
    
    // 📊 COLLECTE RÉSULTATS
    console.log('\n📊 COLLECTE RÉSULTATS FINAUX...');
    const collectResponse = await fetch(`${SUPABASE_URL}/functions/v1/collect-diagnostic-results`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const collectResult = await collectResponse.json();
    results.step34_collect = collectResult;
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RÉSUMÉ DIAGNOSTIC COMPLET');
    console.log('=' .repeat(60));
    console.log('✅ ÉTAPE 3.1 - API Curl:', curlResult.success ? 'OK' : 'ÉCHEC');
    console.log('✅ ÉTAPE 3.2 - Cookie CAS:', casResult.success ? 'OK' : 'ÉCHEC');
    console.log('✅ ÉTAPE 3.3 - Batch 50:', batchResult.success ? 'OK' : 'ÉCHEC');
    
    if (batchResult.success && batchResult.stats?.validPages > 0) {
      console.log('\n🎯 DONNÉES RÉCUPÉRÉES AVEC SUCCÈS!');
      console.log(`   Pages valides: ${batchResult.stats.validPages}`);
      console.log(`   IDs récupérés: ${batchResult.pageIds?.length || 0}`);
      console.log('\n⚠️  PROBLÈME: Les données sont récupérées mais PAS insérées en base');
      console.log('   ➜ Le parsing ou l\'insertion échoue silencieusement');
    } else {
      console.log('\n❌ PROBLÈME DE RÉCUPÉRATION DES DONNÉES');
      console.log('   ➜ Vérifier l\'accès API et l\'authentification');
    }
    
    return results;
    
  } catch (error) {
    console.error('💥 Erreur diagnostic:', error.message);
    return { error: error.message, results };
  }
}

// Lancer le diagnostic
executeDiagnosticSteps()
  .then(results => {
    console.log('\n🏁 DIAGNOSTIC TERMINÉ');
    console.log('📄 Résultats disponibles pour analyse approfondie');
  })
  .catch(console.error);