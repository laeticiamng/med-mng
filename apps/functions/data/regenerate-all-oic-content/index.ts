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

    console.log('🚀 VERSION 3.0 FINALE - CORRECTION backup_oic_competences ✅');
    console.log('🚀 VERSION 3.0 FINALE - CORRECTION backup_oic_competences ✅');
    console.log('🚀 VERSION 3.0 FINALE - CORRECTION backup_oic_competences ✅');

    // Récupérer tous les items
    const { data: items, error: itemsError } = await supabase
      .from('edn_items_immersive')
      .select('id, item_code, title, subtitle');

    if (itemsError) throw itemsError;

    // Récupérer TOUTES les compétences OIC depuis la table backup (source complète)
    // IMPORTANT: Supabase limite par défaut à 1000 résultats, on doit augmenter la limite
    console.log('🔄 DÉBUT chargement compétences OIC depuis backup_oic_competences...');
    const { data: allOicCompetences, error: oicError } = await supabase
      .from('backup_oic_competences')
      .select('item_parent, rang, objectif_id, intitule, description, rubrique')
      .limit(10000); // Charger toutes les compétences

    if (oicError) {
      console.error('❌ ERREUR chargement OIC:', oicError);
      throw oicError;
    }

    console.log(`📚 CHARGÉ: ${allOicCompetences?.length || 0} compétences OIC depuis Supabase`);
    console.log(`📚 CHARGÉ: ${allOicCompetences?.length || 0} compétences OIC depuis Supabase`);
    console.log(`📚 CHARGÉ: ${allOicCompetences?.length || 0} compétences OIC depuis Supabase`);

    // Indexer TOUTES les compétences OIC valides (filtrer les fallbacks + null)
    const oicByItem = new Map();
    let acceptedCount = 0;
    let totalCount = allOicCompetences?.length || 0;
    let rejectedFallback = 0;
    let rejectedNull = 0;
    
    (allOicCompetences || []).forEach(comp => {
      // Exclure les fallbacks (objectif_id commençant par IC-)
      if (comp.objectif_id && comp.objectif_id.startsWith('IC-')) {
        rejectedFallback++;
        return;
      }
      
      // Exclure les compétences sans intitulé ou description
      if (!comp.intitule || !comp.description) {
        rejectedNull++;
        return;
      }
      
      acceptedCount++;
      const key = `${comp.item_parent}_${comp.rang}`;
      if (!oicByItem.has(key)) {
        oicByItem.set(key, []);
      }
      oicByItem.get(key).push(comp);
      
      // Log quelques exemples de mapping pour debug
      if (comp.item_parent === '025' || comp.item_parent === '288' || comp.item_parent === '283') {
        console.log(`🔑 Indexé: ${comp.item_parent}_${comp.rang} => ${comp.objectif_id}`);
      }
    });
    console.log(`✅ ACCEPTÉES: ${acceptedCount}/${totalCount} compétences OIC valides`);
    console.log(`✅ ACCEPTÉES: ${acceptedCount}/${totalCount} compétences OIC valides`);
    console.log(`✅ ACCEPTÉES: ${acceptedCount}/${totalCount} compétences OIC valides`);
    console.log(`❌ Rejetées (fallback IC-*): ${rejectedFallback}`);
    console.log(`❌ Rejetées (null): ${rejectedNull}`);
    console.log(`📋 Items uniques avec OIC: ${oicByItem.size} clés distinctes`);
    console.log(`🔍 Test IC-1: 001_A => ${oicByItem.get('001_A')?.length || 0} compétences`);
    console.log(`🔍 Test IC-2: 002_A => ${oicByItem.get('002_A')?.length || 0} compétences`);
    console.log(`🔍 Test IC-25: 025_A => ${oicByItem.get('025_A')?.length || 0} compétences`);
    console.log(`🔍 Test IC-288: 288_A => ${oicByItem.get('288_A')?.length || 0} compétences`);
    console.log(`🔍 Test IC-288: 288_B => ${oicByItem.get('288_B')?.length || 0} compétences`);

    let updatedCount = 0;
    const errors = [];

    // Traiter chaque item
    for (const item of items || []) {
      try {
        // Extraire le numéro : IC-1 -> 001, IC-66 -> 066, IC-334 -> 334
        const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
        console.log(`🔍 ${item.item_code} -> Recherche OIC avec clé: ${itemNumber}`);
        
        let oicRangA = oicByItem.get(`${itemNumber}_A`) || [];
        let oicRangB = oicByItem.get(`${itemNumber}_B`) || [];
        
        console.log(`📊 ${item.item_code}: ${oicRangA.length} compétences A, ${oicRangB.length} compétences B`);

        // SEUILS ABAISSÉS : Utiliser toutes les compétences OIC réelles disponibles, même s'il n'y en a qu'une seule
        const hasSufficientA = oicRangA.length >= 1;
        const hasSufficientB = oicRangB.length >= 1;

        if (!hasSufficientA) {
          console.log(`⚠️ ${item.item_code}: Compétences Rang A insuffisantes (${oicRangA.length})`);
        }
        
        if (!hasSufficientB) {
          console.log(`⚠️ ${item.item_code}: Compétences Rang B insuffisantes (${oicRangB.length})`);
        }

        // Générer Rang A avec vraies compétences OIC (ou fallback si insuffisant)
        const tableauRangA = {
          title: `${item.item_code} Rang A - ${item.title}`,
          subtitle: item.subtitle || "Compétences fondamentales",
          objectifs: hasSufficientA 
            ? oicRangA.slice(0, 5).map(c => c.intitule)
            : [
                `Comprendre les bases de ${item.title}`,
                `Identifier les signes cliniques principaux`,
                `Connaître la prise en charge initiale`,
                `Appliquer les recommandations de bonnes pratiques`
              ],
          competences_cles: hasSufficientA 
            ? oicRangA.map(comp => ({
                niveau: "Fondamental",
                competence: comp.intitule,
                description: comp.description,
                rubrique: comp.rubrique || "Compétence Fondamentale",
                objectif_id: comp.objectif_id || `OIC-${itemNumber}-A`
              }))
            : [
                {
                  niveau: "Fondamental",
                  competence: `Connaissances de base - ${item.title}`,
                  description: `Maîtriser les connaissances fondamentales concernant ${item.title}`,
                  rubrique: "Compétence Fondamentale",
                  objectif_id: `IC-${item.item_code}-BASE-A`
                }
              ],
          situations_cliniques: [
            `Cas clinique standard de ${item.title}`,
            "Diagnostic et prise en charge initiale",
            "Surveillance et suivi patient"
          ]
        };

        // Générer Rang B avec vraies compétences OIC (ou fallback si insuffisant)
        const tableauRangB = {
          title: `${item.item_code} Rang B - ${item.title}`,
          subtitle: item.subtitle || "Compétences avancées",
          objectifs: hasSufficientB
            ? oicRangB.slice(0, 5).map(c => c.intitule)
            : [
                `Maîtriser la prise en charge complexe de ${item.title}`,
                `Gérer les situations atypiques et complications`,
                `Coordonner une approche pluridisciplinaire`
              ],
          competences_cles: hasSufficientB
            ? oicRangB.map(comp => ({
                niveau: "Avancé",
                competence: comp.intitule,
                description: comp.description,
                rubrique: comp.rubrique || "Compétence Avancée",
                objectif_id: comp.objectif_id || `OIC-${itemNumber}-B`
              }))
            : [
                {
                  niveau: "Avancé",
                  competence: `Expertise avancée - ${item.title}`,
                  description: `Développer une expertise approfondie dans la gestion de ${item.title}`,
                  rubrique: "Compétence Avancée",
                  objectif_id: `IC-${item.item_code}-EXPERT-B`
                }
              ],
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
          competences_expertes: hasSufficientB && oicRangB.length >= 3
            ? oicRangB.slice(0, 3).map(comp => ({
                niveau: "Expert",
                expertise: comp.intitule,
                description: comp.description
              }))
            : [
                {
                  niveau: "Expert",
                  expertise: `Maîtrise experte - ${item.title}`,
                  description: `Expertise complète dans les aspects complexes de ${item.title}`
                }
              ]
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
