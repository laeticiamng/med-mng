
export interface AuditResult {
  id: string;
  slug: string;
  item_code: string;
  status: 'valid' | 'invalid' | 'error';
  errors: string[];
  warnings: string[];
  isV2Format: boolean;
  completeness: {
    rangA: boolean;
    rangB: boolean;
    parolesMusicales: boolean;
    generationConfig: boolean;
  };
}

export interface AuditReport {
  timestamp: string;
  totalItems: number;
  validItems: number;
  invalidItems: number;
  errorItems: number;
  results: AuditResult[];
}
