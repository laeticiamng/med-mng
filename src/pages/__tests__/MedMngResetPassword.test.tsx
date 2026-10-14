import { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Recette du 14.10.2026 : le lien « Mot de passe oublié » menait à emotionscare.com. L'e-mail de
 * mm-password-reset pointe désormais vers /med-mng/reset-password?token_hash=…&type=recovery ; la page
 * échange le jeton (verifyOtp) puis affiche le formulaire. Lien expiré ou déjà utilisé : message
 * sobre et lien pour refaire une demande, sans détail technique.
 */
const etat = vi.hoisted(() => ({
  verifyOtp: vi.fn(),
  updatePassword: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { verifyOtp: etat.verifyOtp } },
}));
vi.mock('@/components/med-mng/AuthProvider', () => ({
  useAuth: () => ({ updatePassword: etat.updatePassword }),
}));
// src/tests/setup.ts remplace useLocation par un faux : ici le vrai routeur (fragment d'URL lu par la page).
vi.mock('react-router-dom', async () => await vi.importActual('react-router-dom'));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { MedMngResetPassword } from '../MedMngResetPassword';

let compteur = 0;
/** Jeton distinct par test : la page garde en mémoire les échanges déjà lancés (un jeton ne sert qu'une fois). */
const jeton = () => `jeton-hache-${++compteur}`;

const afficher = (adresse: string, strict = false) => {
  const page = (
    <MemoryRouter initialEntries={[adresse]}>
      <Routes>
        <Route path="/med-mng/reset-password" element={<MedMngResetPassword />} />
        <Route path="/med-mng/login" element={<p>Page de connexion</p>} />
      </Routes>
    </MemoryRouter>
  );
  return render(strict ? <StrictMode>{page}</StrictMode> : page);
};

