import { ednExtractor } from './launch-edn-objectifs-extraction';

// Script de test pour l'extraction EDN
async function testEdnExtraction() {
  console.log('🧪 Test de l\'extraction des objectifs EDN LISA UNESS');
  console.log('===============================================');
  
  try {
    // Démarrer l'extraction
    console.log('🚀 Démarrage de l\'extraction...');
    const result = await ednExtractor.startExtraction();
    
    console.log('✅ Extraction démarrée avec succès!');
    console.log('📊 Session ID:', result.session_id);
    console.log('🔗 URL de suivi:', result.status_url);
    
    // Surveillance du progrès
    let totalChecks = 0;
    const maxChecks = 100; // Maximum 10 minutes de surveillance
    
    const checkProgress = async () => {
      try {
        const status = await ednExtractor.getStatus();
        totalChecks++;
        
        const progress = Math.round((status.competences_extraites / status.total_competences) * 100);
        const pageProgress = Math.round((status.page_courante / status.total_pages) * 100);
        
        console.log(`📊 Progrès global: ${progress}% (${status.competences_extraites}/${status.total_competences} objectifs)`);
        console.log(`📄 Pages: ${status.page_courante}/${status.total_pages} (${pageProgress}%)`);
        console.log(`🟢 Statut: ${status.statut.toUpperCase()}`);
        console.log('---');
        
        if (status.statut === 'termine') {
          console.log('🎉 EXTRACTION TERMINÉE AVEC SUCCÈS!');
          
          // Générer le rapport final
          console.log('📊 Génération du rapport final...');
          const rapport = await ednExtractor.generateRapport();
          
          console.log('\n📈 RAPPORT FINAL:');
          console.log(`✅ Total extraits: ${rapport.total_competences_extraites.toLocaleString()}`);
          console.log(`🎯 Complétude: ${rapport.completude_globale}%`);
          console.log(`📚 Items couverts: ${rapport.repartition_par_item.length}`);
          
          // Top 5 des items les plus complets
          const topItems = rapport.repartition_par_item
            .sort((a, b) => b.completude_pct - a.completude_pct)
            .slice(0, 5);
          
          console.log('\n🏆 TOP 5 DES ITEMS LES PLUS COMPLETS:');
          topItems.forEach((item, index) => {
            console.log(`${index + 1}. IC-${item.item_parent.toString().padStart(3, '0')}: ${Math.round(item.completude_pct)}% (${item.competences_extraites}/${item.competences_attendues})`);
          });
          
          return;
        }
        
        if (status.statut === 'erreur') {
          console.error('❌ ERREUR DURANT L\'EXTRACTION');
          if (status.erreurs && status.erreurs.length > 0) {
            console.error('🔍 Détails des erreurs:', status.erreurs);
          }
          return;
        }
        
        if (totalChecks >= maxChecks) {
          console.log('⏰ Limite de surveillance atteinte. L\'extraction continue en arrière-plan.');
          console.log(`🔗 Vous pouvez suivre le progrès sur: /admin/extract-objectifs`);
          return;
        }
        
        // Vérifier à nouveau dans 10 secondes
        setTimeout(checkProgress, 10000);
        
      } catch (error) {
        console.error('❌ Erreur lors de la vérification du progrès:', error);
        setTimeout(checkProgress, 15000); // Réessayer dans 15 secondes
      }
    };
    
    // Commencer la surveillance après 5 secondes
    setTimeout(checkProgress, 5000);
    
  } catch (error) {
    console.error('💥 Erreur critique lors du test:', error);
    
    // Afficher les instructions de dépannage
    console.log('\n🔧 DÉPANNAGE:');
    console.log('1. Vérifiez que les identifiants UNESS sont configurés dans Supabase');
    console.log('2. Vérifiez la connexion internet');
    console.log('3. Consultez les logs de l\'edge function pour plus de détails');
    console.log('4. Essayez de relancer l\'extraction via l\'interface: /admin/extract-objectifs');
  }
}

// Exporter pour utilisation
export { testEdnExtraction };

// Lancement si exécuté directement
console.log('🎫 Script de test d\'extraction EDN LISA UNESS');
console.log('Rendez-vous sur /admin/extract-objectifs pour utiliser l\'interface complète');
console.log('Ou utilisez cette fonction: testEdnExtraction()');