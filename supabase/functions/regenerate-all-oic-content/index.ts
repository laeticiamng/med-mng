import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Régénération complète avec compétences OIC réelles');

    // Récupérer tous les items
    const { data: items, error: itemsError } = await supabase
      .from('edn_items_immersive')
      .select('id, item_code, title, subtitle');

    if (itemsError) throw itemsError;

    // Récupérer toutes les compétences OIC de qualité
    const { data: allOicCompetences } = await supabase
      .from('backup_oic_competences')
      .select('item_parent, rang, objectif_id, intitule, description, rubrique')
      .not('intitule', 'is', null)
      .not('description', 'is', null);

    console.log(`📚 ${allOicCompetences?.length || 0} compétences OIC chargées`);

    // Filtrer et indexer les compétences de qualité
    const oicByItem = new Map();
    (allOicCompetences || []).forEach(comp => {
      if (!comp.intitule || comp.intitule.length < 15) return;
      if (!comp.description || comp.description.length < 20) return;
      
      const key = `${comp.item_parent}_${comp.rang}`;
      if (!oicByItem.has(key)) {
        oicByItem.set(key, []);
      }
      oicByItem.get(key).push(comp);
    });

    let updatedCount = 0;
    const errors = [];

    // Traiter chaque item
    for (const item of items || []) {
      try {
        const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
        const oicRangA = oicByItem.get(`${itemNumber}_A`) || [];
        const oicRangB = oicByItem.get(`${itemNumber}_B`) || [];

        // Générer Rang A avec vraies compétences OIC
        const tableauRangA = {
          title: `${item.item_code} Rang A - ${item.title}`,
          subtitle: item.subtitle || "Compétences fondamentales",
          objectifs: oicRangA.slice(0, 5).map(c => c.intitule),
          competences_cles: oicRangA.map(comp => ({
            niveau: "Fondamental",
            competence: comp.intitule,
            description: comp.description,
            rubrique: comp.rubrique,
            objectif_id: comp.objectif_id
          })),
          situations_cliniques: [
            `Cas clinique standard de ${item.title}`,
            "Diagnostic et prise en charge initiale",
            "Surveillance et suivi patient"
          ]
        };

        // Générer Rang B avec vraies compétences OIC
        const tableauRangB = {
          title: `${item.item_code} Rang B - ${item.title}`,
          subtitle: item.subtitle || "Compétences avancées",
          objectifs: oicRangB.slice(0, 5).map(c => c.intitule),
          competences_cles: oicRangB.map(comp => ({
            niveau: "Avancé",
            competence: comp.intitule,
            description: comp.description,
            rubrique: comp.rubrique,
            objectif_id: comp.objectif_id
          })),
          situations_cliniques: [
            `Cas complexe multi-factoriel de ${item.title}`,
            "Complications et situations atypiques",
            "Prise en charge pluridisciplinaire"
          ],
          cas_complexes: [
            "Cas avec comorbidités multiples",
            "Situation d'urgence critique",
            "Patient polymédiqué"
          ],
          competences_expertes: oicRangB.slice(0, 3).map(comp => ({
            niveau: "Expert",
            expertise: comp.intitule,
            description: comp.description
          }))
        };

        // Mettre à jour
        const { error: updateError } = await supabase
          .from('edn_items_immersive')
          .update({
            tableau_rang_a: tableauRangA,
            tableau_rang_b: tableauRangB
          })
          .eq('id', item.id);

        if (updateError) {
          errors.push({ item_code: item.item_code, error: updateError.message });
        } else {
          updatedCount++;
          if (updatedCount % 50 === 0) {
            console.log(`✅ ${updatedCount}/${items.length} items traités`);
          }
        }
      } catch (itemError) {
        errors.push({ item_code: item.item_code, error: itemError.message });
      }
    }

    console.log(`🎉 Régénération terminée: ${updatedCount} items mis à jour`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${updatedCount} items régénérés avec compétences OIC réelles`,
        total_processed: items?.length || 0,
        updated: updatedCount,
        errors: errors
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('💥 Erreur:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
