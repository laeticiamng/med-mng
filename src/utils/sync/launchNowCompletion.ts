import { supabase } from '@/integrations/supabase/client';

console.log('🚀 DÉMARRAGE IMMÉDIAT COMPLETION EDN-OIC...');

// Lancement immédiat de la fonction
(async () => {
  try {
    console.log('📡 Invocation complete-edn-with-oic...');
    
    const { data, error } = await supabase.functions.invoke('complete-edn-with-oic', {
      body: { action: 'complete' }
    });

    if (error) {
      console.error('❌ ERREUR FONCTION:', error);
      return;
    }

    console.log('🎉 COMPLETION TERMINÉE !');
    console.log('========================');
    
    if (data?.success) {
      const stats = data.statistics;
      console.log(`📊 Items traités: ${stats.items_processed}`);
      console.log(`✅ Items enrichis: ${stats.items_completed}`);
      console.log(`❌ Erreurs: ${stats.items_with_errors}`);
      console.log(`📈 Taux succès: ${stats.completion_rate}`);
      
      if (data.details?.length > 0) {
        console.log('\n📋 Exemples enrichis:');
        data.details.slice(0, 5).forEach((item: any) => {
          console.log(`   ${item.item_code}: Rang A (${item.rang_a_before}→${item.rang_a_after}) | Rang B (${item.rang_b_before}→${item.rang_b_after})`);
        });
      }
      
      console.log(`\n💾 Fonction sauvée: ${data.function_saved}`);
    } else {
      console.error('❌ ÉCHEC:', data?.error || 'Erreur inconnue');
    }

  } catch (error) {
    console.error('💥 ERREUR CRITIQUE:', error);
  }
})();

export {};