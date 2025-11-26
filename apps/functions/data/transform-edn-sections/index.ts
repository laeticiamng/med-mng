import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../../_shared/cors.ts';

import { getErrorMessage } from '../../_shared/error-utils.ts';
/**
 * Transforme la structure tableau avec objectifs/competences_cles
 * en format sections pour tous les items EDN
 */
const transformTableauToSections = (tableauData: any, itemCode: string, title: string, rang: 'A' | 'B') => {
  if (!tableauData || typeof tableauData !== 'object') {
    return null;
  }

  // Si sections existe déjà et n'est pas vide, retourner tel quel
  if (tableauData.sections && Array.isArray(tableauData.sections) && tableauData.sections.length > 0) {
    return tableauData;
  }

  const sections = [];

  // Section 1 : Objectifs pédagogiques
  if (tableauData.objectifs && Array.isArray(tableauData.objectifs) && tableauData.objectifs.length > 0) {
    sections.push({
      title: "Objectifs pédagogiques",
      content: tableauData.objectifs.join('\n• '),
      keywords: []
    });
  }

  // Section 2 : Compétences clés
  if (tableauData.competences_cles && Array.isArray(tableauData.competences_cles) && tableauData.competences_cles.length > 0) {
    sections.push({
      title: "Compétences clés",
      content: "",
      competences: tableauData.competences_cles.map((comp: any) => ({
        competence_id: comp.niveau || comp.id || 'N/A',
        concept: comp.competence || comp.titre || comp.intitule || '',
        definition: comp.description || '',
        exemple: comp.exemple || '',
        application: comp.application || '',
        niveau: comp.niveau || '',
        intitule: comp.competence || comp.titre || comp.intitule || '',
        description: comp.description || '',
        objectif_id: comp.niveau || comp.id || 'N/A',
        rubrique: comp.rubrique || 'Compétence Clé',
        titre_complet: comp.competence || comp.titre || comp.intitule || '',
        sommaire: comp.description?.substring(0, 150) || ''
      })),
      keywords: []
    });
  }

  // Section 3 : Situations cliniques
  if (tableauData.situations_cliniques && Array.isArray(tableauData.situations_cliniques) && tableauData.situations_cliniques.length > 0) {
    sections.push({
      title: "Situations cliniques",
      content: tableauData.situations_cliniques.join('\n• '),
      keywords: []
    });
  }

  // Sections spécifiques Rang B
  if (rang === 'B') {
    if (tableauData.cas_complexes && Array.isArray(tableauData.cas_complexes) && tableauData.cas_complexes.length > 0) {
      sections.push({
        title: "Cas complexes",
        content: tableauData.cas_complexes.join('\n• '),
        keywords: []
      });
    }

    if (tableauData.competences_expertes && Array.isArray(tableauData.competences_expertes) && tableauData.competences_expertes.length > 0) {
      sections.push({
        title: "Compétences expertes",
        content: "",
        competences: tableauData.competences_expertes.map((comp: any) => ({
          competence_id: comp.niveau || 'Expert',
          concept: comp.expertise || comp.competence || '',
          definition: comp.description || '',
          niveau: comp.niveau || 'Expert',
          intitule: comp.expertise || comp.competence || '',
          description: comp.description || '',
          objectif_id: comp.niveau || 'Expert',
          rubrique: 'Expertise Avancée',
          titre_complet: comp.expertise || comp.competence || '',
          sommaire: comp.description?.substring(0, 150) || ''
        })),
        keywords: []
      });
    }
  }

  if (sections.length === 0) {
    return tableauData;
  }

  return {
    ...tableauData,
    sections: sections
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification requise pour transform-edn-sections
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

    // ✅ SÉCURITÉ: Vérifier rôle ADMIN pour transform-edn-sections
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

    console.log(`✅ transform-edn-sections autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { itemCode } = await req.json();

    // Si itemCode fourni, transformer un seul item, sinon tous
    const query = supabase
      .from('edn_items_immersive')
      .select('id, item_code, title, tableau_rang_a, tableau_rang_b');
    
    if (itemCode) {
      query.eq('item_code', itemCode);
    }

    const { data: items, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    let updatedCount = 0;
    let errors = [];

    for (const item of items || []) {
      try {
        const transformedRangA = transformTableauToSections(
          item.tableau_rang_a,
          item.item_code,
          item.title,
          'A'
        );

        const transformedRangB = transformTableauToSections(
          item.tableau_rang_b,
          item.item_code,
          item.title,
          'B'
        );

        // Mettre à jour seulement si transformation a eu lieu
        if (transformedRangA || transformedRangB) {
          const updateData: any = {};
          if (transformedRangA) updateData.tableau_rang_a = transformedRangA;
          if (transformedRangB) updateData.tableau_rang_b = transformedRangB;

          const { error: updateError } = await supabase
            .from('edn_items_immersive')
            .update(updateData)
            .eq('id', item.id);

          if (updateError) {
            errors.push({ item_code: item.item_code, error: updateError.message });
          } else {
            updatedCount++;
          }
        }
      } catch (itemError) {
        errors.push({ item_code: item.item_code, error: itemError.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${updatedCount} items transformés avec succès`,
        total_processed: items?.length || 0,
        updated: updatedCount,
        errors: errors
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
