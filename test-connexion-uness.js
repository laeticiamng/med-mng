// 🔐 TEST CONNEXION UNESS - Vérification authentification
console.log('🔐 TEST CONNEXION UNESS - Vérification des identifiants...');

async function testUnessConnection() {
  try {
    console.log('📡 Test de connexion en mode single...');
    
    const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/unified-extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({ 
        mode: 'single',
        version: 'v1.0'
      })
    });
    
    console.log(`📊 Statut HTTP: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ RÉPONSE FONCTION REÇUE');
      console.log('='.repeat(60));
      console.log(`🎯 Succès: ${data.success}`);
      console.log(`📋 Échantillon récupéré: ${data.sample?.length || 0} compétences`);
      
      if (data.sample && data.sample.length > 0) {
        console.log('\n📝 PREMIER ÉCHANTILLON:');
        const first = data.sample[0];
        console.log(`   🔗 ID: ${first.objectif_id}`);
        console.log(`   📖 Titre: ${first.intitule?.substring(0, 50)}...`);
        console.log(`   📏 Description: ${first.description?.length || 0} caractères`);
        console.log(`   🔄 Statut: ${first.extraction_status}`);
        
        if (first.description && first.description.length > 100) {
          console.log('🎉 CONNEXION UNESS RÉUSSIE - Données complètes récupérées !');
        } else {
          console.log('⚠️  Données partielles - Vérifier authentification UNESS');
        }
      }
      
      console.log('='.repeat(60));
      
      // Test d'un rapport complet
      console.log('\n📊 Test rapport complet...');
      const reportResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/unified-extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
        },
        body: JSON.stringify({ 
          mode: 'report',
          version: 'v1.0'
        })
      });
      
      if (reportResponse.ok) {
        const reportData = await reportResponse.json();
        console.log('📈 RAPPORT ÉTAT ACTUEL:');
        console.log(`   📊 Total: ${reportData.report?.totalCompetences || 0} compétences`);
        console.log(`   ✅ Complètes: ${reportData.report?.completedCompetences || 0}`);
        console.log(`   🔧 Tronquées: ${reportData.report?.truncatedCompetences || 0}`);
        console.log(`   📈 Taux: ${reportData.report?.completionRate || 0}%`);
      }
      
    } else {
      console.error('❌ Erreur HTTP:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Détails erreur:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Erreur critique:', error);
  }
}

// Test immédiat
testUnessConnection().catch(console.error);