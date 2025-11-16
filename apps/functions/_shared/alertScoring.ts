/**
 * Système de scoring unifié pour les alertes
 * Combine PagerDuty urgency + CVSS scores + facteurs contextuels
 */

export interface ScoringWeights {
  pagerduty: number;
  cvss: number;
  age: number;
  frequency: number;
}

export interface ScoringFactors {
  pagerduty_score: number;
  cvss_normalized_score: number;
  age_score: number;
  frequency_score: number;
  raw_cvss?: number;
  age_hours?: number;
  occurrence_count?: number;
}

export interface ScoringResult {
  unified_score: number;
  factors: ScoringFactors;
  priority_level: 'critical' | 'high' | 'medium' | 'low';
}

export class AlertScoring {
  // Poids par défaut (peuvent être configurés)
  private static readonly DEFAULT_WEIGHTS: ScoringWeights = {
    pagerduty: 0.35,  // 35%
    cvss: 0.35,       // 35%
    age: 0.15,        // 15%
    frequency: 0.15,  // 15%
  };

  /**
   * Calcule le score unifié d'une alerte
   */
  static calculateScore(
    source: 'pagerduty' | 'nvd',
    severity: string,
    cvssScore: number | null,
    status: string | null,
    createdAt: string,
    occurrenceCount: number = 1,
    weights: ScoringWeights = this.DEFAULT_WEIGHTS
  ): ScoringResult {
    // 1. Score PagerDuty
    const pagerdutyScore = this.calculatePagerDutyScore(source, severity, status);

    // 2. Score CVSS normalisé
    const cvssNormalizedScore = this.normalizeCVSS(cvssScore);

    // 3. Score basé sur l'âge
    const ageScore = this.calculateAgeScore(createdAt);

    // 4. Score basé sur la fréquence
    const frequencyScore = this.calculateFrequencyScore(occurrenceCount);

    // 5. Calcul du score unifié (0-100)
    const unifiedScore =
      pagerdutyScore * weights.pagerduty +
      cvssNormalizedScore * weights.cvss +
      ageScore * weights.age +
      frequencyScore * weights.frequency;

    // 6. Déterminer le niveau de priorité
    const priorityLevel = this.getPriorityLevel(unifiedScore);

    const ageHours = this.getAgeInHours(createdAt);

    return {
      unified_score: Math.round(unifiedScore * 100) / 100,
      factors: {
        pagerduty_score: Math.round(pagerdutyScore * 100) / 100,
        cvss_normalized_score: Math.round(cvssNormalizedScore * 100) / 100,
        age_score: Math.round(ageScore * 100) / 100,
        frequency_score: Math.round(frequencyScore * 100) / 100,
        raw_cvss: cvssScore || undefined,
        age_hours: ageHours,
        occurrence_count: occurrenceCount,
      },
      priority_level: priorityLevel,
    };
  }

  /**
   * Calcule le score PagerDuty (0-100)
   */
  private static calculatePagerDutyScore(
    source: string,
    severity: string,
    status: string | null
  ): number {
    if (source !== 'pagerduty') {
      // Pour NVD, utiliser seulement la sévérité
      return this.severityToScore(severity);
    }

    let baseScore = this.severityToScore(severity);

    // Ajustement selon le statut
    if (status === 'triggered') {
      baseScore *= 1.2; // +20% si non acquitté
    } else if (status === 'acknowledged') {
      baseScore *= 0.9; // -10% si acquitté
    }

    return Math.min(baseScore, 100);
  }

  /**
   * Convertit une sévérité en score (0-100)
   */
  private static severityToScore(severity: string): number {
    const scores: Record<string, number> = {
      critical: 95,
      high: 75,
      medium: 50,
      low: 25,
    };
    return scores[severity.toLowerCase()] || 0;
  }

  /**
   * Normalise un score CVSS (0-10) en score 0-100
   */
  private static normalizeCVSS(cvssScore: number | null): number {
    if (!cvssScore || cvssScore === 0) {
      return 0;
    }
    // CVSS 0-10 → Score 0-100
    return cvssScore * 10;
  }

  /**
   * Calcule le score basé sur l'âge (plus récent = plus important)
   */
  private static calculateAgeScore(createdAt: string): number {
    const ageHours = this.getAgeInHours(createdAt);

    // Décroissance exponentielle
    // 0h = 100, 1h = 95, 6h = 75, 24h = 50, 72h = 25, >168h = 10
    if (ageHours < 1) return 100;
    if (ageHours < 6) return 95 - (ageHours - 1) * 4;
    if (ageHours < 24) return 75 - (ageHours - 6) * 1.4;
    if (ageHours < 72) return 50 - (ageHours - 24) * 0.5;
    if (ageHours < 168) return 25 - (ageHours - 72) * 0.15;
    return 10;
  }

  /**
   * Calcule le score basé sur la fréquence d'occurrence
   */
  private static calculateFrequencyScore(occurrenceCount: number): number {
    // Plus d'occurrences = plus important
    // 1 = 50, 2 = 60, 5 = 80, 10+ = 100
    if (occurrenceCount === 1) return 50;
    if (occurrenceCount === 2) return 60;
    if (occurrenceCount <= 5) return 60 + (occurrenceCount - 2) * 6.7;
    if (occurrenceCount <= 10) return 80 + (occurrenceCount - 5) * 4;
    return 100;
  }

  /**
   * Retourne l'âge en heures
   */
  private static getAgeInHours(createdAt: string): number {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    return diffMs / (1000 * 60 * 60);
  }

  /**
   * Détermine le niveau de priorité basé sur le score unifié
   */
  private static getPriorityLevel(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  /**
   * Recalcule le score d'une alerte existante avec occurrence mise à jour
   */
  static recalculateWithOccurrence(
    previousScore: ScoringResult,
    newOccurrenceCount: number
  ): ScoringResult {
    // Garde les mêmes scores sauf fréquence
    const newFrequencyScore = this.calculateFrequencyScore(newOccurrenceCount);
    
    const weights = this.DEFAULT_WEIGHTS;
    const unifiedScore =
      previousScore.factors.pagerduty_score * weights.pagerduty +
      previousScore.factors.cvss_normalized_score * weights.cvss +
      previousScore.factors.age_score * weights.age +
      newFrequencyScore * weights.frequency;

    return {
      unified_score: Math.round(unifiedScore * 100) / 100,
      factors: {
        ...previousScore.factors,
        frequency_score: Math.round(newFrequencyScore * 100) / 100,
        occurrence_count: newOccurrenceCount,
      },
      priority_level: this.getPriorityLevel(unifiedScore),
    };
  }
}
