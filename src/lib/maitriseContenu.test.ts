import { describe, expect, it } from 'vitest';
import {
  TYPE_CONTENU_ECOS,
  TYPE_CONTENU_ITEM,
  maitriseDepuisScoreEcos,
  maitriseDepuisStatut,
  statutDepuisMaitrise,
} from './maitriseContenu';

// Valeurs de production (pg_constraint, 07.10.2026).
const TYPES_AUTORISES = ['edn', 'ecos', 'quiz'];
const NIVEAUX_AUTORISES = ['beginner', 'intermediate', 'advanced', 'expert', null];

describe('maitriseContenu — valeurs acceptées par user_progress', () => {
  it('les content_type écrits respectent user_progress_content_type_check', () => {
    expect(TYPES_AUTORISES).toContain(TYPE_CONTENU_ITEM);
    expect(TYPES_AUTORISES).toContain(TYPE_CONTENU_ECOS);
  });

  it('les mastery_level écrits respectent user_progress_mastery_level_check', () => {
    for (const s of ['not_started', 'in_progress', 'revised'] as const) {
      expect(NIVEAUX_AUTORISES).toContain(maitriseDepuisStatut(s));
    }
    for (const p of [0, 30, 59, 60, 100]) {
      expect(NIVEAUX_AUTORISES).toContain(maitriseDepuisScoreEcos(p));
    }
  });

  it('aller-retour statut → niveau → statut sans perte', () => {
    for (const s of ['not_started', 'in_progress', 'revised'] as const) {
      expect(statutDepuisMaitrise(maitriseDepuisStatut(s))).toBe(s);
    }
    expect(statutDepuisMaitrise('expert')).toBe('revised');
    expect(statutDepuisMaitrise('beginner')).toBe('in_progress');
  });
});
