import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 VERSION 4.0 - CHARGEMENT COMPLET OIC');

    // Récupérer tous les items
    const { data: items, error: itemsError } = await supabase
      .from('edn_items_immersive')
      .select('id, item_code, title, subtitle');

    if (itemsError) throw itemsError;
    console.log(`📦 ${items?.length || 0} items EDN chargés`);

    // Charger TOUTES les compétences OIC en plusieurs batches pour éviter les limites
    console.log('🔄 Chargement des compétences OIC...');
    
    // Récupérer le total
    const { count: totalCount } = await supabase
      .from('backup_oic_competences')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Total compétences en base: ${totalCount}`);
    
    // Charger toutes les données avec pagination
    let allOicCompetences: any[] = [];
    let offset = 0;
    const pageSize = 1000;
    
    while (offset < (totalCount || 0)) {
      const { data: batch, error: batchError } = await supabase
        .from('backup_oic_competences')
        .select('item_parent, rang, objectif_id, intitule, description, rubrique')
        .range(offset, offset + pageSize - 1);
      
      if (batchError) {
        console.error(`❌ Erreur batch ${offset}:`, batchError);
        throw batchError;
      }
      
      allOicCompetences = allOicCompetences.concat(batch || []);
      offset += pageSize;
      console.log(`📥 Chargé ${allOicCompetences.length}/${totalCount} compétences`);
    }

    console.log(`✅ TOTAL CHARGÉ: ${allOicCompetences.length} compétences`);

    // Indexer par item_parent + rang
    const oicByItem = new Map<string, any[]>();
    let acceptedCount = 0;
    let rejectedFallback = 0;
    let rejectedNoIntitule = 0;
    
    for (const comp of allOicCompetences) {
      // Exclure les fallbacks (objectif_id commençant par IC-)
      if (comp.objectif_id && comp.objectif_id.startsWith('IC-')) {
        rejectedFallback++;
        continue;
      }
      
      // Exiger un intitulé
      if (!comp.intitule) {
        rejectedNoIntitule++;
        continue;
      }
      
      acceptedCount++;
      const key = `${comp.item_parent}_${comp.rang}`;
      if (!oicByItem.has(key)) {
        oicByItem.set(key, []);
      }
      oicByItem.get(key)!.push(comp);
    }
    
    console.log(`✅ ACCEPTÉES: ${acceptedCount}`);
    console.log(`❌ Rejetées (fallback): ${rejectedFallback}`);
    console.log(`❌ Rejetées (no intitulé): ${rejectedNoIntitule}`);
    console.log(`📋 Clés uniques: ${oicByItem.size}`);
    
    // Tests de vérification
    const testKeys = ['001_A', '002_A', '003_A', '025_A', '288_A'];
    for (const key of testKeys) {
      console.log(`🔍 ${key} => ${oicByItem.get(key)?.length || 0} compétences`);
    }

    let updatedCount = 0;
    let itemsWithRealA = 0;
    let itemsWithRealB = 0;
    const errors: any[] = [];

    for (const item of items || []) {
      try {
        // Extraire le numéro : IC-1 -> 001
        const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
        
        const oicRangA = oicByItem.get(`${itemNumber}_A`) || [];
        const oicRangB = oicByItem.get(`${itemNumber}_B`) || [];
        
        const hasSufficientA = oicRangA.length >= 1;
        const hasSufficientB = oicRangB.length >= 1;

        if (hasSufficientA) itemsWithRealA++;
        if (hasSufficientB) itemsWithRealB++;

        // Générer Rang A
        const tableauRangA = {
          title: `${item.item_code} Rang A - ${item.title}`,
          subtitle: item.subtitle || "Compétences fondamentales",
          objectifs: hasSufficientA 
            ? oicRangA.slice(0, 5).map((c: any) => c.intitule)
            : [`Comprendre les bases de ${item.title}`],
          competences_cles: hasSufficientA 
            ? oicRangA.map((comp: any) => ({
                niveau: "Fondamental",
                competence: comp.intitule,
                description: comp.description || `Compétence pour ${item.title}`,
                rubrique: comp.rubrique || "Compétence Fondamentale",
                objectif_id: comp.objectif_id
              }))
            : [{
                niveau: "Fondamental",
                competence: `Connaissances de base - ${item.title}`,
                description: `Maîtriser les connaissances fondamentales concernant ${item.title}`,
                rubrique: "Compétence Fondamentale",
                objectif_id: `FALLBACK-${itemNumber}-A`
              }],
          situations_cliniques: [
            `Cas clinique standard de ${item.title}`,
            "Diagnostic et prise en charge initiale"
          ]
        };

        // Générer Rang B
        const tableauRangB = {
          title: `${item.item_code} Rang B - ${item.title}`,
          subtitle: item.subtitle || "Compétences avancées",
          objectifs: hasSufficientB
            ? oicRangB.slice(0, 5).map((c: any) => c.intitule)
            : [`Maîtriser la prise en charge complexe de ${item.title}`],
          competences_cles: hasSufficientB
            ? oicRangB.map((comp: any) => ({
                niveau: "Avancé",
                competence: comp.intitule,
                description: comp.description || `Compétence avancée pour ${item.title}`,
                rubrique: comp.rubrique || "Compétence Avancée",
                objectif_id: comp.objectif_id
              }))
            : [{
                niveau: "Avancé",
                competence: `Expertise avancée - ${item.title}`,
                description: `Expertise approfondie dans la gestion de ${item.title}`,
                rubrique: "Compétence Avancée",
                objectif_id: `FALLBACK-${itemNumber}-B`
              }],
          situations_cliniques: [
            `Cas complexe de ${item.title}`,
            "Complications et situations atypiques"
          ]
        };

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
        }
      } catch (itemError: any) {
        errors.push({ item_code: item.item_code, error: itemError.message });
      }
    }

    console.log(`🎉 TERMINÉ: ${updatedCount} items mis à jour`);
    console.log(`📊 Items avec OIC Rang A: ${itemsWithRealA}`);
    console.log(`📊 Items avec OIC Rang B: ${itemsWithRealB}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${updatedCount} items régénérés`,
        total_processed: items?.length || 0,
        updated: updatedCount,
        items_with_real_a: itemsWithRealA,
        items_with_real_b: itemsWithRealB,
        total_oic_loaded: allOicCompetences.length,
        accepted_oic: acceptedCount,
        errors: errors.slice(0, 10)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
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