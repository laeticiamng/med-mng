import { supabase } from '@/integrations/supabase/client';

// Lancement automatique de l'extraction OIC
export async function autoLaunchOICExtraction() {
  console.log('🚀 Lancement automatique de l\'extraction OIC des 4,872 compétences...');
  
  try {
    // Démarrer l'extraction OIC avec paramètres optimisés
    const { data, error } = await supabase.functions.invoke('extract-uness-enhanced', {
      body: {
        action: 'start',
        extraction_type: 'oic',
        batch_size: 100,
        max_concurrent: 8
      }
    });

    if (error) {
      throw new Error(`Erreur: ${error.message}`);
    }

    const session_id = data.session_id;
    console.log(`✅ Extraction OIC démarrée - Session: ${session_id}`);
    console.log(`📊 Configuration: ${data.config.batch_size} éléments/batch, ${data.config.max_concurrent} parallèles`);

    // Monitoring automatique
    const monitorInterval = setInterval(async () => {
      try {
        const { data: status, error: statusError } = await supabase.functions.invoke('extract-uness-enhanced', {
          body: {
            action: 'status',
            session_id: session_id
          }
        });

        if (statusError) {
          console.error('❌ Erreur status:', statusError);
          return;
        }

        const progress = Math.round((status.progress.processed / status.progress.total) * 100);
        const successRate = status.progress.success_rate.toFixed(1);
        
        console.log(`📈 Progrès: ${status.progress.processed}/${status.progress.total} (${progress}%) - Réussite: ${successRate}%`);
        
        if (status.status === 'completed') {
          clearInterval(monitorInterval);
          console.log('🎉 Extraction OIC terminée avec succès!');
          console.log(`📊 Résultats: ${status.progress.processed} compétences extraites`);
          console.log(`✅ Taux de réussite final: ${successRate}%`);
        } else if (status.status === 'failed') {
          clearInterval(monitorInterval);
          console.log('❌ Extraction échouée:', status.error_message);
        }
        
      } catch (err) {
        console.error('❌ Erreur monitoring:', err);
      }
    }, 5000);

    return { success: true, session_id, message: 'Extraction lancée et monitoring actif' };
    
  } catch (error) {
    console.error('💥 Erreur critique:', error);
    throw error;
  }
}

// Auto-lancement immédiat
autoLaunchOICExtraction().then(result => {
  console.log('🚀 Auto-extraction lancée:', result);
}).catch(error => {
  console.error('💥 Échec auto-extraction:', error);
});