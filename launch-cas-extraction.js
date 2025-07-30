// 🚀 Extraction avec authentification CAS stockée
console.log('🔐 Lancement de l\'extraction avec authentification CAS...');

fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
  },
  body: JSON.stringify({ 
    action: 'start',
    force_extraction: true,
    use_stored_credentials: true
  })
})
.then(response => {
  console.log('📊 Statut HTTP:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ Extraction lancée avec authentification CAS !');
  console.log('📈 Résultat:', data);
  
  if (data.session_id) {
    console.log(`🎯 Session ID: ${data.session_id}`);
    console.log('⏳ Extraction en cours avec vos identifiants CAS...');
    
    // Monitoring automatique
    const monitorInterval = setInterval(() => {
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
        console.log('📊 Statut extraction:', status);
        if (status.status === 'termine' || status.status === 'erreur') {
          clearInterval(monitorInterval);
          console.log('🎉 Extraction terminée !');
        }
      });
    }, 10000); // Check every 10 seconds
  }
})
.catch(error => {
  console.error('❌ Erreur lors de l\'extraction:', error);
});