import { supabase } from '@/integrations/supabase/client';

export async function launchOICFixes() {
  console.log('🚀 Lancement automatique des corrections OIC...');
  
  try {
    const { data, error } = await supabase.functions.invoke('fix-oic-data-quality', {
      body: { action: 'fix' }
    });
    
    if (error) {
      throw error;
    }
    
    console.log('✅ CORRECTIONS OIC TERMINÉES !');
    console.log('==============================');
    console.log(`📊 Total traité: ${data.report.totalProcessed}`);
    console.log(`🔧 Total corrigé: ${data.totalFixed}`);
    console.log(`📈 Taux de succès: ${data.successRate}%`);
    console.log('');
    console.log('📋 Détail des corrections:');
    console.log(`   🔧 HTML nettoyé: ${data.report.htmlEntitiesFixed}`);
    console.log(`   📝 Fragments reconstruits: ${data.report.fragmentsReconstructed}`);
    console.log(`   ❌ Descriptions créées: ${data.report.emptyDescriptionsHandled}`);
    console.log(`   📋 Tables nettoyées: ${data.report.wikitablesCleaned}`);
    console.log(`   💥 Intitulés corrigés: ${data.report.intitulesFixed}`);
    
    return data;
    
  } catch (error) {
    console.error('❌ Erreur lors des corrections OIC:', error);
    throw error;
  }
}

// Auto-exécution immédiate
launchOICFixes();