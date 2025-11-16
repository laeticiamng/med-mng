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

    console.log('🔄 Synchronisation edn_items_immersive → edn_items_complete');

    // Récupérer tous les items de edn_items_immersive
    const { data: sourceItems, error: sourceError } = await supabase
      .from('edn_items_immersive')
      .select('*');

    if (sourceError) throw sourceError;

    console.log(`📚 ${sourceItems.length} items à synchroniser`);

    let syncedCount = 0;
    const errors = [];

    for (const sourceItem of sourceItems) {
      try {
        // Vérifier si l'item existe dans edn_items_complete
        const { data: existingItem } = await supabase
          .from('edn_items_complete')
          .select('id, item_code')
          .eq('item_code', sourceItem.item_code)
          .maybeSingle();

        if (existingItem) {
          // Mettre à jour l'item existant avec les données OIC
          const { error: updateError } = await supabase
            .from('edn_items_complete')
            .update({
              tableau_rang_a: sourceItem.tableau_rang_a,
              tableau_rang_b: sourceItem.tableau_rang_b,
              competences_oic_rang_a: sourceItem.competences_oic_rang_a,
              competences_oic_rang_b: sourceItem.competences_oic_rang_b,
              competences_count_rang_a: sourceItem.competences_count_rang_a || 0,
              competences_count_rang_b: sourceItem.competences_count_rang_b || 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingItem.id);

          if (updateError) {
            errors.push({ item_code: sourceItem.item_code, error: updateError.message });
          } else {
            syncedCount++;
          }
        } else {
          console.log(`⚠️ Item ${sourceItem.item_code} non trouvé dans edn_items_complete`);
        }

        if (syncedCount % 50 === 0) {
          console.log(`✅ ${syncedCount} items synchronisés`);
        }
      } catch (itemError) {
        errors.push({ item_code: sourceItem.item_code, error: itemError.message });
      }
    }

    console.log(`🎉 Synchronisation terminée: ${syncedCount} items mis à jour`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${syncedCount} items synchronisés`,
        total_processed: sourceItems.length,
        synced: syncedCount,
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
