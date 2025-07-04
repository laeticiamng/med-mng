// Script pour lancer immédiatement l'extraction EDN
console.log('🚀 Lancement immédiat de l\'extraction des 367 items EDN...');

fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-uness', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
  },
  body: JSON.stringify({
    action: 'start',
    credentials: {
      username: 'laeticia.moto-ngane@etud.u-picardie.fr',
      password: 'Aiciteal1!'
    }
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Réponse de l\'extraction:', data);
  if (data.success) {
    console.log(`🎉 Extraction lancée avec succès!`);
    console.log(`📊 Statistiques:`, data.stats);
  } else {
    console.error('❌ Erreur:', data.error);
  }
})
.catch(error => {
  console.error('💥 Erreur critique:', error);
});

console.log('⏳ Extraction en cours... Cela peut prendre 10-15 minutes pour traiter les 367 items.');
console.log('📊 Vous pouvez suivre le progrès sur: /admin/extract-edn');