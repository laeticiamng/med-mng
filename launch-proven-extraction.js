// 🔐 Lancement avec la logique CAS éprouvée de votre script .cjs
console.log('🔐 EXTRACTION AVEC LOGIQUE CAS ÉPROUVÉE');
console.log('===================================');
console.log('✅ Utilise exactement la même méthode que votre script extract-oic-competences.cjs');
console.log('✅ Évite toute la complexité des cookies et redirections CAS');

fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/oic-extraction-proven', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
  },
  body: JSON.stringify({ action: 'extract_with_proven_cas_method' })
})
.then(response => {
  console.log('📊 Statut HTTP:', response.status);
  return response.json();
})
.then(data => {
  console.log('🎉 EXTRACTION AVEC MÉTHODE ÉPROUVÉE TERMINÉE !');
  console.log('📈 Résultats:', data);
  
  if (data.success) {
    console.log(`🎯 Compétences extraites: ${data.total_extracted || 'N/A'}`);
    console.log(`📊 Taux de complétude: ${data.completion_rate || 'N/A'}%`);
    console.log(`🔐 Méthode: ${data.method || 'CAS selon votre script .cjs'}`);
    console.log(`⏰ Horodatage: ${data.timestamp || 'N/A'}`);
  } else {
    console.error('❌ Erreur:', data.error);
  }
})
.catch(error => {
  console.error('💥 Erreur critique:', error);
});

console.log('🚀 Extraction lancée avec la méthode CAS éprouvée de votre script !');
console.log('📋 Cette version utilise exactement votre logique d\'authentification multi-étapes');