import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Session simulée : un compte connecté et deux notifications en base
// (colonne `read`, comme dans user_notifications).
const appels: Array<{ table: string; op: string; valeurs?: unknown; filtres: Array<[string, unknown]> }> = [];
let lignes: any[] = [];
let utilisateur: { id: string } | null = { id: 'u1' };

vi.mock('@/integrations/supabase/client', () => {
  const constructeur = (table: string) => {
    const appel = { table, op: 'select', valeurs: undefined as unknown, filtres: [] as Array<[string, unknown]> };
    const b: any = {
      select: () => b,
      order: () => b,
      limit: () => b,
      eq: (c: string, v: unknown) => { appel.filtres.push([c, v]); return b; },
      update: (v: unknown) => { appel.op = 'update'; appel.valeurs = v; return b; },
      delete: () => { appel.op = 'delete'; return b; },
      then: (resolve: (r: unknown) => void) => {
        appels.push(appel);
        resolve({ data: appel.op === 'select' ? lignes : null, error: null });
      },
    };
    return b;
  };
  return {
    supabase: {
      from: (t: string) => constructeur(t),
      auth: { getUser: async () => ({ data: { user: utilisateur }, error: null }) },
    },
  };
});

import { NotificationSystem } from './NotificationSystem';

beforeEach(() => {
  appels.length = 0;
  utilisateur = { id: 'u1' };
  lignes = [
    { id: 'n1', type: 'info', title: 'Révision prévue', message: 'IC-230 à revoir', created_at: new Date().toISOString(), read: false, priority: 'medium' },
    { id: 'n2', type: 'success', title: 'Badge obtenu', message: '', created_at: new Date().toISOString(), read: true, priority: 'low' },
  ];
});

describe('NotificationSystem (session simulée)', () => {
  it("lit la colonne `read` : une seule notification non lue", async () => {
    render(<NotificationSystem isOpen onClose={() => {}} />);
    expect(await screen.findByText('Révision prévue')).toBeInTheDocument();
    expect(screen.getByText('Badge obtenu')).toBeInTheDocument();
    // Badge du titre = nombre de non lues
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Lue/ })).toHaveLength(1);
  });

  it('« Tout marquer lu » et « Supprimer » sont enregistrés en base', async () => {
    render(<NotificationSystem isOpen onClose={() => {}} />);
    await screen.findByText('Révision prévue');
    fireEvent.click(screen.getByRole('button', { name: /Tout marquer lu/ }));
    await waitFor(() => expect(appels.some(a => a.op === 'update' && (a.valeurs as any)?.read === true)).toBe(true));
    fireEvent.click(screen.getAllByRole('button', { name: 'Supprimer la notification' })[0]);
    await waitFor(() => expect(appels.some(a => a.op === 'delete' && a.filtres.some(([c, v]) => c === 'id' && v === 'n1'))).toBe(true));
  });

  it('sans compte : état vide honnête', async () => {
    utilisateur = null;
    render(<NotificationSystem isOpen onClose={() => {}} />);
    expect(await screen.findByText('Connectez-vous pour consulter vos notifications.')).toBeInTheDocument();
  });

  it('plus de filtres « Succès » / « Contenus » toujours vides', async () => {
    render(<NotificationSystem isOpen onClose={() => {}} />);
    await screen.findByText('Révision prévue');
    expect(screen.queryByRole('button', { name: 'Succès' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Contenus' })).not.toBeInTheDocument();
  });
});
