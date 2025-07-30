import { generateAllLyricsAdvanced } from './generateAllLyricsAdvanced';

/**
 * Lance la génération des paroles médicales avancées
 */
export async function lancerGenerationAvancee() {
  console.log('🚀 Lancement de la génération des paroles médicales spécifiques...');
  
  try {
    const result = await generateAllLyricsAdvanced();
    console.log('✅ Génération terminée:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    throw error;
  }
}

// Lancer immédiatement si appelé directement
if (typeof window !== 'undefined') {
  lancerGenerationAvancee().then(result => {
    console.log('🎯 Résultat final de la génération:', result);
  }).catch(error => {
    console.error('🚨 Erreur finale:', error);
  });
}