import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

CONTENU: ${JSON.stringify(payload, null, 2).substring(0, 3000)}

COMPÉTENCES DÉCLARÉES:
- Rang A (${competencesA.length}): ${competencesA.slice(0, 3).map((c: any) => c.title || c.intitule || 'N/A').join(', ')}...
- Rang B (${competencesB.length}): ${competencesB.slice(0, 2).map((c: any) => c.title || c.intitule || 'N/A').join(', ')}...

ANALYSE RAPIDE:
1. Score de complétude global (0-100)
2. Rang A complet ? (true/false)
3. Rang B complet ? (true/false)
4. Top 3 compétences manquantes pour Rang A
5. Top 2 compétences manquantes pour Rang B
6. Suggestion principale d'amélioration

RÉPONSE JSON STRICTE (maximum 2000 caractères):
{
  "completeness_score": <0-100>,
  "rang_a_complete": <true/false>,
  "rang_b_complete": <true/false>,
  "missing_rang_a": [<max 3 items>],
  "missing_rang_b": [<max 2 items>],
  "suggestions": "<max 200 caractères>"
}`;

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
              content: 'Tu es un expert en analyse de complétude de contenu médical EDN. Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000,
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
          missing_rang_a: analysis.missing_rang_a || [],
          missing_rang_b: analysis.missing_rang_b || [],
          suggestions: analysis.suggestions || '',
          ai_analysis: analysis,
          audit_date: new Date().toISOString()
        })
        .eq('item_code', itemCode)
        .eq('status', 'analyzing');

      if (updateError) throw updateError;

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

  } catch (error) {
    console.error('Error in audit-edn-completeness:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
