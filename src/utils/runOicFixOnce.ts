import { supabase } from '@/integrations/supabase/client';

// Déclenche une fois la fonction Edge fix-incomplete-oic pour compléter les descriptions depuis url_source
export async function runOicFixOnce() {
  try {
    if (typeof window === 'undefined') return;
    const key = 'oicFixRun_v1_4872';
    if (localStorage.getItem(key)) return; // déjà exécuté

    console.log('🚀 Déclenchement unique: fix-incomplete-oic sur 4 872 compétences');
    localStorage.setItem(key, new Date().toISOString());

    const { data, error } = await supabase.functions.invoke('fix-incomplete-oic');
    if (error) {
      console.error('❌ fix-incomplete-oic échec:', error);
      return;
    }
    console.log('✅ fix-incomplete-oic terminé:', data);
  } catch (e) {
    console.error('❌ Erreur runOicFixOnce:', e);
  }
}

// lancer immédiatement sans attendre une interaction
runOicFixOnce();
