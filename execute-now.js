// ⚡ Exécution immédiate de l'extraction README
console.log('⚡ Lancement IMMÉDIAT de l\'extraction selon README-OIC-EXTRACTION.md');

fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/complete-oic-competences', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
  },
  body: JSON.stringify({ 
    action: 'complete_all',
    method: 'readme_api_first',
    force_update: true
  })
})
.then(r => r.json())
.then(result => {
  console.log('🎯 RÉSULTAT EXTRACTION:', result);
  if (result.success) {
    console.log(`✅ ${result.processed_count || '?'} compétences traitées`);
    console.log(`📊 Taux complétion: ${result.completion_rate || '?'}%`);
  }
})
.catch(e => console.error('❌ ERREUR:', e));

console.log('🚀 Extraction en cours selon votre méthode README...');