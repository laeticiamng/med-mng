
import { supabase } from '@/integrations/supabase/client';
import { AuditResult, AuditReport } from './types';
import { AuditValidators } from './validators';

export class EDNItemsAuditor {
  
  static async auditAllItems(): Promise<AuditReport> {
    console.log('🔍 Démarrage de l\'audit des items EDN...');
    
    try {
      // Récupération de tous les items
      const { data: items, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .order('item_code');

      if (error) {
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      if (!items || items.length === 0) {
        console.warn('⚠️ Aucun item trouvé dans la base');
        return this.createEmptyReport();
      }

      console.log(`📦 ${items.length} items trouvés, début de l'audit...`);

      // Audit de chaque item
      const results: AuditResult[] = [];
      for (const item of items) {
        const auditResult = await AuditValidators.auditSingleItem(item);
        results.push(auditResult);
        console.log(`✅ Audit terminé pour ${auditResult.item_code}: ${auditResult.status}`);
      }

      // Génération du rapport
      const report: AuditReport = {
        timestamp: new Date().toISOString(),
        totalItems: results.length,
        validItems: results.filter(r => r.status === 'valid').length,
        invalidItems: results.filter(r => r.status === 'invalid').length,
        errorItems: results.filter(r => r.status === 'error').length,
        results
      };

      console.log('📊 Rapport d\'audit généré:', {
        total: report.totalItems,
        valid: report.validItems,
        invalid: report.invalidItems,
        errors: report.errorItems
      });

      return report;

    } catch (error) {
      console.error('❌ Erreur lors de l\'audit:', error);
      throw error;
    }
  }

  private static createEmptyReport(): AuditReport {
    return {
      timestamp: new Date().toISOString(),
      totalItems: 0,
      validItems: 0,
      invalidItems: 0,
      errorItems: 0,
      results: []
    };
  }
}
