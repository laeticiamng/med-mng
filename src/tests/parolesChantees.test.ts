import { describe, expect, it } from 'vitest';
import {
  entierEnLettres,
  nombreEnLettres,
  parolesChantees,
} from '../../supabase/functions/_shared/mm-paroles-chantees';

describe('paroles chantées — nombres en toutes lettres', () => {
  it('entiers (orthographe traditionnelle)', () => {
    expect(entierEnLettres(0)).toBe('zéro');
    expect(entierEnLettres(21)).toBe('vingt et un');
    expect(entierEnLettres(71)).toBe('soixante et onze');
    expect(entierEnLettres(80)).toBe('quatre-vingts');
    expect(entierEnLettres(85)).toBe('quatre-vingt-cinq');
    expect(entierEnLettres(90)).toBe('quatre-vingt-dix');
    expect(entierEnLettres(97)).toBe('quatre-vingt-dix-sept');
    expect(entierEnLettres(200)).toBe('deux cents');
    expect(entierEnLettres(250)).toBe('deux cent cinquante');
    expect(entierEnLettres(1000)).toBe('mille');
    expect(entierEnLettres(2500)).toBe('deux mille cinq cents');
    expect(entierEnLettres(10932)).toBe('dix mille neuf cent trente-deux');
  });

  it('décimaux', () => {
    expect(nombreEnLettres('2,5')).toBe('deux virgule cinq');
    expect(nombreEnLettres('0.8')).toBe('zéro virgule huit');
    expect(nombreEnLettres('7,30')).toBe('sept virgule trente');
    expect(nombreEnLettres('0,01')).toBe('zéro virgule zéro un');
  });

  it('doses, intervalles et unités (IC-150, constat du 09.10)', () => {
    expect(
      parolesChantees(
        'Moins de 2 ans : amoxicilline 80 à 90 milligrammes par kilo et par jour, 8 à 10 jours,'
      )
    ).toBe(
      'Moins de deux ans : amoxicilline quatre-vingts à quatre-vingt-dix milligrammes par kilo et par jour, huit à dix jours,'
    );
    expect(
      parolesChantees(
        'Sinon réévaluer à 48-72 heures si symptômes persistants.'
      )
    ).toBe(
      'Sinon réévaluer à quarante-huit à soixante-douze heures si symptômes persistants.'
    );
    expect(
      parolesChantees("Staphylocoque doré, Pseudomonas, 10 % d'Aspergillus")
    ).toBe("Staphylocoque doré, Pseudomonas, dix pour cent d'Aspergillus");
    expect(parolesChantees('Séromuqueuse : bilatérale à 85 %,')).toBe(
      'Séromuqueuse : bilatérale à quatre-vingt-cinq pour cent,'
    );
  });

  it('unités abrégées', () => {
    expect(parolesChantees('Adrénaline 0,01 mg/kg en IM')).toBe(
      'Adrénaline zéro virgule zéro un milligramme par kilo en IM'
    );
    expect(parolesChantees('Glycémie > 2 g/L à 2 h')).toBe(
      'Glycémie > deux grammes par litre à deux heures'
    );
    expect(parolesChantees('PAS < 90 mmHg pendant 15 min')).toBe(
      'PAS < quatre-vingt-dix millimètres de mercure pendant quinze minutes'
    );
    expect(parolesChantees('pH < 7,30, bicarbonates < 18 mmol/L')).toBe(
      'pH < sept virgule trente, bicarbonates < dix-huit millimoles par litre'
    );
    expect(parolesChantees('Fièvre à 38,5 °C')).toBe(
      'Fièvre à trente-huit virgule cinq degrés'
    );
  });

  it('ordinaux ; codes et balises intacts', () => {
    expect(parolesChantees('Antibiotique de 1re intention, en 2e ligne')).toBe(
      'Antibiotique de première intention, en deuxième ligne'
    );
    expect(parolesChantees('[Couplet 1]')).toBe('[Couplet 1]');
    expect(parolesChantees('OMA, HTA, IC-12 et OIC-001-01-A')).toBe(
      'OMA, HTA, IC-12 et OIC-001-01-A'
    );
    expect(parolesChantees('COVID-19 et H1N1')).toBe('COVID-19 et H1N1');
  });
});
