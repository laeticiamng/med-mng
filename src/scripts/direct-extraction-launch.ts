import { supabase } from '@/integrations/supabase/client';

// Lancement direct de l'extraction complète des objectifs EDN
export async function launchDirectExtraction() {
  console.log('🚀 LANCEMENT DIRECT DE L\'EXTRACTION EDN-OBJECTIFS');
  console.log('==================================================');
  
  try {
    console.log('📡 Appel de l\'edge function extract-edn-objectifs...');
    
    const { data, error } = await supabase.functions.invoke('extract-edn-objectifs', {
      body: {
        action: 'start'
      }
    });

    if (error) {
      console.error('❌ Erreur lors de l\'appel:', error);
      throw error;
    }

    console.log('✅ EXTRACTION DÉMARRÉE AVEC SUCCÈS!');
    console.log('📊 Session ID:', data.session_id);
    console.log('🔗 Message:', data.message);
    
    console.log('');
    console.log('🎯 EXTRACTION EN COURS:');
    console.log('- 4,872 compétences OIC à extraire');
    console.log('- 25 pages depuis LISA UNESS');
    console.log('- Authentification CAS automatique');
    console.log('- Sauvegarde temps réel en base');
    
    console.log('');
    console.log('⏱️ DURÉE ESTIMÉE: 15-20 minutes');
    console.log('📈 SUIVI: /admin/extract-objectifs');
    
    // Démarrer le polling du statut
    console.log('');
    console.log('🔄 Démarrage du suivi automatique...');
    
    const pollStatus = async () => {
      try {
        const { data: status, error: statusError } = await supabase.functions.invoke('extract-edn-objectifs', {
          body: {
            action: 'status',
            session_id: data.session_id
          }
        });

        if (statusError) {
          console.error('❌ Erreur statut:', statusError);
          return;
        }

        const progress = Math.round((status.competences_extraites / status.total_competences) * 100);
        console.log(`📊 Progrès: ${progress}% (${status.competences_extraites}/${status.total_competences}) - Page ${status.page_courante}/${status.total_pages} - Statut: ${status.statut.toUpperCase()}`);
        
        if (status.statut === 'termine') {
          console.log('🎉 EXTRACTION TERMINÉE AVEC SUCCÈS!');
          
          // Générer le rapport final
          const { data: rapport } = await supabase.functions.invoke('extract-edn-objectifs', {
            body: { action: 'rapport' }
          });

          if (rapport) {
            console.log('');
            console.log('📈 RAPPORT FINAL:');
            console.log(`✅ Total extraits: ${rapport.total_competences_extraites.toLocaleString()}`);
            console.log(`🎯 Complétude: ${rapport.completude_globale}%`);
            console.log(`📚 Items couverts: ${rapport.repartition_par_item.length}`);
          }
          
          return;
        }
        
        if (status.statut === 'erreur') {
          console.error('❌ ERREUR DURANT L\'EXTRACTION');
          if (status.erreurs && status.erreurs.length > 0) {
            console.error('🔍 Détails:', status.erreurs);
          }
          return;
        }
        
        // Continuer le polling dans 10 secondes
        setTimeout(pollStatus, 10000);
        
      } catch (err) {
        console.error('❌ Erreur lors du polling:', err);
        setTimeout(pollStatus, 15000); // Réessayer dans 15 secondes
      }
    };
    
    // Démarrer le polling après 5 secondes
    setTimeout(pollStatus, 5000);

    return data;
    
  } catch (error) {
    console.error('💥 ERREUR CRITIQUE:', error);
    console.log('');
    console.log('🔧 SOLUTIONS POSSIBLES:');
    console.log('1. Vérifiez la connexion internet');
    console.log('2. Vérifiez les identifiants UNESS dans Supabase');
    console.log('3. Consultez les logs de l\'edge function');
    console.log('4. Utilisez l\'interface: /admin/extract-objectifs');
    throw error;
  }
}

// Auto-exécution si appelé directement
if (typeof window !== 'undefined') {
  console.log('🎫 Script de lancement direct de l\'extraction EDN');
  console.log('Lancement automatique dans 3 secondes...');
  
  setTimeout(() => {
    launchDirectExtraction();
  }, 3000);
}