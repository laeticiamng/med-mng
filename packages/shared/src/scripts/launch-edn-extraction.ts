import { supabase } from '../lib/supabase';

/**
 * ✅ SÉCURISÉ: Script de lancement sécurisé de l'extraction EDN
 * Utilise des variables d'environnement ou des prompts utilisateur
 */
async function launchEdnExtraction() {
  console.log('🚀 Lancement de l\'extraction automatique des 367 items EDN...');
  
  try {
    // ✅ SÉCURISÉ: Récupération des credentials depuis l'environnement ou prompt
    const username = import.meta.env.VITE_CAS_USERNAME || prompt('Username CAS:');
    const password = import.meta.env.VITE_CAS_PASSWORD || prompt('Password CAS:');
    
    if (!username || !password) {
      throw new Error('Credentials manquants - veuillez configurer VITE_CAS_USERNAME et VITE_CAS_PASSWORD');
    }
    
    const { data, error } = await supabase.functions.invoke('extract-edn-uness', {
      body: {
        action: 'start',
        credentials: {
          username,
          password
        }
      }
    });

    if (error) {
      console.error('❌ Erreur lors du lancement de l\'extraction:', error);
      throw error;
    }

    console.log('✅ Extraction lancée avec succès!');
    console.log('📊 Résultats:', data);
    
    return data;
    
  } catch (error) {
    console.error('❌ Échec du lancement de l\'extraction:', error);
    throw error;
  }
}

// Lancer l'extraction immédiatement
launchEdnExtraction()
  .then(result => {
    console.log('🎉 Extraction terminée avec succès:', result);
  })
  .catch(error => {
    console.error('💥 Erreur critique:', error);
  });