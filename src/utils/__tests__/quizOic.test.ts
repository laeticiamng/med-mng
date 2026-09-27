import { describe, expect, it } from 'vitest';
import { couperOption, genererQuestionsOic } from '../quizOic';
import type { OicCompetence } from '@/hooks/useOicCompetences';

const comp = (n: number, rang = 'A', description?: string): OicCompetence => ({
  objectif_id: `OIC-001-${String(n).padStart(2, '0')}-${rang}`,
  intitule: `Connaître la notion ${n}`,
  description: description ?? `Description officielle détaillée de la notion numéro ${n}, avec son contenu.`,
  rubrique: 'Définition',
  rang,
  item_parent: '001',
});

describe('genererQuestionsOic', () => {
  it('produit des questions à 4 options distinctes, une bonne réponse et une explication', () => {
    const cibles = [1, 2, 3, 4, 5, 6].map((n) => comp(n));
    const qs = genererQuestionsOic(cibles, [], 10);
    expect(qs).toHaveLength(6);
    for (const q of qs) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options[q.correctIndex]).toContain(`notion numéro ${q.competence.objectif_id.slice(8, 10).replace(/^0/, '')}`);
      expect(q.explanation).toContain(q.competence.objectif_id);
    }
  });

  it('complète les distracteurs avec la réserve quand l’item a peu de compétences', () => {
    const qs = genererQuestionsOic([comp(1)], [comp(2, 'B'), comp(3, 'B'), comp(4, 'B')]);
    expect(qs).toHaveLength(1);
    expect(qs[0].options).toHaveLength(4);
  });

  it('ne pose pas de question sans assez de distracteurs ni sans description', () => {
    expect(genererQuestionsOic([comp(1), comp(2)], [])).toHaveLength(0);
    expect(genererQuestionsOic([comp(1, 'A', '')], [comp(2), comp(3), comp(4)])).toHaveLength(0);
  });

  it('ne limite le nombre de questions qu’au maximum demandé', () => {
    const cibles = Array.from({ length: 15 }, (_, i) => comp(i + 1));
    expect(genererQuestionsOic(cibles, [], 10)).toHaveLength(10);
  });

  it('coupe les options longues au mot', () => {
    const long = 'mot '.repeat(200);
    const coupe = couperOption(long, 50);
    expect(coupe.length).toBeLessThanOrEqual(51);
    expect(coupe.endsWith('…')).toBe(true);
  });
});
