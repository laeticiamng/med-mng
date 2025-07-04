import { launchEdnObjectifsExtraction } from './launch-edn-objectifs-extraction';

// Script pour lancer l'extraction complète des 4,872 compétences OIC
console.log('🚀 LANCEMENT DE L\'EXTRACTION COMPLÈTE DES OBJECTIFS EDN');
console.log('===============================================');
console.log('📊 Extraction de 4,872 compétences depuis LISA UNESS');
console.log('🎯 Authentification CAS automatique');
console.log('💾 Sauvegarde en base Supabase');
console.log('');

// Lancer l'extraction
launchEdnObjectifsExtraction()
  .then((result) => {
    console.log('✅ Extraction lancée avec succès!');
    console.log('📋 Session ID:', result.session_id);
    console.log('');
    console.log('🔍 SUIVI DU PROGRÈS:');
    console.log('- Interface web: /admin/extract-objectifs');
    console.log('- Polling automatique activé');
    console.log('- Durée estimée: 15-20 minutes');
    console.log('');
    console.log('📈 Le système va extraire automatiquement:');
    console.log('- 25 pages de compétences');
    console.log('- ~200 compétences par page');
    console.log('- Format OIC-XXX-YY-R-ZZ');
    console.log('- Sauvegarde temps réel');
  })
  .catch((error) => {
    console.error('❌ Erreur lors du lancement:', error);
    console.log('');
    console.log('🔧 SOLUTIONS:');
    console.log('1. Vérifiez la connexion internet');
    console.log('2. Utilisez l\'interface: /admin/extract-objectifs');
    console.log('3. Consultez les logs de l\'edge function');
  });

export { launchEdnObjectifsExtraction };