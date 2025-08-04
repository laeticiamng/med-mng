// 🔍 DIAGNOSTIC COMPLET POUR IDENTIFIER LE PROBLÈME
console.log('🚀 DIAGNOSTIC COMPLET - EXTRACTION OIC');
console.log('=====================================');

async function diagnosticComplet() {
  const results = {
    api_public: null,
    api_auth: null,
    edge_function: null,
    workflow_status: null,
    recommendation: null
  };

  try {
    // === TEST 1: API PUBLIC ===
    console.log('\n📡 Test 1: API MediaWiki public...');
    try {
      const response = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=3&format=json&origin=*');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.error) {
          results.api_public = {
            status: 'blocked',
            error: data.error.code,
            message: data.error.info,
            solution: 'Authentification CAS requise'
          };
          console.log('❌ API bloquée:', data.error.code);
        } else if (data.query && data.query.categorymembers) {
          results.api_public = {
            status: 'accessible',
            count: data.query.categorymembers.length,
            sample: data.query.categorymembers[0]?.title,
            solution: 'Extraction directe possible'
          };
          console.log(`✅ API accessible: ${data.query.categorymembers.length} compétences`);
        } else {
          results.api_public = {
            status: 'empty',
            message: 'Réponse vide',
            solution: 'Vérifier la catégorie'
          };
          console.log('⚠️ Réponse API vide');
        }
      } else {
        results.api_public = {
          status: 'error',
          http_code: response.status,
          solution: 'Problème réseau ou serveur'
        };
        console.log(`❌ Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      results.api_public = {
        status: 'failed',
        error: error.message,
        solution: 'Vérifier connectivité'
      };
      console.log(`💥 Erreur: ${error.message}`);
    }

    // === TEST 2: EDGE FUNCTION ===
    console.log('\n🔧 Test 2: Edge Function test-oic-simple...');
    try {
      const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/test-oic-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
        },
        body: JSON.stringify({ action: 'test_simple' })
      });

      if (response.ok) {
        const data = await response.json();
        results.edge_function = {
          status: 'working',
          diagnosis: data.diagnosis,
          recommendation: data.diagnosis?.recommendation
        };
        console.log('✅ Edge Function fonctionne');
        console.log('📋 Diagnostic:', data.diagnosis?.recommendation);
      } else {
        const errorText = await response.text();
        results.edge_function = {
          status: 'failed',
          http_code: response.status,
          error: errorText.substring(0, 200),
          solution: 'Débugger Edge Function'
        };
        console.log(`❌ Edge Function erreur: ${response.status}`);
      }
    } catch (error) {
      results.edge_function = {
        status: 'failed',
        error: error.message,
        solution: 'Vérifier déploiement Edge Function'
      };
      console.log(`💥 Erreur Edge Function: ${error.message}`);
    }

    // === TEST 3: TEST CONNECTIVITY ===
    console.log('\n🔗 Test 3: test-connectivity...');
    try {
      const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/test-connectivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
        },
        body: JSON.stringify({ action: 'test', timestamp: new Date().toISOString() })
      });

      if (response.ok) {
        const data = await response.json();
        results.workflow_status = {
          status: 'connectivity_ok',
          needs_auth: data.statistics?.debug_info?.needs_authentication,
          api_accessible: data.statistics?.api_accessible
        };
        console.log('✅ Connectivity OK');
      } else {
        results.workflow_status = {
          status: 'connectivity_failed',
          http_code: response.status
        };
        console.log(`❌ Connectivity failed: ${response.status}`);
      }
    } catch (error) {
      results.workflow_status = {
        status: 'connectivity_error',
        error: error.message
      };
      console.log(`💥 Connectivity error: ${error.message}`);
    }

    // === ANALYSE ET RECOMMANDATIONS ===
    console.log('\n📊 ANALYSE COMPLÈTE');
    console.log('==================');

    if (results.api_public?.status === 'accessible') {
      results.recommendation = {
        type: 'immediate_extraction',
        action: 'Lancer extraction directe sans CAS',
        confidence: 'high',
        steps: [
          '1. Utiliser API public directement',
          '2. Créer script d\'extraction simple',
          '3. Sauvegarder en base'
        ]
      };
      console.log('🎯 RECOMMANDATION: Extraction directe possible !');
    } else if (results.api_public?.status === 'blocked' && results.edge_function?.status === 'working') {
      results.recommendation = {
        type: 'cas_authentication',
        action: 'Implémenter CAS avec Playwright',
        confidence: 'medium',
        steps: [
          '1. Utiliser le script Playwright fonctionnel',
          '2. Authentification CAS automatisée',
          '3. Extraction avec cookies'
        ]
      };
      console.log('🔐 RECOMMANDATION: Authentification CAS requise');
    } else {
      results.recommendation = {
        type: 'debug_required',
        action: 'Débugger infrastructure',
        confidence: 'low',
        steps: [
          '1. Vérifier connectivité réseau',
          '2. Tester Edge Functions',
          '3. Contacter support'
        ]
      };
      console.log('🔧 RECOMMANDATION: Debug infrastructure requis');
    }

    // === RAPPORT FINAL ===
    console.log('\n📋 RAPPORT DIAGNOSTIC');
    console.log('====================');
    console.log('🔸 API Public:', results.api_public?.status || 'unknown');
    console.log('🔸 Edge Function:', results.edge_function?.status || 'unknown');
    console.log('🔸 Connectivity:', results.workflow_status?.status || 'unknown');
    console.log('🔸 Recommandation:', results.recommendation?.type || 'none');
    
    if (results.recommendation?.steps) {
      console.log('\n✅ PROCHAINES ÉTAPES:');
      results.recommendation.steps.forEach((step, i) => {
        console.log(`   ${step}`);
      });
    }

    return results;

  } catch (globalError) {
    console.error('\n💥 ERREUR GLOBALE:', globalError);
    return { error: globalError.message, status: 'failed' };
  }
}

// Lancement du diagnostic
diagnosticComplet()
  .then(results => {
    console.log('\n🎉 DIAGNOSTIC TERMINÉ');
    
    if (results.recommendation?.type === 'immediate_extraction') {
      console.log('\n🚀 READY: Vous pouvez lancer l\'extraction maintenant !');
    } else if (results.recommendation?.type === 'cas_authentication') {
      console.log('\n🔐 CAS REQUIRED: Authentification CAS nécessaire');
    } else {
      console.log('\n🔧 DEBUG NEEDED: Problèmes à résoudre');
    }
  })
  .catch(error => {
    console.error('\n💥 DIAGNOSTIC FAILED:', error);
  });

console.log('🔍 Diagnostic en cours...');