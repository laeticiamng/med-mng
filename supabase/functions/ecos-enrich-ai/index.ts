import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { situation_id, enrich_type } = await req.json();

    if (!situation_id) {
      return new Response(JSON.stringify({ error: 'situation_id requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🎯 Enrichissement ECOS ${situation_id} - Type: ${enrich_type || 'complet'}`);

    // Récupérer la situation depuis la base
    const { data: situation, error: fetchError } = await supabase
      .from('ecos_situations_uness')
      .select('*')
      .eq('sd_id', situation_id)
      .single();

    if (fetchError || !situation) {
      return new Response(JSON.stringify({ error: 'Situation non trouvée' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY non configurée' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Créer le prompt selon le type d'enrichissement
    let systemPrompt = '';
    let userPrompt = '';

    switch (enrich_type) {
      case 'patient_scenario':
        systemPrompt = `Tu es un expert en pédagogie médicale spécialisé dans la création de scénarios ECOS (Examens Cliniques Objectifs Structurés).
Ton rôle est de créer un profil patient détaillé et réaliste pour une situation ECOS.`;
        
        userPrompt = `Crée un profil patient détaillé pour cette situation ECOS:

**Titre:** ${situation.intitule_sd}
**Contenu:** ${situation.contenu_complet_html.replace(/<[^>]*>/g, ' ').substring(0, 1000)}

Génère un JSON structuré avec:
{
  "patient": {
    "name": "Nom complet du patient",
    "age": nombre d'années,
    "sex": "Masculin/Féminin",
    "avatar": "emoji représentatif",
    "background": "Contexte médical et social détaillé (2-3 phrases)",
    "motif_consultation": "Raison précise de la consultation",
    "histoire_maladie": "Histoire de la maladie actuelle détaillée",
    "antecedents": {
      "medicaux": ["liste des ATCD médicaux"],
      "chirurgicaux": ["liste des ATCD chirurgicaux"],
      "familiaux": ["liste des ATCD familiaux"],
      "allergies": ["liste des allergies"]
    },
    "traitements_actuels": ["liste des traitements"],
    "mode_vie": {
      "profession": "profession du patient",
      "tabac": "statut tabagique",
      "alcool": "consommation d'alcool",
      "activite_physique": "niveau d'activité"
    }
  },
  "pitch_immersif": "Phrase d'accroche immersive pour débuter le scénario (style: 'Vous êtes interne aux urgences...')"
}`;
        break;

      case 'clinical_steps':
        systemPrompt = `Tu es un expert en pédagogie médicale spécialisé dans la structuration de consultations ECOS.
Ton rôle est de décomposer la consultation en étapes structurées: interrogatoire, examen clinique, et conclusion.`;
        
        userPrompt = `Structure cette situation ECOS en 3 étapes pédagogiques:

**Titre:** ${situation.intitule_sd}
**Contenu:** ${situation.contenu_complet_html.replace(/<[^>]*>/g, ' ').substring(0, 1000)}
**Compétences:** ${situation.competences_associees?.join(', ') || 'Non spécifiées'}

Génère un JSON structuré avec:
{
  "steps": [
    {
      "title": "Je dis",
      "subtitle": "Interrogatoire dirigé",
      "icon": "MessageCircle",
      "questions": [
        "Liste de 5-8 questions pertinentes à poser au patient",
        "Chaque question doit être précise et orientée vers le diagnostic"
      ],
      "points_cles": ["Points clés à ne pas oublier dans l'interrogatoire"]
    },
    {
      "title": "Je fais",
      "subtitle": "Examen clinique",
      "icon": "HandIcon",
      "actions": [
        "Liste de 5-8 actions d'examen clinique à réaliser",
        "Dans l'ordre logique d'exécution"
      ],
      "points_cles": ["Points clés de l'examen physique"]
    },
    {
      "title": "Je conclus",
      "subtitle": "Synthèse et prise en charge",
      "icon": "FileText",
      "elements": [
        "Résumé de la situation",
        "Hypothèses diagnostiques (avec diagnostics différentiels)",
        "Examens complémentaires à prescrire",
        "Prise en charge immédiate et orientation"
      ],
      "diagnostics_differentiels": ["Liste des diagnostics à évoquer"],
      "examens_complementaires": ["Liste des examens à prescrire avec justification"]
    }
  ]
}`;
        break;

      case 'quiz':
        systemPrompt = `Tu es un expert en évaluation médicale. Crée des questions de quiz pertinentes pour tester les connaissances sur une situation ECOS.`;
        
        userPrompt = `Crée 5-7 questions de quiz (QCM) pour cette situation ECOS:

**Titre:** ${situation.intitule_sd}
**Contenu:** ${situation.contenu_complet_html.replace(/<[^>]*>/g, ' ').substring(0, 1000)}
**Compétences:** ${situation.competences_associees?.join(', ') || 'Non spécifiées'}

Génère un JSON avec:
{
  "quiz_questions": [
    {
      "question": "Question précise et claire",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct": index de la réponse correcte (0-3),
      "explanation": "Explication détaillée de la bonne réponse",
      "difficulty": "facile/moyen/difficile"
    }
  ]
}

Les questions doivent couvrir:
- Diagnostic et raisonnement clinique
- Examens complémentaires
- Prise en charge thérapeutique
- Complications possibles
- Aspects médico-légaux si pertinents`;
        break;

      default: // 'complet'
        systemPrompt = `Tu es un expert en pédagogie médicale ECOS. Crée un scénario clinique complet, immersif et pédagogique.`;
        
        userPrompt = `Crée un scénario ECOS complet pour:

**Titre:** ${situation.intitule_sd}
**Contenu:** ${situation.contenu_complet_html.replace(/<[^>]*>/g, ' ').substring(0, 1500)}
**Compétences:** ${situation.competences_associees?.join(', ') || 'Non spécifiées'}

Génère un JSON exhaustif avec TOUS les éléments:
{
  "patient": { /* profil complet */ },
  "pitch_immersif": "...",
  "steps": [ /* 3 étapes complètes */ ],
  "quiz_questions": [ /* 5-7 questions */ ],
  "competences_travaillees": ["Liste des compétences médicales travaillées"],
  "objectifs_pedagogiques": ["Objectifs d'apprentissage clairs"],
  "duree_estimee": nombre de minutes,
  "niveau_difficulte": "R1/R2/R3",
  "specialite": "Spécialité médicale principale"
}`;
    }

    console.log('📝 Appel OpenAI pour enrichissement...');

    // Appel à OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 4000,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('❌ Erreur OpenAI:', errorText);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de l\'enrichissement AI',
        details: errorText 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiData = await openaiResponse.json();
    const enrichedContent = JSON.parse(openaiData.choices[0].message.content);

    console.log('✅ Enrichissement généré avec succès');

    // Sauvegarder l'enrichissement dans la base (dans un champ JSON dédié)
    const updateField = `enriched_${enrich_type || 'complet'}`;
    const { error: updateError } = await supabase
      .from('ecos_situations_uness')
      .update({ 
        [updateField]: enrichedContent,
        updated_at: new Date().toISOString()
      })
      .eq('sd_id', situation_id);

    if (updateError) {
      console.error('⚠️ Erreur sauvegarde enrichissement:', updateError);
      // On retourne quand même le contenu enrichi
    }

    return new Response(JSON.stringify({
      success: true,
      situation_id,
      enrich_type: enrich_type || 'complet',
      enriched_content: enrichedContent,
      tokens_used: openaiData.usage?.total_tokens || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur dans ecos-enrich-ai:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erreur interne',
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
