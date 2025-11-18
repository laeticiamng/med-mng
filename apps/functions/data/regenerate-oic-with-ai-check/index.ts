import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification requise pour regenerate-oic-with-ai-check
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

    // ✅ SÉCURITÉ: Vérifier rôle ADMIN pour regenerate-oic-with-ai-check
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ regenerate-oic-with-ai-check autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('🚀 Démarrage régénération OIC avec vérification IA');

    // 1. Charger toutes les compétences OIC réelles depuis backup_oic_competences
    const { data: allOicCompetences, error: oicError } = await supabaseClient
      .from('backup_oic_competences')
      .select('objectif_id, intitule, description, item_parent, rang')
      .not('objectif_id', 'like', 'IC-%')
      .limit(10000);

    if (oicError) throw oicError;
    
    console.log(`✅ Chargé ${allOicCompetences.length} compétences OIC depuis backup_oic_competences`);

    // 2. Créer un index par item_parent et rang
    const oicByItemAndRang = new Map();
    
    for (const comp of allOicCompetences) {
      const key = `${comp.item_parent}_${comp.rang}`;
      if (!oicByItemAndRang.has(key)) {
        oicByItemAndRang.set(key, []);
      }
      oicByItemAndRang.get(key).push(comp);
    }

    console.log(`📊 Index créé avec ${oicByItemAndRang.size} groupes`);

    // 3. Charger tous les items EDN
    const { data: items, error: itemsError } = await supabaseClient
      .from('edn_items_complete')
      .select('item_code, title')
      .order('item_code');

    if (itemsError) throw itemsError;

    console.log(`📚 ${items.length} items à traiter`);

    let updated = 0;
    let skipped = 0;
    const results = [];

    // 4. Pour chaque item, assigner les compétences OIC avec filtres qualité
    for (const item of items) {
      const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
      
      // Chercher compétences Rang A avec filtres qualité
      const allCompetencesA = oicByItemAndRang.get(`${itemNumber}_A`) || [];
      const competencesA = allCompetencesA
        .filter(c => 
          c.intitule && c.intitule.length >= 10 && 
          c.description && c.description.length >= 15
        )
        .slice(0, 15); // Prendre jusqu'à 15 compétences de qualité

      // Chercher compétences Rang B avec filtres qualité
      const allCompetencesB = oicByItemAndRang.get(`${itemNumber}_B`) || [];
      const competencesB = allCompetencesB
        .filter(c => 
          c.intitule && c.intitule.length >= 10 && 
          c.description && c.description.length >= 15
        )
        .slice(0, 10); // Prendre jusqu'à 10 compétences de qualité

      if (competencesA.length === 0 && competencesB.length === 0) {
        skipped++;
        continue;
      }

      // Mettre à jour l'item
      const { error: updateError } = await supabaseClient
        .from('edn_items_complete')
        .update({
          competences_oic_rang_a: competencesA.length > 0 ? competencesA : null,
          competences_oic_rang_b: competencesB.length > 0 ? competencesB : null,
        })
        .eq('item_code', item.item_code);

      if (!updateError) {
        updated++;
        results.push({
          item_code: item.item_code,
          title: item.title,
          rang_a_count: competencesA.length,
          rang_b_count: competencesB.length
        });
        console.log(`✅ ${item.item_code}: ${competencesA.length}/${allCompetencesA.length} Rang A, ${competencesB.length}/${allCompetencesB.length} Rang B`);
      } else {
        console.error(`❌ Erreur ${item.item_code}:`, updateError);
      }
    }

    console.log(`\n📊 Résumé: ${updated} items mis à jour, ${skipped} items sans compétences`);

    // 5. Vérification et complétion IA sur TOUS les items mis à jour
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const aiChecks = [];
    let itemsEnriched = 0;

    if (LOVABLE_API_KEY && results.length > 0) {
      console.log('\n🤖 Lancement analyse IA complète sur tous les items...');
      
      for (const result of results) {
        const prompt = `Analyse de l'item EDN ${result.item_code} - ${result.title}:

Compétences OIC actuelles:
- Rang A (essentielles): ${result.rang_a_count} compétences
- Rang B (approfondissement): ${result.rang_b_count} compétences

Attendu selon programme officiel EDN:
- Rang A: 8-15 compétences minimum
- Rang B: 5-10 compétences minimum

TÂCHE:
1. Évalue si la couverture est suffisante
2. Si insuffisant, génère les compétences manquantes au format OIC

Réponds en JSON:
{
  "score": (0-100),
  "qualite": "excellent/bon/moyen/insuffisant",
  "analyse": "évaluation concise",
  "manques": ["domaine manquant 1", "domaine manquant 2"],
  "competences_a_generer": [
    {
      "rang": "A" ou "B",
      "intitule": "titre court de la compétence",
      "description": "description détaillée de la compétence"
    }
  ]
}`;

        try {
          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: 'Tu es un expert en médecine qui évalue la complétude des référentiels EDN.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.3,
            }),
          });

          const aiData = await aiResponse.json();
          const content = aiData.choices[0].message.content;
          
          // Extraire le JSON
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            aiChecks.push({
              item_code: result.item_code,
              ...analysis
            });
            
            // Si des compétences doivent être générées, les ajouter
            if (analysis.competences_a_generer && analysis.competences_a_generer.length > 0) {
              const newCompetences = analysis.competences_a_generer;
              
              // Récupérer les compétences actuelles
              const { data: currentItem } = await supabaseClient
                .from('edn_items_complete')
                .select('competences_oic_rang_a, competences_oic_rang_b')
                .eq('item_code', result.item_code)
                .single();
              
              const currentRangA = currentItem?.competences_oic_rang_a || [];
              const currentRangB = currentItem?.competences_oic_rang_b || [];
              
              // Ajouter les nouvelles compétences générées par l'IA
              const newRangA = [...currentRangA];
              const newRangB = [...currentRangB];
              
              for (const comp of newCompetences) {
                const newComp = {
                  objectif_id: `OIC-AI-${result.item_code}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  intitule: comp.intitule,
                  description: comp.description,
                  item_parent: result.item_code.replace('IC-', '').padStart(3, '0'),
                  rang: comp.rang
                };
                
                if (comp.rang === 'A') {
                  newRangA.push(newComp);
                } else {
                  newRangB.push(newComp);
                }
              }
              
              // Mettre à jour l'item avec les nouvelles compétences
              const { error: updateError } = await supabaseClient
                .from('edn_items_complete')
                .update({
                  competences_oic_rang_a: newRangA.length > 0 ? newRangA : null,
                  competences_oic_rang_b: newRangB.length > 0 ? newRangB : null,
                })
                .eq('item_code', result.item_code);
              
              if (!updateError) {
                itemsEnriched++;
                console.log(`✨ ${result.item_code}: Enrichi avec ${newCompetences.length} compétences IA - ${analysis.qualite} (${analysis.score}/100)`);
              }
            } else {
              console.log(`✅ ${result.item_code}: Complet - ${analysis.qualite} (${analysis.score}/100)`);
            }
          }
        } catch (aiError) {
          console.error(`❌ Erreur IA pour ${result.item_code}:`, aiError.message);
        }
      }
    }

    // 6. Statistiques finales
    const { data: finalStats } = await supabaseClient
      .from('edn_items_complete')
      .select('item_code')
      .not('competences_oic_rang_a', 'is', null);

    const finalCount = finalStats?.length || 0;
    const coverage = ((finalCount / items.length) * 100).toFixed(1);

    return new Response(JSON.stringify({
      success: true,
      stats: {
        total_items: items.length,
        updated: updated,
        skipped: skipped,
        items_enriched_by_ai: itemsEnriched,
        final_coverage: `${finalCount}/${items.length} (${coverage}%)`,
      },
      sample_results: results.slice(0, 10),
      ai_checks: aiChecks.slice(0, 20),
      message: `✅ Régénération terminée: ${updated} items mis à jour, ${itemsEnriched} items enrichis par IA`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
