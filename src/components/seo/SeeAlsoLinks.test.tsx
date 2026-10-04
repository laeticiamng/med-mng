import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ROUTE_PATHS } from '@/config/routes';
import { SeeAlsoLinks } from './SeeAlsoLinks';

/**
 * Contre-vérification vague 2 (04.10.2026) : « Voir aussi », présent sur 8 pages publiques,
 * proposait encore « Simulateur d'examen EDN en ligne » et « Cas cliniques corrigés pour l'EDN »
 * (fonctionnalités retirées, DC7 : les deux adresses redirigent vers les fiches officielles).
 */
describe('SeeAlsoLinks', () => {
  it('ne propose aucune page de fonctionnalité retirée', () => {
    render(
      <MemoryRouter>
        <SeeAlsoLinks currentPath={ROUTE_PATHS.seoRangAvsRangB} maxLinks={20} />
      </MemoryRouter>,
    );
    const cibles = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(cibles.length).toBeGreaterThan(3);
    expect(cibles).not.toContain(ROUTE_PATHS.seoSimulationEdn);
    expect(cibles).not.toContain(ROUTE_PATHS.seoCasCliniqueEdn);
    expect(screen.queryByText(/Simulateur d'examen/)).toBeNull();
  });
});
