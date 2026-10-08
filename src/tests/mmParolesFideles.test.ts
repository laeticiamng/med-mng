import { describe, expect, it } from 'vitest';
import {
  REGLE_FIDELITE_SOURCE,
  motifNombresInventes,
  nombresAbsentsDeLaSource,
  nombresDuTexte,
} from '../../supabase/functions/_shared/mm-paroles-fideles';

// Textes de test neutres (aucune donnée médicale réelle n'est affirmée ici) :
// seule la mécanique de comparaison des nombres est vérifiée.
const SOURCE =
  'Seuil A à 38,5 ; contrôle à 48 h ; dose 0.5 ; 3 critères ; 1re intention';

describe('mm-paroles-fideles : aucun chiffre absent de la source', () => {
  it('accepte des paroles qui reprennent les nombres de la source (virgule ou point, zéros non significatifs)', () => {
    const paroles = [
      '[Couplet 1]',
      'Seuil A à 38.5',
      'Contrôle à 48 heures',
      'Dose 0,50',
      '3 critères à retenir',
    ].join('\n');
    expect(nombresAbsentsDeLaSource(paroles, SOURCE)).toEqual([]);
    expect(motifNombresInventes(paroles, SOURCE)).toBeNull();
  });

  it('refuse un nombre chanté absent de la source et le nomme dans le motif', () => {
    const paroles = [
      '[Refrain]',
      'Seuil A à 39',
      'Contrôle à 48 h',
      'Dose 0,5 puis 72 h',
    ].join('\n');
    expect(nombresAbsentsDeLaSource(paroles, SOURCE)).toEqual(['39', '72']);
    const motif = motifNombresInventes(paroles, SOURCE);
    expect(motif).toContain('39');
    expect(motif).toContain('72');
  });

  it('ignore les lignes de structure ([Couplet 2]) et les ordinaux (1re, 2e, 3ème)', () => {
    const paroles = [
      '[Couplet 2]',
      'En 1re intention',
      'puis en 2e ligne, au 3ème temps',
      '[Pont 4]',
    ].join('\n');
    expect(nombresAbsentsDeLaSource(paroles, SOURCE)).toEqual([]);
  });

  it('ne compte pas un nombre une seule fois en double', () => {
    const paroles = 'Dose 7\nDose 7 encore\nDose 7,0';
    expect(nombresAbsentsDeLaSource(paroles, SOURCE)).toEqual(['7']);
  });

  it('extrait les nombres normalisés de la source', () => {
    expect([...nombresDuTexte(SOURCE)].sort()).toEqual(
      ['0.5', '3', '38.5', '48'].sort()
    );
  });

  it("la règle ajoutée à l'invite exige la reprise à l'identique des chiffres, seuils et molécules", () => {
    expect(REGLE_FIDELITE_SOURCE).toMatch(/À L'IDENTIQUE/);
    expect(REGLE_FIDELITE_SOURCE).toMatch(/seuils/);
    expect(REGLE_FIDELITE_SOURCE).toMatch(/molécules/);
    expect(REGLE_FIDELITE_SOURCE).toMatch(/jamais apparaître/);
  });
});

describe('generer-paroles-item : la règle de fidélité est branchée', () => {
  it("l'invite système contient la règle et le contrôle de qualité appelle la vérification des nombres", async () => {
    const { readFileSync } = await import('node:fs');
    const code = readFileSync(
      'supabase/functions/generer-paroles-item/index.ts',
      'utf8'
    );
    expect(code).toContain('${REGLE_FIDELITE_SOURCE}');
    expect(code).toMatch(/motifNombresInventes\(paroles, source\)/);
    // L'interdiction d'inventer, déjà présente, est conservée.
    expect(code).toContain(
      "N'invente aucun fait, aucun chiffre, aucune molécule"
    );
  });
});
