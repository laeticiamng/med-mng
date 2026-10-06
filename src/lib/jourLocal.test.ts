import { afterEach, describe, expect, it } from 'vitest';
import {
  dateDepuisJour,
  debutJourLocal,
  decalerJour,
  ecartJours,
  hierLocal,
  jourLocal,
  plusLongueSerie,
  prochainMinuitLocal,
  serieActuelle,
  versDateLocale,
} from './jourLocal';

/**
 * Ces tests fixent eux-mêmes le fuseau (process.env.TZ, pris en compte à chaud par Node) : ils
 * vérifient le comportement à Zurich, New York ou Auckland quel que soit le fuseau de la machine
 * qui lance la suite (la CI tourne en UTC, où l'ancien calcul « jour UTC » paraissait juste).
 */
const fuseauInitial = process.env.TZ;
function fuseau(tz: string) {
  process.env.TZ = tz;
}
afterEach(() => {
  if (fuseauInitial === undefined) delete process.env.TZ;
  else process.env.TZ = fuseauInitial;
});

/** L'ancien calcul, remplacé partout : jour UTC. */
const ancienJour = (d: Date) => d.toISOString().split('T')[0];

describe('jourLocal : jour calendaire local, pas jour UTC', () => {
  it('00 h 30 à Zurich en été (UTC+2) : on est déjà le 15 juillet', () => {
    fuseau('Europe/Zurich');
    const instant = new Date('2026-07-14T22:30:00Z');
    expect(instant.getHours()).toBe(0);
    expect(jourLocal(instant)).toBe('2026-07-15');
    expect(ancienJour(instant)).toBe('2026-07-14'); // le défaut corrigé
  });

  it('00 h 30 à Zurich en hiver (UTC+1) : on est déjà le 15 janvier', () => {
    fuseau('Europe/Zurich');
    const instant = new Date('2026-01-14T23:30:00Z');
    expect(jourLocal(instant)).toBe('2026-01-15');
    expect(ancienJour(instant)).toBe('2026-01-14');
  });

  it('21 h à New York (UTC-4) : on est encore le 14 juillet', () => {
    fuseau('America/New_York');
    const instant = new Date('2026-07-15T01:00:00Z');
    expect(jourLocal(instant)).toBe('2026-07-14');
    expect(ancienJour(instant)).toBe('2026-07-15');
  });

  it('8 h à Auckland (UTC+12) : on est le 15 juillet', () => {
    fuseau('Pacific/Auckland');
    expect(jourLocal(new Date('2026-07-14T20:00:00Z'))).toBe('2026-07-15');
  });

  it('accepte un horodatage ISO de la base et renvoie tel quel un jour déjà formé', () => {
    fuseau('America/New_York');
    expect(jourLocal('2026-07-15T01:00:00+00:00')).toBe('2026-07-14');
    // new Date('2026-07-15') serait minuit UTC, donc le 14 à 20 h à New York.
    expect(jourLocal('2026-07-15')).toBe('2026-07-15');
    expect(versDateLocale('2026-07-15').getDate()).toBe(15);
    expect(dateDepuisJour('2026-07-15').getHours()).toBe(0);
  });

  it('refuse une date invalide plutôt que d’écrire « NaN-NaN-NaN »', () => {
    expect(() => jourLocal('pas une date')).toThrow(RangeError);
  });
});

describe('changements d’heure (Europe/Zurich) : arithmétique calendaire', () => {
  it('29 mars 2026 (jour de 23 h) : la veille du 30 à 00 h 30 est bien le 29', () => {
    fuseau('Europe/Zurich');
    const instant = new Date('2026-03-29T22:30:00Z'); // 30 mars, 00 h 30 (UTC+2)
    expect(jourLocal(instant)).toBe('2026-03-30');
    expect(hierLocal(instant)).toBe('2026-03-29');
    // Ancien calcul « maintenant − 86 400 000 ms » : 28 mars, 23 h 30 (deux jours en arrière).
    expect(jourLocal(new Date(instant.getTime() - 86_400_000))).toBe('2026-03-28');
    expect(prochainMinuitLocal(new Date('2026-03-29T10:00:00Z')).toISOString()).toBe('2026-03-29T22:00:00.000Z');
  });

  it('25 octobre 2026 (jour de 25 h) : la veille du 25 à 23 h 30 est bien le 24', () => {
    fuseau('Europe/Zurich');
    const instant = new Date('2026-10-25T22:30:00Z'); // 25 octobre, 23 h 30 (UTC+1)
    expect(jourLocal(instant)).toBe('2026-10-25');
    expect(hierLocal(instant)).toBe('2026-10-24');
    // Ancien calcul : 25 octobre 00 h 30, « hier » valait aujourd'hui.
    expect(jourLocal(new Date(instant.getTime() - 86_400_000))).toBe('2026-10-25');
    expect(debutJourLocal(instant).toISOString()).toBe('2026-10-24T22:00:00.000Z');
    expect(prochainMinuitLocal(instant).toISOString()).toBe('2026-10-25T23:00:00.000Z');
  });

  it('décalages et écarts en jours identiques dans tous les fuseaux', () => {
    for (const tz of ['Europe/Zurich', 'UTC', 'America/New_York', 'Pacific/Auckland']) {
      fuseau(tz);
      expect(decalerJour('2026-03-30', -1)).toBe('2026-03-29');
      expect(decalerJour('2026-10-26', -1)).toBe('2026-10-25');
      expect(decalerJour('2026-02-28', 1)).toBe('2026-03-01');
      expect(decalerJour('2026-12-31', 1)).toBe('2027-01-01');
      expect(ecartJours('2026-03-30', '2026-03-29')).toBe(1);
      expect(ecartJours('2026-10-26', '2026-10-25')).toBe(1);
      expect(ecartJours('2026-10-20', '2026-10-27')).toBe(-7);
    }
  });
});

describe('série de jours consécutifs', () => {
  it('compte depuis aujourd’hui, ou depuis hier si rien encore aujourd’hui', () => {
    const jours = ['2026-07-16', '2026-07-15', '2026-07-15', '2026-07-14', '2026-07-12'];
    expect(serieActuelle(jours, '2026-07-16')).toBe(3);
    expect(serieActuelle(jours, '2026-07-17')).toBe(3);
    expect(serieActuelle(jours, '2026-07-18')).toBe(0);
    expect(serieActuelle([], '2026-07-18')).toBe(0);
    expect(plusLongueSerie(jours)).toBe(3);
  });

  it('traverse les changements d’heure sans se casser', () => {
    for (const tz of ['Europe/Zurich', 'America/New_York', 'Pacific/Auckland', 'UTC']) {
      fuseau(tz);
      expect(serieActuelle(['2026-03-28', '2026-03-29', '2026-03-30'], '2026-03-30')).toBe(3);
      expect(serieActuelle(['2026-10-24', '2026-10-25', '2026-10-26'], '2026-10-26')).toBe(3);
      expect(plusLongueSerie(['2026-10-24', '2026-10-25', '2026-10-26', '2026-10-28'])).toBe(3);
    }
  });
});
