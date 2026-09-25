import { corsHeaders, securityHeaders } from '../types.ts';

// Miroir de src/lib/colonnesEdnPubliques.ts (edn_items_complete sans les
// colonnes premium ni backup_data).
const COLONNES_PUBLIQUES_ITEM =
  'id,item_code,title,subtitle,slug,pitch_intro,specialite,domaine_medical,niveau_complexite,mots_cles,tags_medicaux,status,'
  + 'competences_count_rang_a,competences_count_rang_b,competences_count_total,competences_oic_rang_a,competences_oic_rang_b,'
  + 'tableau_rang_a,tableau_rang_b,scene_immersive,interaction_config,reward_messages,audio_ambiance,visual_ambiance,'
  + 'completeness_score,is_validated,validation_status,validation_date,validation_sources,last_audit_date,migration_notes,'
  + 'reviewer_1_id,reviewer_1_date,reviewer_1_notes,reviewer_2_id,reviewer_2_date,reviewer_2_notes,created_at,updated_at';

export async function handleEdn(
  req: Request,
  supabase: any,
  path: string,
  url: URL,
) {
  if (path === '/edn' && req.method === 'GET') {
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '50'));
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      // Table canonique : edn_items_complete (367 items, tableaux de rang issus du
      // référentiel OIC). edn_items_immersive est l'ancienne table, au contenu
      // pédagogique générique — elle n'est plus la source de vérité.
      .from('edn_items_complete')
      .select('item_code,title,subtitle,slug', { count: 'exact' })
      .order('item_code')
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('EDN list error:', error);
      return new Response(JSON.stringify({ error: 'edn_list_error' }), {
        status: 500,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ items: data || [], page, limit, totalCount: count || 0 }),
      { headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } },
    );
  }

  if (path.startsWith('/edn/') && req.method === 'GET') {
    const slug = path.split('/')[2];

    // Colonnes publiques seulement (jamais `*`) : le client est créé avec la
    // clé anon et le JWT de l'utilisateur, il est soumis au verrouillage par
    // colonne de la phase 2 (paroles_*, quiz_questions, payload_v2 réservés).
    const { data, error } = await supabase
      .from('edn_items_complete')
      .select(COLONNES_PUBLIQUES_ITEM)
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'edn_not_found' }), {
        status: 404,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Contenu immersif (paroles, quiz, payload_v2, planches, récit) par la RPC,
    // avec le JWT de l'appelant : item d'essai ou abonné Premium, sinon
    // `contenu_verrouille: true` et rien de plus.
    const { data: contenu, error: erreurContenu } = await supabase
      .rpc('mm_contenu_immersif_item', { p_item_code: data.item_code });
    if (erreurContenu) {
      console.error('EDN immersive content error:', erreurContenu);
    }
    const verrouille = !contenu || contenu.verrouille === true;
    const corps = verrouille
      ? { ...data, contenu_verrouille: true }
      : { ...data, ...contenu, verrouille: undefined, contenu_verrouille: false };

    return new Response(JSON.stringify(corps), {
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
    });
  }

  return null;
}

