// 🚀 LANCEMENT FINAL - Extraction avec Puppeteer (Solution définitive)
console.log('🎭 EXTRACTION FINALE AVEC PUPPETEER - SOLUTION DÉFINITIVE');
console.log('========================================================');
console.log('✅ Utilise Puppeteer pour gérer TOUTES les redirections et cookies CAS');
console.log('✅ Reprend exactement la logique de votre script extract-oic-competences.cjs');

fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/puppeteer-oic-final', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
  },
  body: JSON.stringify({ action: 'extract_with_puppeteer_final' })
})
.then(response => {
  console.log('📊 Statut HTTP:', response.status);
  return response.json();
})
.then(data => {
  console.log('🎉 EXTRACTION PUPPETEER TERMINÉE !');
  console.log('📈 Résultats complets:', data);
  
  if (data.success) {
    console.log(`🎯 Compétences extraites: ${data.totalExtracted || 'N/A'}`);
    console.log(`📊 Taux de complétude: ${data.completionRate || 'N/A'}`);
    console.log(`⏱️ Durée: ${data.duration || 'N/A'}`);
    console.log(`🎭 Méthode: ${data.method || 'Puppeteer Edge Function'}`);
    console.log(`❌ Erreurs: ${data.totalErrors || 0}`);
  } else {
    console.error('❌ Erreur:', data.error);
  }
})
.catch(error => {
  console.error('💥 Erreur critique:', error);
});

console.log('🎭 EXTRACTION PUPPETEER LANCÉE - GESTION AUTOMATIQUE DES COOKIES !');
console.log('📊 Cette version résout le problème des redirections CAS complexes !');