import type { OicCompetence } from './oic-parser.ts';

export const OIC_ID_REGEX = /^OIC-\d{3}-\d{2}-[AB]-\d{2}$/;

export interface OicQualityAssessment {
  criticalIssues: string[];
  warningIssues: string[];
}

export interface OicQualityMetrics {
  totalPages: number;
  parsedItems: number;
  savedItems: number;
  criticalAnomalies: number;
  warningAnomalies: number;
  parseFailures: number;
  qualityScore: number;
}

export function assessOicCompetence(competence: OicCompetence): OicQualityAssessment {
  const criticalIssues: string[] = [];
  const warningIssues: string[] = [];

  if (!OIC_ID_REGEX.test(competence.objectif_id)) {
    criticalIssues.push('invalid_objectif_id');
  }

  if (!/^\d{3}$/.test(competence.item_parent)) {
    criticalIssues.push('invalid_item_parent');
  }

  if (!['A', 'B'].includes(competence.rang)) {
    criticalIssues.push('invalid_rang');
  }

  const intitule = competence.intitule?.trim() || '';
  if (intitule.length < 10) {
    criticalIssues.push('intitule_too_short');
  }

  const description = competence.description?.trim() || '';
  if (!description) {
    warningIssues.push('missing_description');
  } else {
    if (description.startsWith(`Description de l'objectif`)) {
      warningIssues.push('fallback_description');
    }
    if (description.length < 30) {
      warningIssues.push('description_too_short');
    }
  }

  if (competence.rubrique?.startsWith('Rubrique')) {
    warningIssues.push('unknown_rubrique');
  }

  if (!competence.url_source) {
    warningIssues.push('missing_source_url');
  }

  return { criticalIssues, warningIssues };
}

export function computeQualityScore(metrics: OicQualityMetrics): number {
  const total = Math.max(metrics.totalPages, 1);
  const penalty = metrics.criticalAnomalies + metrics.parseFailures + metrics.warningAnomalies * 0.25;
  return Math.max(0, Number((1 - penalty / total).toFixed(4)));
}

export function shouldBlockImport(metrics: OicQualityMetrics): boolean {
  return metrics.criticalAnomalies > 0 || metrics.parseFailures > 0;
}
