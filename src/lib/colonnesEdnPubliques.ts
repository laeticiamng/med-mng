/**
 * Colonnes des tables `edn_items_complete` et `edn_items_immersive` lisibles
 * par tout le monde (clé anon ou utilisateur connecté), et colonnes réservées
 * à Med MNG Premium.
 *
 * SOURCE DE VÉRITÉ CÔTÉ FRONT, miroir exact du GRANT SELECT par colonne de la
 * migration supabase/migrations/20260925130000_mm_contenu_premium_phase2.sql
 * (le test src/lib/colonnesEdnPubliques.test.ts vérifie que les deux listes
 * restent identiques).
 *
 * Règle : aucune requête REST ou supabase-js sur ces deux tables ne demande
 * `*` ni une colonne de COLONNES_PREMIUM. Le contenu premium (paroles, quiz,
 * payload_v2, planches, récit) s'obtient uniquement par la RPC
 * `mm_contenu_immersif_item` (src/hooks/useContenuImmersifItem.ts), qui
 * applique côté serveur la règle « item d'essai ou abonné Premium ». Après la
 * phase 2, une requête qui demanderait encore une colonne premium échouerait
 * entièrement (42501) ; avant, elle exposerait le contenu à n'importe qui.
 */

/** Colonnes dont la lecture directe est retirée à anon et authenticated. */
export const COLONNES_PREMIUM = [
  'paroles_musicales',
  'paroles_rang_a',
  'paroles_rang_b',
  'paroles_rang_ab',
  'quiz_questions',
  'payload_v2',
  'bd_panels',
  'roman_story',
] as const;

export type ColonnePremium = (typeof COLONNES_PREMIUM)[number];

/**
 * `edn_items_complete` (46 colonnes en base) moins les 6 colonnes premium
 * qu'elle porte et moins `backup_data` (copie de sauvegarde, jamais lue par
 * l'application, susceptible de contenir une ligne complète).
 */
export const COLONNES_PUBLIQUES_COMPLETE = [
  'id', 'item_code', 'title', 'subtitle', 'slug', 'pitch_intro',
  'specialite', 'domaine_medical', 'niveau_complexite', 'mots_cles', 'tags_medicaux', 'status',
  'competences_count_rang_a', 'competences_count_rang_b', 'competences_count_total',
  'competences_oic_rang_a', 'competences_oic_rang_b',
  'tableau_rang_a', 'tableau_rang_b', 'scene_immersive', 'interaction_config', 'reward_messages',
  'audio_ambiance', 'visual_ambiance',
  'completeness_score', 'is_validated', 'validation_status', 'validation_date', 'validation_sources',
  'last_audit_date', 'migration_notes',
  'reviewer_1_id', 'reviewer_1_date', 'reviewer_1_notes',
  'reviewer_2_id', 'reviewer_2_date', 'reviewer_2_notes',
  'created_at', 'updated_at',
] as const;

/** `edn_items_immersive` (30 colonnes en base) moins les 8 colonnes premium. */
export const COLONNES_PUBLIQUES_IMMERSIVE = [
  'id', 'item_code', 'title', 'subtitle', 'slug', 'pitch_intro', 'specialite', 'mots_cles',
  'competences_count_rang_a', 'competences_count_rang_b', 'competences_count_total',
  'competences_oic_rang_a', 'competences_oic_rang_b',
  'tableau_rang_a', 'tableau_rang_b', 'scene_immersive', 'interaction_config', 'reward_messages',
  'audio_ambiance', 'visual_ambiance',
  'created_at', 'updated_at',
] as const;

/**
 * Listes prêtes pour `select=` (REST) ou `.select()` (supabase-js). Ce sont
 * des littéraux (et non un `join`) pour que supabase-js type le résultat ;
 * le test vérifie qu'ils correspondent aux tableaux ci-dessus.
 */
export const SELECT_PUBLIC_COMPLETE = 'id,item_code,title,subtitle,slug,pitch_intro,specialite,domaine_medical,niveau_complexite,mots_cles,tags_medicaux,status,competences_count_rang_a,competences_count_rang_b,competences_count_total,competences_oic_rang_a,competences_oic_rang_b,tableau_rang_a,tableau_rang_b,scene_immersive,interaction_config,reward_messages,audio_ambiance,visual_ambiance,completeness_score,is_validated,validation_status,validation_date,validation_sources,last_audit_date,migration_notes,reviewer_1_id,reviewer_1_date,reviewer_1_notes,reviewer_2_id,reviewer_2_date,reviewer_2_notes,created_at,updated_at' as const;

export const SELECT_PUBLIC_IMMERSIVE = 'id,item_code,title,subtitle,slug,pitch_intro,specialite,mots_cles,competences_count_rang_a,competences_count_rang_b,competences_count_total,competences_oic_rang_a,competences_oic_rang_b,tableau_rang_a,tableau_rang_b,scene_immersive,interaction_config,reward_messages,audio_ambiance,visual_ambiance,created_at,updated_at' as const;

const PREMIUM = new Set<string>(COLONNES_PREMIUM);

/** Une colonne fait-elle partie du contenu réservé à Premium ? */
export const estColonnePremium = (colonne: string): colonne is ColonnePremium => PREMIUM.has(colonne);

/**
 * Garde-fou pour une liste de colonnes construite dynamiquement : rejette
 * `*` et toute colonne premium (pour ne jamais émettre une requête qui
 * échouerait après la phase 2).
 */
export const verifierSelectionPublique = (selection: string): void => {
  const colonnes = selection.split(',').map((c) => c.trim()).filter(Boolean);
  const interdites = colonnes.filter((c) => c === '*' || PREMIUM.has(c));
  if (interdites.length > 0) {
    throw new Error(
      `Sélection interdite sur edn_items_* : ${interdites.join(', ')} (passer par la RPC mm_contenu_immersif_item)`
    );
  }
};
