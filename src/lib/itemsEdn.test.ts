import { describe, expect, it } from 'vitest';
import {
  normaliserTexte,
  numeroItem,
  rechercherItems,
  trierItemsParNumero,
} from './itemsEdn';

const items = [
  { item_code: 'IC-1', title: 'La relation médecin-malade' },
  { item_code: 'IC-10', title: 'Approches transversales du corps' },
  { item_code: 'IC-100', title: 'Céphalée inhabituelle aiguë et chronique' },
  { item_code: 'IC-12', title: 'Violences sexuelles' },
  { item_code: 'IC-120', title: 'Ménopause' },
  { item_code: 'IC-2', title: 'Les valeurs professionnelles' },
  {
    item_code: 'IC-226',
    title: 'Thrombose veineuse profonde et embolie pulmonaire',
    subtitle: 'TVP EP anticoagulants',
  },
  {
    item_code: 'IC-334',
    title: "Prise en charge d'un syndrome coronarien aigu",
  },
];

describe('items EDN — ordre officiel', () => {
  it('numéro lisible quelle que soit la forme', () => {
    expect(numeroItem('IC-12')).toBe(12);
    expect(numeroItem('ic-012')).toBe(12);
    expect(numeroItem('12')).toBe(12);
    expect(numeroItem('IC-1000')).toBeNull();
    expect(numeroItem('abc')).toBeNull();
  });

  it('tri numérique, pas alphabétique (IC-2 avant IC-10)', () => {
    expect(trierItemsParNumero(items).map((i) => i.item_code)).toEqual([
      'IC-1',
      'IC-2',
      'IC-10',
      'IC-12',
      'IC-100',
      'IC-120',
      'IC-226',
      'IC-334',
    ]);
  });
});

describe('items EDN — recherche', () => {
  it('sans requête : tous les items, ordre officiel', () => {
    expect(rechercherItems(items, '  ')).toHaveLength(items.length);
    expect(rechercherItems(items, '')[1].item_code).toBe('IC-2');
  });

  it('par numéro : l’item exact d’abord, puis ceux qui commencent par ce numéro', () => {
    expect(rechercherItems(items, '12').map((i) => i.item_code)).toEqual([
      'IC-12',
      'IC-120',
    ]);
    expect(rechercherItems(items, 'IC-12')[0].item_code).toBe('IC-12');
    expect(rechercherItems(items, 'ic 1').map((i) => i.item_code)).toEqual([
      'IC-1',
      'IC-10',
      'IC-12',
      'IC-100',
      'IC-120',
    ]);
  });

  it('par titre, sans tenir compte des accents ni de la casse', () => {
    expect(rechercherItems(items, 'cephalee').map((i) => i.item_code)).toEqual([
      'IC-100',
    ]);
    expect(rechercherItems(items, 'MÉNOPAUSE').map((i) => i.item_code)).toEqual(
      ['IC-120']
    );
  });

  it('par mot-clé du sous-titre, plusieurs mots dans n’importe quel ordre', () => {
    expect(
      rechercherItems(items, 'anticoagulants').map((i) => i.item_code)
    ).toEqual(['IC-226']);
    expect(
      rechercherItems(items, 'aigu coronarien').map((i) => i.item_code)
    ).toEqual(['IC-334']);
  });

  it('début de titre en premier', () => {
    const r = rechercherItems(
      [
        { item_code: 'IC-5', title: 'Douleur chez l’enfant' },
        { item_code: 'IC-6', title: 'Enfant : vaccinations' },
      ],
      'enfant'
    );
    expect(r[0].item_code).toBe('IC-6');
  });

  it('normalisation', () => {
    expect(normaliserTexte('  L’Embolie   Pulmonaire ')).toBe(
      'l embolie pulmonaire'
    );
  });
});
