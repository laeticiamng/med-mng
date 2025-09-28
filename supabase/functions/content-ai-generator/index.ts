import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🎨 Content AI Generator called:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialiser Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authentification (admin seulement)
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { item_id, content_type, regenerate = false } = await req.json();

    if (!item_id || !content_type) {
      return new Response(JSON.stringify({ error: 'item_id et content_type requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!['comic', 'novel', 'poem'].includes(content_type)) {
      return new Response(JSON.stringify({ error: 'content_type doit être: comic, novel, ou poem' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🎨 Génération contenu IA: ${content_type} pour ${item_id}`);

    // Vérifier si le contenu existe déjà
    const { data: existingContent } = await supabase
      .from('med_mng_content_ai')
      .select('*')
      .eq('item_id', item_id)
      .single();

    if (existingContent && !regenerate) {
      console.log('📚 Contenu existant trouvé, pas de régénération');
      const fieldMap = {
        comic: 'comic_panels',
        novel: 'novel_text', 
        poem: 'poem_text'
      };
      
      return new Response(JSON.stringify({
        success: true,
        exists: true,
        content: existingContent[fieldMap[content_type]],
        generated_at: existingContent.generated_at
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Récupérer les données de l'item
    const { data: itemData, error: itemError } = await supabase
      .from('edn_items_immersive')
      .select('item_code, title, tableau_rang_a, tableau_rang_b')
      .eq('item_code', item_id)
      .single();

    if (itemError || !itemData) {
      console.error('❌ Item non trouvé:', itemError);
      return new Response(JSON.stringify({ error: 'Item non trouvé' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Marquer la génération comme en cours
    await supabase
      .from('med_mng_content_ai')
      .upsert({
        item_id: item_id,
        generation_status: 'generating'
      });

    // Créer le prompt selon le type de contenu
    let prompt = '';
    const contentSource = {
      rang_a: itemData.tableau_rang_a,
      rang_b: itemData.tableau_rang_b
    };

    switch (content_type) {
      case 'comic':
        prompt = `Crée une bande dessinée éducative sur "${itemData.title}" (${item_id}) en combinant les connaissances Rang A et Rang B.

Contenu médical:
${JSON.stringify(contentSource, null, 2)}

Instructions:
- 6-8 panneaux de BD
- Histoire cohérente et pédagogique
- Personnages médicaux (médecin, patient, etc.)
- Mélange d'humour et de rigueur scientifique
- Concepts médicaux intégrés naturellement
- Descriptions visuelles détaillées pour chaque panneau

Format JSON:
{
  "title": "Titre de la BD",
  "panels": [
    {
      "panel_number": 1,
      "visual_description": "Description détaillée de l'image",
      "dialogue": "Dialogue ou texte",
      "medical_concept": "Concept médical illustré"
    }
  ]
}`;
        break;

      case 'novel':
        prompt = `Écris un court roman médical captivant sur "${itemData.title}" (${item_id}) combinant Rang A et Rang B.

Contenu médical:
${JSON.stringify(contentSource, null, 2)}

Instructions:
- Roman de 1500-2000 mots
- Intrigue médicale réaliste
- Personnages crédibles
- Suspense et émotion
- Concepts médicaux intégrés dans l'histoire
- Fin éducative et satisfaisante

Format JSON:
{
  "title": "Titre du roman",
  "chapters": [
    {
      "chapter_number": 1,
      "title": "Titre du chapitre",
      "content": "Contenu narratif"
    }
  ],
  "medical_themes": ["thème1", "thème2"]
}`;
        break;

      case 'poem':
        prompt = `Compose un poème médical sur "${itemData.title}" (${item_id}) intégrant Rang A et Rang B.

Contenu médical:
${JSON.stringify(contentSource, null, 2)}

Instructions:
- Poème de 20-30 vers
- Style lyrique mais informatif
- Rimes et rythme agréables
- Concepts médicaux intégrés poétiquement
- Mémorisation facilitée
- Ton respectueux du contexte médical

Format JSON:
{
  "title": "Titre du poème",
  "verses": [
    {
      "verse_number": 1,
      "lines": ["ligne1", "ligne2", "ligne3", "ligne4"]
    }
  ],
  "style": "Description du style poétique"
}`;
        break;
    }

    // Générer avec OpenAI
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error('❌ OpenAI key manquante');
      await supabase
        .from('med_mng_content_ai')
        .upsert({
          item_id: item_id,
          generation_status: 'failed'
        });
      return new Response(JSON.stringify({ error: 'Configuration IA manquante' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: `Tu es un expert en médecine et en création de contenu éducatif. Crée du contenu ${content_type} pédagogique et engageant. Réponds uniquement en JSON valide.` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!openAIResponse.ok) {
      console.error('❌ Erreur OpenAI:', await openAIResponse.text());
      await supabase
        .from('med_mng_content_ai')
        .upsert({
          item_id: item_id,
          generation_status: 'failed'
        });
      return new Response(JSON.stringify({ error: 'Erreur génération IA' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const aiResult = await openAIResponse.json();
    const generatedContent = JSON.parse(aiResult.choices[0].message.content);

    // Sauvegarder selon le type
    const updateData: any = {
      item_id: item_id,
      generation_status: 'completed',
      generated_at: new Date().toISOString()
    };

    switch (content_type) {
      case 'comic':
        updateData.comic_panels = generatedContent;
        break;
      case 'novel':
        updateData.novel_text = JSON.stringify(generatedContent);
        break;
      case 'poem':
        updateData.poem_text = JSON.stringify(generatedContent);
        break;
    }

    const { data: savedContent, error: saveError } = await supabase
      .from('med_mng_content_ai')
      .upsert(updateData)
      .select()
      .single();

    if (saveError) {
      console.error('❌ Erreur sauvegarde:', saveError);
      return new Response(JSON.stringify({ error: 'Erreur sauvegarde' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Contenu ${content_type} généré avec succès pour ${item_id}`);

    return new Response(JSON.stringify({
      success: true,
      content_type: content_type,
      content: generatedContent,
      generated_at: savedContent.generated_at,
      regenerated: regenerate
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur Content AI Generator:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur interne serveur',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});