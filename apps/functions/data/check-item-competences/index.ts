import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

import { getErrorMessage } from '../../_shared/error-utils.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXPECTED_IC1_COMPETENCES = {
  rangA: [
    'Définition de la relation médecin-malade',
    'Déterminants de la relation',
    'Corrélats cliniques',
    'Approche centrée patient',
    'Représentation de la maladie',
    'Information au patient',
    'Ajustement au stress',
    'Mécanismes de défense',
    'Empathie clinique',
    'Alliance thérapeutique',
    'Processus de changement',
    'Entretien motivationnel',
    'Communication empathique',
    'Communication adaptée',
    'Annonce mauvaise nouvelle'
  ],
  rangB: [
    'Outils de communication',
    'Techniques d\'entretien',
    'Gestion des émotions',
    'Évaluation de la relation'
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification requise pour check-item-competences
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase si nécessaire
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ check-item-competences autorisé pour user ${user.id}`);

    // Code original de la fonction
    
    const { item_code } = await req.json();
    console.log(`🔍 Vérification des compétences pour l'item: ${item_code}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY non configuré');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Récupérer l'item
    const { data: item, error: itemError } = await supabase
      .from('edn_items_complete')
      .select('*')
      .eq('item_code', item_code)
      .single();

    if (itemError) throw itemError;
    console.log(`✅ Item récupéré: ${item.title}`);

    // 2. Récupérer les compétences OIC
    const { data: competencesRangA, error: errorA } = await supabase
      .from('oic_competences')
      .select('*')
      .eq('item_parent', item_code)
      .eq('rang', 'A')
      .gte('length(definition)', 10);

    const { data: competencesRangB, error: errorB } = await supabase
      .from('oic_competences')
      .select('*')
      .eq('item_parent', item_code)
      .eq('rang', 'B')
      .gte('length(definition)', 10);

    if (errorA) throw errorA;
    if (errorB) throw errorB;

    console.log(`📊 Compétences trouvées: ${competencesRangA?.length || 0} Rang A, ${competencesRangB?.length || 0} Rang B`);

    // 3. Préparer le prompt pour Lovable AI
    const prompt = `Tu es un expert médical chargé de vérifier la complétude des compétences pour l'item ${item_code} "${item.title}".

COMPÉTENCES ATTENDUES POUR IC-1:

Rang A (15 compétences attendues):
${EXPECTED_IC1_COMPETENCES.rangA.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Rang B (4 compétences attendues):
${EXPECTED_IC1_COMPETENCES.rangB.map((c, i) => `${i + 1}. ${c}`).join('\n')}

COMPÉTENCES ACTUELLEMENT PRÉSENTES:

Rang A (${competencesRangA?.length || 0} compétences):
${competencesRangA?.map((c: any, i: number) => `${i + 1}. ${c.titre} - ${c.definition?.substring(0, 100)}...`).join('\n') || 'Aucune compétence'}

Rang B (${competencesRangB?.length || 0} compétences):
${competencesRangB?.map((c: any, i: number) => `${i + 1}. ${c.titre} - ${c.definition?.substring(0, 100)}...`).join('\n') || 'Aucune compétence'}

MISSION:
1. Vérifier si chaque compétence attendue est couverte par les compétences présentes
2. Identifier les compétences manquantes
3. Évaluer la qualité et la pertinence des compétences présentes
4. Donner un score de complétude (0-100%)
5. Fournir des recommandations précises

Format de réponse attendu:
{
  "score_completude": <nombre 0-100>,
  "rang_a": {
    "presentes": [<liste des compétences attendues qui sont couvertes>],
    "manquantes": [<liste des compétences attendues manquantes>],
    "qualite": "<excellent/bon/moyen/faible>"
  },
  "rang_b": {
    "presentes": [<liste des compétences attendues qui sont couvertes>],
    "manquantes": [<liste des compétences attendues manquantes>],
    "qualite": "<excellent/bon/moyen/faible>"
  },
  "recommandations": [<liste de recommandations précises>],
  "resume": "<résumé en 2-3 phrases>"
}`;

    // 4. Appeler Lovable AI
    console.log('🤖 Appel à Lovable AI...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert médical spécialisé dans l\'analyse de compétences OIC. Tu réponds toujours en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Erreur Lovable AI:', aiResponse.status, errorText);
      throw new Error(`Erreur Lovable AI: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('✅ Réponse AI reçue');
    
    // Parser la réponse JSON
    let analysis;
    try {
      // Extraire le JSON de la réponse (peut être entouré de ```json```)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(aiContent);
      }
    } catch (e) {
      console.error('❌ Erreur parsing JSON:', e);
      analysis = {
        score_completude: 0,
        rang_a: { presentes: [], manquantes: EXPECTED_IC1_COMPETENCES.rangA, qualite: 'faible' },
        rang_b: { presentes: [], manquantes: EXPECTED_IC1_COMPETENCES.rangB, qualite: 'faible' },
        recommandations: ['Erreur lors de l\'analyse'],
        resume: 'Impossible d\'analyser les compétences',
        raw_response: aiContent
      };
    }

    // 5. Construire le rapport final
    const report = {
      item_code,
      item_title: item.title,
      timestamp: new Date().toISOString(),
      statistiques: {
        rang_a_attendues: EXPECTED_IC1_COMPETENCES.rangA.length,
        rang_a_presentes: competencesRangA?.length || 0,
        rang_b_attendues: EXPECTED_IC1_COMPETENCES.rangB.length,
        rang_b_presentes: competencesRangB?.length || 0,
      },
      analysis,
      competences_raw: {
        rang_a: competencesRangA,
        rang_b: competencesRangB
      }
    };

    console.log(`✅ Rapport généré - Score: ${analysis.score_completude}%`);

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('❌ Erreur:', error);
    return new Response(JSON.stringify({ 
      error: getErrorMessage(error),
      details: error.toString() 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
