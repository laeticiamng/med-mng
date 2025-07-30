// 🚀 Lancement immédiat de l'extraction OIC
console.log('🚀 Lancement de l\'extraction des compétences OIC...');

// Utilisation directe avec les clés du projet
fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/complete-oic-competences', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
  },
  body: JSON.stringify({ action: 'complete_all' })
})
.then(response => {
  console.log('📊 Statut HTTP:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ Extraction terminée avec succès !');
  console.log('📈 Résultats:', data);
  
  if (data.success) {
    console.log(`🎯 Compétences traitées: ${data.processed_count || 'N/A'}`);
    console.log(`✅ Compétences complétées: ${data.completed_count || 'N/A'}`);
    console.log(`📊 Taux de complétion: ${data.completion_rate || 'N/A'}%`);
  }
})
.catch(error => {
  console.error('❌ Erreur lors de l\'extraction:', error);
  
  // Tentative avec la fonction d'extraction directe en backup
  console.log('🔄 Tentative avec extraction directe...');
  return fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/oic-extraction-direct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
    },
    body: JSON.stringify({ action: 'extract_all' })
  })
  .then(r => r.json())
  .then(backupData => {
    console.log('🎯 Résultat extraction directe:', backupData);
  });
});

console.log('⏳ Extraction en cours... Veuillez patienter...');