// LANCEMENT IMMÉDIAT COMPLETION EDN-OIC
import { supabase } from '@/integrations/supabase/client';

console.log('🚀 DÉMARRAGE COMPLETION EDN AVEC COMPÉTENCES OIC...');
console.log('================================================');

(async () => {
  try {
    console.log('📡 Invocation de complete-edn-with-oic...');
    console.log('⏰ Début:', new Date().toLocaleTimeString());

    const { data, error } = await supabase.functions.invoke('complete-edn-with-oic', {
      body: { 
        action: 'complete',
        timestamp: new Date().toISOString()
      }
    });

    console.log('⏰ Fin appel:', new Date().toLocaleTimeString());

    if (error) {
      console.error('❌ ERREUR LORS DE L\'INVOCATION:', error);
      return;
    }

    console.log('📊 RÉPONSE REÇUE:', data);

    if (data?.success) {
      console.log('🎉 COMPLETION RÉUSSIE !');
      console.log('========================');
      
      const stats = data.statistics;
      console.log(`📊 Items traités: ${stats.items_processed}`);
      console.log(`✅ Items enrichis: ${stats.items_completed}`);
      console.log(`❌ Erreurs: ${stats.items_with_errors}`);
      console.log(`📈 Taux de succès: ${stats.completion_rate}`);
      
      if (data.details && data.details.length > 0) {
        console.log('');
        console.log('📋 DÉTAILS DES ENRICHISSEMENTS:');
        console.log('================================');
        
        data.details.slice(0, 10).forEach((item: any) => {
          console.log(`${item.item_code}:`);
          console.log(`  └ Rang A: ${item.rang_a_before} → ${item.rang_a_after} (+${item.rang_a_after - item.rang_a_before})`);
          console.log(`  └ Rang B: ${item.rang_b_before} → ${item.rang_b_after} (+${item.rang_b_after - item.rang_b_before})`);
          console.log(`  └ Total: ${item.total_before} → ${item.total_after} (+${item.total_after - item.total_before})`);
        });
        
        if (data.details.length > 10) {
          console.log(`... et ${data.details.length - 10} autres items enrichis`);
        }
      }
      
      console.log('');
      console.log(`💾 Fonction sauvegardée: ${data.function_saved}`);
      console.log('✨ COMPLETION TERMINÉE AVEC SUCCÈS !');
      
    } else {
      console.error('❌ ÉCHEC DE LA COMPLETION:', data?.error || data?.message || 'Erreur inconnue');
      if (data?.details) {
        console.error('Détails:', data.details);
      }
    }

  } catch (error) {
    console.error('💥 ERREUR CRITIQUE:', error);
    console.error('Type:', typeof error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  }
})();

export {};