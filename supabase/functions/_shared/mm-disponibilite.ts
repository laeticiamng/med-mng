/**
 * Disponibilité de la génération audio Med MNG — SOURCE UNIQUE (serveur + site).
 *
 * Historique :
 *  - 09.10.2026 (matin) : suspension CIBLÉE des nouvelles générations audio (drapeau à false).
 *  - 09.10.2026 (soir) : RÉACTIVATION sur décision explicite de l'utilisatrice (CEO) ; fournisseur
 *    technique inchangé, sunoapi.org, aucune migration prévue (docs/SOURCE_DE_VERITE.md,
 *    « Génération musicale »).
 *
 * À false, tout se referme d'un coup : mm-generate-music refuse (503 GENERATION_SUSPENDUE) avant
 * toute réservation ou appel au fournisseur, et le site, l'e-mail de bienvenue et la description
 * du produit Stripe annoncent la suspension. Après un changement : redéployer mm-generate-music,
 * mm-create-checkout, mm-stripe-webhook, mm-customer-portal et send-welcome-email, mettre à
 * jour public/llms.txt, republier le site.
 */
export const GENERATION_AUDIO_DISPONIBLE = true;

/** Message affiché seulement si le drapeau repasse à false (aucune affirmation sur les droits). */
export const MESSAGE_GENERATION_SUSPENDUE =
  "La génération audio est momentanément suspendue. Les paroles, les fiches, les quiz et vos chansons déjà créées restent disponibles.";
