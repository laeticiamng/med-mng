import { supabase } from '@/integrations/supabase/client';

/**
 * ✅ SÉCURISÉ: Script de lancement sécurisé de l'extraction EDN
 * Utilise des variables d'environnement ou des prompts utilisateur
 */
async function launchEdnExtraction() {
  console.log('🚀 Lancement de l\'extraction automatique des 367 items EDN...');
  
  try {
    // CAS credentials must be provided by the user via secure form
    const username = prompt('Username CAS:');
    const password = prompt('Password CAS:');
    
    if (!username || !password) {
      throw new Error('Credentials manquants - veuillez saisir vos identifiants CAS');
    }
    
    const { _data, error } = await supabase.functions.invoke('extract-edn-uness', {
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
    console.log('📊 Résultats:', _data);
    
    return _data;
    
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