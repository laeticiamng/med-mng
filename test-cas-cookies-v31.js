// 🍪 TEST RÉCUPÉRATION COOKIES COMME VERSION 31
console.log('🚀 TEST AUTHENTIFICATION CAS - RÉPLIQUE VERSION 31');
console.log('================================================');

async function testCASCookiesVersion31() {
  try {
    console.log('📡 Appel Edge Function cas-cookies-replica...');
    
    const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/cas-cookies-replica', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({ 
        action: 'extract_with_cookies'
      })
    });

    console.log('📊 Statut HTTP:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Réponse reçue avec succès');
      
      if (data.success) {
        console.log('\n🎉 SUCCÈS - MÉTHODE VERSION 31 CONFIRMÉE !');
        console.log('===========================================');
        console.log(`🍪 Cookies récupérés: ${data.cookies_recovered}`);
        console.log(`📊 Compétences trouvées: ${data.extraction_results?.total_found}`);
        console.log(`🔧 Méthode: ${data.extraction_results?.extraction_method}`);
        
        console.log('\n📄 Échantillon de données:');
        if (data.extraction_results?.sample_data) {
          data.extraction_results.sample_data.forEach((item, i) => {
            console.log(`   ${i+1}. ${item.title} (${item.type})`);
          });
        }
        
        console.log('\n✅ PROCHAINES ÉTAPES:');
        if (data.next_steps) {
          data.next_steps.forEach((step, i) => {
            console.log(`   ${i+1}. ${step}`);
          });
        }
        
        console.log('\n🎯 CONCLUSION: La méthode de la version 31 fonctionne !');
        console.log('👉 Il faut reproduire exactement cette logique d\'authentification CAS');
        
      } else {
        console.log('\n❌ PROBLÈME IDENTIFIÉ');
        console.log('====================');
        console.log('🔸 Issue:', data.issue || 'Non spécifiée');
        console.log('🔸 Solution:', data.solution || 'Non spécifiée');
        
        if (data.version_31_analysis) {
          console.log('\n📋 ANALYSE VERSION 31:');
          console.log('Étapes qui marchent:');
          data.version_31_analysis.working_steps?.forEach((step, i) => {
            console.log(`   ✅ ${step}`);
          });
          
          console.log('\n🚨 Problème actuel:', data.version_31_analysis.current_issue);
          console.log('🔧 Fix requis:', data.version_31_analysis.fix_needed);
        }
      }
      
    } else {
      console.log('❌ Erreur HTTP:', response.status);
      const errorText = await response.text();
      console.log('📄 Détails:', errorText.substring(0, 300));
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error.message);
  }
}

// Lancement du test
console.log('🔄 Démarrage du test...');
testCASCookiesVersion31()
  .then(() => {
    console.log('\n📝 Test terminé.');
    console.log('💡 Si la méthode fonctionne, nous devons implémenter l\'authentification CAS réelle.');
  })
  .catch(error => {
    console.error('💥 Erreur globale:', error);
  });

console.log('⏳ Test en cours...');