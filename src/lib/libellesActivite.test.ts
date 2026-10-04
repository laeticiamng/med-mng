import { describe, expect, it } from 'vitest';
import { libelleTypeActivite, repartitionParLibelle } from './libellesActivite';

describe('libellés des types d’activité (tableau de progression)', () => {
  it('traduit les types connus et regroupe les inconnus', () => {
    expect(libelleTypeActivite('study')).toBe('Étude des items');
    expect(libelleTypeActivite('srs_review')).toBe('Révisions espacées');
    expect(libelleTypeActivite('page_view')).toBe('Autres activités');
  });

  it('n’affiche ni identifiant brut ni zéro, et cumule les types de même libellé', () => {
    const r = repartitionParLibelle({
      srs_review: 0, exam: 0, flashcard: 0, clinical_case: 2, study: 5, ai_question: 0,
      music_generation: 0, ecos: 1, review: 0, clinical: 1, page_view: 3,
    });
    expect(r).toEqual([
      ['Étude des items', 5],
      ['Autres activités', 3],
      ['Cas cliniques', 3],
      ['Situations ECOS', 1],
    ]);
    for (const [libelle] of r) expect(libelle).not.toMatch(/_|review|streak/i);
  });

  it('renvoie une liste vide quand tout est à zéro', () => {
    expect(repartitionParLibelle({ study: 0, review: 0 })).toEqual([]);
  });
});
