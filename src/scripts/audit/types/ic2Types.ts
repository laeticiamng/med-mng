
export interface IC2ConceptAnalysis {
  found: string[];
  missing: string[];
}

export interface IC2RangReport {
  expected: number;
  found: number;
  concepts: string[];
  missingConcepts: string[];
}

export interface IC2Report {
  exists: boolean;
  itemCode?: string;
  title?: string;
  slug?: string;
  rangA: IC2RangReport;
  rangB: IC2RangReport;
  completeness: number;
  recommendations: string[];
}
