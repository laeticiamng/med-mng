import { supabase } from '@/integrations/supabase/client';
import { validateItemEDN, ItemEDNV2 } from '@/schemas/itemEDNSchema';
import { EDNItemParser } from '@/parsers/ednItemParser';

interface IC1CompletenessReport {
  isCompliant: boolean;
  missingElements: string[];
  contentAnalysis: {
    rangA: {
      hasContent: boolean;
      competencesCount: number;
      missingCompetences: string[];
    };
    rangB: {
      hasContent: boolean;
      competencesCount: number;
      missingCompetences: string[];
    };
  };
  medicalContentCheck: {
    hasRelationMedecinMalade: boolean;
    hasCorpsHumainDimensions: boolean;
    hasMaladiesImpact: boolean;
    hasPratiquesCliniques: boolean;
  };
  recommendations: string[];
}

// Compétences attendues pour IC-1 selon le référentiel
const EXPECTED_IC1_COMPETENCES = {
  rangA: [
    'Approches transversales du corps',
    'Dimensions humaines du corps (alimentation, activité physique, genre, procréation)',
    'Impact des maladies sur l\'expérience corporelle',
    'Relation thérapeutique et corps du patient'
  ],
  rangB: [
    'Pratiques cliniques et données personnelles',
    'Regard médical et palpation',
    'Imagerie et analyses biologiques',
    'Respect de la dignité et de l\'intimité'
  ]
};

export class IC1CompletenessAuditor {
  
