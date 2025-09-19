import { describe, expect, it } from 'vitest';
import { buildQuizQuestions, buildScenarioContent, type CompetenceSummary } from '../../../supabase/functions/complete-edn-content/generators';

describe('complete-edn-content generators', () => {
  const competencesA: CompetenceSummary[] = [
    { intitule: 'Sémiologie', description: 'Identifier les signes cliniques majeurs.' },
    { intitule: 'Physiopathologie', description: 'Comprendre les mécanismes sous-jacents.' },
  ];
  const competencesB: CompetenceSummary[] = [
    { intitule: 'Diagnostic différentiel', description: 'Comparer les hypothèses diagnostiques.' },
  ];

  it('builds deterministic quiz questions with provided competences', () => {
    const questions = buildQuizQuestions({
      itemNumber: '042',
      itemTitle: 'Insuffisance cardiaque',
      competencesA,
      competencesB,
      random: () => 0.4,
    });

    expect(questions).toHaveLength(3);
    expect(questions[0].question).toContain('Insuffisance cardiaque');
    expect(questions[0].options[0]).toContain('Sémiologie');
    expect(questions[1].options[1]).toContain('Diagnostic différentiel');
    expect(questions[2].explanation).toContain('2 compétences');
  });

  it('handles missing competences gracefully when generating quiz', () => {
    const questions = buildQuizQuestions({
      itemNumber: '007',
      itemTitle: 'Item sans compétences',
      competencesA: [],
      competencesB: [],
      random: () => 0,
    });

    expect(questions).toHaveLength(1);
    expect(questions[0].correct).toBe(2);
    expect(questions[0].explanation).toContain('0 compétences');
  });

  it('creates scenario content wired to item metadata and competences', () => {
    const scenario = buildScenarioContent({
      itemNumber: '042',
      itemTitle: 'Insuffisance cardiaque',
      competencesA,
      competencesB,
    });

    expect(scenario.theme).toBe('medical_case');
    expect(scenario.case_presentation.initial_symptoms).toContain('Sémiologie');
    expect(scenario.interactions[0].feedback.rang_b).toContain('Diagnostic différentiel');
    expect(scenario.interactions[1].learning_objectives.rang_a).toContain('2 compétences');
    expect(scenario.learning_outcomes).toContain("Préparation efficace à l'ECN");
  });
});
