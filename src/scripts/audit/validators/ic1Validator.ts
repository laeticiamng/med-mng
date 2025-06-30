
import { validateItemEDN } from '@/schemas/itemEDNSchema';
import { EDNItemParser } from '@/parsers/ednItemParser';
import type { IC1CompletenessReport } from '../types/ic1Types';

export class IC1Validator {
  static validateFormat(item: any, report: IC1CompletenessReport): void {
    console.log('🔍 Validation du format v2...');
    
    const isV2 = EDNItemParser.isItemV2(item);
    
    if (!isV2) {
      report.isCompliant = false;
      report.missingElements.push('Item non conforme au schéma v2');
      report.recommendations.push('Migrer l\'item vers le format v2 avec item_metadata, content.rang_a, content.rang_b');
    } else {
      const validation = validateItemEDN(item);
      if (!validation.success) {
        report.isCompliant = false;
        report.missingElements.push(...validation.errors);
      }
    }
  }
}
