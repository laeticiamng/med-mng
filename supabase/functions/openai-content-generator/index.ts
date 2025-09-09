import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, itemCode, title, tableauA, tableauB, customPrompt } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'scene':
        systemPrompt = "Tu es un expert en pédagogie médicale. Tu crées des scènes immersives réalistes pour l'apprentissage médical.";
        userPrompt = `Crée une scène immersive pour l'item ${itemCode} - ${title}.
        
Contexte médical disponible:
- Tableau Rang A: ${JSON.stringify(tableauA)}
- Tableau Rang B: ${JSON.stringify(tableauB)}

Structure JSON attendue:
{
  "title": "Titre de la scène",
  "context": "Contexte hospitalier/clinique",
  "characters": [
    {
      "role": "Médecin/Patient/Infirmier",
      "name": "Nom du personnage",
      "description": "Description du personnage"
    }
  ],
  "scenario": "Description détaillée du cas clinique",
  "learning_objectives": ["Objectif 1", "Objectif 2"],
  "interactions": [
    {
      "type": "decision",
      "question": "Question posée",
      "options": ["Option 1", "Option 2"],
      "feedback": "Retour pédagogique"
    }
  ]
}`;
        break;

      case 'quiz':
        systemPrompt = "Tu es un expert en création de quiz médicaux. Tu crées des questions pertinentes et pédagogiques.";
        userPrompt = `Crée un quiz interactif pour l'item ${itemCode} - ${title}.
        
Contexte médical:
- Tableau Rang A: ${JSON.stringify(tableauA)}
- Tableau Rang B: ${JSON.stringify(tableauB)}

Structure JSON attendue:
{
  "title": "Quiz ${itemCode} - ${title}",
  "description": "Description du quiz",
  "questions": [
    {
      "id": 1,
      "question": "Question à choix multiples",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 2,
      "explanation": "Explication détaillée de la réponse",
      "rang": "A ou B"
    }
  ]
}`;
        break;

      case 'bd':
        systemPrompt = "Tu es un expert en storytelling médical et bande dessinée pédagogique.";
        userPrompt = `Crée le scénario d'une bande dessinée pédagogique pour l'item ${itemCode} - ${title}.
        
Contexte médical:
- Tableau Rang A: ${JSON.stringify(tableauA)}
- Tableau Rang B: ${JSON.stringify(tableauB)}

Structure JSON attendue:
{
  "title": "BD ${itemCode} - ${title}",
  "story": "Histoire narrative",
  "panels": [
    {
      "id": 1,
      "scene": "Description de la scène",
      "dialogue": "Dialogue des personnages",
      "medical_point": "Point médical illustré"
    }
  ],
  "characters": [
    {
      "name": "Nom du personnage",
      "role": "Rôle (médecin, patient, etc.)",
      "description": "Description du personnage"
    }
  ]
}`;
        break;

      default:
        throw new Error('Type de contenu non supporté');
    }

    if (customPrompt) {
      userPrompt += `\n\nInstructions supplémentaires: ${customPrompt}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Tenter de parser le JSON généré
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError);
      // Retourner le contenu brut si le parsing échoue
      parsedContent = {
        raw_content: generatedContent,
        type: type,
        generated_at: new Date().toISOString()
      };
    }

    return new Response(JSON.stringify({
      success: true,
      content: parsedContent,
      type: type,
      itemCode: itemCode
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in openai-content-generator:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});