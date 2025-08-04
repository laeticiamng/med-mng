// Test d'extraction OIC simplifié pour debug
console.log('🔍 TEST EXTRACTION OIC SIMPLIFIÉ');
console.log('==============================');

async function testExtractionSimple() {
  try {
    console.log('📡 Test 1: Accès API public...');
    
    // Test basique sans authentification
    const response = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=3&format=json&origin=*');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API répond:', response.status);
      console.log('📊 Structure:', Object.keys(data));
      
      if (data.error) {
        console.log('❌ Erreur API:', data.error);
        console.log('💡 Solution: Authentification CAS requise');
        return { needsAuth: true, error: data.error };
      }
      
      if (data.query && data.query.categorymembers) {
        console.log(`✅ ${data.query.categorymembers.length} compétences trouvées`);
        console.log('📄 Première compétence:', data.query.categorymembers[0]);
        return { success: true, count: data.query.categorymembers.length };
      }
    } else {
      console.log('❌ API inaccessible:', response.status);
      return { error: `HTTP ${response.status}` };
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error.message);
    return { error: error.message };
  }
}

async function testWithCASCookies() {
  console.log('\n🔐 Test 2: Simulation avec cookies CAS...');
  
  try {
    // Appel vers notre Edge Function qui gère le CAS
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
      console.log('✅ Edge Function répond:', data);
      return data;
    } else {
      console.log('❌ Edge Function erreur:', response.status);
      const errorText = await response.text();
      console.log('📄 Détails:', errorText);
      return { error: `Edge Function ${response.status}` };
    }
    
  } catch (error) {
    console.error('💥 Erreur Edge Function:', error.message);
    return { error: error.message };
  }
}

// Tests séquentiels
testExtractionSimple()
  .then(result1 => {
    console.log('\n📋 RÉSULTAT TEST 1:', result1);
    
    if (result1.needsAuth) {
      console.log('\n🔄 Test avec authentification CAS...');
      return testWithCASCookies();
    } else if (result1.success) {
      console.log('\n🎉 SUCCESS: API accessible sans authentification !');
      return { final: 'success_no_auth' };
    } else {
      console.log('\n⚠️ API inaccessible, test avec CAS...');
      return testWithCASCookies();
    }
  })
  .then(result2 => {
    console.log('\n📋 RÉSULTAT FINAL:', result2);
    
    if (result2 && result2.success) {
      console.log('\n🎯 CONCLUSION: Extraction possible avec CAS');
      console.log('✅ Prochaine étape: Lancer l\'extraction complète');
    } else {
      console.log('\n❌ CONCLUSION: Problème persistant');
      console.log('🔧 Action requise: Débugger l\'authentification CAS');
    }
  })
  .catch(error => {
    console.error('\n💥 ERREUR GLOBALE:', error);
  });

console.log('🚀 Tests lancés...');