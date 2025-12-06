// ✅ ADMIN QUICK EDIT - API pour corrections manuelles ultra-rapides
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

interface QuickEditRequest {
  action: 'update' | 'get_changelog' | 'get_pending_corrections' | 'apply_correction';
  table_name?: string;
  record_id?: string;
  field_name?: string;
  new_value?: any;
  reason?: string;
  correction_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, table_name, record_id, field_name, new_value, reason, correction_id } = await req.json() as QuickEditRequest;

    switch (action) {
      case 'update': {
        if (!table_name || !record_id || !field_name || new_value === undefined) {
          throw new Error('Paramètres manquants pour la mise à jour');
        }

        // 1. Récupérer la valeur actuelle
        const { data: currentData, error: fetchError } = await supabase
          .from(table_name)
          .select(field_name)
          .eq('id', record_id)
          .single();

        if (fetchError) throw fetchError;

        const old_value = currentData[field_name];

        // 2. Effectuer la mise à jour
        const { error: updateError } = await supabase
          .from(table_name)
          .update({ [field_name]: new_value })
          .eq('id', record_id);

        if (updateError) throw updateError;

        // 3. Logger le changement
        const { error: logError } = await supabase.rpc('log_admin_change', {
          p_table_name: table_name,
          p_record_id: record_id,
          p_field_name: field_name,
          p_old_value: old_value,
          p_new_value: new_value,
          p_action_type: 'correction',
          p_reason: reason || 'Correction manuelle rapide'
        });

        if (logError) console.warn('Erreur logging:', logError);

        return new Response(
          JSON.stringify({
            success: true,
            message: `Champ ${field_name} mis à jour avec succès`,
            old_value,
            new_value
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_changelog': {
        const { data, error } = await supabase
          .from('admin_changelog')
          .select(`
            *,
            profiles:admin_user_id(display_name, email)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_pending_corrections': {
        const { data, error } = await supabase
          .from('pending_corrections')
          .select(`
            *,
            requester:requested_by(display_name, email),
            reviewer:reviewed_by(display_name, email)
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'apply_correction': {
        if (!correction_id) {
          throw new Error('ID de correction manquant');
        }

        // 1. Récupérer la correction
        const { data: correction, error: fetchError } = await supabase
          .from('pending_corrections')
          .select('*')
          .eq('id', correction_id)
          .single();

        if (fetchError) throw fetchError;

        // 2. Appliquer la correction
        const { error: updateError } = await supabase
          .from(correction.table_name)
          .update({ [correction.field_name]: correction.proposed_value })
          .eq('id', correction.record_id);

        if (updateError) throw updateError;

        // 3. Marquer comme appliquée
        const { error: markError } = await supabase
          .from('pending_corrections')
          .update({
            status: 'applied',
            applied_at: new Date().toISOString(),
            reviewed_by: (await supabase.auth.getUser()).data.user?.id
          })
          .eq('id', correction_id);

        if (markError) throw markError;

        // 4. Logger
        await supabase.rpc('log_admin_change', {
          p_table_name: correction.table_name,
          p_record_id: correction.record_id,
          p_field_name: correction.field_name,
          p_old_value: correction.current_value,
          p_new_value: correction.proposed_value,
          p_action_type: 'correction',
          p_reason: `Application correction en attente: ${correction.correction_reason}`
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Correction appliquée avec succès'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Action non supportée: ${action}`);
    }

  } catch (error) {
    console.error('Erreur admin quick edit:', error);
    return new Response(
      JSON.stringify({
        error: 'Erreur lors de l\'opération',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});