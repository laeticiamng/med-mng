/**
 * Messages d'erreur d'authentification en français.
 *
 * Supabase Auth renvoie ses messages en anglais (« Invalid login credentials »,
 * « User already registered »…) et les pages de connexion, d'inscription et de
 * réinitialisation les affichaient tels quels. Les cas courants sont traduits ;
 * un message inconnu est remplacé par une formulation générique plutôt que
 * montré en anglais.
 */
const TRADUCTIONS: Array<[RegExp, string]> = [
  [/invalid login credentials|invalid credentials/i, 'Adresse e-mail ou mot de passe incorrect.'],
  [/email not confirmed/i, "Votre adresse e-mail n'a pas encore été confirmée : consultez le message reçu à l'inscription."],
  [/user already registered|already been registered|already exists/i, 'Un compte existe déjà avec cette adresse e-mail.'],
  [/password should be at least (\d+)/i, 'Le mot de passe doit contenir au moins $1 caractères.'],
  [/signup requires a valid password|weak password|password is too weak/i, 'Ce mot de passe est trop faible : choisissez-en un plus long.'],
  [/unable to validate email address|invalid format|invalid email/i, "L'adresse e-mail n'est pas valide."],
  [/for security purposes, you can only request this after (\d+) seconds/i, 'Par sécurité, patientez $1 secondes avant une nouvelle demande.'],
  [/email rate limit exceeded|rate limit|too many requests/i, 'Trop de tentatives : réessayez dans quelques minutes.'],
  [/unsupported provider|provider is not enabled/i, "La connexion avec ce service n'est pas disponible pour le moment."],
  [/signups not allowed|signup is disabled/i, "Les inscriptions sont fermées pour le moment."],
  [/user not found/i, 'Aucun compte ne correspond à cette adresse e-mail.'],
  [/new password should be different/i, "Le nouveau mot de passe doit être différent de l'ancien."],
  [/auth session missing|session.*(expired|missing)|invalid.*token|token.*(expired|invalid)|otp.*expired/i, 'Le lien a expiré ou a déjà été utilisé : demandez un nouveau lien de réinitialisation.'],
  [/network|failed to fetch|fetch failed|load failed/i, 'Connexion au serveur impossible : vérifiez votre réseau et réessayez.'],
];

const GENERIQUE = "Une erreur est survenue. Réessayez dans quelques instants.";

export const traduireErreurAuth = (erreur: unknown): string => {
  const message = typeof erreur === 'string'
    ? erreur
    : (erreur as { message?: unknown } | null)?.message;
  if (typeof message !== 'string' || !message.trim()) return GENERIQUE;
  for (const [motif, traduction] of TRADUCTIONS) {
    const m = motif.exec(message);
    if (m) return traduction.replace('$1', m[1] ?? '');
  }
  // Message déjà en français (validation locale) : conservé tel quel.
  if (/[àâçéèêëîïôûùüÿœ]/i.test(message) || /\b(le|la|les|mot de passe|adresse|veuillez)\b/i.test(message)) return message;
  return GENERIQUE;
};
