import { supabase } from '@/integrations/supabase/client';
import { secureOpenAIClient } from '@/lib/secureApiClient';

interface CompetenceOIC {
  objectif_id: string;
  intitule: string;
  description: string;
  rang: string;
  rubrique: string;
  item_parent: string;
}

interface EdnItemData {
  item_code: string;
  title: string;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  competences_oic_rang_a?: any;
  competences_oic_rang_b?: any;
}

/**
 * Génère des paroles riches style Nekfeu avec OpenAI
 * Structure complète avec assonances, allitérations et contenu médical dense
 */
export async function generateRichAdvancedLyrics(
  itemCode: string, 
  rang: 'A' | 'B' | 'AB'
): Promise<string[]> {
  console.log(`🎵 Génération RICHE avancée ${itemCode} Rang ${rang}`);
  
  try {
    // 1. Récupérer les données complètes de l'item
    const itemData = await fetchItemData(itemCode);
    
    // 2. Récupérer toutes les compétences OIC détaillées
    const competences = await fetchDetailedCompetences(itemCode, rang);
    
    // 3. Générer avec OpenAI un prompt ultra-détaillé
    const richLyrics = await generateWithOpenAI(itemData, competences, rang);
    
    console.log(`✅ Paroles riches générées: ${richLyrics.length} lignes`);
    return richLyrics;
    
  } catch (error) {
    console.error('❌ Erreur génération riche:', error);
    throw error;
  }
}

async function fetchItemData(itemCode: string): Promise<EdnItemData> {
  const { data, error } = await supabase
    .from('edn_items_complete')
    .select(`
      item_code, 
      title, 
      tableau_rang_a, 
      tableau_rang_b,
      competences_oic_rang_a,
      competences_oic_rang_b
    `)
    .eq('item_code', itemCode)
    .single();
    
  if (error || !data) {
    throw new Error(`Item ${itemCode} non trouvé`);
  }
  
  return data;
}

async function fetchDetailedCompetences(itemCode: string, rang: 'A' | 'B' | 'AB'): Promise<CompetenceOIC[]> {
  const itemNum = itemCode.replace('IC-', '').padStart(3, '0');
  
  let query = supabase
    .from('oic_competences')
    .select('*')
    .eq('item_parent', itemNum);
    
  if (rang !== 'AB') {
    query = query.eq('rang', rang);
  }
  
  const { data, error } = await query.order('ordre');
  
  if (error || !data) {
    console.log(`Aucune compétence OIC pour ${itemCode}`);
    return [];
  }
  
  return data;
}

async function generateWithOpenAI(
  itemData: EdnItemData, 
  competences: CompetenceOIC[], 
  rang: 'A' | 'B' | 'AB'
): Promise<string[]> {
  
  const competencesText = competences.map(c => 
    `- ${c.intitule}: ${c.description}`
  ).join('\n');
  
  const systemPrompt = `Tu es un expert en création de chansons médicales style NEKFEU.

MISSION: Créer une vraie chanson COMPLÈTE et RICHE pour l'item médical ${itemData.item_code} "${itemData.title}" rang ${rang}.

OBJECTIF PÉDAGOGIQUE: 
- Permettre de retenir TOUTES les compétences pour avoir 20/20 au QCM
- Intégrer chaque élément clé des descriptions de compétences
- Créer un contenu mémorable et musical

STYLE NEKFEU:
- Flow moderne, urbain, intelligent
- Jeux de mots et métaphores médicales
- Assonances et allitérations systématiques
- Rimes riches et internes
- Ton personnel et direct
- Références médicales précises

STRUCTURE OBLIGATOIRE:
[Intro] (2-3 lignes accroche)
[Couplet 1] (8 lignes - présentation pathologie)
[Refrain] (4 lignes - message central avec assonances)
[Couplet 2] (8 lignes - diagnostic et examens)
[Refrain] (répétition exacte)
[Couplet 3] (8 lignes - traitement et surveillance)
[Refrain] (répétition exacte)
[Pont] (4 lignes - transition vers complexité)
[Couplet 4] (8 lignes - cas complexes/pronostic)
[Refrain Final] (4 lignes - variation du refrain)
[Outro] (2-3 lignes - conclusion mémorable)

CONTRAINTES TECHNIQUES:
- TOUS les éléments des compétences doivent apparaître
- Assonances en -ion, -tion, -ment, -eur, -age
- Allitérations médicales (diagnostic/différentiel, clinique/critique, etc.)
- Vocabulaire médical précis mais accessible en musique
- Rythme et métrique adaptés au rap
- Maximum 5000 caractères

COMPÉTENCES À INTÉGRER:
${competencesText}

Génère une chanson COMPLÈTE, RICHE et MÉMORABLE qui couvre tout le contenu médical.`;

  const userPrompt = `Crée maintenant la chanson complète pour ${itemData.item_code} "${itemData.title}" rang ${rang}.

Intègre absolument TOUTES les compétences listées ci-dessus.
Assure-toi que chaque couplet contient du contenu médical précis et mémorable.
Utilise des assonances et allitérations pour faciliter la mémorisation.
Style Nekfeu moderne et engagé.

FORMAT DE RÉPONSE: Une liste de lignes de paroles avec les sections clairement marquées.`;

  try {
    const response = await secureOpenAIClient.createChatCompletion({
      model: 'gpt-5-2025-08-07',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_completion_tokens: 2000
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Parser la réponse en lignes
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !line.startsWith('**') && !line.startsWith('*')); // Supprimer markdown
    
    if (lines.length < 10) {
      throw new Error('Réponse OpenAI trop courte');
    }
    
    return lines;
    
  } catch (error) {
    console.error('❌ Erreur OpenAI:', error);
    throw new Error(`Erreur génération OpenAI: ${error.message}`);
  }
}

// Export pour compatibilité
export async function generateMixedRichLyrics(itemCode: string): Promise<string[]> {
  return generateRichAdvancedLyrics(itemCode, 'AB');
}