import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { traduireErreurAuth } from '@/lib/erreursAuth';

/**
 * Recette du 14.10.2026 : resetPassword passait par supabase.auth.resetPasswordForEmail, dont la
 * redirection était écrasée par l'URL du site du projet partagé (emotionscare.com). Il appelle
 * désormais la fonction Edge mm-password-reset ; ses refus (429 avec attente, 400, 503, autres)
 * deviennent des messages français sobres.
 */
const etat = vi.hoisted(() => ({
  invoke: vi.fn(),
  resetPasswordForEmail: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
      resetPasswordForEmail: etat.resetPasswordForEmail,
    },
    functions: { invoke: etat.invoke },
    from: vi.fn(),
  },
}));
vi.mock('@/hooks/useEmailNotifications', () => ({ useEmailNotifications: () => ({ sendWelcomeEmail: vi.fn() }) }));
vi.mock('@/config/testMode', () => ({ TEST_MODE_ENABLED: false, TEST_USER: { id: 'test' } }));

import { AuthProvider, useAuth } from '../AuthProvider';

type ReinitialiserMotDePasse = ReturnType<typeof useAuth>['resetPassword'];

async function obtenirResetPassword(): Promise<ReinitialiserMotDePasse> {
  let fonction: ReinitialiserMotDePasse | null = null;
  const Sonde = () => {
    fonction = useAuth().resetPassword;
    return null;
  };
  render(
    <AuthProvider>
      <Sonde />
    </AuthProvider>,
  );
  await waitFor(() => expect(fonction).not.toBeNull());
  return fonction as unknown as ReinitialiserMotDePasse;
}

/** Erreur telle que supabase-js la produit pour une réponse HTTP d'erreur (FunctionsHttpError). */
const erreurHttp = (status: number, corps: unknown, entetes: Record<string, string> = {}) =>
  Object.assign(new Error('Edge Function returned a non-2xx status code'), {
    name: 'FunctionsHttpError',
    context: new Response(typeof corps === 'string' ? corps : JSON.stringify(corps), {
      status,
      headers: { 'Content-Type': 'application/json', ...entetes },
    }),
  });

/** Message tel que la page de connexion l'affiche. */
const affiche = (erreur: unknown) => traduireErreurAuth(erreur);

describe('AuthProvider.resetPassword', () => {
  beforeEach(() => {
    etat.invoke.mockReset();
    etat.resetPasswordForEmail.mockReset();
  });

  it("appelle la fonction mm-password-reset avec l'adresse, jamais resetPasswordForEmail", async () => {
    etat.invoke.mockResolvedValue({ data: { ok: true }, error: null });
    const resetPassword = await obtenirResetPassword();
    expect(await resetPassword('camille@exemple.fr')).toEqual({ error: null });
    expect(etat.invoke).toHaveBeenCalledTimes(1);
    expect(etat.invoke).toHaveBeenCalledWith('mm-password-reset', { body: { email: 'camille@exemple.fr' } });
    expect(etat.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('429 : « Trop de demandes, réessayez dans … » avec l’attente du corps', async () => {
    etat.invoke.mockResolvedValue({
      data: null,
      error: erreurHttp(429, { ok: false, code: 'TROP_DE_DEMANDES', retry_after: 2400 }, { 'Retry-After': '2400' }),
    });
    const { error } = await (await obtenirResetPassword())('camille@exemple.fr');
    expect(affiche(error)).toBe('Trop de demandes, réessayez dans 40 minutes.');
  });

  it("429 : attente lue dans l'en-tête Retry-After si le corps est illisible", async () => {
    etat.invoke.mockResolvedValue({ data: null, error: erreurHttp(429, 'pas du json', { 'Retry-After': '90' }) });
    const { error } = await (await obtenirResetPassword())('camille@exemple.fr');
    expect(affiche(error)).toBe('Trop de demandes, réessayez dans 2 minutes.');
  });

  it('429 sans aucune indication : formulation générale', async () => {
    etat.invoke.mockResolvedValue({ data: null, error: erreurHttp(429, 'x') });
    const { error } = await (await obtenirResetPassword())('camille@exemple.fr');
    expect(affiche(error)).toBe('Trop de demandes, réessayez dans quelques minutes.');
  });

  it('400, 503 et autres erreurs : messages français sobres, sans détail technique', async () => {
    const resetPassword = await obtenirResetPassword();
    const cas: Array<[number, string]> = [
      [400, "Saisissez une adresse e-mail valide."],
      [503, 'Service momentanément indisponible. Réessayez dans quelques minutes.'],
      [500, "L'e-mail de réinitialisation n'a pas pu être envoyé. Réessayez dans quelques instants."],
      [404, "L'e-mail de réinitialisation n'a pas pu être envoyé. Réessayez dans quelques instants."],
    ];
    for (const [statut, message] of cas) {
      etat.invoke.mockResolvedValue({ data: null, error: erreurHttp(statut, { ok: false, error: 'detail interne SQL' }) });
      const { error } = await resetPassword('camille@exemple.fr');
      expect(affiche(error)).toBe(message);
      expect(affiche(error)).not.toMatch(/non-2xx|SQL|Edge Function/);
    }
  });

  it('réseau coupé (pas de réponse HTTP) ou exception : messages français', async () => {
    const resetPassword = await obtenirResetPassword();
    etat.invoke.mockResolvedValue({ data: null, error: Object.assign(new Error('Failed to send a request to the Edge Function'), { name: 'FunctionsFetchError' }) });
    expect(affiche((await resetPassword('camille@exemple.fr')).error)).toBe('Connexion au serveur impossible : vérifiez votre réseau et réessayez.');

    etat.invoke.mockRejectedValue(new Error('boom'));
    expect(affiche((await resetPassword('camille@exemple.fr')).error)).toBe(
      "L'e-mail de réinitialisation n'a pas pu être envoyé. Réessayez dans quelques instants.",
    );
  });
});
