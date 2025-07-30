// 🔍 Test diagnostique de l'API MediaWiki UNESS
console.log('🔍 DIAGNOSTIC API MEDIAWHQIKI UNESS');
console.log('=================================');

async function diagnosticAPI() {
  const testUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=1&format=json&origin=*';
  
  try {
    console.log('🌐 Test URL:', testUrl);
    const response = await fetch(testUrl);
    
    console.log('📊 Statut HTTP:', response.status);
    console.log('📝 Headers:', [...response.headers.entries()]);
    
    const text = await response.text();
    console.log('📄 Réponse (premiers 500 chars):', text.substring(0, 500));
    
    if (text.includes('CAS') || text.includes('login') || text.includes('authentication')) {
      console.log('🔐 PROBLÈME: L\'API redirige vers CAS - authentification requise');
      console.log('💡 SOLUTION: Il faut absolument vos identifiants CAS pour accéder aux données');
    } else {
      try {
        const data = JSON.parse(text);
        console.log('✅ JSON valide reçu:', data);
      } catch {
        console.log('❌ Réponse non-JSON - possible page d\'erreur HTML');
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur réseau:', error);
  }
}

diagnosticAPI();