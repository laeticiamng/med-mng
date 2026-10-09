import { describe, expect, it } from 'vitest';
import { estIdAbonnementStripe } from '@/hooks/useSubscription';

/**
 * Constat 09.10.2026 : une ligne de démonstration de 2025 (`sim_standard_…`, statut
 * « active », période échue) faisait afficher « résiliez d'abord votre abonnement » sur
 * Mes données, alors que le serveur (delete-user-account) ne la compte pas.
 */
describe('estIdAbonnementStripe (même règle que delete-user-account)', () => {
  it('accepte un vrai identifiant Stripe', () => {
    expect(estIdAbonnementStripe('sub_1ULzDFDFa5Y9NR1IPzUzlveB')).toBe(true);
  });

  it('refuse les lignes de démonstration et les valeurs absentes', () => {
    expect(
      estIdAbonnementStripe('sim_standard_c2903313-1e4b-4d4d-bc0e-e62f4e361e7c')
    ).toBe(false);
    expect(estIdAbonnementStripe(null)).toBe(false);
    expect(estIdAbonnementStripe(undefined)).toBe(false);
    expect(estIdAbonnementStripe('')).toBe(false);
  });
});
