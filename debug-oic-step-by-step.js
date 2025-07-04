// 🔧 SCRIPT DEBUG OIC EXTRACTION - Étapes 1-6 du ticket
console.log('🚀 DEBUG OIC EXTRACTION - Diagnostic complet');

const EDGE_FUNCTION_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/debug-oic-extraction';
const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
};

async function runDiagnostic() {
  try {
    console.log('📡 Lancement diagnostic complet...');
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ step: 'all' })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Diagnostic terminé');
      console.log('📊 RÉSULTATS:');
      console.log('='.repeat(50));
      
      data.results.forEach(result => {
        console.log(result);
      });
      
      console.log('='.repeat(50));
      console.log(`⏰ Terminé à: ${data.timestamp}`);
      
    } else {
      console.error('❌ Erreur diagnostic:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Détails:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Erreur critique:', error.message);
  }
}

// ÉTAPES INDIVIDUELLES
async function testStep(stepNumber) {
  console.log(`🔍 Test étape ${stepNumber}...`);
  
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify({ step: stepNumber.toString() })
  });
  
  if (response.ok) {
    const data = await response.json();
    data.results.forEach(result => console.log(result));
  } else {
    console.error(`❌ Erreur étape ${stepNumber}:`, await response.text());
  }
}

// TESTS DIRECTS curl équivalents
async function testCurlEquivalent() {
  console.log('🧪 TESTS CURL ÉQUIVALENTS');
  console.log('-'.repeat(30));
  
  // 1. Test API siteinfo
  console.log('1️⃣ Test curl API siteinfo...');
  try {
    const response = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&meta=siteinfo&format=json&origin=*');
    console.log(`   Status: ${response.status}`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
    
    if (response.ok) {
      const text = await response.text();
      console.log(`   Content: ${text.substring(0, 200)}...`);
    }
  } catch (e) {
    console.log(`   Erreur: ${e.message}`);
  }
  
  // 2. Test catégorie minimale
  console.log('\n2️⃣ Test curl catégorie...');
  try {
    const url = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie%3AObjectif_de_connaissance&cmlimit=1&format=json&origin=*';
    const response = await fetch(url);
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   Réponse: ${JSON.stringify(data, null, 2)}`);
    } else {
      const text = await response.text();
      console.log(`   Erreur: ${text.substring(0, 300)}`);
    }
  } catch (e) {
    console.log(`   Erreur: ${e.message}`);
  }
}

// MAIN - Lancer selon l'argument
const action = process.argv[2] || 'all';

switch (action) {
  case 'all':
    runDiagnostic();
    break;
  case 'curl':
    testCurlEquivalent();
    break;
  case '1':
  case '2':
  case '3':
  case '4':
    testStep(action);
    break;
  default:
    console.log('Usage: node debug-oic-step-by-step.js [all|curl|1|2|3|4]');
    console.log('  all  - Diagnostic complet');
    console.log('  curl - Tests curl équivalents');
    console.log('  1-4  - Test étape spécifique');
}