// Test rapide de l'extraction OIC avec authentification
console.log('🧪 Test de l\'extraction OIC avec authentification CAS...');

// Lancer l'extraction
fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
  },
  body: JSON.stringify({
    action: 'start'
  })
})
.then(response => response.json())
.then(data => {
  console.log('📊 Résultat:', data);
  
  if (data.success) {
    console.log('✅ Extraction démarrée avec succès!');
    console.log(`Session ID: ${data.session_id}`);
    
    // Vérifier le statut après 30 secondes
    setTimeout(() => {
      fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
        },
        body: JSON.stringify({
          action: 'status',
          session_id: data.session_id
        })
      })
      .then(r => r.json())
      .then(status => {
        console.log('📈 Statut après 30s:', status);
        console.log(`Items extraits: ${status.items_extracted || 0}`);
        console.log(`Statut: ${status.status}`);
      });
    }, 30000);
    
  } else {
    console.error('❌ Erreur:', data.error);
  }
})
.catch(error => {
  console.error('💥 Erreur critique:', error);
});