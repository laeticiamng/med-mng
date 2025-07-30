// 🚀 Déclencheur de l'extraction via GitHub Actions
console.log('🔧 Déclenchement de l\'extraction GitHub Actions...');

// Utilisation de l'API GitHub pour déclencher le workflow
const GITHUB_API_URL = 'https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/actions/workflows/extract-oic.yml/dispatches';

// Déclencher le workflow manuellement
fetch(GITHUB_API_URL, {
  method: 'POST',
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': 'Bearer YOUR_GITHUB_TOKEN', // À remplacer par votre token
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ref: 'main' // ou votre branche principale
  })
})
.then(response => {
  if (response.ok) {
    console.log('✅ Workflow GitHub Actions déclenché avec succès !');
    console.log('🔍 L\'extraction va utiliser vos identifiants CAS stockés');
    console.log('📊 Vérifiez l\'onglet Actions de votre repo GitHub pour suivre le progrès');
  } else {
    console.error('❌ Erreur lors du déclenchement:', response.status);
  }
})
.catch(error => {
  console.error('💥 Erreur:', error);
  
  // Alternative: utiliser directement le script d'extraction
  console.log('🔄 Tentative alternative avec le script extraction direct...');
  console.log('💡 Conseil: Exécutez manuellement le workflow depuis GitHub Actions');
  console.log('📍 Allez sur: https://github.com/YOUR_USERNAME/YOUR_REPO/actions');
  console.log('🎯 Sélectionnez "Extract OIC Competences" > "Run workflow"');
});

console.log('⚡ Alternative recommandée: déclenchez manuellement depuis GitHub !');
console.log('🔗 Votre workflow est configuré avec les bons identifiants CAS');