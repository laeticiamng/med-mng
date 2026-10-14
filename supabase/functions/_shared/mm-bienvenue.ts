/**
 * Marque durable « e-mail de bienvenue déjà envoyé », stockée dans app_metadata du compte
 * (modifiable seulement avec la clé de service, jamais par l'utilisateur).
 *
 * Constat (QA du 14.10.2026) : chaque chargement de page dans la minute suivant l'inscription
 * rappelait send-welcome-email ; la clé d'idempotence Resend évitait un second e-mail, mais le
 * compteur journalier (2) était consommé et la 3e demande recevait un 429 (erreur en console).
 * Avec cette marque, les demandes suivantes reçoivent une réponse 200 « déjà envoyé » sans
 * toucher au compteur.
 *
 * Aucune dépendance Deno : testable avec vitest (src/tests/mmBienvenue.test.ts).
 */

export const CLE_BIENVENUE_ENVOYEE = 'mm_bienvenue_envoyee_le';

type Meta = Record<string, unknown> | null | undefined;

export function bienvenueDejaEnvoyee(appMetadata: Meta): boolean {
  const valeur = appMetadata?.[CLE_BIENVENUE_ENVOYEE];
  return typeof valeur === 'string' && valeur.length > 0;
}

/** Nouvel app_metadata : l'existant est conservé, seule la marque est ajoutée. */
export function avecMarqueBienvenue(appMetadata: Meta, maintenant: Date = new Date()): Record<string, unknown> {
  return { ...(appMetadata ?? {}), [CLE_BIENVENUE_ENVOYEE]: maintenant.toISOString() };
}
