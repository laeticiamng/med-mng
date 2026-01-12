import { parseOICContent } from '../supabase/functions/extract-edn-objectifs/oic-parser';
import { assessOicCompetence, computeQualityScore, shouldBlockImport } from '../supabase/functions/extract-edn-objectifs/oic-quality';

describe('OIC sample quality suite', () => {
  const samplePages = [
    {
      title: 'OIC-010-02-A-01',
      revisions: [
        {
          slots: {
            main: {
              content: "| Intitulé = Décrire les bases de l'immunité | Description = Comprendre les mécanismes immunitaires de base.",
            },
          },
        },
      ],
    },
    {
      title: 'OIC-011-03-B-02',
      revisions: [
        {
          slots: {
            main: {
              content: "== Intitulé ==\nApproche clinique avancée\n\nDescription détaillée de l'objectif clinique.",
            },
          },
        },
      ],
    },
  ];

  it('parses an OIC sample batch', () => {
    const results = samplePages.map(page => parseOICContent(page));
    expect(results.every(Boolean)).toBe(true);
    expect(results[0]!.objectif_id).toBe('OIC-010-02-A-01');
    expect(results[1]!.rang).toBe('B');
  });

  it('flags critical anomalies on malformed content', () => {
    const malformed = {
      objectif_id: 'OIC-999-99-A-99',
      intitule: 'Court',
      item_parent: '99',
      rang: 'C',
      rubrique: 'Rubrique 99',
      description: '',
      url_source: '',
    };
    const assessment = assessOicCompetence(malformed as any);
    expect(assessment.criticalIssues).toContain('invalid_item_parent');
    expect(assessment.criticalIssues).toContain('invalid_rang');
    expect(assessment.criticalIssues).toContain('intitule_too_short');
  });

  it('computes quality metrics and blocks on critical anomalies', () => {
    const metrics = {
      totalPages: 2,
      parsedItems: 2,
      savedItems: 1,
      criticalAnomalies: 1,
      warningAnomalies: 0,
      parseFailures: 0,
      qualityScore: 1,
    };
    const score = computeQualityScore(metrics);
    expect(score).toBeLessThan(1);
    expect(shouldBlockImport({ ...metrics, qualityScore: score })).toBe(true);
  });
});
