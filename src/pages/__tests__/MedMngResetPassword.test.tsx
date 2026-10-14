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

  it("échec réseau pendant l'échange du jeton : même écran de lien invalide", async () => {
    etat.verifyOtp.mockRejectedValue(new TypeError('Failed to fetch'));
    afficher(`/med-mng/reset-password?token_hash=${jeton()}&type=recovery`);
    expect(await screen.findByRole('heading', { name: 'Lien expiré ou déjà utilisé' })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Failed to fetch/);
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
