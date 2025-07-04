// Script pour lancer l'extraction complète des 4,872 compétences OIC
console.log('🚀 Lancement de l\'extraction complète des objectifs OIC avec authentification...');

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
  console.log('✅ Réponse de l\'extraction:', data);
  if (data.success) {
    console.log(`🎉 Extraction lancée avec succès!`);
    console.log(`📊 Session ID: ${data.session_id}`);
    console.log(`🔍 Suivi du progrès: ${data.status_url}`);
  } else {
    console.error('❌ Erreur:', data.error);
  }
})
.catch(error => {
  console.error('💥 Erreur critique:', error);
});

console.log('⏳ Extraction lancée avec authentification CAS...');
console.log('📊 Vérifiez les logs Edge Function pour le diagnostic détaillé');