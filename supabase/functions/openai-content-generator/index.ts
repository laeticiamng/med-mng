/**
 * 🎯 GÉNÉRATEUR DE CONTENU IA EDN PRODUCTION
 * Edge function premium pour génération de contenu médical avec OpenAI
 * ✅ Sécurité maximale
 * ✅ Performance optimisée
 * ✅ Production ready
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration sécurisée
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

if (!openAIApiKey) {
  console.error('⚠️ OPENAI_API_KEY manquante');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Modèles de prompts médicaux spécialisés
const MEDICAL_PROMPTS = {
  scene: `Tu es un expert médical français spécialisé dans la création de scénarios cliniques immersifs pour l'EDN (Épreuves Nationales Dématérialisées).

Crée une scène immersive détaillée pour cet item médical :

**Item :** {itemCode} - {title}

**Contexte médical :**
{tableauA}

**Niveau avancé :**
{tableauB}

**Instructions :**
1. Crée un scénario clinique réaliste et immersif
2. Inclus des interactions patient-médecin authentiques
3. Intègre les compétences EDN attendues
4. Utilise un langage médical précis mais accessible
5. Propose des choix cliniques pertinents

Retourne un JSON avec :
- title: titre de la scène
- setting: environnement médical (urgences, consultation, etc.)
- context: contexte clinique détaillé
- characters: personnages (médecin, patient, équipe)
- scenario: déroulement de la scène avec interactions
- learning_objectives: objectifs pédagogiques EDN
- clinical_decisions: décisions cliniques à prendre

Réponds UNIQUEMENT en JSON valide, sans markdown.`,

  quiz: `Tu es un expert EDN français spécialisé dans la création de QCM médicaux de haut niveau.

Crée un quiz EDN professionnel pour cet item :

**Item :** {itemCode} - {title}

**Connaissances Rang A :**
{tableauA}

**Connaissances Rang B :**
{tableauB}

**Instructions :**
1. Crée 5 questions QCM de niveau EDN
2. Mélange questions Rang A (fondamentales) et Rang B (approfondies)
3. Utilise le format EDN officiel
4. Inclus des explications détaillées
5. Varie les types : diagnostic, thérapeutique, physiopathologie

Format de réponse JSON :
- title: titre du quiz
- description: description pédagogique
- questions: array de 5 questions avec:
  - id: numéro
  - question: énoncé clinique
  - options: array de 5 propositions (A, B, C, D, E)
  - correct: index de la bonne réponse (0-4)
  - explanation: explication médicale détaillée
  - rang: "A" ou "B" selon le niveau
  - category: domaine médical (diagnostic, thérapeutique, etc.)

Réponds UNIQUEMENT en JSON valide.`,

  bd: `Tu es un expert en bande dessinée médicale française, spécialisé dans la création de contenus pédagogiques EDN.

Crée un story-board de BD médicale pour cet item :

**Item :** {itemCode} - {title}

**Contenu médical :**
{tableauA}

**Niveau expert :**
{tableauB}

**Instructions :**
1. Crée une BD pédagogique en 6 cases
2. Raconte une histoire médicale engageante
3. Intègre les concepts EDN de façon visuelle
4. Utilise un ton à la fois sérieux et accessible
5. Inclus du dialogue médical authentique

Format JSON :
- title: titre de la BD
- story_theme: thème narratif
- panels: array de 6 cases avec:
  - panel_number: numéro (1-6)
  - scene_description: description visuelle détaillée
  - characters: personnages présents
  - dialogue: dialogues et textes
  - medical_focus: point médical illustré
  - visual_style: style visuel (gros plan, plan large, etc.)
- learning_outcome: objectif pédagogique de la BD
- target_audience: public cible (extern, interne, etc.)

Réponds UNIQUEMENT en JSON valide.`
};

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Vérification de la méthode HTTP
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Méthode non autorisée' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérification de la clé OpenAI
    if (!openAIApiKey) {
      console.error('⚠️ Configuration incomplète - OPENAI_API_KEY manquante');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration incomplète',
          message: 'Clé OpenAI non configurée'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parsing de la requête
    const body = await req.json();
    const { type, itemCode, title, tableauA, tableauB, customPrompt } = body;

    console.log(`🎯 Génération ${type} pour item ${itemCode}`);

    // Validation des paramètres
    if (!type || !itemCode || !title) {
      return new Response(
        JSON.stringify({ 
          error: 'Paramètres manquants',
          message: 'type, itemCode et title sont requis'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sélection du prompt selon le type
    let prompt = '';
    switch (type) {
      case 'scene':
        prompt = MEDICAL_PROMPTS.scene;
        break;
      case 'quiz':
        prompt = MEDICAL_PROMPTS.quiz;
        break;
      case 'bd':
        prompt = MEDICAL_PROMPTS.bd;
        break;
      default:
        return new Response(
          JSON.stringify({ 
            error: 'Type invalide',
            message: 'Types supportés: scene, quiz, bd'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Utilisation du prompt personnalisé si fourni
    if (customPrompt) {
      prompt = customPrompt;
    }

    // Substitution des variables dans le prompt
    const finalPrompt = prompt
      .replace(/\{itemCode\}/g, itemCode)
      .replace(/\{title\}/g, title)
      .replace(/\{tableauA\}/g, JSON.stringify(tableauA) || 'Non disponible')
      .replace(/\{tableauB\}/g, JSON.stringify(tableauB) || 'Non disponible');

    console.log(`📝 Prompt généré (${finalPrompt.length} caractères)`);

    // Appel à l'API OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert médical français spécialisé en création de contenu pédagogique EDN. Tu réponds TOUJOURS en JSON valide sans markdown.'
          },
          {
            role: 'user',
            content: finalPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('❌ Erreur OpenAI:', errorText);
      throw new Error(`Erreur OpenAI: ${openAIResponse.status} - ${errorText}`);
    }

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0].message.content;

    console.log(`✅ Contenu généré (${generatedContent.length} caractères)`);

    // Validation JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('⚠️ Contenu généré invalide:', generatedContent.substring(0, 200));
      
      // Tentative de nettoyage du JSON
      const cleanedContent = generatedContent
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .trim();
      
      try {
        parsedContent = JSON.parse(cleanedContent);
        console.log('✅ JSON nettoyé avec succès');
      } catch (secondParseError) {
        return new Response(
          JSON.stringify({ 
            error: 'Format de réponse invalide',
            message: 'Le contenu généré n\'est pas un JSON valide',
            raw_content: generatedContent.substring(0, 500)
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Log de succès avec métadonnées
    console.log(`🎉 Génération réussie:`, {
      type,
      itemCode,
      contentLength: generatedContent.length,
      tokenUsed: openAIData.usage?.total_tokens || 'N/A'
    });

    // Sauvegarde dans Supabase (optionnel)
    try {
      await supabase
        .from('ai_generated_content')
        .upsert({
          identifier: `${itemCode}-${type}`,
          content_type: type,
          title: `${title} - ${type.toUpperCase()}`,
          content: parsedContent,
          last_updated: new Date().toISOString()
        });
      console.log('💾 Contenu sauvegardé dans Supabase');
    } catch (saveError) {
      console.warn('⚠️ Échec sauvegarde Supabase:', saveError);
      // Continue sans bloquer
    }

    return new Response(
      JSON.stringify({
        success: true,
        content: parsedContent,
        metadata: {
          type,
          itemCode,
          generatedAt: new Date().toISOString(),
          tokensUsed: openAIData.usage?.total_tokens
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Erreur fonction generateContent:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Erreur interne du serveur',
        message: error.message || 'Erreur inconnue',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});