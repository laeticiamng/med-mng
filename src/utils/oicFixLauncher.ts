import { supabase } from '@/integrations/supabase/client';

export async function launchOICFixes() {
  console.log('🚀 Lancement automatique des corrections OIC...');
  
  try {
    const { _data, error } = await supabase.functions.invoke('fix-oic-data-quality', {
      body: { action: 'fix' }
    });
    
    if (error) {
      throw error;
    }
    
    console.log('✅ CORRECTIONS OIC TERMINÉES !');
    console.log('==============================');
    console.log(`📊 Total traité: ${_data.report.totalProcessed}`);
    console.log(`🔧 Total corrigé: ${_data.totalFixed}`);
    console.log(`📈 Taux de succès: ${_data.successRate}%`);
    console.log('');
    console.log('📋 Détail des corrections:');
    console.log(`   🔧 HTML nettoyé: ${_data.report.htmlEntitiesFixed}`);
    console.log(`   📝 Fragments reconstruits: ${_data.report.fragmentsReconstructed}`);
    console.log(`   ❌ Descriptions créées: ${_data.report.emptyDescriptionsHandled}`);
    console.log(`   📋 Tables nettoyées: ${_data.report.wikitablesCleaned}`);
    console.log(`   💥 Intitulés corrigés: ${_data.report.intitulesFixed}`);
    
    return _data;
    
  } catch (error) {
    console.error('❌ Erreur lors des corrections OIC:', error);
    throw error;
  }
}

// Auto-exécution immédiate
launchOICFixes();