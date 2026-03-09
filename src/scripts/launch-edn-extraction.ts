import { supabase } from '@/integrations/supabase/client';

/**
 * ✅ SÉCURISÉ: Script de lancement sécurisé de l'extraction EDN
 * Utilise des variables d'environnement ou des prompts utilisateur
 */
async function launchEdnExtraction() {
  if (import.meta.env.DEV) console.log('🚀 Lancement de l\'extraction automatique des 367 items EDN...');
  
  try {
    const username = prompt('Username CAS:');
    const password = prompt('Password CAS:');
    
    if (!username || !password) {
      throw new Error('Credentials manquants - veuillez saisir vos identifiants CAS');
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
      if (import.meta.env.DEV) console.error('❌ Erreur lors du lancement de l\'extraction:', error);
      throw error;
    }

    if (import.meta.env.DEV) {
      console.log('✅ Extraction lancée avec succès!');
      console.log('📊 Résultats:', data);
    }

    return data;
    
  } catch (error) {
    if (import.meta.env.DEV) console.error('❌ Échec du lancement de l\'extraction:', error);
    throw error;
  }
}

launchEdnExtraction()
  .then(result => {
    if (import.meta.env.DEV) console.log('🎉 Extraction terminée avec succès:', result);
  })
  .catch(error => {
    if (import.meta.env.DEV) console.error('💥 Erreur critique:', error);
  });
