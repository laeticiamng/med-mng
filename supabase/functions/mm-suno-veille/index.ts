/**
 * mm-suno-veille — veille de la surveillance du solde Suno.
 *
 * La fonction mm-suno-solde signale elle-même les pannes du fournisseur et, quand elle reprend, l'interruption
 * qui a précédé. Elle ne peut pas signaler qu'elle ne tourne plus du tout : tâche « mm-suno-solde-horaire »
 * désactivée ou supprimée, fonction en erreur au démarrage, jeton des tâches planifiées refusé. Cette veille,
 * appelée toutes les 2 h par une autre tâche pg_cron (migration 20261027170000_mm_suno_veille.sql), regarde la
 * date du dernier relevé et envoie un e-mail si aucun n'a été enregistré depuis 3 h.
 *
 * INDÉPENDANCE : elle n'utilise ni le jeton des tâches planifiées, ni le code de lecture du solde, ni la clé Suno,
 * pour ne pas tomber avec ce qu'elle surveille. Elle n'exige donc aucun jeton (verify_jwt = false) : un appel
 * extérieur ne peut rien obtenir ni déclencher de plus qu'elle-même. La réponse ne contient que l'état, sans
 * date, adresse ni clé ; un e-mail ne part que si la surveillance est réellement arrêtée, et au plus une fois par
 * RAPPEL_VEILLE_HEURES grâce à une réservation atomique en base (mm_suno_veille_reserver), quel que soit le nombre
 * d'appels.
 */
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { envoyerEmail, expediteur } from '../_shared/mm-email.ts';
import { construireEmailArret, surveillanceArretee } from '../_shared/mm-suno-solde.ts';

const EN_TETES = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

const reponse = (statut: number, corps: Record<string, unknown>) =>
  new Response(JSON.stringify(corps), { status: statut, headers: EN_TETES });

const enDate = (v: unknown): Date | null => {
  if (typeof v !== 'string') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

serve(async (req: Request) => {
  if (req.method !== 'POST') return reponse(405, { error: 'methode_non_autorisee' });

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const cleService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !cleService) return reponse(503, { error: 'configuration_incomplete' });
  const admin = createClient(url, cleService, { auth: { persistSession: false } });

  const { data: etat, error: erreurEtat } = await admin.rpc('mm_suno_veille_etat');
  if (erreurEtat || !etat || typeof etat !== 'object') {
    console.error('❌ Veille Suno : état illisible :', erreurEtat?.message ?? 'réponse vide');
    return reponse(500, { error: 'etat_illisible' });
  }

  const maintenant = new Date();
  const dernierReleve = enDate(etat.dernier_releve);
  const tacheActive = typeof etat.tache_active === 'boolean' ? etat.tache_active : null;

  if (!surveillanceArretee(dernierReleve, maintenant)) {
    // Surveillance repartie : la prochaine panne sera signalée sans attendre la fin du délai de rappel.
    if (etat.veille_alerte_at) await admin.rpc('mm_suno_veille_reserver', { p_liberer: true });
    return reponse(200, { etat: 'ok' });
  }

  console.error(`❌ Surveillance du solde Suno arrêtée (tâche ${tacheActive === null ? 'absente' : tacheActive ? 'active' : 'désactivée'}).`);

  const { data: reserve, error: erreurReserve } = await admin.rpc('mm_suno_veille_reserver', { p_liberer: false });
  if (erreurReserve) {
    console.error('❌ Veille Suno : réservation impossible :', erreurReserve.message);
    return reponse(500, { etat: 'arretee', error: 'reservation_impossible' });
  }
  if (reserve !== true) return reponse(200, { etat: 'arretee', alerte: 'deja_envoyee' });

  const { data: destinataire, error: erreurDest } = await admin.rpc('mm_suno_alerte_destinataire');
  if (erreurDest || typeof destinataire !== 'string' || !destinataire.includes('@')) {
    await admin.rpc('mm_suno_veille_reserver', { p_liberer: true });
    console.error('❌ Veille Suno : aucune adresse d’alerte dans Vault (mm_alerte_email ou devis_notify_email).');
    return reponse(500, { etat: 'arretee', alerte: 'destinataire_absent' });
  }

  const email = construireEmailArret({ dernierReleve, tacheActive, maintenant });
  const resultat = await envoyerEmail(
    { from: expediteur('Med MNG'), to: [destinataire], subject: email.sujet, html: email.html },
    { idempotence: `mm-suno-veille-${maintenant.toISOString().slice(0, 13)}` },
  );
  if (!resultat.ok) {
    // Réservation rendue : la veille suivante réessaiera.
    await admin.rpc('mm_suno_veille_reserver', { p_liberer: true });
    console.error(`❌ Veille Suno : e-mail non envoyé : ${resultat.erreur} (${resultat.status})`);
    return reponse(502, { etat: 'arretee', alerte: 'echec_envoi' });
  }
  return reponse(200, { etat: 'arretee', alerte: 'envoyee' });
});
