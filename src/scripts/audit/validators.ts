
import { validateItemEDN } from '@/schemas/itemEDNSchema';
import { EDNItemParser } from '@/parsers/ednItemParser';
import { AuditResult } from './types';

export class AuditValidators {
  static async auditSingleItem(item: any): Promise<AuditResult> {
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
}
