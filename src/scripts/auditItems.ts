
import { supabase } from '@/integrations/supabase/client';
import { validateItemEDN } from '@/schemas/itemEDNSchema';
import { EDNItemParser } from '@/parsers/ednItemParser';

interface AuditResult {
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

interface AuditReport {
  timestamp: string;
  totalItems: number;
  validItems: number;
  invalidItems: number;
  errorItems: number;
  results: AuditResult[];
}

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
        const auditResult = await this.auditSingleItem(item);
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

  private static async auditSingleItem(item: any): Promise<AuditResult> {
    console.log(`🔍 Audit de ${item.item_code || item.slug}...`);

    const result: AuditResult = {
      id: item.id,
      slug: item.slug || 'unknown',
      item_code: item.item_code || 'IC-?',
      status: 'valid',
      errors: [],
      warnings: [],
      isV2Format: false,
      completeness: {
        rangA: false,
        rangB: false,
        parolesMusicales: false,
        generationConfig: false
      }
    };

    try {
      // 1. Détection du format
      result.isV2Format = EDNItemParser.isItemV2(item);
      
      if (result.isV2Format) {
        console.log(`✅ Item v2 détecté: ${result.item_code}`);
        
        // 2. Validation schema v2
        const validation = validateItemEDN(item);
        
        if ('success' in validation && validation.success === true) {
          console.log(`✅ Validation schema OK: ${result.item_code}`);
          
          // 3. Vérification de complétude
          this.checkCompleteness(item, result);
          
        } else if ('success' in validation && validation.success === false && 'errors' in validation) {
          console.warn(`⚠️ Validation schema échouée: ${result.item_code}`);
          result.status = 'invalid';
          result.errors = validation.errors;
        }
        
      } else {
        console.log(`📋 Item v1 détecté: ${result.item_code}`);
        result.warnings.push('Item en format v1 (legacy) - migration recommandée');
        
        // Vérification basique pour les items v1
        this.checkLegacyCompleteness(item, result);
      }

      // 4. Vérifications communes
      this.checkCommonRequirements(item, result);

    } catch (error) {
      console.error(`❌ Erreur lors de l'audit de ${result.item_code}:`, error);
      result.status = 'error';
      result.errors.push(`Erreur d'audit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    return result;
  }

  private static checkCompleteness(item: any, result: AuditResult) {
    console.log(`🔍 Vérification complétude v2: ${result.item_code}`);
    
    // Rang A
    if (item.content?.rang_a?.competences && item.content.rang_a.competences.length > 0) {
      result.completeness.rangA = true;
      console.log(`✅ Rang A complet: ${item.content.rang_a.competences.length} compétences`);
    } else {
      result.errors.push('Rang A manquant ou vide');
    }

    // Rang B
    if (item.content?.rang_b?.competences && item.content.rang_b.competences.length > 0) {
      result.completeness.rangB = true;
      console.log(`✅ Rang B complet: ${item.content.rang_b.competences.length} compétences`);
    } else {
      result.errors.push('Rang B manquant ou vide');
    }

    // Paroles musicales
    const hasParolesA = item.content?.rang_a?.competences?.some((c: any) => 
      c.paroles_chantables && c.paroles_chantables.length > 0
    );
    const hasParolesB = item.content?.rang_b?.competences?.some((c: any) => 
      c.paroles_chantables && c.paroles_chantables.length > 0
    );
    
    if (hasParolesA || hasParolesB) {
      result.completeness.parolesMusicales = true;
      console.log('✅ Paroles musicales présentes');
    } else {
      result.warnings.push('Paroles musicales manquantes');
    }

    // Configuration de génération
    if (item.generation_config) {
      result.completeness.generationConfig = true;
      console.log('✅ Configuration de génération présente');
    } else {
      result.warnings.push('Configuration de génération manquante');
    }
  }

  private static checkLegacyCompleteness(item: any, result: AuditResult) {
    console.log(`🔍 Vérification complétude v1: ${result.item_code}`);
    
    // Vérifications basiques pour les items v1
    if (item.tableau_rang_a?.lignes && item.tableau_rang_a.lignes.length > 0) {
      result.completeness.rangA = true;
    }
    
    if (item.tableau_rang_b?.lignes && item.tableau_rang_b.lignes.length > 0) {
      result.completeness.rangB = true;
    }
    
    if (item.paroles_musicales && item.paroles_musicales.length > 0) {
      result.completeness.parolesMusicales = true;
    }
    
    result.completeness.generationConfig = true; // On assume OK pour v1
  }

  private static checkCommonRequirements(item: any, result: AuditResult) {
    console.log(`🔍 Vérification exigences communes: ${result.item_code}`);
    
    // Vérification des champs obligatoires
    if (!item.slug || item.slug.trim() === '') {
      result.errors.push('Slug manquant');
    }
    
    if (!item.title || item.title.trim() === '') {
      result.errors.push('Titre manquant');
    }

    // Vérification de la cohérence
    if (result.item_code && !result.item_code.match(/^IC-[0-9]+$/)) {
      result.warnings.push('Format du code item non standard (attendu: IC-X)');
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

  // Génération du rapport Markdown
  static generateMarkdownReport(report: AuditReport): string {
    const date = new Date(report.timestamp).toLocaleString('fr-FR');
    
    let markdown = `# Rapport d'Audit EDN Items\n\n`;
    markdown += `**Date:** ${date}\n\n`;
    markdown += `## Résumé\n\n`;
    markdown += `- **Total items:** ${report.totalItems}\n`;
    markdown += `- **Items valides:** ${report.validItems} (${Math.round(report.validItems/report.totalItems*100)}%)\n`;
    markdown += `- **Items invalides:** ${report.invalidItems}\n`;
    markdown += `- **Erreurs d'audit:** ${report.errorItems}\n\n`;

    markdown += `## Détail par item\n\n`;
    
    for (const result of report.results) {
      const statusEmoji = result.status === 'valid' ? '✅' : result.status === 'invalid' ? '⚠️' : '❌';
      const formatBadge = result.isV2Format ? '`v2`' : '`v1`';
      
      markdown += `### ${statusEmoji} ${result.item_code} ${formatBadge}\n\n`;
      markdown += `- **Slug:** ${result.slug}\n`;
      markdown += `- **Statut:** ${result.status}\n`;
      
      // Complétude
      markdown += `- **Complétude:**\n`;
      markdown += `  - Rang A: ${result.completeness.rangA ? '✅' : '❌'}\n`;
      markdown += `  - Rang B: ${result.completeness.rangB ? '✅' : '❌'}\n`;
      markdown += `  - Paroles musicales: ${result.completeness.parolesMusicales ? '✅' : '⚠️'}\n`;
      markdown += `  - Config génération: ${result.completeness.generationConfig ? '✅' : '⚠️'}\n`;
      
      // Erreurs
      if (result.errors.length > 0) {
        markdown += `- **Erreurs:**\n`;
        for (const error of result.errors) {
          markdown += `  - ${error}\n`;
        }
      }
      
      // Avertissements
      if (result.warnings.length > 0) {
        markdown += `- **Avertissements:**\n`;
        for (const warning of result.warnings) {
          markdown += `  - ${warning}\n`;
        }
      }
      
      markdown += '\n';
    }

    return markdown;
  }

  // Génération du rapport JSON
  static generateJSONReport(report: AuditReport): string {
    return JSON.stringify(report, null, 2);
  }
}

// Fonction principale pour utilisation en script
export async function runAudit() {
  try {
    console.log('🚀 Lancement de l\'audit EDN Items...');
    const report = await EDNItemsAuditor.auditAllItems();
    
    console.log('\n📊 RAPPORT D\'AUDIT');
    console.log('==================');
    console.log(`Total: ${report.totalItems} items`);
    console.log(`Valides: ${report.validItems} items`);
    console.log(`Invalides: ${report.invalidItems} items`);
    console.log(`Erreurs: ${report.errorItems} items`);
    
    // Génération des rapports
    const markdownReport = EDNItemsAuditor.generateMarkdownReport(report);
    const jsonReport = EDNItemsAuditor.generateJSONReport(report);
    
    console.log('\n📄 Rapport Markdown généré');
    console.log('\n📄 Rapport JSON généré');
    
    return {
      report,
      markdown: markdownReport,
      json: jsonReport
    };
    
  } catch (error) {
    console.error('❌ Échec de l\'audit:', error);
    throw error;
  }
}
