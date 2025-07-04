// 🧪 TEST INSERTION UNITAIRE - Diagnostic rapide insertion OIC
console.log('🧪 TEST INSERTION UNITAIRE OIC');
console.log('=' .repeat(50));

const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

async function testInsertion() {
  try {
    console.log('1️⃣ Vérification count initial...');
    
    // Count initial
    const countInitial = await fetch(`${SUPABASE_URL}/rest/v1/oic_competences?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    const countInitialResult = await countInitial.text();
    console.log('📊 Count initial:', countInitialResult);
    
    console.log('\n2️⃣ Test insertion échantillon...');
    
    // Créer un échantillon de test
    const sampleCompetence = {
      objectif_id: 'OIC-001-23-A-01',
      intitule: 'TEST - Compétence de diagnostic',
      item_parent: '001',
      rang: 'A',
      rubrique: 'Génétique',
      description: 'Compétence de test pour diagnostic',
      ordre: 1,
      url_source: 'https://livret.uness.fr/lisa/2025/OIC-001-23-A-01',
      date_import: new Date().toISOString(),
      extraction_status: 'test'
    };
    
    console.log('SAMPLE ➜', JSON.stringify(sampleCompetence, null, 2));
    
    // Tentative d'insertion
    console.log('\n3️⃣ Insertion via REST API...');
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/oic_competences`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(sampleCompetence)
    });
    
    console.log('📊 Status insertion:', insertResponse.status);
    
    if (insertResponse.ok) {
      console.log('✅ INSERTION RÉUSSIE!');
    } else {
      const errorText = await insertResponse.text();
      console.error('❌ ERREUR INSERTION:', errorText);
      
      // Analyser l'erreur
      try {
        const errorJson = JSON.parse(errorText);
        console.error('📄 Détail erreur:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.error('📄 Erreur brute:', errorText);
      }
    }
    
    console.log('\n4️⃣ Vérification count final...');
    
    // Count final
    const countFinal = await fetch(`${SUPABASE_URL}/rest/v1/oic_competences?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    const countFinalResult = await countFinal.text();
    console.log('📊 Count final:', countFinalResult);
    
    // Test lecture
    console.log('\n5️⃣ Test lecture de l\'échantillon...');
    const readResponse = await fetch(`${SUPABASE_URL}/rest/v1/oic_competences?objectif_id=eq.${sampleCompetence.objectif_id}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (readResponse.ok) {
      const readData = await readResponse.json();
      console.log('✅ Lecture réussie:', readData.length, 'résultat(s)');
      if (readData.length > 0) {
        console.log('📄 Données:', JSON.stringify(readData[0], null, 2));
      }
    } else {
      console.error('❌ Erreur lecture:', await readResponse.text());
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🏁 TEST INSERTION TERMINÉ');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('💥 Erreur critique:', error);
  }
}

// Lancer le test
testInsertion();