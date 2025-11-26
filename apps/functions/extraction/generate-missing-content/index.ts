import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../../_shared/cors.ts';

import { getErrorMessage } from '../../_shared/error-utils.ts';
/**
 * Génère le contenu pédagogique manquant à partir des compétences OIC
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès generate-missing-content sans authentification');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('❌ Token invalide pour generate-missing-content');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ✅ SÉCURITÉ: Vérifier rôle ADMIN
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      console.warn(`❌ Non-admin tentative generate-missing-content par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ generate-missing-content autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Démarrage génération contenu manquant...');

    // 1. Récupérer TOUS les items pour regénération complète
    const { data: items, error: itemsError } = await supabase
      .from('edn_items_immersive')
      .select('id, item_code, title, subtitle, tableau_rang_a, tableau_rang_b');

    if (itemsError) throw itemsError;

    console.log(`📊 ${items?.length || 0} items à traiter`);

    // 2. Récupérer TOUTES les compétences OIC en une seule requête
    const { data: allOicCompetences } = await supabase
      .from('backup_oic_competences')
      .select('item_parent, rang, objectif_id, intitule, description, rubrique');

    console.log(`📚 ${allOicCompetences?.length || 0} compétences OIC chargées`);

    // 3. Filtrer et indexer les compétences de qualité par item_parent et rang
    const oicByItem = new Map();
    (allOicCompetences || []).forEach(comp => {
      // Filtrer les compétences de mauvaise qualité
      if (!comp.intitule || comp.intitule.length < 25) return;
      if (!comp.description || comp.description.length < 30) return;
      
      const key = `${comp.item_parent}_${comp.rang}`;
      if (!oicByItem.has(key)) {
        oicByItem.set(key, []);
      }
      oicByItem.get(key).push(comp);
    });

    let processedCount = 0;
    let updatedCount = 0;
    const errors = [];

    // 4. Traiter chaque item
    for (const item of items || []) {
      try {
        processedCount++;
        const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
        
        const oicRangA = oicByItem.get(`${itemNumber}_A`) || [];
        const oicRangB = oicByItem.get(`${itemNumber}_B`) || [];

        console.log(`🔄 ${item.item_code}: ${oicRangA.length} compétences A, ${oicRangB.length} compétences B`);

        // Générer le contenu Rang A
        const tableauRangA = {
          title: `${item.item_code} Rang A - ${item.title}`,
          subtitle: item.subtitle || "Compétences fondamentales",
          objectifs: oicRangA.length > 0 
            ? oicRangA.slice(0, 5).map(c => c.intitule || c.description?.substring(0, 100))
            : [
                `Comprendre les concepts fondamentaux de ${item.title}`,
                `Identifier les situations cliniques de base`,
                `Appliquer les principes essentiels en pratique`
              ],
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

        // Générer le contenu Rang B
        const tableauRangB = {
          title: `${item.item_code} Rang B - ${item.title}`,
          subtitle: item.subtitle || "Compétences avancées",
          objectifs: oicRangB.length > 0
            ? oicRangB.slice(0, 5).map(c => c.intitule || c.description?.substring(0, 100))
            : [
                `Maîtriser les aspects complexes de ${item.title}`,
                `Gérer les situations cliniques difficiles`,
                `Prendre des décisions expertes en situation critique`
              ],
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
            "Cas clinique avec comorbidités multiples",
            "Situation d'urgence critique",
            "Patient polymédiqué avec interactions"
          ],
          competences_expertes: oicRangB.slice(0, 3).map(comp => ({
            niveau: "Expert",
            expertise: comp.intitule,
            description: comp.description
          }))
        };

        // Mettre à jour l'item
        const { error: updateError } = await supabase
          .from('edn_items_immersive')
          .update({
            tableau_rang_a: tableauRangA,
            tableau_rang_b: tableauRangB
          })
          .eq('id', item.id);

        if (updateError) {
          errors.push({ item_code: item.item_code, error: updateError.message });
          console.error(`❌ ${item.item_code}: ${updateError.message}`);
        } else {
          updatedCount++;
          if (updatedCount % 50 === 0) {
            console.log(`✅ ${updatedCount}/${items.length} items traités`);
          }
        }

      } catch (itemError) {
        errors.push({ item_code: item.item_code, error: itemError.message });
        console.error(`❌ ${item.item_code}: ${itemError.message}`);
      }
    }

    console.log(`🎉 Génération terminée: ${updatedCount}/${processedCount} items mis à jour`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${updatedCount} items complétés avec succès`,
        total_processed: processedCount,
        updated: updatedCount,
        errors: errors,
        details: {
          items_without_content: items?.length || 0,
          oic_competences_available: allOicCompetences?.length || 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: unknown) {
    console.error('💥 Erreur génération:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: getErrorMessage(error),
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
