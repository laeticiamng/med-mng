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

    // 5. Vérification IA sur les 5 premiers items mis à jour
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const aiChecks = [];

    if (LOVABLE_API_KEY && results.length > 0) {
      console.log('\n🤖 Lancement vérification IA sur échantillon...');
      
      const itemsToCheck = results.slice(0, 5);
      
      for (const result of itemsToCheck) {
        const prompt = `Analyse de l'item ${result.item_code} - ${result.title}:
        
Compétences trouvées:
- Rang A: ${result.rang_a_count} compétences
- Rang B: ${result.rang_b_count} compétences

Attendu pour un item EDN complet selon le programme officiel:
- Rang A: 8-15 compétences minimum (essentielles)
- Rang B: 5-10 compétences minimum (approfondissement)

Question: Cette couverture est-elle suffisante? Y a-t-il des manques critiques?

Réponds en JSON avec:
{
  "score": (0-100),
  "qualite": "excellent/bon/moyen/insuffisant",
  "analyse": "analyse concise",
  "recommandations": ["rec1", "rec2"]
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
            console.log(`✅ IA check ${result.item_code}: ${analysis.qualite} (${analysis.score}/100)`);
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
        final_coverage: `${finalCount}/${items.length} (${coverage}%)`,
      },
      sample_results: results.slice(0, 10),
      ai_checks: aiChecks,
      message: `✅ Régénération terminée: ${updated} items mis à jour avec vérification IA`
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
