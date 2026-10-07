/**
 * Archivage des factures Stripe de MED MNG dans `subscription_invoices`.
 *
 * ÉTAT DE LA PRODUCTION (vérifié le 07.10.2026, SELECT to_regclass) : la table
 * n'existe pas — la migration 20260210130000 n'a jamais été appliquée. Elle
 * n'est pas appliquée ici : elle crée aussi la vue `exam_rankings` (sans
 * security_invoker, elle exposerait identifiants, noms et scores de tous les
 * comptes en contournant la RLS de exam_sessions, pour un classement retiré du
 * site) et une table `clinical_case_scores` que rien n'écrit. Aucun écran ne lit
 * subscription_invoices : les factures restent consultables dans Stripe
 * (portail client mm-customer-portal), qui fait foi.
 *
 * L'archivage est donc NON BLOQUANT (le statut de l'abonnement est déjà écrit,
 * et un 500 ferait rejouer l'événement par Stripe sans fin) mais jamais
 * silencieux : table absente → avertissement explicite ; autre erreur ou
 * exception → erreur journalisée avec son code. Aucune donnée personnelle.
 */

export type ResultatArchivage = 'archivee' | 'table_absente' | 'erreur';

/** Champs de Stripe.Invoice utilisés (évite d'importer le SDK Stripe ici). */
export interface FactureArchivable {
  /** Optionnel dans les types Stripe récents (factures d'aperçu) ; toujours présent sur un événement. */
  id?: string | null;
  amount_paid?: number | null;
  amount_due?: number | null;
  currency?: string | null;
  hosted_invoice_url?: string | null;
  created?: number | null;
}

interface ClientArchivage {
  from: (table: string) => {
    upsert: (
      ligne: Record<string, unknown>,
      options: { onConflict: string },
    ) => PromiseLike<{ error: { code?: string; message?: string } | null }>;
  };
}

/** Table absente : Postgres (42P01) ou cache de schéma PostgREST (PGRST205). */
const TABLE_ABSENTE = new Set(['42P01', 'PGRST205']);

const versIso = (secondes: unknown): string | null => {
  if (typeof secondes !== 'number' || !Number.isFinite(secondes) || secondes <= 0) return null;
  const d = new Date(secondes * 1000);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export async function archiverFacture(
  supabase: ClientArchivage,
  invoice: FactureArchivable,
  subscriptionId: string,
  statut: 'paid' | 'failed',
): Promise<ResultatArchivage> {
  if (!invoice.id) {
    console.warn(`[MM-STRIPE-WEBHOOK] Facture sans identifiant (${statut}) : non archivée.`);
    return 'erreur';
  }
  try {
    const { error } = await supabase.from('subscription_invoices').upsert(
      {
        stripe_invoice_id: invoice.id,
        stripe_subscription_id: subscriptionId,
        amount: (statut === 'paid' ? invoice.amount_paid : invoice.amount_due) ?? 0,
        currency: invoice.currency ?? 'eur',
        status: statut,
        invoice_url: invoice.hosted_invoice_url ?? null,
        created_at: versIso(invoice.created) ?? new Date().toISOString(),
      },
      { onConflict: 'stripe_invoice_id' },
    );
    if (!error) {
      console.log(`[MM-STRIPE-WEBHOOK] Facture archivée : ${invoice.id} (${statut})`);
      return 'archivee';
    }
    if (error.code && TABLE_ABSENTE.has(error.code)) {
      console.warn(
        `[MM-STRIPE-WEBHOOK] Facture ${invoice.id} (${statut}) NON archivée : table subscription_invoices absente ` +
          `(migration 20260210130000 non appliquée). Non bloquant : la facture reste dans Stripe.`,
      );
      return 'table_absente';
    }
    console.error(
      `[MM-STRIPE-WEBHOOK] Facture ${invoice.id} (${statut}) NON archivée : erreur ${error.code ?? 'sans code'} — ${
        (error.message ?? '').slice(0, 200)
      }`,
    );
    return 'erreur';
  } catch (e) {
    console.error(
      `[MM-STRIPE-WEBHOOK] Facture ${invoice.id} (${statut}) NON archivée : exception ${
        e instanceof Error ? `${e.name} — ${e.message.slice(0, 200)}` : 'inconnue'
      }`,
    );
    return 'erreur';
  }
}
