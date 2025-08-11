import { supabase } from '@/integrations/supabase/client';

// Déclenche une régénération globale UNE FOIS par navigateur
export async function runBulkLyricsOnce() {
  try {
    if (typeof window === 'undefined') return;
    if (!location.pathname.startsWith('/edn')) return;
    const key = 'bulkLyricsRun_v2_refined';
    if (localStorage.getItem(key)) return; // déjà exécuté

    console.log('🚀 Déclenchement unique: generate-lyrics-bulk refined (ALL)');
    localStorage.setItem(key, new Date().toISOString());

    const { data, error } = await supabase.functions.invoke('generate-lyrics-bulk', {
      body: { rang: 'ALL' }
    });

    if (error) throw error;
    console.log('✅ Bulk terminé:', data);
  } catch (e) {
    console.error('❌ Erreur bulk auto:', e);
  }
}

// Lancer automatiquement
if (typeof window !== 'undefined') {
  // petit délai pour laisser l'app se monter
  setTimeout(() => {
    runBulkLyricsOnce();
  }, 1500);
}
