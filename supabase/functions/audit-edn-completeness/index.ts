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
    const { action, itemCode } = await req.json();

    if (action === 'start-audit') {
      // Lancer l'audit sur tous les items
      console.log('🚀 Starting full EDN audit...');

      // Récupérer tous les items EDN
      const { data: items, error: itemsError } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title, payload_v2')
        .order('item_code');

      if (itemsError) throw itemsError;

      console.log(`📊 Found ${items.length} items to audit`);

      // Créer les entrées d'audit en statut "pending"
      const auditEntries = items.map(item => ({
        item_code: item.item_code,
        status: 'pending'
      }));

      const { error: insertError } = await supabase
        .from('edn_items_audit')
        .insert(auditEntries);

      if (insertError) throw insertError;

      // Lancer l'analyse de chaque item (en arrière-plan)
      console.log('🔄 Triggering individual item analyses...');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Audit lancé sur ${items.length} items`,
          itemCount: items.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'analyze-item' && itemCode) {
      // Analyser un item spécifique
      console.log(`🔍 Analyzing item: ${itemCode}`);

      // Mettre à jour le statut
      await supabase
        .from('edn_items_audit')
        .update({ status: 'analyzing' })
        .eq('item_code', itemCode)
        .eq('status', 'pending');

      // Récupérer l'item
      const { data: item, error: itemError } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title, payload_v2')
        .eq('item_code', itemCode)
        .single();

      if (itemError) {
        await supabase
          .from('edn_items_audit')
          .update({ 
            status: 'failed',
            error_message: `Item not found: ${itemError.message}`
          })
          .eq('item_code', itemCode);
        throw itemError;
      }

      // Préparer le prompt pour Lovable AI
      const payload = item.payload_v2 || {};
      const competencesA = payload.competences_rang_a || [];
      const competencesB = payload.competences_rang_b || [];

      const analysisPrompt = `Tu es un expert en évaluation de complétude de contenu médical EDN.

ITEM: ${item.item_code} - ${item.title}

CONTENU COMPLET: ${JSON.stringify(payload, null, 2)}

COMPÉTENCES DÉCLARÉES:
- Rang A (${competencesA.length}): ${competencesA.map((c: any) => c.title || c.intitule || JSON.stringify(c)).join(', ')}
- Rang B (${competencesB.length}): ${competencesB.map((c: any) => c.title || c.intitule || JSON.stringify(c)).join(', ')}

ANALYSE COMPLÈTE REQUISE:
1. Identifie TOUTES les compétences attendues selon le référentiel EDN pour cet item
2. Vérifie la présence et complétude de CHAQUE compétence
3. Liste TOUTES les compétences manquantes ou incomplètes

FORMAT JSON ATTENDU (sois concis dans les titres mais exhaustif dans les listes):
{
  "completeness_score": <0-100>,
  "rang_a_complete": <true/false>,
  "rang_b_complete": <true/false>,
  "expected_competences_rang_a": ["titre1", "titre2", ...],
  "expected_competences_rang_b": ["titre1", "titre2", ...],
  "missing_rang_a": ["titre1", "titre2", ...],
  "missing_rang_b": ["titre1", "titre2", ...],
  "incomplete_rang_a": ["titre1", "titre2", ...],
  "incomplete_rang_b": ["titre1", "titre2", ...],
  "suggestions": "Liste concise des améliorations prioritaires"
}

IMPORTANT: Utilise des titres courts et concis pour les compétences, évite les descriptions longues.`;

      // Vérifier le quota IA avant l'appel
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const { data: quotaCheck } = await supabase.functions.invoke('ia-quota', {
          body: {
            action: 'check_quota',
            service_type: 'lovable_ai',
            operation_type: 'audit',
            credits_required: 2
          },
          headers: { Authorization: authHeader }
        });

        if (quotaCheck && !quotaCheck.can_proceed) {
          throw new Error('Crédits IA insuffisants. Veuillez recharger votre quota.');
        }
      }

      // Appeler Lovable AI
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      if (!lovableApiKey) throw new Error('LOVABLE_API_KEY not configured');

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
              content: 'Tu es un expert en analyse de complétude de contenu médical EDN. Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après. Utilise des titres courts et concis.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 8000,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        throw new Error(`Lovable AI error: ${errorText}`);
      }

      const aiData = await aiResponse.json();
      const aiContent = aiData.choices[0]?.message?.content || '';
      
      console.log('AI Response length:', aiContent.length);
      console.log('AI Response preview:', aiContent.substring(0, 200));

      // Parser la réponse JSON
      let analysis;
      try {
        // Nettoyer le contenu : enlever les backticks markdown et le texte avant/après
        let cleanContent = aiContent.trim();
        
        // Enlever les markdown code blocks si présents
        cleanContent = cleanContent.replace(/```json\s*/g, '');
        cleanContent = cleanContent.replace(/```\s*$/g, '');
        
        // Trouver le premier { et le dernier } pour extraire le JSON
        const firstBrace = cleanContent.indexOf('{');
        const lastBrace = cleanContent.lastIndexOf('}');
        
        if (firstBrace === -1 || lastBrace === -1) {
          throw new Error('No JSON object found in AI response');
        }
        
        const jsonStr = cleanContent.substring(firstBrace, lastBrace + 1);
        console.log('Extracted JSON length:', jsonStr.length);
        
        analysis = JSON.parse(jsonStr);
        console.log('✅ JSON parsed successfully');
        
      } catch (parseError) {
        console.error('❌ Failed to parse AI response');
        console.error('Parse error:', parseError.message);
        console.error('Full AI response:', aiContent);
        
        // Retourner une analyse par défaut en cas d'erreur
        analysis = {
          completeness_score: 0,
          rang_a_complete: false,
          rang_b_complete: false,
          expected_competences_rang_a: [],
          expected_competences_rang_b: [],
          missing_rang_a: [],
          missing_rang_b: [],
          incomplete_rang_a: [],
          incomplete_rang_b: [],
          competence_details: [],
          suggestions: `Erreur de parsing: ${parseError.message}. Contenu tronqué ou invalide.`
        };
      }

      // Sauvegarder les résultats
      const { error: updateError } = await supabase
        .from('edn_items_audit')
        .update({
          status: 'completed',
          completeness_score: analysis.completeness_score || 0,
          rang_a_complete: analysis.rang_a_complete || false,
          rang_b_complete: analysis.rang_b_complete || false,
          expected_competences_rang_a: analysis.expected_competences_rang_a || [],
          expected_competences_rang_b: analysis.expected_competences_rang_b || [],
          missing_rang_a: analysis.missing_rang_a || [],
          missing_rang_b: analysis.missing_rang_b || [],
          incomplete_rang_a: analysis.incomplete_rang_a || [],
          incomplete_rang_b: analysis.incomplete_rang_b || [],
          suggestions: analysis.suggestions || '',
          ai_analysis: analysis,
          audit_date: new Date().toISOString()
        })
        .eq('item_code', itemCode)
        .eq('status', 'analyzing');

      if (updateError) throw updateError;

      // Utiliser les crédits après succès
      if (authHeader) {
        await supabase.functions.invoke('ia-quota', {
          body: {
            action: 'use_quota',
            service_type: 'lovable_ai',
            operation_type: 'audit',
            credits_to_use: 2,
            request_details: { itemCode, action: 'analyze-item' }
          },
          headers: { Authorization: authHeader }
        });
      }

      console.log(`✅ Item ${itemCode} analyzed successfully`);

      return new Response(
        JSON.stringify({ success: true, itemCode, analysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get-status') {
      // Obtenir le statut de l'audit
      const { data: stats, error: statsError } = await supabase
        .from('edn_items_audit')
        .select('status');

      if (statsError) throw statsError;

      const statusCounts = {
        pending: stats.filter(s => s.status === 'pending').length,
        analyzing: stats.filter(s => s.status === 'analyzing').length,
        completed: stats.filter(s => s.status === 'completed').length,
        failed: stats.filter(s => s.status === 'failed').length,
        total: stats.length
      };

      return new Response(
        JSON.stringify({ success: true, stats: statusCounts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error: unknown) {
    console.error('Error in audit-edn-completeness:', error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
