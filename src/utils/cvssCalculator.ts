/**
 * CVSS v3.1 Calculator
 * Based on official CVSS v3.1 specification
 * https://www.first.org/cvss/v3.1/specification-document
 */

export interface CVSSMetrics {
  // Base Metrics
  attackVector: 'N' | 'A' | 'L' | 'P';
  attackComplexity: 'L' | 'H';
  privilegesRequired: 'N' | 'L' | 'H';
  userInteraction: 'N' | 'R';
  scope: 'U' | 'C';
  confidentialityImpact: 'N' | 'L' | 'H';
  integrityImpact: 'N' | 'L' | 'H';
  availabilityImpact: 'N' | 'L' | 'H';
  
  // Temporal Metrics (optional)
  exploitCodeMaturity?: 'X' | 'U' | 'P' | 'F' | 'H';
  remediationLevel?: 'X' | 'O' | 'T' | 'W' | 'U';
  reportConfidence?: 'X' | 'U' | 'R' | 'C';
  
  // Environmental Metrics (optional)
  confidentialityRequirement?: 'X' | 'L' | 'M' | 'H';
  integrityRequirement?: 'X' | 'L' | 'M' | 'H';
  availabilityRequirement?: 'X' | 'L' | 'M' | 'H';
}

export interface CVSSScore {
  baseScore: number;
  baseSeverity: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  temporalScore: number | null;
  environmentalScore: number | null;
  vectorString: string;
  impactScore: number;
  exploitabilityScore: number;
}

// Metric value weights
const weights = {
  attackVector: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
  attackComplexity: { L: 0.77, H: 0.44 },
  privilegesRequired: { 
    unchanged: { N: 0.85, L: 0.62, H: 0.27 },
    changed: { N: 0.85, L: 0.68, H: 0.5 }
  },
  userInteraction: { N: 0.85, R: 0.62 },
  confidentialityImpact: { N: 0, L: 0.22, H: 0.56 },
  integrityImpact: { N: 0, L: 0.22, H: 0.56 },
  availabilityImpact: { N: 0, L: 0.22, H: 0.56 },
  exploitCodeMaturity: { X: 1, U: 0.91, P: 0.94, F: 0.97, H: 1 },
  remediationLevel: { X: 1, O: 0.95, T: 0.96, W: 0.97, U: 1 },
  reportConfidence: { X: 1, U: 0.92, R: 0.96, C: 1 },
  confidentialityRequirement: { X: 1, L: 0.5, M: 1, H: 1.5 },
  integrityRequirement: { X: 1, L: 0.5, M: 1, H: 1.5 },
  availabilityRequirement: { X: 1, L: 0.5, M: 1, H: 1.5 }
};

function roundUp(value: number): number {
  return Math.ceil(value * 10) / 10;
}

export function calculateCVSS(metrics: CVSSMetrics): CVSSScore {
  // Calculate Impact Sub-Score (ISS)
  const scopeChanged = metrics.scope === 'C';
  
  const iss = 1 - (
    (1 - weights.confidentialityImpact[metrics.confidentialityImpact]) *
    (1 - weights.integrityImpact[metrics.integrityImpact]) *
    (1 - weights.availabilityImpact[metrics.availabilityImpact])
  );

  // Calculate Impact Score
  let impactScore: number;
  if (scopeChanged) {
    impactScore = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
  } else {
    impactScore = 6.42 * iss;
  }

  // Calculate Exploitability Score
  const prValue = scopeChanged 
    ? weights.privilegesRequired.changed[metrics.privilegesRequired]
    : weights.privilegesRequired.unchanged[metrics.privilegesRequired];

  const exploitabilityScore = 8.22 * 
    weights.attackVector[metrics.attackVector] *
    weights.attackComplexity[metrics.attackComplexity] *
    prValue *
    weights.userInteraction[metrics.userInteraction];

  // Calculate Base Score
  let baseScore: number;
  if (impactScore <= 0) {
    baseScore = 0;
  } else {
    if (scopeChanged) {
      baseScore = Math.min(1.08 * (impactScore + exploitabilityScore), 10);
    } else {
      baseScore = Math.min(impactScore + exploitabilityScore, 10);
    }
    baseScore = roundUp(baseScore);
  }

  // Determine Base Severity
  let baseSeverity: CVSSScore['baseSeverity'];
  if (baseScore === 0) baseSeverity = 'None';
  else if (baseScore < 4.0) baseSeverity = 'Low';
  else if (baseScore < 7.0) baseSeverity = 'Medium';
  else if (baseScore < 9.0) baseSeverity = 'High';
  else baseSeverity = 'Critical';

  // Calculate Temporal Score (if metrics provided)
  let temporalScore: number | null = null;
  if (metrics.exploitCodeMaturity || metrics.remediationLevel || metrics.reportConfidence) {
    const e = weights.exploitCodeMaturity[metrics.exploitCodeMaturity || 'X'];
    const rl = weights.remediationLevel[metrics.remediationLevel || 'X'];
    const rc = weights.reportConfidence[metrics.reportConfidence || 'X'];
    temporalScore = roundUp(baseScore * e * rl * rc);
  }

  // Calculate Environmental Score (if metrics provided)
  let environmentalScore: number | null = null;
  if (metrics.confidentialityRequirement || metrics.integrityRequirement || metrics.availabilityRequirement) {
    const cr = weights.confidentialityRequirement[metrics.confidentialityRequirement || 'X'];
    const ir = weights.integrityRequirement[metrics.integrityRequirement || 'X'];
    const ar = weights.availabilityRequirement[metrics.availabilityRequirement || 'X'];

    const modifiedIss = Math.min(
      1 - (
        (1 - weights.confidentialityImpact[metrics.confidentialityImpact] * cr) *
        (1 - weights.integrityImpact[metrics.integrityImpact] * ir) *
        (1 - weights.availabilityImpact[metrics.availabilityImpact] * ar)
      ),
      0.915
    );

    let modifiedImpact: number;
    if (scopeChanged) {
      modifiedImpact = 7.52 * (modifiedIss - 0.029) - 3.25 * Math.pow(modifiedIss * 0.9731 - 0.02, 13);
    } else {
      modifiedImpact = 6.42 * modifiedIss;
    }

    if (modifiedImpact <= 0) {
      environmentalScore = 0;
    } else {
      if (scopeChanged) {
        environmentalScore = Math.min(1.08 * (modifiedImpact + exploitabilityScore), 10);
      } else {
        environmentalScore = Math.min(modifiedImpact + exploitabilityScore, 10);
      }
      
      // Apply temporal metrics if present
      const e = weights.exploitCodeMaturity[metrics.exploitCodeMaturity || 'X'];
      const rl = weights.remediationLevel[metrics.remediationLevel || 'X'];
      const rc = weights.reportConfidence[metrics.reportConfidence || 'X'];
      
      environmentalScore = roundUp(environmentalScore * e * rl * rc);
    }
  }

  // Generate Vector String
  const vectorString = generateVectorString(metrics);

  return {
    baseScore,
    baseSeverity,
    temporalScore,
    environmentalScore,
    vectorString,
    impactScore: roundUp(impactScore),
    exploitabilityScore: roundUp(exploitabilityScore)
  };
}

