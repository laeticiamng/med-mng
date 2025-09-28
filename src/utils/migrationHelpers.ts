
import { ItemEDNV2, createEmptyItemEDN } from '@/schemas/itemEDNSchema';
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper pour migrer un item v1 vers v2
 * Utilisé par le script de migration
 */
export class MigrationHelpers {
  
  /**
   * Convertit un item legacy vers le format v2
   */
  static convertLegacyToV2(legacyItem: any): ItemEDNV2 {
    console.log('🔄 Migration v1→v2 pour:', legacyItem.item_code);
    
    const baseItem = createEmptyItemEDN(
      legacyItem.item_code || 'IC-?',
      legacyItem.title || 'Titre non défini',
      this.mapCategoryFromLegacy(legacyItem)
    );
    
    // Mapping du contenu existant
    if (legacyItem.tableau_rang_a) {
      baseItem.content.rang_a = this.mapTableauToRangContent(legacyItem.tableau_rang_a, 'A');
    }
    
    if (legacyItem.tableau_rang_b) {
      baseItem.content.rang_b = this.mapTableauToRangContent(legacyItem.tableau_rang_b, 'B');
    }
    
    // Mapping des paroles musicales
    if (legacyItem.paroles_musicales) {
      this.injectParolesIntoCompetences(baseItem, legacyItem.paroles_musicales);
    }
    
    // Configuration de génération
    baseItem.generation_config = {
      music_enabled: !!legacyItem.paroles_musicales?.length,
      bd_enabled: true,
      quiz_enabled: !!legacyItem.quiz_questions,
      interactive_enabled: !!legacyItem.scene_immersive
    };
    
    return baseItem;
  }
  
  /**
   * Mappe les catégories legacy vers les nouvelles
   */
  private static mapCategoryFromLegacy(legacyItem: any): ItemEDNV2['item_metadata']['category'] {
    const code = legacyItem.item_code || '';
    
    if (code === 'IC-1') return 'relation_medecin_malade';
    if (code === 'IC-2') return 'valeurs_professionnelles';
    if (code === 'IC-3') return 'raisonnement_decision';
    if (code === 'IC-4') return 'qualite_securite';
    if (code === 'IC-5') return 'organisation_systeme';
    
    // Fallback
    return 'relation_medecin_malade';
  }
  
  /**
   * Convertit un tableau legacy vers le format rang v2
   */
  private static mapTableauToRangContent(tableau: any, rang: 'A' | 'B') {
    const theme = tableau.theme || `Rang ${rang} - Contenu migré`;
    const competences = [];
    
    if (tableau.lignes && Array.isArray(tableau.lignes)) {
      tableau.lignes.forEach((ligne: string[], index: number) => {
        if (ligne.length >= 8) {
          competences.push({
            competence_id: `MIGRATED_${rang}_${index + 1}`,
            concept: ligne[0] || 'Concept migré',
            definition: ligne[1] || 'Définition migrée',
            exemple: ligne[2] || 'Exemple migré',
            piege: ligne[3] || 'Piège migré',
            mnemo: ligne[4] || 'Mnémo migré',
            subtilite: ligne[5] || 'Subtilité migrée',
            application: ligne[6] || 'Application migrée',
            vigilance: ligne[7] || 'Vigilance migrée',
            paroles_chantables: [] // Sera rempli plus tard
          });
        }
      });
    }
    
    return { theme, competences };
  }
  
  /**
   * Injecte les paroles musicales dans les compétences
   */
  private static injectParolesIntoCompetences(itemV2: ItemEDNV2, paroles: string[]) {
    const allCompetences = [
      ...itemV2.content.rang_a.competences,
      ...itemV2.content.rang_b.competences
    ];
    
    paroles.forEach((parole, index) => {
      if (allCompetences[index]) {
        allCompetences[index].paroles_chantables = [parole];
      }
    });
  }
  
  /**
   * Vérifie si un item peut être migré sans perte
   */
  static canMigrateSafely(legacyItem: any): { canMigrate: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    if (!legacyItem.item_code) {
      warnings.push('Code item manquant');
    }
    
    if (!legacyItem.title) {
      warnings.push('Titre manquant');
    }
    
    if (!legacyItem.tableau_rang_a && !legacyItem.tableau_rang_b) {
      warnings.push('Aucun contenu de rang trouvé');
    }
    
    return {
      canMigrate: warnings.length === 0,
      warnings
    };
  }
  
  /**
   * Sauvegarde un item v2 dans Supabase
   */
  static async saveItemV2(itemV2: ItemEDNV2, originalId: string) {
    try {
      const { error } = await supabase
        .from('edn_items_immersive')
        .update({
          // Nouveaux champs v2
          payload_v2: itemV2,
          migration_status: 'migrated_v2',
          updated_at: new Date().toISOString()
        })
        .eq('id', originalId);
      
      if (error) throw error;
      
      console.log('✅ Item v2 sauvegardé:', itemV2.item_metadata.code);
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde v2:', error);
      return false;
    }
  }
}