  static async auditIC1Completeness(): Promise<IC1CompletenessReport> {
    console.log('🔍 Audit de complétude IC-1 - Relation médecin-malade...');
    
    try {
      // Récupération de l'item IC-1
      const { data: ic1Item, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .or('item_code.eq.IC-1,item_code.eq.IC-001,slug.eq.ic-1,slug.eq.relation-medecin-malade')
        .single();

      if (error || !ic1Item) {
        return {
          isCompliant: false,
          missingElements: ['Item IC-1 non trouvé dans la base de données'],
          contentAnalysis: {
            rangA: { hasContent: false, competencesCount: 0, missingCompetences: EXPECTED_IC1_COMPETENCES.rangA },
            rangB: { hasContent: false, competencesCount: 0, missingCompetences: EXPECTED_IC1_COMPETENCES.rangB }
          },
          medicalContentCheck: {
            hasRelationMedecinMalade: false,
            hasCorpsHumainDimensions: false,
            hasMaladiesImpact: false,
            hasPratiquesCliniques: false
          },
          recommendations: ['Créer l\'item IC-1 avec le contenu médical approprié']
        };
      }

      console.log('📦 Item IC-1 trouvé:', ic1Item.item_code || ic1Item.slug);

      const report: IC1CompletenessReport = {
        isCompliant: true,
        missingElements: [],
        contentAnalysis: {
          rangA: { hasContent: false, competencesCount: 0, missingCompetences: [] },
          rangB: { hasContent: false, competencesCount: 0, missingCompetences: [] }
        },
        medicalContentCheck: {
          hasRelationMedecinMalade: false,
          hasCorpsHumainDimensions: false,
          hasMaladiesImpact: false,
          hasPratiquesCliniques: false
        },
        recommendations: []
      };

      // 1. Vérification du format v2
      const isV2 = EDNItemParser.isItemV2(ic1Item);
      
      if (!isV2) {
        report.isCompliant = false;
        report.missingElements.push('Item non conforme au schéma v2');
        report.recommendations.push('Migrer l\'item vers le format v2 avec item_metadata, content.rang_a, content.rang_b');
      } else {
        // 2. Validation du schéma avec correction de l'accès aux erreurs
        const validation = validateItemEDN(ic1Item);
        if (!validation.success && validation.error) {
          report.isCompliant = false;
          // S'assurer que error est bien une ZodError
          if ('issues' in validation.error) {
            const errorMessages = validation.error.issues.map(
              (issue: any) => `${issue.path.join('.')} - ${issue.message}`
            );
            report.missingElements.push(...errorMessages);
          } else {
            // Fallback si la structure est différente
            report.missingElements.push('Erreur de validation du schéma');
          }
        }
      }

      // 3. Analyse du contenu
      await this.analyzeContent(ic1Item, report);

      // 4. Vérification du contenu médical spécifique
      this.checkMedicalContent(ic1Item, report);

      // 5. Génération des recommandations
      this.generateRecommendations(report);

      return report;

    } catch (error) {
      console.error('❌ Erreur lors de l\'audit IC-1:', error);
      throw error;
    }
  }

  private static async analyzeContent(item: any, report: IC1CompletenessReport) {
    console.log('🔍 Analyse du contenu IC-1...');

    // Analyse Rang A
    if (item.content?.rang_a?.competences) {
      report.contentAnalysis.rangA.hasContent = true;
      report.contentAnalysis.rangA.competencesCount = item.content.rang_a.competences.length;
      
      const presentCompetences = item.content.rang_a.competences.map((c: any) => c.concept || c.titre);
      report.contentAnalysis.rangA.missingCompetences = EXPECTED_IC1_COMPETENCES.rangA.filter(
        expected => !presentCompetences.some((present: string) => 
          present.toLowerCase().includes(expected.toLowerCase().split(' ')[0])
        )
      );
    } else if (item.tableau_rang_a?.lignes) {
      // Format v1
      report.contentAnalysis.rangA.hasContent = true;
      report.contentAnalysis.rangA.competencesCount = item.tableau_rang_a.lignes.length;
      report.contentAnalysis.rangA.missingCompetences = EXPECTED_IC1_COMPETENCES.rangA;
    } else {
      report.isCompliant = false;
      report.missingElements.push('Rang A manquant ou vide');
      report.contentAnalysis.rangA.missingCompetences = EXPECTED_IC1_COMPETENCES.rangA;
    }

    // Analyse Rang B
    if (item.content?.rang_b?.competences) {
      report.contentAnalysis.rangB.hasContent = true;
      report.contentAnalysis.rangB.competencesCount = item.content.rang_b.competences.length;
      
      const presentCompetences = item.content.rang_b.competences.map((c: any) => c.concept || c.titre);
      report.contentAnalysis.rangB.missingCompetences = EXPECTED_IC1_COMPETENCES.rangB.filter(
        expected => !presentCompetences.some((present: string) => 
          present.toLowerCase().includes(expected.toLowerCase().split(' ')[0])
        )
      );
    } else if (item.tableau_rang_b?.lignes) {
      // Format v1
      report.contentAnalysis.rangB.hasContent = true;
      report.contentAnalysis.rangB.competencesCount = item.tableau_rang_b.lignes.length;
      report.contentAnalysis.rangB.missingCompetences = EXPECTED_IC1_COMPETENCES.rangB;
    } else {
      report.isCompliant = false;
      report.missingElements.push('Rang B manquant ou vide');
      report.contentAnalysis.rangB.missingCompetences = EXPECTED_IC1_COMPETENCES.rangB;
    }
  }

  private static checkMedicalContent(item: any, report: IC1CompletenessReport) {
    console.log('🏥 Vérification du contenu médical IC-1...');
    
    const fullContent = JSON.stringify(item).toLowerCase();
    
    // Vérification des thèmes médicaux essentiels
    report.medicalContentCheck.hasRelationMedecinMalade = 
      fullContent.includes('relation') && 
      (fullContent.includes('médecin') || fullContent.includes('medecin')) &&
      fullContent.includes('malade');

    report.medicalContentCheck.hasCorpsHumainDimensions = 
      fullContent.includes('corps') && 
      (fullContent.includes('dimension') || fullContent.includes('alimentation') || fullContent.includes('physique'));

    report.medicalContentCheck.hasMaladiesImpact = 
      fullContent.includes('maladie') && 
      (fullContent.includes('impact') || fullContent.includes('expérience') || fullContent.includes('experience'));

    report.medicalContentCheck.hasPratiquesCliniques = 
      fullContent.includes('pratique') && 
      (fullContent.includes('clinique') || fullContent.includes('palpation') || fullContent.includes('imagerie'));

    // Vérifier si tous les aspects médicaux sont couverts
    const medicalChecks = Object.values(report.medicalContentCheck);
    if (!medicalChecks.every(check => check)) {
      report.isCompliant = false;
      report.missingElements.push('Contenu médical incomplet pour IC-1');
    }
  }

  private static generateRecommendations(report: IC1CompletenessReport) {
    console.log('💡 Génération des recommandations...');
    
    if (!report.medicalContentCheck.hasRelationMedecinMalade) {
      report.recommendations.push('Ajouter du contenu sur la relation médecin-malade');
    }
    
    if (!report.medicalContentCheck.hasCorpsHumainDimensions) {
      report.recommendations.push('Inclure les dimensions humaines du corps (alimentation, activité physique, genre, procréation)');
    }
    
    if (!report.medicalContentCheck.hasMaladiesImpact) {
      report.recommendations.push('Développer l\'impact des maladies sur l\'expérience corporelle');
    }
    
    if (!report.medicalContentCheck.hasPratiquesCliniques) {
      report.recommendations.push('Ajouter les pratiques cliniques (palpation, imagerie, analyses biologiques)');
    }

    if (report.contentAnalysis.rangA.competencesCount < 3) {
      report.recommendations.push('Rang A: Ajouter plus de compétences (minimum 3-4 attendues)');
    }

    if (report.contentAnalysis.rangB.competencesCount < 3) {
      report.recommendations.push('Rang B: Ajouter plus de compétences (minimum 3-4 attendues)');
    }

    if (report.contentAnalysis.rangA.missingCompetences.length > 0) {
      report.recommendations.push(`Rang A manque: ${report.contentAnalysis.rangA.missingCompetences.join(', ')}`);
    }

    if (report.contentAnalysis.rangB.missingCompetences.length > 0) {
      report.recommendations.push(`Rang B manque: ${report.contentAnalysis.rangB.missingCompetences.join(', ')}`);
    }
  }

  static displayReport(report: IC1CompletenessReport) {
    console.log('\n📋 RAPPORT DE COMPLÉTUDE IC-1');
    console.log('================================');
    
    console.log(`\n✅ Conformité globale: ${report.isCompliant ? 'OUI' : 'NON'}`);
    
    if (report.missingElements.length > 0) {
      console.log('\n❌ Éléments manquants:');
      report.missingElements.forEach(element => console.log(`  • ${element}`));
    }

    console.log('\n📊 Analyse du contenu:');
    console.log(`  Rang A: ${report.contentAnalysis.rangA.competencesCount} compétences`);
    console.log(`  Rang B: ${report.contentAnalysis.rangB.competencesCount} compétences`);

    console.log('\n🏥 Contenu médical:');
    console.log(`  Relation médecin-malade: ${report.medicalContentCheck.hasRelationMedecinMalade ? '✅' : '❌'}`);
    console.log(`  Dimensions du corps: ${report.medicalContentCheck.hasCorpsHumainDimensions ? '✅' : '❌'}`);
    console.log(`  Impact des maladies: ${report.medicalContentCheck.hasMaladiesImpact ? '✅' : '❌'}`);
    console.log(`  Pratiques cliniques: ${report.medicalContentCheck.hasPratiquesCliniques ? '✅' : '❌'}`);

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommandations:');
      report.recommendations.forEach(rec => console.log(`  • ${rec}`));
    }
  }
}

// Export pour utilisation en script standalone
export async function runIC1CompletenessAudit() {
  try {
    const report = await IC1CompletenessAuditor.auditIC1Completeness();
    IC1CompletenessAuditor.displayReport(report);
    return report;
  } catch (error) {
    console.error('❌ Échec de l\'audit IC-1:', error);
    throw error;
  }
}
