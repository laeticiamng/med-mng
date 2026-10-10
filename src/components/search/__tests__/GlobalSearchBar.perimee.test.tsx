import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Test en production du 09.10.2026 (« insuffisance cardiaque » → IC-348 en tête) et revue
 * Codex #241 : la réponse d'une recherche plus ancienne, reçue après une nouvelle saisie
 * (y compris pendant le délai de 300 ms), ne doit jamais s'afficher.
 */
type Ligne = { id: string; item_code: string; title: string; slug: string; specialite: string };

const etat = vi.hoisted(() => ({
  attentes: [] as Array<{ q: string; resoudre: (lignes: unknown[]) => void }>,
}));

vi.mock('@/lib/rechercheCompetences', () => ({
  rechercherCompetences: async () => [],
  regrouperParItem: () => new Map(),
}));

vi.mock('@/integrations/supabase/client', () => {
  const requete = () => {
    let motif = '';
    const objet: Record<string, unknown> = {};
    for (const m of ['select', 'eq', 'order', 'limit', 'in']) objet[m] = () => objet;
    objet.or = (f: string) => {
      motif = f;
      return objet;
    };
    objet.filter = (_c: string, _o: string, v: string) => {
      motif = v;
      return objet;
    };
    objet.then = (ok: (v: unknown) => unknown, ko: (e: unknown) => unknown) =>
      new Promise<unknown[]>((resoudre) => etat.attentes.push({ q: motif, resoudre }))
        .then((data) => ({ data, error: null }))
        .then(ok, ko);
    return objet;
  };
  return { supabase: { from: () => requete() } };
});

import { GlobalSearchBar } from '../GlobalSearchBar';

const item = (code: string, titre: string): Ligne => ({
  id: code,
  item_code: code,
  title: titre,
  slug: code.toLowerCase(),
  specialite: '',
});

const attendre = (ms: number) => act(() => new Promise((r) => setTimeout(r, ms)));

describe('GlobalSearchBar — réponses périmées', () => {
  beforeEach(() => {
    etat.attentes = [];
  });

  it('une réponse de l’ancienne saisie arrivée pendant le délai ne s’affiche pas', async () => {
    render(
      <MemoryRouter>
        <GlobalSearchBar />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Rechercher/ }));
    const champ = await screen.findByPlaceholderText(/Numéro, titre ou discipline/);

    fireEvent.change(champ, { target: { value: 'insuffisance' } });
    await attendre(350);
    const anciennes = [...etat.attentes];
    expect(anciennes.length).toBeGreaterThan(0);

    // Nouvelle saisie, puis l'ancienne réponse arrive PENDANT le délai de 300 ms
    fireEvent.change(champ, { target: { value: 'insuffisance cardiaque' } });
    await act(async () => {
      anciennes.forEach((a) => a.resoudre([item('IC-348', 'Insuffisance rénale aiguë - Anurie')]));
    });
    await attendre(10);
    expect(screen.queryByText(/IC-348/)).not.toBeInTheDocument();

    // La recherche en cours répond : seul son résultat s'affiche
    await attendre(350);
    const nouvelles = etat.attentes.slice(anciennes.length);
    expect(nouvelles.length).toBeGreaterThan(0);
    await act(async () => {
      nouvelles.forEach((a) => a.resoudre([item('IC-234', "Insuffisance cardiaque de l'adulte")]));
    });
    expect(await screen.findByText(/IC-234/)).toBeInTheDocument();
    expect(screen.queryByText(/IC-348/)).not.toBeInTheDocument();
  });
});
