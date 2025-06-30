
import { supabase } from '@/integrations/supabase/client';

// Connaissances attendues selon E-LiSA officiel
const EXPECTED_IC2_RANG_A = [
  'Identifier les professionnels, compétences et ressources liés à un rôle particulier dans une organisation de santé',
  'Connaître la définition de la pratique médicale et connaître la signification de l\'éthique',
  'Connaître les définitions de normes et de valeurs professionnelles',
  'Connaître l\'organisation sociale et politique de la profession médicale et sa régulation étatique',
  'Connaître les principes de la médecine fondée sur les preuves et de la médecine basée sur la responsabilité et l\'expérience du malade',
  'Connaître les principes de déontologie médicale, connaître la notion de conflit de valeurs et de conflit d\'intérêts'
];

const EXPECTED_IC2_RANG_B = [
  'Connaître l\'organisation de l\'exercice des professionnels de santé en France et leurs statuts',
  'Connaître le rôle des ordres professionnels',
  'Connaître les différents acteurs de la santé et leurs interactions'
];

export async function checkIC2Completeness() {
  console.log('🔍 Vérification complétude IC-2 selon E-LiSA officiel...');
  
  try {
    // Récupérer l'item IC-2
    const { data: ic2Item, error } = await supabase
      .from('edn_items_immersive')
      .select('*')
      .or('item_code.eq.IC-2,slug.eq.valeurs-professionnelles-medecin')
      .single();

    if (error || !ic2Item) {
      console.error('❌ Item IC-2 non trouvé:', error);
      return {
        exists: false,
        itemCode: 'IC-2',
        title: 'Non trouvé',
        slug: 'valeurs-professionnelles-medecin',
        rangA: {
          expected: 6,
          found: 0,
          concepts: [],
          missingConcepts: [...EXPECTED_IC2_RANG_A]
        },
        rangB: {
          expected: 3,
          found: 0,
          concepts: [],
          missingConcepts: [...EXPECTED_IC2_RANG_B]
        },
        completeness: 0,
        recommendations: ['Item IC-2 non trouvé dans la base de données']
      };
    }

    console.log('📦 Item IC-2 trouvé:', ic2Item.item_code || ic2Item.slug);
    
    const report = {
      exists: true,
      itemCode: ic2Item.item_code,
      title: ic2Item.title,
      slug: ic2Item.slug,
      rangA: {
        expected: 6, // Selon E-LiSA: 6 connaissances principales en Rang A
        found: 0,
        concepts: [],
        missingConcepts: [...EXPECTED_IC2_RANG_A]
      },
      rangB: {
        expected: 3, // Selon E-LiSA: 3 connaissances en Rang B
        found: 0,
        concepts: [],
        missingConcepts: [...EXPECTED_IC2_RANG_B]
      },
      completeness: 0,
      recommendations: []
    };

    // Analyser le contenu Rang A
    if (ic2Item.tableau_rang_a) {
      const rangAData = typeof ic2Item.tableau_rang_a === 'string' 
        ? JSON.parse(ic2Item.tableau_rang_a) 
        : ic2Item.tableau_rang_a;

      if (rangAData.lignes && Array.isArray(rangAData.lignes)) {
        report.rangA.found = rangAData.lignes.length;
        
        // Extraire les concepts présents
        rangAData.lignes.forEach((ligne: any, index: number) => {
          const concept = Array.isArray(ligne) ? ligne[0] : ligne.concept || ligne.titre;
          if (concept) {
            report.rangA.concepts.push(concept);
          }
        });

        console.log(`📋 Rang A: ${report.rangA.found} concepts trouvés`);
      }
    }

    // Analyser le contenu Rang B
    if (ic2Item.tableau_rang_b) {
      const rangBData = typeof ic2Item.tableau_rang_b === 'string' 
        ? JSON.parse(ic2Item.tableau_rang_b) 
        : ic2Item.tableau_rang_b;

      if (rangBData.lignes && Array.isArray(rangBData.lignes)) {
        report.rangB.found = rangBData.lignes.length;
        
        // Extraire les concepts présents
        rangBData.lignes.forEach((ligne: any, index: number) => {
          const concept = Array.isArray(ligne) ? ligne[0] : ligne.concept || ligne.titre;
          if (concept) {
            report.rangB.concepts.push(concept);
          }
        });

        console.log(`📋 Rang B: ${report.rangB.found} concepts trouvés`);
      }
    }

    // Calculer la complétude
    const totalExpected = report.rangA.expected + report.rangB.expected;
    const totalFound = report.rangA.found + report.rangB.found;
    report.completeness = Math.round((totalFound / totalExpected) * 100);

    // Générer les recommandations
    if (report.rangA.found < report.rangA.expected) {
      report.recommendations.push(`Rang A: ${report.rangA.expected - report.rangA.found} concepts manquants`);
    }
    
    if (report.rangB.found < report.rangB.expected) {
      report.recommendations.push(`Rang B: ${report.rangB.expected - report.rangB.found} concepts manquants`);
    }

    if (report.completeness < 100) {
      report.recommendations.push('Mettre à jour l\'item IC-2 selon le référentiel E-LiSA officiel');
    }

    // Afficher le rapport
    console.log('\n📊 RAPPORT DE COMPLÉTUDE IC-2');
    console.log('==================================');
    console.log(`📦 Item: ${report.itemCode} - ${report.title}`);
    console.log(`🎯 Complétude globale: ${report.completeness}%`);
    console.log(`📋 Rang A: ${report.rangA.found}/${report.rangA.expected} concepts`);
    console.log(`📋 Rang B: ${report.rangB.found}/${report.rangB.expected} concepts`);
    
    if (report.completeness === 100) {
      console.log('✅ Item IC-2 COMPLET à 100% selon E-LiSA');
    } else {
      console.log('⚠️ Item IC-2 INCOMPLET');
      console.log('\n💡 Recommandations:');
      report.recommendations.forEach(rec => console.log(`  • ${rec}`));
    }

    return report;

  } catch (error) {
    console.error('❌ Erreur lors de la vérification IC-2:', error);
    throw error;
  }
}

// Export pour utilisation directe
export async function runIC2CompletenessCheck() {
  try {
    const report = await checkIC2Completeness();
    return report;
  } catch (error) {
    console.error('❌ Échec de la vérification IC-2:', error);
    throw error;
  }
}
