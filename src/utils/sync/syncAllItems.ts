import { supabase } from '@/integrations/supabase/client';

export async function syncAllItemsWithOic() {
  try {
    console.log('🚀 Démarrage synchronisation globale EDN...');
    
    const { data, error } = await supabase.functions.invoke('sync-edn-content', {
      body: { syncAll: true }
    });

    if (error) {
      console.error('❌ Erreur fonction sync:', error);
      throw error;
    }

    console.log('✅ Synchronisation terminée:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Erreur synchronisation globale:', error);
    throw error;
  }
}