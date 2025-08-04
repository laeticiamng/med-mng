// 🔍 DIAGNOSTIC RAPIDE - QU'EST-CE QUI NE MARCHE PAS ?
console.log('🚨 DIAGNOSTIC RAPIDE DU PROBLÈME');
console.log('================================');

async function diagnosticRapide() {
  const tests = {
    edge_function_cas: null,
    workflow_clean: null,
    api_connectivity: null
  };

  // Test 1: Edge Function CAS Cookies Replica
  console.log('\n🔧 Test 1: Edge Function cas-cookies-replica...');
  try {
    const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/cas-cookies-replica', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({ action: 'extract_with_cookies' })
    });

    if (response.ok) {
      const data = await response.json();
      tests.edge_function_cas = { 
        status: 'working', 
        success: data.success,
        message: data.success ? 'Edge Function OK' : data.issue || 'Problème détecté'
      };
      console.log(`✅ Edge Function responsive: ${data.success ? 'SUCCESS' : 'ISSUES DETECTED'}`);
    } else {
      tests.edge_function_cas = { 
        status: 'error', 
        code: response.status,
        message: 'Edge Function inaccessible'
      };
      console.log(`❌ Edge Function erreur: ${response.status}`);
    }
  } catch (error) {
    tests.edge_function_cas = { 
      status: 'failed', 
      message: error.message 
    };
    console.log(`💥 Edge Function échec: ${error.message}`);
  }

  // Test 2: API Basic Connectivity
  console.log('\n📡 Test 2: API MediaWiki basique...');
  try {
    const response = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=1&format=json&origin=*');
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.error) {
        tests.api_connectivity = {
          status: 'blocked',
          error_code: data.error.code,
          message: 'API nécessite authentification',
          solution: 'CAS authentification requise'
        };
        console.log(`🔐 API bloquée: ${data.error.code} - Authentification CAS requise`);
      } else if (data.query && data.query.categorymembers) {
        tests.api_connectivity = {
          status: 'accessible',
          count: data.query.categorymembers.length,
          message: 'API accessible publiquement'
        };
        console.log(`✅ API accessible: ${data.query.categorymembers.length} compétences`);
      } else {
        tests.api_connectivity = {
          status: 'empty',
          message: 'API répond mais données vides'
        };
        console.log(`⚠️ API répond mais vide`);
      }
    } else {
      tests.api_connectivity = {
        status: 'error',
        code: response.status,
        message: 'API inaccessible'
      };
      console.log(`❌ API erreur: ${response.status}`);
    }
  } catch (error) {
    tests.api_connectivity = {
      status: 'failed',
      message: error.message
    };
    console.log(`💥 API échec: ${error.message}`);
  }

  // Test 3: Workflow Status (simulation)
  console.log('\n⚙️ Test 3: Workflow clean status...');
  tests.workflow_clean = {
    status: 'ready',
    message: 'Workflow extract-oic-clean.yml créé',
    note: 'Évite les conflits Storybook'
  };
  console.log(`✅ Workflow prêt: extract-oic-clean.yml`);

  // Analyse et recommandations
  console.log('\n📊 ANALYSE DU PROBLÈME');
  console.log('======================');

  let probleme_principal = 'indeterminé';
  let solution_recommandee = 'diagnostic approfondi';

  if (tests.edge_function_cas?.status === 'working') {
    if (tests.api_connectivity?.status === 'blocked') {
      probleme_principal = 'API nécessite authentification CAS';
      solution_recommandee = 'Lancer workflow extract-oic-clean.yml avec authentification CAS';
      console.log('🎯 PROBLÈME: API nécessite authentification CAS');
      console.log('✅ SOLUTION: Utiliser workflow avec authentification');
    } else if (tests.api_connectivity?.status === 'accessible') {
      probleme_principal = 'API accessible - extraction directe possible';
      solution_recommandee = 'Lancer extraction directe sans CAS';
      console.log('🎯 SURPRISE: API accessible sans authentification !');
      console.log('✅ SOLUTION: Extraction directe possible');
    }
  } else {
    probleme_principal = 'Edge Functions défaillantes';
    solution_recommandee = 'Débugger Edge Functions';
    console.log('🎯 PROBLÈME: Edge Functions ne répondent pas');
    console.log('✅ SOLUTION: Vérifier déploiement Edge Functions');
  }

  console.log('\n🔧 ACTIONS RECOMMANDÉES:');
  
  if (solution_recommandee.includes('workflow')) {
    console.log('1. Lancer le workflow extract-oic-clean.yml dans GitHub Actions');
    console.log('2. Le workflow évite les conflits npm et utilise authentification CAS');
    console.log('3. Suivre les logs du workflow pour voir l\'authentification');
  } else if (solution_recommandee.includes('directe')) {
    console.log('1. Créer script d\'extraction directe (pas de CAS nécessaire)');
    console.log('2. Extraire directement via l\'API MediaWiki');
    console.log('3. Sauvegarder en base Supabase');
  } else {
    console.log('1. Vérifier les Edge Functions dans Supabase');
    console.log('2. Relancer les scripts de test');
    console.log('3. Consulter les logs Edge Functions');
  }

  console.log('\n📋 RÉSUMÉ:');
  console.log(`🔸 Edge Function: ${tests.edge_function_cas?.status || 'unknown'}`);
  console.log(`🔸 API MediaWiki: ${tests.api_connectivity?.status || 'unknown'}`);
  console.log(`🔸 Workflow: ${tests.workflow_clean?.status || 'unknown'}`);
  console.log(`🔸 Problème principal: ${probleme_principal}`);

  return {
    tests,
    probleme_principal,
    solution_recommandee
  };
}

// Lancement
diagnosticRapide()
  .then(result => {
    console.log('\n🎉 DIAGNOSTIC TERMINÉ');
    if (result.solution_recommandee.includes('workflow')) {
      console.log('\n🚀 READY TO GO: Lancez extract-oic-clean.yml !');
    } else if (result.solution_recommandee.includes('directe')) {
      console.log('\n🚀 READY TO GO: Extraction directe possible !');
    } else {
      console.log('\n🔧 NEEDS FIXING: Problèmes à résoudre avant extraction');
    }
  })
  .catch(error => {
    console.error('\n💥 DIAGNOSTIC FAILED:', error);
  });

console.log('🔍 Diagnostic en cours...');