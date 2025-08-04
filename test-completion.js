// Test de la fonction de complétion OIC
console.log('🧪 Test de la complétion des compétences OIC...');

async function testCompletion() {
  try {
    const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/complete-oic-competences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({})
    });

    console.log(`📡 Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur HTTP:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Réponse reçue:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

testCompletion();