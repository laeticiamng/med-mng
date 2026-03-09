
import { validateItemEDN } from '@/schemas/itemEDNSchema';
import { EDNItemParser } from '@/parsers/ednItemParser';
import { AuditResult } from './types';

export class AuditValidators {
  static async auditSingleItem(item: any): Promise<AuditResult> {
    if (import.meta.env.DEV) console.log(`🔍 Audit de ${item.item_code || item.slug}...`);

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
      result.isV2Format = EDNItemParser.isItemV2(item);
      
      if (result.isV2Format) {
        if (import.meta.env.DEV) console.log(`✅ Item v2 détecté: ${result.item_code}`);
        
        const validation = validateItemEDN(item);
        
        if ('success' in validation && validation.success === true) {
          if (import.meta.env.DEV) console.log(`✅ Validation schema OK: ${result.item_code}`);
          this.checkCompleteness(item, result);
        } else if ('success' in validation && validation.success === false && 'errors' in validation) {
          if (import.meta.env.DEV) console.warn(`⚠️ Validation schema échouée: ${result.item_code}`);
          result.status = 'invalid';
          result.errors = validation.errors;
        }
        
      } else {
        if (import.meta.env.DEV) console.log(`📋 Item v1 détecté: ${result.item_code}`);
        result.warnings.push('Item en format v1 (legacy) - migration recommandée');
        this.checkLegacyCompleteness(item, result);
      }

      this.checkCommonRequirements(item, result);

    } catch (error) {
      if (import.meta.env.DEV) console.error(`❌ Erreur lors de l'audit de ${result.item_code}:`, error);
      result.status = 'error';
      result.errors.push(`Erreur d'audit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    return result;
  }

  private static checkCompleteness(item: any, result: AuditResult) {
    if (import.meta.env.DEV) console.log(`🔍 Vérification complétude v2: ${result.item_code}`);
    
    if (item.content?.rang_a?.competences && item.content.rang_a.competences.length > 0) {
      result.completeness.rangA = true;
      if (import.meta.env.DEV) console.log(`✅ Rang A complet: ${item.content.rang_a.competences.length} compétences`);
    } else {
      result.errors.push('Rang A manquant ou vide');
    }

    if (item.content?.rang_b?.competences && item.content.rang_b.competences.length > 0) {
      result.completeness.rangB = true;
      if (import.meta.env.DEV) console.log(`✅ Rang B complet: ${item.content.rang_b.competences.length} compétences`);
    } else {
      result.errors.push('Rang B manquant ou vide');
    }

    const hasParolesA = item.content?.rang_a?.competences?.some((c: any) => 
      c.paroles_chantables && c.paroles_chantables.length > 0
    );
    const hasParolesB = item.content?.rang_b?.competences?.some((c: any) => 
      c.paroles_chantables && c.paroles_chantables.length > 0
    );
    
    if (hasParolesA || hasParolesB) {
      result.completeness.parolesMusicales = true;
      if (import.meta.env.DEV) console.log('✅ Paroles musicales présentes');
    } else {
      result.warnings.push('Paroles musicales manquantes');
    }

    if (item.generation_config) {
      result.completeness.generationConfig = true;
      if (import.meta.env.DEV) console.log('✅ Configuration de génération présente');
    } else {
      result.warnings.push('Configuration de génération manquante');
    }
  }

  private static checkLegacyCompleteness(item: any, result: AuditResult) {
    if (import.meta.env.DEV) console.log(`🔍 Vérification complétude v1: ${result.item_code}`);
    
    if (item.tableau_rang_a?.lignes && item.tableau_rang_a.lignes.length > 0) {
      result.completeness.rangA = true;
    }
    
    if (item.tableau_rang_b?.lignes && item.tableau_rang_b.lignes.length > 0) {
      result.completeness.rangB = true;
    }
    
    if (item.paroles_musicales && item.paroles_musicales.length > 0) {
      result.completeness.parolesMusicales = true;
    }
    
    result.completeness.generationConfig = true;
  }

  private static checkCommonRequirements(item: any, result: AuditResult) {
    if (import.meta.env.DEV) console.log(`🔍 Vérification exigences communes: ${result.item_code}`);
    
    if (!item.slug || item.slug.trim() === '') {
      result.errors.push('Slug manquant');
    }
    
    if (!item.title || item.title.trim() === '') {
      result.errors.push('Titre manquant');
    }

    if (result.item_code && !result.item_code.match(/^IC-[0-9]+$/)) {
      result.warnings.push('Format du code item non standard (attendu: IC-X)');
    }
  }
}