describe('MedMngResetPassword', () => {
  beforeEach(() => {
    etat.verifyOtp.mockReset();
    etat.updatePassword.mockReset();
    etat.updatePassword.mockResolvedValue({ error: null });
  });

  it('échange le token_hash avec verifyOtp puis affiche le formulaire de nouveau mot de passe', async () => {
    const t = jeton();
    etat.verifyOtp.mockResolvedValue({ data: {}, error: null });
    afficher(`/med-mng/reset-password?token_hash=${t}&type=recovery`);

    expect(screen.getByRole('status')).toHaveTextContent('Vérification en cours');
    expect(screen.queryByLabelText('Nouveau mot de passe')).not.toBeInTheDocument();
    expect(await screen.findByLabelText('Nouveau mot de passe')).toBeInTheDocument();
    expect(etat.verifyOtp).toHaveBeenCalledTimes(1);
    expect(etat.verifyOtp).toHaveBeenCalledWith({ token_hash: t, type: 'recovery' });
  });

  it("n'échange le jeton qu'une fois, même en double montage (React.StrictMode)", async () => {
    etat.verifyOtp.mockResolvedValue({ data: {}, error: null });
    afficher(`/med-mng/reset-password?token_hash=${jeton()}&type=recovery`, true);
    expect(await screen.findByLabelText('Nouveau mot de passe')).toBeInTheDocument();
    expect(etat.verifyOtp).toHaveBeenCalledTimes(1);
  });

  it('enregistre le nouveau mot de passe après vérification, puis renvoie vers la connexion', async () => {
    etat.verifyOtp.mockResolvedValue({ data: {}, error: null });
    afficher(`/med-mng/reset-password?token_hash=${jeton()}&type=recovery`);

    fireEvent.change(await screen.findByLabelText('Nouveau mot de passe'), { target: { value: 'motdepasse-solide' } });
    fireEvent.change(screen.getByLabelText('Confirmer'), { target: { value: 'motdepasse-solide' } });
    fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour le mot de passe' }));

    await waitFor(() => expect(etat.updatePassword).toHaveBeenCalledWith('motdepasse-solide'));
    expect(await screen.findByText('Page de connexion')).toBeInTheDocument();
  });

  it('lien expiré ou déjà utilisé : message sobre, lien pour refaire une demande, aucun formulaire ni détail technique', async () => {
    etat.verifyOtp.mockResolvedValue({
      data: {},
      error: { name: 'AuthApiError', status: 403, code: 'otp_expired', message: 'Email link is invalid or has expired' },
    });
    afficher(`/med-mng/reset-password?token_hash=${jeton()}&type=recovery`);

    expect(await screen.findByRole('heading', { name: 'Lien expiré ou déjà utilisé' })).toBeInTheDocument();
    const lien = screen.getByRole('link', { name: 'Demander un nouveau lien' });
    expect(lien).toHaveAttribute('href', '/med-mng/login?mdp=oublie');
    expect(screen.queryByLabelText('Nouveau mot de passe')).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/otp_expired|AuthApiError|403|invalid or has expired/i);
  });

  it.each([
    ['AuthRetryableFetchError (réseau, statut 0)', { name: 'AuthRetryableFetchError', status: 0, message: 'Failed to fetch' }],
    ['erreur serveur 500', { name: 'AuthApiError', status: 500, message: 'Database error' }],
    ['erreur serveur 503', { name: 'AuthApiError', status: 503, message: 'unavailable' }],
    ['trop de requêtes 429', { name: 'AuthApiError', status: 429, code: 'over_request_rate_limit', message: 'Too many' }],
    ['erreur sans statut', { name: 'AuthUnknownError', message: 'Unexpected' }],
  ])('échec transitoire (%s) : « Connexion impossible pour le moment », jeton conservé dans l’adresse, rien en cache', async (_nom, erreur) => {
    const t = jeton();
    const remplacer = vi.spyOn(window.history, 'replaceState');
    etat.verifyOtp.mockResolvedValueOnce({ data: {}, error: erreur });
    afficher(`/med-mng/reset-password?token_hash=${t}&type=recovery`);

    expect(await screen.findByRole('heading', { name: 'Connexion impossible pour le moment' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Lien expiré ou déjà utilisé' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nouveau mot de passe')).not.toBeInTheDocument();
    expect(remplacer).not.toHaveBeenCalled(); // token_hash conservé dans l'adresse
    expect(document.body.textContent).not.toMatch(/Failed to fetch|Database error|AuthRetryableFetchError/);
    remplacer.mockRestore();
  });

  it('exception réseau pendant l’échange : même écran « Connexion impossible », pas de lien périmé', async () => {
    etat.verifyOtp.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    afficher(`/med-mng/reset-password?token_hash=${jeton()}&type=recovery`);
    expect(await screen.findByRole('heading', { name: 'Connexion impossible pour le moment' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Lien expiré ou déjà utilisé' })).not.toBeInTheDocument();
  });

  it('échec transitoire puis « Réessayer » réussi : le même jeton est rééchangé et le formulaire s’affiche', async () => {
    const t = jeton();
    etat.verifyOtp
      .mockResolvedValueOnce({ data: {}, error: { name: 'AuthRetryableFetchError', status: 0, message: 'Failed to fetch' } })
      .mockResolvedValueOnce({ data: {}, error: null });
    afficher(`/med-mng/reset-password?token_hash=${t}&type=recovery`);

    fireEvent.click(await screen.findByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByLabelText('Nouveau mot de passe')).toBeInTheDocument();
    expect(etat.verifyOtp).toHaveBeenCalledTimes(2);
    expect(etat.verifyOtp).toHaveBeenNthCalledWith(1, { token_hash: t, type: 'recovery' });
    expect(etat.verifyOtp).toHaveBeenNthCalledWith(2, { token_hash: t, type: 'recovery' });
  });

  it('« Réessayer » qui échoue encore de façon transitoire : on peut réessayer de nouveau ; refus définitif ensuite : lien expiré', async () => {
    etat.verifyOtp
      .mockResolvedValueOnce({ data: {}, error: { name: 'AuthRetryableFetchError', status: 0, message: 'x' } })
      .mockResolvedValueOnce({ data: {}, error: { name: 'AuthApiError', status: 500, message: 'x' } })
      .mockResolvedValueOnce({ data: {}, error: { name: 'AuthApiError', status: 403, code: 'otp_expired', message: 'x' } });
    afficher(`/med-mng/reset-password?token_hash=${jeton()}&type=recovery`);

    fireEvent.click(await screen.findByRole('button', { name: 'Réessayer' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByRole('heading', { name: 'Lien expiré ou déjà utilisé' })).toBeInTheDocument();
    expect(etat.verifyOtp).toHaveBeenCalledTimes(3);
  });

  it.each([400, 401, 403, 404, 422])('refus définitif (statut %i) : « Lien expiré ou déjà utilisé » et jeton retiré de l’adresse', async (statut) => {
    const remplacer = vi.spyOn(window.history, 'replaceState');
    etat.verifyOtp.mockResolvedValueOnce({ data: {}, error: { name: 'AuthApiError', status: statut, message: 'invalid' } });
    afficher(`/med-mng/reset-password?token_hash=${jeton()}&type=recovery`);
    expect(await screen.findByRole('heading', { name: 'Lien expiré ou déjà utilisé' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Réessayer' })).not.toBeInTheDocument();
    expect(remplacer).toHaveBeenCalled();
    remplacer.mockRestore();
  });

  it("token_hash sans type=recovery : lien invalide, aucun appel à verifyOtp", async () => {
    afficher(`/med-mng/reset-password?token_hash=${jeton()}&type=signup`);
    expect(await screen.findByRole('heading', { name: 'Lien expiré ou déjà utilisé' })).toBeInTheDocument();
    expect(etat.verifyOtp).not.toHaveBeenCalled();
  });

  it("repli (ancien parcours, session lue par supabase-js dans le fragment) : formulaire direct, sans verifyOtp", () => {
    afficher('/med-mng/reset-password#access_token=abc&type=recovery');
    expect(screen.getByLabelText('Nouveau mot de passe')).toBeInTheDocument();
    expect(etat.verifyOtp).not.toHaveBeenCalled();
  });

  it("repli : fragment d'erreur de l'ancien parcours (otp_expired) : lien invalide", () => {
    afficher('/med-mng/reset-password#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired');
    expect(screen.getByRole('heading', { name: 'Lien expiré ou déjà utilisé' })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/access_denied|otp_expired/);
  });
});
