import { describe, expect, it } from 'vitest';
import {
  appartientADiscipline,
  comparateur,
  correspondContenu,
  correspondRecherche,
  listerDisciplines,
  listerOptionsContenu,
  rangPertinence,
  type ItemBibliotheque,
} from './bibliothequeEdn';

const PAROLES = ['[Couplet 1]', 'Le cœur bat, on écoute, on mesure.', 'La douleur serre, on agit vite.'];
const MOTS_CLES = ['nbsp nbsp migraine évaluer', 'diagnostic préciser'];

const items: ItemBibliotheque[] = [
  { item_code: 'IC-230', title: 'Douleur thoracique aiguë', specialite: 'Cardiologie', paroles_musicales: PAROLES, competences_count_rang_a: 6, competences_count_rang_b: 4 },
  { item_code: 'IC-2', title: 'Les valeurs professionnelles', specialite: 'Fondamentaux médicaux', paroles_musicales: PAROLES, competences_count_rang_a: 7, competences_count_rang_b: 2 },
  { item_code: 'IC-280', title: 'Ascite', specialite: 'Médecine générale', paroles_musicales: MOTS_CLES, competences_count_rang_a: 1, competences_count_rang_b: 1 },
  { item_code: 'IC-233', title: 'Valvulopathies', specialite: 'cardiologie ', paroles_musicales: PAROLES, competences_count_rang_a: 12, competences_count_rang_b: 3 },
  { item_code: 'IC-99', title: 'Migraine', specialite: null, paroles_musicales: [], competences_count_rang_a: 0, competences_count_rang_b: 3 },
];

describe('listerDisciplines', () => {
  it('ne propose que les disciplines présentes, regroupées sans tenir compte de la casse ni des espaces', () => {
    const d = listerDisciplines(items);
    expect(d.map(x => [x.libelle, x.nombre])).toEqual([
      ['Cardiologie', 2],
      ['Fondamentaux médicaux', 1],
      ['Médecine générale', 1],
    ]);
    expect(d.find(x => x.libelle === 'Gastro-entérologie')).toBeUndefined();
  });

  it('le filtre compte exactement l’effectif annoncé', () => {
    for (const d of listerDisciplines(items)) {
      expect(items.filter(i => appartientADiscipline(i, d.cle))).toHaveLength(d.nombre);
    }
    expect(items.filter(i => appartientADiscipline(i, 'all'))).toHaveLength(items.length);
  });

  it('compare sans accents', () => {
    const [mg] = listerDisciplines([{ item_code: 'IC-1', title: 't', specialite: 'MÉDECINE Générale' }]);
    expect(appartientADiscipline({ item_code: 'IC-2', title: 't', specialite: 'medecine generale' }, mg.cle)).toBe(true);
  });
});

describe('contenu', () => {
  it('distingue des paroles rédigées d’une suite de mots-clés', () => {
    expect(items.filter(i => correspondContenu(i, 'avecParoles')).map(i => i.item_code)).toEqual(['IC-230', 'IC-2', 'IC-233']);
    expect(items.filter(i => correspondContenu(i, 'sansParoles')).map(i => i.item_code)).toEqual(['IC-280', 'IC-99']);
  });

  it('omet les options sans aucun item', () => {
    const options = listerOptionsContenu(items.filter(i => i.item_code !== 'IC-280' && i.item_code !== 'IC-99'));
    expect(options.map(o => o.valeur)).not.toContain('sansParoles');
  });

  it('paroles non chargées (contenu Premium) : ni « avec » ni « sans », les deux options disparaissent', () => {
    const sansParoles = items.map(({ paroles_musicales: _p, ...reste }) => reste);
    expect(sansParoles.filter(i => correspondContenu(i, 'avecParoles'))).toEqual([]);
    expect(sansParoles.filter(i => correspondContenu(i, 'sansParoles'))).toEqual([]);
    const options = listerOptionsContenu(sansParoles).map(o => o.valeur);
    expect(options).not.toContain('avecParoles');
    expect(options).not.toContain('sansParoles');
    expect(options).toContain('competences10');
  });

  it('seuils de compétences', () => {
    expect(items.filter(i => correspondContenu(i, 'competences10')).map(i => i.item_code)).toEqual(['IC-230', 'IC-233']);
    expect(items.filter(i => correspondContenu(i, 'competencesMoins5')).map(i => i.item_code)).toEqual(['IC-280', 'IC-99']);
  });
});

describe('recherche', () => {
  it('par numéro exact, par discipline et par titre', () => {
    expect(items.filter(i => correspondRecherche(i, '230')).map(i => i.item_code)).toEqual(['IC-230']);
    expect(items.filter(i => correspondRecherche(i, 'cardio')).map(i => i.item_code)).toEqual(['IC-230', 'IC-233']);
    expect(items.filter(i => correspondRecherche(i, 'THORACIQUE AIGUE')).map(i => i.item_code)).toEqual(['IC-230']);
  });
});

describe('tri', () => {
  const codes = (t: Parameters<typeof comparateur>[0]) => [...items].sort(comparateur(t)).map(i => i.item_code);
  it('numéro', () => expect(codes('numero')).toEqual(['IC-2', 'IC-99', 'IC-230', 'IC-233', 'IC-280']));
  it('titre', () => expect(codes('titre')).toEqual(['IC-280', 'IC-230', 'IC-2', 'IC-99', 'IC-233']));
  it('nombre de compétences', () => expect(codes('competences')).toEqual(['IC-233', 'IC-230', 'IC-2', 'IC-99', 'IC-280']));
  it('rang A', () => expect(codes('rangA')).toEqual(['IC-233', 'IC-2', 'IC-230', 'IC-280', 'IC-99']));
});

// Test en production du 09.10.2026 : « insuffisance cardiaque » plaçait en tête l'IC-348
// (cité dans une seule compétence) au lieu de l'IC-234 dont c'est le titre.
describe('rangPertinence', () => {
  const ic234 = { item_code: 'IC-234', title: "Insuffisance cardiaque de l'adulte", specialite: 'Cardiologie' };
  const ic348 = { item_code: 'IC-348', title: 'Insuffisance rénale aiguë - Anurie', specialite: "Médecine d'urgence" };
  const ic232 = { item_code: 'IC-232', title: 'Fibrillation atriale', specialite: 'Cardiologie' };

  it('titre avant compétence seule', () => {
    expect(rangPertinence(ic234, 'insuffisance cardiaque')).toBe(0);
    expect(rangPertinence(ic348, 'insuffisance cardiaque')).toBe(2);
    const tries = [ic348, ic234].sort(
      (a, b) => rangPertinence(a, 'insuffisance cardiaque') - rangPertinence(b, 'insuffisance cardiaque'),
    );
    expect(tries[0].item_code).toBe('IC-234');
  });

  it('accents, pluriel et discipline', () => {
    expect(rangPertinence(ic234, 'Insuffisances cardiaques')).toBe(0);
    expect(rangPertinence(ic232, 'cardiologie')).toBe(1);
    expect(rangPertinence(ic232, '232')).toBe(1);
    expect(rangPertinence(ic232, '')).toBe(0);
  });
});
