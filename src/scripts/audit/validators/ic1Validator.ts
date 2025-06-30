
import { validateItemEDN } from '@/schemas/itemEDNSchema';
import { EDNItemParser } from '@/parsers/ednItemParser';
import type { IC1CompletenessReport } from '../types/ic1Types';

export class IC1Validator {
  static validateFormat(item: any, report: IC1CompletenessReport): void {
    console.log('🔍 Validation du format IC-1...', { item_code: item.item_code || item.slug });
    
    // Vérifier si c'est bien l'item IC-1
    if (!this.isIC1Item(item)) {
      report.isCompliant = false;
      report.missingElements.push('Item non identifié comme IC-1');
      return;
    }

    const isV2 = EDNItemParser.isItemV2(item);
    
    if (isV2) {
      console.log('✅ Format v2 détecté');
      const validation = validateItemEDN(item);
      
      if (validation.success) {
        console.log('✅ Item validé avec succès en format v2');
      } else {
        console.log('⚠️ Validation v2 échouée, mais on continue l\'analyse');
        report.missingElements.push('Format v2 non strictement conforme mais analysable');
      }
    } else {
      console.log('📋 Format v1/legacy détecté - analyse compatible');
      // Les items v1 sont acceptables pour IC-1
    }
  }

  private static isIC1Item(item: any): boolean {
    const identifiers = [
      item.item_code?.toLowerCase(),
      item.slug?.toLowerCase(),
      item.title?.toLowerCase()
    ].filter(Boolean);

    return identifiers.some(id => 
      id.includes('ic-1') || 
      id.includes('ic1') ||
      id.includes('relation-medecin-malade') ||
      id.includes('relation médecin-malade')
    );
  }
}
