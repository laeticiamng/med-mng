import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * delete-user-account (service commun EmotionsCare) refuse la suppression en
 * 409 `{ error: 'active_subscription', message }` tant qu'un abonnement Stripe
 * est prélevable (active, trialing, past_due, unpaid). La page doit afficher ce
 * message — pas un toast générique — avec un accès au portail de gestion, et
 * prévenir dès l'affichage, y compris pour un impayé.
 */
const etat = vi.hoisted(() => ({
  abonnementPrelevable: false,
  invoke: vi.fn(),
  openCustomerPortal: vi.fn(),
  toast: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@/components/layout/PremiumPageLayout', () => ({
  PremiumPageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({
    isSubscriptionActive: () => false,
    abonnementPrelevable: etat.abonnementPrelevable,
    openCustomerPortal: etat.openCustomerPortal,
  }),
}));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: etat.toast }) }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'u-1', email: 'e@x.fr', created_at: '2026-01-01' } } }),
      signOut: etat.signOut,
    },
    functions: { invoke: etat.invoke },
  },
}));

import MesDonneesRGPD from '../MesDonneesRGPD';

const MESSAGE_409 =
  "Vous avez un abonnement en cours (MED MNG). Supprimer le compte n'arrêterait pas le prélèvement. " +
  "Résiliez d'abord l'abonnement (depuis votre profil MED MNG), puis revenez supprimer votre compte. Rien n'a été supprimé.";

/** Erreur telle que supabase-js la produit (FunctionsHttpError) : corps lisible via context.json(). */
const erreurHttp = (status: number, corps: unknown) => {
  const reponse = new Response(JSON.stringify(corps), { status, headers: { 'Content-Type': 'application/json' } });
  return Object.assign(new Error('Edge Function returned a non-2xx status code'), {
    name: 'FunctionsHttpError',
    context: reponse,
  });
};

const confirmerSuppression = async () => {
  render(
    <MemoryRouter>
      <MesDonneesRGPD />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: /Demander la suppression/ }));
  fireEvent.click(screen.getByRole('button', { name: /Oui, supprimer définitivement/ }));
};

describe('Mes données RGPD — suppression du compte', () => {
  beforeEach(() => {
    etat.abonnementPrelevable = false;
    etat.invoke.mockReset();
    etat.openCustomerPortal.mockReset();
    etat.toast.mockReset();
    etat.signOut.mockReset();
  });

  it('409 abonnement prélevable : affiche le message du service et un accès au portail, sans déconnecter', async () => {
    etat.invoke.mockResolvedValue({
      data: null,
      error: erreurHttp(409, { error: 'active_subscription', message: MESSAGE_409, applications: ['medmng'] }),
    });
    await confirmerSuppression();

    const alerte = await screen.findByRole('alert', { name: /Suppression impossible/ });
    expect(alerte).toHaveTextContent(MESSAGE_409);
    expect(etat.toast).toHaveBeenCalledWith(expect.objectContaining({ description: MESSAGE_409 }));
    expect(etat.toast).not.toHaveBeenCalledWith(
      expect.objectContaining({ description: expect.stringMatching(/Réessayez dans quelques minutes, ou écrivez/) }),
    );
    expect(etat.signOut).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Gérer mon abonnement/ }));
    expect(etat.openCustomerPortal).toHaveBeenCalledTimes(1);
  });

  it('503 vérification impossible : affiche le message du service, sans portail', async () => {
    const message = "Nous n'avons pas pu vérifier l'état de votre abonnement. Rien n'a été supprimé : réessayez dans quelques minutes.";
    etat.invoke.mockResolvedValue({ data: null, error: erreurHttp(503, { error: 'subscription_check_failed', message }) });
    await confirmerSuppression();

    await waitFor(() => expect(etat.toast).toHaveBeenCalledWith(expect.objectContaining({ description: message })));
    expect(screen.queryByRole('button', { name: /Gérer mon abonnement/ })).not.toBeInTheDocument();
    expect(etat.signOut).not.toHaveBeenCalled();
  });

  it('prévient avant la suppression dès qu’un abonnement est prélevable (past_due/unpaid compris)', () => {
    etat.abonnementPrelevable = true;
    render(
      <MemoryRouter>
        <MesDonneesRGPD />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Supprimer le compte n'arrête pas le prélèvement/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Gérer mon abonnement/ }));
    expect(etat.openCustomerPortal).toHaveBeenCalledTimes(1);
  });

  it('suppression acceptée : déconnexion', async () => {
    etat.invoke.mockResolvedValue({ data: { status: 'deleted' }, error: null });
    const assign = vi.spyOn(window, 'location', 'get').mockReturnValue({ href: '' } as Location);
    await confirmerSuppression();
    await waitFor(() => expect(etat.signOut).toHaveBeenCalled());
    assign.mockRestore();
  });

  // Test en production du 09.10.2026 : ~24 s sans état visible, toast effacé par la redirection
  // immédiate, bouton de confirmation sous la ligne de flottaison.
  it('confirmation : amenée à l’écran et focus sur le bouton de confirmation', async () => {
    const scroll = vi.fn();
    const avant = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = scroll;
    try {
      render(
        <MemoryRouter>
          <MesDonneesRGPD />
        </MemoryRouter>,
      );
      fireEvent.click(screen.getByRole('button', { name: /Demander la suppression/ }));
      const confirmer = screen.getByRole('button', { name: /Oui, supprimer définitivement/ });
      await waitFor(() => expect(confirmer).toHaveFocus());
      expect(scroll).toHaveBeenCalled();
    } finally {
      Element.prototype.scrollIntoView = avant;
    }
  });

  it('pendant la suppression : état « en cours » visible et boutons désactivés', async () => {
    let terminer: (v: unknown) => void = () => {};
    etat.invoke.mockReturnValue(new Promise((r) => { terminer = r; }));
    await confirmerSuppression();
    const bouton = await screen.findByRole('button', { name: /Suppression en cours/ });
    expect(bouton).toBeDisabled();
    expect(screen.getByRole('button', { name: /Annuler/ })).toBeDisabled();
    expect(screen.getByText(/jusqu'à 30 secondes/)).toBeInTheDocument();
    terminer({ data: null, error: erreurHttp(503, { error: 'x', message: 'Rien n’a été supprimé.' }) });
    await waitFor(() => expect(screen.getByRole('button', { name: /Oui, supprimer définitivement/ })).not.toBeDisabled());
  });

  it('suppression acceptée : confirmation visible et toast avant la redirection', async () => {
    etat.invoke.mockResolvedValue({ data: { status: 'deleted' }, error: null });
    etat.signOut.mockResolvedValue({ error: null });
    const lieu = { href: '' } as Location;
    const espion = vi.spyOn(window, 'location', 'get').mockReturnValue(lieu);
    try {
      await confirmerSuppression();
      expect(await screen.findByText(/Votre compte a été supprimé/)).toBeInTheDocument();
      expect(etat.toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Compte supprimé' }));
      // Pas de redirection immédiate : le message reste lisible
      expect(lieu.href).toBe('');
      await waitFor(() => expect(lieu.href).toBe('/'), { timeout: 4000 });
    } finally {
      espion.mockRestore();
    }
  });
});