function generateVectorString(metrics: CVSSMetrics): string {
  let vector = `CVSS:3.1/AV:${metrics.attackVector}/AC:${metrics.attackComplexity}`;
  vector += `/PR:${metrics.privilegesRequired}/UI:${metrics.userInteraction}`;
  vector += `/S:${metrics.scope}/C:${metrics.confidentialityImpact}`;
  vector += `/I:${metrics.integrityImpact}/A:${metrics.availabilityImpact}`;

  if (metrics.exploitCodeMaturity && metrics.exploitCodeMaturity !== 'X') {
    vector += `/E:${metrics.exploitCodeMaturity}`;
  }
  if (metrics.remediationLevel && metrics.remediationLevel !== 'X') {
    vector += `/RL:${metrics.remediationLevel}`;
  }
  if (metrics.reportConfidence && metrics.reportConfidence !== 'X') {
    vector += `/RC:${metrics.reportConfidence}`;
  }
  if (metrics.confidentialityRequirement && metrics.confidentialityRequirement !== 'X') {
    vector += `/CR:${metrics.confidentialityRequirement}`;
  }
  if (metrics.integrityRequirement && metrics.integrityRequirement !== 'X') {
    vector += `/IR:${metrics.integrityRequirement}`;
  }
  if (metrics.availabilityRequirement && metrics.availabilityRequirement !== 'X') {
    vector += `/AR:${metrics.availabilityRequirement}`;
  }

  return vector;
}

export function getPatchPriority(score: CVSSScore, hasExploit: boolean = false): {
  priority: number;
  label: string;
  deadline: number; // days
  color: string;
} {
  const severity = score.baseSeverity;
  const finalScore = score.environmentalScore || score.temporalScore || score.baseScore;

  if (severity === 'Critical' || (finalScore >= 9.0 && hasExploit)) {
    return {
      priority: 1,
      label: 'Urgent - Patch Immediately',
      deadline: 1,
      color: 'destructive'
    };
  } else if (severity === 'High' || finalScore >= 7.0) {
    return {
      priority: 2,
      label: 'High - Patch within 7 days',
      deadline: 7,
      color: 'warning'
    };
  } else if (severity === 'Medium' || finalScore >= 4.0) {
    return {
      priority: 3,
      label: 'Medium - Patch within 30 days',
      deadline: 30,
      color: 'secondary'
    };
  } else if (severity === 'Low') {
    return {
      priority: 4,
      label: 'Low - Patch within 90 days',
      deadline: 90,
      color: 'outline'
    };
  } else {
    return {
      priority: 5,
      label: 'Informational - Monitor',
      deadline: 365,
      color: 'outline'
    };
  }
}

export const metricLabels = {
  attackVector: {
    N: 'Network',
    A: 'Adjacent',
    L: 'Local',
    P: 'Physical'
  },
  attackComplexity: {
    L: 'Low',
    H: 'High'
  },
  privilegesRequired: {
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  userInteraction: {
    N: 'None',
    R: 'Required'
  },
  scope: {
    U: 'Unchanged',
    C: 'Changed'
  },
  impact: {
    N: 'None',
    L: 'Low',
    H: 'High'
  }
};
