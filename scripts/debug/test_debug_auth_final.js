// Test de la fonction debug-uness-auth avec les nouveaux secrets
const testDebugAuth = async () => {
  try {
    console.log('🔄 Test de l\'authentification CAS...');
    
    const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/debug-uness-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({ name: "Functions" })
    });
    
    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log('📋 Résultat complet:', JSON.stringify(result, null, 2));
    
    if (result.debug && result.debug.length > 0) {
      console.log('\n🔍 Détails des étapes:');
      result.debug.forEach((step, i) => {
        console.log(`\n📝 Étape ${step.step || i+1}:`, step);
      });
    }
    
    if (result.success) {
      console.log('\n✅ Authentification CAS réussie !');
      console.log('🍪 Cookies finaux:', result.finalCookies ? 'CONFIGURÉS' : 'MANQUANTS');
    } else {
      console.log('\n❌ Échec authentification:', result.error);
    }
    
  } catch (error) {
    console.error('🚨 Erreur test:', error);
  }
};

// Lancer le test
testDebugAuth();