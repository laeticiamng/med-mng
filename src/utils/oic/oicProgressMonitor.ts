import { supabase } from '@/integrations/supabase/client';

export async function checkOICProgress() {
  const { data, error } = await supabase
    .from('oic_competences')
    .select('description, intitule')
    .limit(10);
    
  if (error) return null;
  
  // Compter les problèmes dans l'échantillon
  let problems = 0;
  data?.forEach(comp => {
    if (comp.description?.includes('&lt;') || 
        comp.description?.includes('&gt;') ||
        comp.description?.startsWith('-') ||
        comp.intitule?.includes('[[')) {
      problems++;
    }
  });
  
  const healthScore = ((10 - problems) / 10) * 100;
  
  console.log(`🔍 Échantillon OIC - Score: ${healthScore}% (${10-problems}/10 propres)`);
  
  return {
    healthScore,
    isComplete: healthScore > 90
  };
}

// Surveillance automatique
setInterval(async () => {
  const progress = await checkOICProgress();
  if (progress?.isComplete) {
    console.log('🎉 CORRECTIONS OIC TERMINÉES !');
  }
}, 30000); // Vérifie toutes les 30 secondes