import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EdnItemCard } from '@/components/edn/premium/EdnItemCard';
import { BandeauVisiteur, TableauDeBordRevision } from './TableauDeBordRevision';

vi.mock('@/hooks/useEdnItemV2Process', () => ({ useEdnItemV2Process: (i: unknown) => i }));

const base = {
  chargement: false,
  erreur: null,
  onRecharger: () => {},
  onContinuer: () => {},
};

describe('TableauDeBordRevision', () => {
  it("sans activité : « Commencer » et état vide honnête, sans chiffre", () => {
    render(
      <TableauDeBordRevision
        {...base}
        aucuneActivite
        indicateurs={[]}
        recommandation={{ code: 'IC-1', motif: 'item_essai', raison: "Item d'essai gratuit", numero: 1, titre: 'La relation médecin-malade' }}
      />
    );
    expect(screen.getByRole('button', { name: /Commencer/ })).toBeInTheDocument();
    expect(screen.getByText('Pas encore de révision')).toBeInTheDocument();
    expect(screen.getByText("Item d'essai gratuit")).toBeInTheDocument();
  });

  it('avec activité : « Continuer ma session » et indicateurs fournis', () => {
    render(
      <TableauDeBordRevision
        {...base}
        aucuneActivite={false}
        indicateurs={[{ libelle: "Révisions dues aujourd'hui", valeur: '2' }]}
        recommandation={{ code: 'IC-4', motif: 'revision_echue', raison: 'Révision prévue il y a 3 jours', numero: 4, titre: 'Qualité et sécurité des soins' }}
      />
    );
    expect(screen.getByRole('button', { name: /Continuer ma session/ })).toBeInTheDocument();
    expect(screen.getByText('Révision prévue il y a 3 jours')).toBeInTheDocument();
    expect(screen.queryByText('Pas encore de révision')).not.toBeInTheDocument();
  });

  it('bandeau visiteur : item 1 gratuit et création de compte', () => {
    render(
      <MemoryRouter>
        <BandeauVisiteur onCommencer={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText("Commencez par l'item 1 — gratuit")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Créer un compte pour suivre votre progression/ })).toBeInTheDocument();
  });
});

describe('EdnItemCard', () => {
  const item = { id: '1', item_code: 'IC-4', title: 'Qualité et sécurité des soins', competences_count_rang_a: 20, competences_count_rang_b: 32, paroles_musicales: ['x'] };
  const rendre = (props: Partial<React.ComponentProps<typeof EdnItemCard>> = {}) =>
    render(
      <TooltipProvider>
        <EdnItemCard item={item} onOpen={() => {}} onToggleFavorite={() => {}} {...props} />
      </TooltipProvider>
    );

  it('à revoir : badge, date réelle et CTA « Revoir »', () => {
    rendre({ statut: 'a_revoir', derniereRevision: 'il y a 3 jours' });
    expect(screen.getByText('À revoir')).toBeInTheDocument();
    expect(screen.getByText('Dernière révision il y a 3 jours')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Revoir l'item 4/ })).toBeInTheDocument();
    expect(screen.getByText('Rang A').parentElement?.textContent).toMatch(/Rang A 20 · Rang B 32/);
  });

  it('sans statut (visiteur) : pas de badge, CTA « Commencer », favori accessible', () => {
    rendre({ isFavorite: true });
    expect(screen.queryByText('Non commencé')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Commencer l'item 4/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retirer l'item 4 des favoris/ })).toHaveAttribute('aria-pressed', 'true');
  });
});
