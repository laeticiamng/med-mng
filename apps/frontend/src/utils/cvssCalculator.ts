/**
 * CVSS v3.1 Calculator for vulnerability scoring
 */

/**
 * CVSS Metrics
 */
export interface CVSSMetrics {
  // Base Metrics
  attackVector?: 'N' | 'A' | 'L' | 'P'; // Network, Adjacent, Local, Physical
  attackComplexity?: 'L' | 'H'; // Low, High
  privilegesRequired?: 'N' | 'L' | 'H'; // None, Low, High
  userInteraction?: 'N' | 'R'; // None, Required
  scope?: 'U' | 'C'; // Unchanged, Changed
  confidentialityImpact?: 'N' | 'L' | 'H'; // None, Low, High
  integrityImpact?: 'N' | 'L' | 'H'; // None, Low, High
  availabilityImpact?: 'N' | 'L' | 'H'; // None, Low, High

  // Temporal Metrics (optional)
  exploitCodeMaturity?: 'X' | 'U' | 'P' | 'F' | 'H'; // Not Defined, Unproven, Proof-of-Concept, Functional, High
  remediationLevel?: 'X' | 'O' | 'T' | 'W' | 'U'; // Not Defined, Official Fix, Temporary Fix, Workaround, Unavailable
  reportConfidence?: 'X' | 'U' | 'R' | 'C'; // Not Defined, Unknown, Reasonable, Confirmed

  // Environmental Metrics (optional)
  confidentialityRequirement?: 'X' | 'L' | 'M' | 'H'; // Not Defined, Low, Medium, High
  integrityRequirement?: 'X' | 'L' | 'M' | 'H';
  availabilityRequirement?: 'X' | 'L' | 'M' | 'H';
}

/**
 * CVSS Score result
 */
export interface CVSSScore {
  baseScore: number;
  temporalScore: number;
  environmentalScore: number;
  baseSeverity: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  vectorString: string;
  impactScore: number;
  exploitabilityScore: number;
}

/**
 * Patch priority result
 */
export interface PatchPriority {
  priority: number;
  label: string;
  color: string;
  deadline: number; // days
}

// Metric value mappings
const attackVectorValues = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 };
const attackComplexityValues = { L: 0.77, H: 0.44 };
const privilegesRequiredValues = {
  unchanged: { N: 0.85, L: 0.62, H: 0.27 },
  changed: { N: 0.85, L: 0.68, H: 0.5 },
};
const userInteractionValues = { N: 0.85, R: 0.62 };
const impactValues = { N: 0, L: 0.22, H: 0.56 };

export const metricLabels = {
  attackVector: {
    N: 'Network',
    A: 'Adjacent Network',
    L: 'Local',
    P: 'Physical',
  },
  attackComplexity: {
    L: 'Low',
    H: 'High',
  },
  privilegesRequired: {
    N: 'None',
    L: 'Low',
    H: 'High',
  },
  userInteraction: {
    N: 'None',
    R: 'Required',
  },
  scope: {
    U: 'Unchanged',
    C: 'Changed',
  },
  impact: {
    N: 'None',
    L: 'Low',
    H: 'High',
  },
};

/**
 * Calculate CVSS v3.1 score
 */
export function calculateCVSS(metrics: CVSSMetrics): CVSSScore {
  // Set defaults
  const av = metrics.attackVector || 'N';
  const ac = metrics.attackComplexity || 'L';
  const pr = metrics.privilegesRequired || 'N';
  const ui = metrics.userInteraction || 'N';
  const s = metrics.scope || 'U';
  const c = metrics.confidentialityImpact || 'N';
  const i = metrics.integrityImpact || 'N';
  const a = metrics.availabilityImpact || 'N';

  // Calculate Impact Sub Score (ISS)
  const iss = 1 - (1 - impactValues[c]) * (1 - impactValues[i]) * (1 - impactValues[a]);

  // Calculate Impact Score
  let impactScore: number;
  if (s === 'U') {
    impactScore = 6.42 * iss;
  } else {
    impactScore = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
  }

  // Calculate Exploitability Score
  const prValue = s === 'C' ? privilegesRequiredValues.changed[pr] : privilegesRequiredValues.unchanged[pr];
  const exploitabilityScore =
    8.22 * attackVectorValues[av] * attackComplexityValues[ac] * prValue * userInteractionValues[ui];

  // Calculate Base Score
  let baseScore: number;
  if (impactScore <= 0) {
    baseScore = 0;
  } else if (s === 'U') {
    baseScore = Math.min(impactScore + exploitabilityScore, 10);
  } else {
    baseScore = Math.min(1.08 * (impactScore + exploitabilityScore), 10);
  }
  baseScore = Math.ceil(baseScore * 10) / 10;

  // Determine severity
  let baseSeverity: CVSSScore['baseSeverity'];
  if (baseScore === 0) baseSeverity = 'None';
  else if (baseScore < 4.0) baseSeverity = 'Low';
  else if (baseScore < 7.0) baseSeverity = 'Medium';
  else if (baseScore < 9.0) baseSeverity = 'High';
  else baseSeverity = 'Critical';

  // Generate vector string
  const vectorString = `CVSS:3.1/AV:${av}/AC:${ac}/PR:${pr}/UI:${ui}/S:${s}/C:${c}/I:${i}/A:${a}`;

  return {
    baseScore,
    temporalScore: baseScore, // Simplified - would need temporal metrics
    environmentalScore: baseScore, // Simplified - would need environmental metrics
    baseSeverity,
    vectorString,
    impactScore: Math.round(impactScore * 10) / 10,
    exploitabilityScore: Math.round(exploitabilityScore * 10) / 10,
  };
}

/**
 * Get patch priority based on CVSS score
 */
export function getPatchPriority(score: CVSSScore): PatchPriority {
  const baseScore = score.baseScore;

  if (baseScore >= 9.0) {
    return {
      priority: 1,
      label: 'Critical - Immediate',
      color: 'red',
      deadline: 1, // 1 day
    };
  } else if (baseScore >= 7.0) {
    return {
      priority: 2,
      label: 'High - Urgent',
      color: 'orange',
      deadline: 7, // 1 week
    };
  } else if (baseScore >= 4.0) {
    return {
      priority: 3,
      label: 'Medium - Schedule',
      color: 'yellow',
      deadline: 30, // 1 month
    };
  } else if (baseScore > 0) {
    return {
      priority: 4,
      label: 'Low - Plan',
      color: 'blue',
      deadline: 90, // 3 months
    };
  } else {
    return {
      priority: 5,
      label: 'None - Monitor',
      color: 'gray',
      deadline: 365, // 1 year
    };
  }
}
