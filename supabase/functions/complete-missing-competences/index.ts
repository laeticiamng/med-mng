import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getErrorMessage } from '../_shared/error-utils.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { itemCode } = await req.json();

    if (!itemCode) {
      throw new Error('itemCode is required');
    }

    console.log(`🔄 Starting completion for item: ${itemCode}`);

    // Récupérer l'audit de l'item
    const { data: audit, error: auditError } = await supabase
      .from('edn_items_audit')
      .select('*')
      .eq('item_code', itemCode)
      .eq('status', 'completed')
      .order('audit_date', { ascending: false })
      .limit(1)
      .single();

    if (auditError || !audit) {
      throw new Error(`Audit not found for item ${itemCode}`);
    }

    const missingRangA = audit.missing_rang_a || [];
    const missingRangB = audit.missing_rang_b || [];
    const incompleteRangA = audit.incomplete_rang_a || [];
    const incompleteRangB = audit.incomplete_rang_b || [];

    const allMissingCompetences = [
      ...missingRangA.map((c: string) => ({ competence: c, rang: 'A', type: 'missing' })),
      ...missingRangB.map((c: string) => ({ competence: c, rang: 'B', type: 'missing' })),
      ...incompleteRangA.map((c: string) => ({ competence: c, rang: 'A', type: 'incomplete' })),
      ...incompleteRangB.map((c: string) => ({ competence: c, rang: 'B', type: 'incomplete' })),
    ];

    if (allMissingCompetences.length === 0) {
      console.log(`✅ Item ${itemCode} is already complete`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Item already complete',
          itemCode 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limiter à 4 compétences max par appel pour éviter les timeouts
    const MAX_COMPETENCES_PER_CALL = 4;
    const competencesToProcess = allMissingCompetences.slice(0, MAX_COMPETENCES_PER_CALL);
    const hasMore = allMissingCompetences.length > MAX_COMPETENCES_PER_CALL;

    console.log(`📋 Found ${allMissingCompetences.length} competences to complete`);
    console.log(`⚡ Processing ${competencesToProcess.length} competences in this call${hasMore ? ` (${allMissingCompetences.length - competencesToProcess.length} remaining)` : ''}`);

    // Récupérer l'item
    const { data: item, error: itemError } = await supabase
      .from('edn_items_immersive')
      .select('*')
      .eq('item_code', itemCode)
      .single();

    if (itemError || !item) {
      throw new Error(`Item ${itemCode} not found`);
    }

    // Vérifier le quota IA et ajuster le nombre de compétences à traiter
    const authHeader = req.headers.get('Authorization');
    let maxCompetencesToProcess = competencesToProcess.length;
    
    if (authHeader) {
      const { data: quotaCheck, error: quotaError } = await supabase.functions.invoke('ia-quota', {
        body: {
          action: 'check_quota',
          service_type: 'lovable_ai',
          operation_type: 'completion',
          credits_required: 1 // Juste pour obtenir le solde
        },
        headers: { Authorization: authHeader }
      });

      if (!quotaError && quotaCheck) {
        const availableCredits = quotaCheck.remaining_credits || 0;
        const maxAffordable = Math.floor(availableCredits / 3); // 3 crédits par compétence
        
        if (maxAffordable === 0) {
          throw new Error(`Crédits IA insuffisants. Vous avez ${availableCredits} crédits, il en faut au moins 3 par compétence.`);
        }
        
        if (maxAffordable < competencesToProcess.length) {
          console.log(`⚠️ Ajustement: traitement de ${maxAffordable}/${competencesToProcess.length} compétences (crédits disponibles: ${availableCredits})`);
          maxCompetencesToProcess = maxAffordable;
        }
      }
    }
    
    // Limiter le nombre de compétences à traiter selon les crédits disponibles
    competencesToProcess = competencesToProcess.slice(0, maxCompetencesToProcess);

    // Générer le contenu pour chaque compétence manquante
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) throw new Error('LOVABLE_API_KEY not configured');

    const generatedContents: any[] = [];

    for (const comp of competencesToProcess) {
      console.log(`🔍 Generating content for: ${comp.competence} (Rang ${comp.rang})`);

      const searchPrompt = `Génère un contenu médical complet et structuré pour la compétence EDN suivante:

ITEM: ${item.item_code} - ${item.title}
COMPÉTENCE: ${comp.competence}
RANG: ${comp.rang}
TYPE: ${comp.type === 'missing' ? 'Compétence totalement absente' : 'Compétence incomplète'}

RECHERCHE WEB REQUISE:
1. Recherche les informations médicales officielles et à jour sur cette compétence
2. Utilise les référentiels EDN et les sources académiques
3. Vérifie les dernières recommandations

STRUCTURE REQUISE DU CONTENU:
{
  "titre": "${comp.competence}",
  "rang": "${comp.rang}",
  "objectifs": ["objectif1", "objectif2", ...],
  "points_cles": ["point1", "point2", ...],
  "notions_essentielles": ["notion1", "notion2", ...],
  "situations_cliniques": ["situation1", "situation2", ...],
  "references": ["ref1", "ref2", ...]
}

IMPORTANT: 
- Contenu médical précis et validé
- Adapté au niveau EDN
- Références récentes et fiables
- Format JSON strict`;

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
              content: 'Tu es un expert médical spécialisé dans la création de contenu EDN. Tu as accès à internet pour rechercher les informations les plus récentes. Réponds UNIQUEMENT en JSON valide.'
            },
            {
              role: 'user',
              content: searchPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000,
        }),
      });

      if (!aiResponse.ok) {
        console.error(`❌ AI request failed for ${comp.competence}`);
        continue;
      }

      const aiData = await aiResponse.json();
      const aiContent = aiData.choices[0]?.message?.content || '';

      try {
        // Parser le JSON généré
        let cleanContent = aiContent.trim();
        cleanContent = cleanContent.replace(/```json\s*/g, '');
        cleanContent = cleanContent.replace(/```\s*$/g, '');
        const firstBrace = cleanContent.indexOf('{');
        const lastBrace = cleanContent.lastIndexOf('}');
        const jsonStr = cleanContent.substring(firstBrace, lastBrace + 1);
        const content = JSON.parse(jsonStr);

        generatedContents.push({
          competence: comp.competence,
          rang: comp.rang,
          type: comp.type,
          content: content
        });

        console.log(`✅ Content generated for: ${comp.competence}`);
      } catch (parseError) {
        console.error(`❌ Failed to parse content for ${comp.competence}:`, parseError);
      }
    }

    // Mettre à jour le payload_v2 de l'item
    const payload = item.payload_v2 || {};
    const competencesRangA = payload.competences_rang_a || [];
    const competencesRangB = payload.competences_rang_b || [];

    for (const generated of generatedContents) {
      if (generated.rang === 'A') {
        // Vérifier si la compétence existe déjà
        const existingIndex = competencesRangA.findIndex(
          (c: any) => c.title === generated.competence || c.intitule === generated.competence
        );
        
        if (existingIndex >= 0) {
          // Mettre à jour la compétence existante
          competencesRangA[existingIndex] = {
            ...competencesRangA[existingIndex],
            ...generated.content,
            completed_by_ai: true,
            completion_date: new Date().toISOString()
          };
        } else {
          // Ajouter la nouvelle compétence
          competencesRangA.push({
            ...generated.content,
            completed_by_ai: true,
            completion_date: new Date().toISOString()
          });
        }
      } else {
        const existingIndex = competencesRangB.findIndex(
          (c: any) => c.title === generated.competence || c.intitule === generated.competence
        );
        
        if (existingIndex >= 0) {
          competencesRangB[existingIndex] = {
            ...competencesRangB[existingIndex],
            ...generated.content,
            completed_by_ai: true,
            completion_date: new Date().toISOString()
          };
        } else {
          competencesRangB.push({
            ...generated.content,
            completed_by_ai: true,
            completion_date: new Date().toISOString()
          });
        }
      }
    }

    payload.competences_rang_a = competencesRangA;
    payload.competences_rang_b = competencesRangB;
    payload.last_ai_completion = new Date().toISOString();

    // Sauvegarder les changements
    const { error: updateError } = await supabase
      .from('edn_items_immersive')
      .update({ 
        payload_v2: payload,
        updated_at: new Date().toISOString()
      })
      .eq('item_code', itemCode);

    if (updateError) {
      throw updateError;
    }

    // Utiliser les crédits après succès
    if (authHeader && generatedContents.length > 0) {
      await supabase.functions.invoke('ia-quota', {
        body: {
          action: 'use_quota',
          service_type: 'lovable_ai',
          operation_type: 'completion',
          credits_to_use: generatedContents.length * 3,
          request_details: { itemCode, completedCount: generatedContents.length }
        },
        headers: { Authorization: authHeader }
      });
    }

    console.log(`✅ Item ${itemCode} completed with ${generatedContents.length} new competences`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        itemCode,
        completedCompetences: generatedContents.length,
        totalMissing: allMissingCompetences.length,
        hasMore: hasMore,
        remaining: hasMore ? allMissingCompetences.length - competencesToProcess.length : 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in complete-missing-competences:', error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
