import { supabase } from '@/integrations/supabase/client';

async function launchEdnExtraction() {
  console.log('🚀 Lancement de l\'extraction automatique des 367 items EDN...');
  
  try {
    const { data, error } = await supabase.functions.invoke('extract-edn-uness', {
      body: {
        action: 'start',
        credentials: {
          username: 'laeticia.moto-ngane@etud.u-picardie.fr',
          password: 'Aiciteal1!'
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