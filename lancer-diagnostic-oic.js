// 🚀 LANCEMENT DIAGNOSTIC OIC - Script de test immédiat
console.log('🔧 DIAGNOSTIC OIC EXTRACTION - Lancement des tests...');

async function launchDiagnostic() {
  try {
    console.log('📡 Appel fonction debug...');
    
    const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/debug-oic-extraction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({ step: 'all' })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ DIAGNOSTIC TERMINÉ');
      console.log('='.repeat(60));
      
      data.results.forEach(result => {
        console.log(result);
      });
      
      console.log('='.repeat(60));
      console.log(`⏰ Terminé: ${data.timestamp}`);
      
      // Analyser les résultats
      const resultText = data.results.join(' ');
      if (resultText.includes('✅ API accessible publiquement')) {
        console.log('\n🎯 CONCLUSION: API publique - pas besoin de CAS');
      } else if (resultText.includes('Redirection CAS') || resultText.includes('Accès interdit')) {
        console.log('\n🔐 CONCLUSION: API protégée - authentification CAS requise');
      }
      
      if (resultText.includes('membres trouvés dans la catégorie')) {
        console.log('✅ CONCLUSION: Catégorie trouvée - URL correcte');
      } else {
        console.log('❌ CONCLUSION: Problème avec le nom de catégorie');
      }
      
    } else {
      console.error('❌ Erreur:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Détails:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Erreur critique:', error);
  }
}

// Test rapide direct
async function testDirect() {
  console.log('\n🧪 TEST DIRECT API...');
  
  try {
    const response = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie%3AObjectif_de_connaissance&cmlimit=1&format=json&origin=*');
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Réponse:', JSON.stringify(data, null, 2));
    } else {
      console.log('Erreur:', await response.text());
    }
  } catch (e) {
    console.log('Exception:', e.message);
  }
}

// Lancer les tests
launchDiagnostic().then(() => {
  console.log('\n' + '='.repeat(60));
  return testDirect();
}).catch(console.error);