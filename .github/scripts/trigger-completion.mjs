// Script simple pour déclencher la completion via Edge Function
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variables SUPABASE manquantes');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  try {
    console.log('🚀 Test de l\'authentification CAS...');
    
    const { data: authTest, error: authError } = await supabase.functions.invoke('complete-oic-urls', {
      body: { action: 'test_auth' }
    });
    
    if (authError) {
      console.error('❌ Erreur test auth:', authError);
      return;
    }
    
    console.log('✅ Test auth résultat:', authTest);
    
    console.log('\n📊 Vérification du statut...');
    
    const { data: status, error: statusError } = await supabase.functions.invoke('complete-oic-urls', {
      body: { action: 'status' }
    });
    
    if (statusError) {
      console.error('❌ Erreur statut:', statusError);
      return;
    }
    
    console.log('📈 Statut actuel:', status);
    
    console.log('\n🚀 Démarrage de la completion...');
    
    const { data: completion, error: completionError } = await supabase.functions.invoke('complete-oic-urls', {
      body: { 
        action: 'start',
        batch_size: 50,
        min_chars: 200,
        concurrency: 3
      }
    });
    
    if (completionError) {
      console.error('❌ Erreur completion:', completionError);
      return;
    }
    
    console.log('✅ Completion démarrée:', completion);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
    process.exit(1);
  }
}

main();