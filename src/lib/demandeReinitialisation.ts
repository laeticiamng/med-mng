/**
 * Message en français pour une demande de réinitialisation du mot de passe refusée par la fonction
 * `mm-password-reset` (voir supabase/functions/mm-password-reset/handler.ts).
 *
 * supabase.functions.invoke ne lève pas sur une réponse d'erreur : `error` est une FunctionsHttpError
 * dont `context` est la `Response` (corps lisible avec .json()), ou une FunctionsFetchError (réseau)
 * sans réponse. Jamais de texte technique ni de message anglais montré à la personne.
 */
export const MESSAGE_REINITIALISATION_INDISPONIBLE =
  "L'e-mail de réinitialisation n'a pas pu être envoyé. Réessayez dans quelques instants.";

const MESSAGE_RESEAU = 'Connexion au serveur impossible : vérifiez votre réseau et réessayez.';
const MESSAGE_ADRESSE = "Saisissez une adresse e-mail valide.";
const MESSAGE_SERVICE = 'Service momentanément indisponible. Réessayez dans quelques minutes.';

/** « Trop de demandes, réessayez dans 12 minutes. » à partir d'une attente en secondes. */
export const messageTropDeDemandes = (secondes: number | null): string => {
  if (!secondes || !Number.isFinite(secondes) || secondes <= 0) return 'Trop de demandes, réessayez dans quelques minutes.';
  if (secondes < 60) return 'Trop de demandes, réessayez dans moins d’une minute.';
  const minutes = Math.ceil(secondes / 60);
  if (minutes < 60) return `Trop de demandes, réessayez dans ${minutes} ${minutes > 1 ? 'minutes' : 'minute'}.`;
  const heures = Math.ceil(minutes / 60);
  return `Trop de demandes, réessayez dans ${heures} ${heures > 1 ? 'heures' : 'heure'}.`;
};

export async function messageErreurDemandeReinitialisation(erreur: unknown): Promise<string> {
  const contexte = (erreur as { context?: unknown } | null)?.context as Response | undefined;
  if (!contexte || typeof contexte.status !== 'number') {
    // Pas de réponse HTTP : réseau coupé ou service injoignable.
    return MESSAGE_RESEAU;
  }
  if (contexte.status === 429) {
    let secondes: number | null = null;
    try {
      const corps = await contexte.clone().json();
      if (typeof corps?.retry_after === 'number') secondes = corps.retry_after;
    } catch {
      // corps absent ou illisible : l'en-tête, s'il est lisible, suffit
    }
    if (secondes === null) {
      const entete = Number(contexte.headers?.get?.('Retry-After'));
      if (Number.isFinite(entete) && entete > 0) secondes = entete;
    }
    return messageTropDeDemandes(secondes);
  }
  if (contexte.status === 400) return MESSAGE_ADRESSE;
  if (contexte.status === 503) return MESSAGE_SERVICE;
  return MESSAGE_REINITIALISATION_INDISPONIBLE;
}
