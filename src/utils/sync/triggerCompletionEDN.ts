import { supabase } from '@/integrations/supabase/client';

console.log('🚀 LANCEMENT COMPLETION EDN-OIC...');

export async function triggerCompletion() {
  try {
    console.log('📡 Appel de la fonction complete-edn-with-oic...');
    
    const { data, error } = await supabase.functions.invoke('complete-edn-with-oic', {
      body: {}
    });

    if (error) {
      console.error('❌ Erreur:', error);
      throw error;
    }

    console.log('✅ COMPLETION RÉUSSIE !');
    console.log('==============================');
    console.log('📊 Résultats:', data);
    
    if (data?.statistics) {
      console.log(`📊 Items traités: ${data.statistics.items_processed}`);
      console.log(`🎯 Items enrichis: ${data.statistics.items_completed}`);
      console.log(`❌ Erreurs: ${data.statistics.items_with_errors}`);
      console.log(`📈 Taux de succès: ${data.statistics.completion_rate}`);
    }

    return data;

  } catch (error) {
    console.error('💥 Erreur lors du lancement:', error);
    throw error;
  }
}

// Auto-exécution
triggerCompletion();