/**
 * AUDIT COMPLET DE LA PLATEFORME MED MNG
 * 
 * Teste chaque fonctionnalité, vérifie la cohérence des données,
 * identifie les problèmes et génère un rapport détaillé
 */

import { supabase } from '../../lib/supabase';

export interface AuditIssue {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  issue: string;
  itemCode?: string;
  details?: string;
  fix?: string;
}

export interface ComprehensiveAuditReport {
  timestamp: string;
  totalScore: number;
  maxScore: number;
  issues: AuditIssue[];
  statistics: {
    totalItems: number;
    itemsWithRangA: number;
    itemsWithRangB: number;
    itemsWithOICCompetencesA: number;
    itemsWithOICCompetencesB: number;
    itemsComplete: number;
    averageCompletion: number;
  };
  oicQuality: {
    totalOICCompetences: number;
    qualityCompetencesA: number;
    qualityCompetencesB: number;
    itemsCoveredA: number;
    itemsCoveredB: number;
  };
  recommendations: string[];
}

export class ComprehensivePlatformAuditor {
  
  /**
   * Audit 1 : Structure et présence des données de base
   */
  static async auditDataStructure(): Promise<{ issues: AuditIssue[], score: number }> {
    const issues: AuditIssue[] = [];
    let score = 100;

    try {
      // Vérifier que tous les items ont les champs requis
      const { data: items, error } = await supabase
        .from('edn_items_immersive')
        .select('id, item_code, title, subtitle, tableau_rang_a, tableau_rang_b');

      if (error) {
        issues.push({
          severity: 'critical',
          category: 'Database',
          issue: 'Impossible de récupérer les items EDN',
          details: error.message
        });
        return { issues, score: 0 };
      }

      // Vérifier chaque item
      items?.forEach((item) => {
        if (!item.tableau_rang_a) {
          issues.push({
            severity: 'high',
            category: 'Data',
            issue: 'Item sans tableau Rang A',
            itemCode: item.item_code
          });
          score -= 0.5;
        }

        if (!item.tableau_rang_b) {
          issues.push({
            severity: 'high',
            category: 'Data',
            issue: 'Item sans tableau Rang B',
            itemCode: item.item_code
          });
          score -= 0.5;
        }

        if (!item.title || item.title.length < 10) {
          issues.push({
            severity: 'medium',
            category: 'Data Quality',
            issue: 'Titre item trop court ou manquant',
            itemCode: item.item_code
          });
          score -= 0.2;
        }
      });

    } catch (err) {
      issues.push({
        severity: 'critical',
        category: 'System',
        issue: 'Erreur système lors de l\'audit de structure',
        details: err instanceof Error ? err.message : 'Erreur inconnue'
      });
      score = 0;
    }

    return { issues, score: Math.max(0, score) };
  }

  /**
   * Audit 2 : Vérifier que les sections existent et sont bien formées
   */
  static async auditSections(): Promise<{ issues: AuditIssue[], score: number }> {
    const issues: AuditIssue[] = [];
    let score = 100;

    try {
      const { data: items } = await supabase
        .from('edn_items_immersive')
        .select('item_code, tableau_rang_a, tableau_rang_b');

      items?.forEach((item) => {
        // Vérifier Rang A
        const tableauA = item.tableau_rang_a as any;
        const sectionsA = tableauA?.sections;
        if (!sectionsA || !Array.isArray(sectionsA) || sectionsA.length === 0) {
          issues.push({
            severity: 'high',
            category: 'Sections',
            issue: 'Sections Rang A manquantes ou vides',
            itemCode: item.item_code
          });
          score -= 1;
        }

        // Vérifier Rang B
        const tableauB = item.tableau_rang_b as any;
        const sectionsB = tableauB?.sections;
        if (!sectionsB || !Array.isArray(sectionsB) || sectionsB.length === 0) {
          issues.push({
            severity: 'high',
            category: 'Sections',
            issue: 'Sections Rang B manquantes ou vides',
            itemCode: item.item_code
          });
          score -= 1;
        }
      });

    } catch (err) {
      issues.push({
        severity: 'critical',
        category: 'System',
        issue: 'Erreur lors de l\'audit des sections'
      });
      score = 0;
    }

    return { issues, score: Math.max(0, score) };
  }

  /**
   * Audit 3 : Vérifier la présence de compétences OIC réelles
   */
  static async auditOICCompetences(): Promise<{ issues: AuditIssue[], score: number }> {
    const issues: AuditIssue[] = [];
    let score = 100;

    try {
      const { data: items } = await supabase
        .from('edn_items_immersive')
        .select('item_code, tableau_rang_a, tableau_rang_b');

      items?.forEach((item) => {
        // Vérifier compétences Rang A
        const tableauA = item.tableau_rang_a as any;
        const sectionsA = tableauA?.sections || [];
        const competencesSectionA = sectionsA.find((s: any) => s.title === 'Compétences clés');
        
        if (!competencesSectionA?.competences || competencesSectionA.competences.length === 0) {
          issues.push({
            severity: 'high',
            category: 'OIC',
            issue: 'Aucune compétence OIC Rang A',
            itemCode: item.item_code,
            fix: 'Exécuter la régénération OIC'
          });
          score -= 0.8;
        } else {
          // Vérifier si ce sont de VRAIES compétences OIC (pas génériques)
          const firstComp = competencesSectionA.competences[0];
          if (firstComp?.objectif_id && !firstComp.objectif_id.includes('OIC')) {
            issues.push({
              severity: 'medium',
              category: 'OIC',
              issue: 'Compétences Rang A probablement génériques (pas OIC réelles)',
              itemCode: item.item_code,
              fix: 'Exécuter la régénération OIC'
            });
            score -= 0.5;
          }
        }

        // Vérifier compétences Rang B
        const tableauB = item.tableau_rang_b as any;
        const sectionsB = tableauB?.sections || [];
        const competencesSectionB = sectionsB.find((s: any) => s.title === 'Compétences clés' || s.title === 'Compétences expertes');
        
        if (!competencesSectionB?.competences || competencesSectionB.competences.length === 0) {
          issues.push({
            severity: 'high',
            category: 'OIC',
            issue: 'Aucune compétence OIC Rang B',
            itemCode: item.item_code,
            fix: 'Exécuter la régénération OIC'
          });
          score -= 0.8;
        }
      });

    } catch (err) {
      issues.push({
        severity: 'critical',
        category: 'System',
        issue: 'Erreur lors de l\'audit des compétences OIC'
      });
      score = 0;
    }

    return { issues, score: Math.max(0, score) };
  }

  /**
   * Audit 4 : Vérifier la qualité des données OIC dans backup_oic_competences
   */
  static async auditOICDataQuality(): Promise<{ issues: AuditIssue[], score: number }> {
    const issues: AuditIssue[] = [];
    let score = 100;

    try {
      const { data: oicCompetences } = await supabase
        .from('backup_oic_competences')
        .select('item_parent, rang, intitule, description');

      if (!oicCompetences || oicCompetences.length === 0) {
        issues.push({
          severity: 'critical',
          category: 'OIC Data',
          issue: 'Table backup_oic_competences vide ou inaccessible',
          fix: 'Vérifier l\'import des données OIC'
        });
        return { issues, score: 0 };
      }

      // Compter les compétences de qualité par rang
      const qualityA = oicCompetences.filter(c => 
        c.rang === 'A' && 
        c.intitule?.length >= 15 && 
        c.description?.length >= 20
      );

      const qualityB = oicCompetences.filter(c => 
        c.rang === 'B' && 
        c.intitule?.length >= 15 && 
        c.description?.length >= 20
      );

      const percentageA = (qualityA.length / oicCompetences.filter(c => c.rang === 'A').length) * 100;
      const percentageB = (qualityB.length / oicCompetences.filter(c => c.rang === 'B').length) * 100;

      if (percentageA < 70) {
        issues.push({
          severity: 'high',
          category: 'OIC Data Quality',
          issue: `Seulement ${percentageA.toFixed(1)}% des compétences Rang A sont de qualité`,
          details: `${qualityA.length} compétences de qualité sur ${oicCompetences.filter(c => c.rang === 'A').length} total`,
          fix: 'Enrichir les données OIC dans backup_oic_competences'
        });
        score -= 20;
      }

      if (percentageB < 70) {
        issues.push({
          severity: 'high',
          category: 'OIC Data Quality',
          issue: `Seulement ${percentageB.toFixed(1)}% des compétences Rang B sont de qualité`,
          details: `${qualityB.length} compétences de qualité sur ${oicCompetences.filter(c => c.rang === 'B').length} total`,
          fix: 'Enrichir les données OIC dans backup_oic_competences'
        });
        score -= 20;
      }

    } catch (err) {
      issues.push({
        severity: 'critical',
        category: 'System',
        issue: 'Erreur lors de l\'audit qualité OIC'
      });
      score = 0;
    }

    return { issues, score: Math.max(0, score) };
  }

  /**
   * Audit 5 : Vérifier les items sans compétences OIC dans backup
   */
  static async auditMissingOICItems(): Promise<{ issues: AuditIssue[], score: number }> {
    const issues: AuditIssue[] = [];
    let score = 100;

    try {
      const { data: items } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title');

      const { data: oicCompetences } = await supabase
        .from('backup_oic_competences')
        .select('item_parent, rang, intitule, description');

      // Indexer les compétences OIC de qualité par item et rang
      const oicByItemRang = new Map<string, number>();
      oicCompetences?.forEach(comp => {
        if (comp.intitule?.length >= 15 && comp.description?.length >= 20) {
          const key = `${comp.item_parent}_${comp.rang}`;
          oicByItemRang.set(key, (oicByItemRang.get(key) || 0) + 1);
        }
      });

      // Vérifier chaque item
      items?.forEach(item => {
        const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
        const countA = oicByItemRang.get(`${itemNumber}_A`) || 0;
        const countB = oicByItemRang.get(`${itemNumber}_B`) || 0;

        if (countA === 0) {
          issues.push({
            severity: 'high',
            category: 'Missing OIC',
            issue: 'Aucune compétence OIC Rang A de qualité dans backup',
            itemCode: item.item_code,
            details: item.title,
            fix: 'Générer ou importer des compétences OIC Rang A'
          });
          score -= 1;
        }

        if (countB === 0) {
          issues.push({
            severity: 'high',
            category: 'Missing OIC',
            issue: 'Aucune compétence OIC Rang B de qualité dans backup',
            itemCode: item.item_code,
            details: item.title,
            fix: 'Générer ou importer des compétences OIC Rang B'
          });
          score -= 1;
        }
      });

    } catch (err) {
      issues.push({
        severity: 'critical',
        category: 'System',
        issue: 'Erreur lors de l\'audit des items manquants'
      });
      score = 0;
    }

    return { issues, score: Math.max(0, score) };
  }

  /**
   * Audit Complet - Exécute tous les audits
   */
  static async runComprehensiveAudit(): Promise<ComprehensiveAuditReport> {
    console.log('🚀 Lancement de l\'audit complet de la plateforme...');

    const allIssues: AuditIssue[] = [];
    let totalScore = 0;
    const maxScore = 500; // 5 audits x 100 points

    // Exécuter tous les audits
    const [
      structureResult,
      sectionsResult,
      oicCompetencesResult,
      oicQualityResult,
      missingOICResult
    ] = await Promise.all([
      this.auditDataStructure(),
      this.auditSections(),
      this.auditOICCompetences(),
      this.auditOICDataQuality(),
      this.auditMissingOICItems()
    ]);

    // Agréger les résultats
    allIssues.push(...structureResult.issues);
    allIssues.push(...sectionsResult.issues);
    allIssues.push(...oicCompetencesResult.issues);
    allIssues.push(...oicQualityResult.issues);
    allIssues.push(...missingOICResult.issues);

    totalScore = structureResult.score + sectionsResult.score + oicCompetencesResult.score + 
                 oicQualityResult.score + missingOICResult.score;

    // Récupérer les statistiques
    const statistics = await this.getStatistics();
    const oicQuality = await this.getOICQualityStats();

    // Générer des recommandations
    const recommendations = this.generateRecommendations(allIssues, statistics, oicQuality);

    return {
      timestamp: new Date().toISOString(),
      totalScore: Math.round(totalScore),
      maxScore,
      issues: allIssues,
      statistics,
      oicQuality,
      recommendations
    };
  }

  /**
   * Récupérer les statistiques générales
   */
  private static async getStatistics() {
    const { data: items } = await supabase
      .from('edn_items_immersive')
      .select('tableau_rang_a, tableau_rang_b');

    const totalItems = items?.length || 0;
    let itemsWithOICCompetencesA = 0;
    let itemsWithOICCompetencesB = 0;

    items?.forEach(item => {
      const tableauA = item.tableau_rang_a as any;
      const tableauB = item.tableau_rang_b as any;
      const sectionsA = tableauA?.sections || [];
      const sectionsB = tableauB?.sections || [];

      const hasCompA = sectionsA.some((s: any) => 
        s.title === 'Compétences clés' && s.competences?.length > 0
      );
      const hasCompB = sectionsB.some((s: any) => 
        (s.title === 'Compétences clés' || s.title === 'Compétences expertes') && s.competences?.length > 0
      );

      if (hasCompA) itemsWithOICCompetencesA++;
      if (hasCompB) itemsWithOICCompetencesB++;
    });

    return {
      totalItems,
      itemsWithRangA: items?.filter(i => (i.tableau_rang_a as any)?.sections?.length > 0).length || 0,
      itemsWithRangB: items?.filter(i => (i.tableau_rang_b as any)?.sections?.length > 0).length || 0,
      itemsWithOICCompetencesA,
      itemsWithOICCompetencesB,
      itemsComplete: Math.min(itemsWithOICCompetencesA, itemsWithOICCompetencesB),
      averageCompletion: ((itemsWithOICCompetencesA + itemsWithOICCompetencesB) / (totalItems * 2)) * 100
    };
  }

  /**
   * Récupérer les statistiques de qualité OIC
   */
  private static async getOICQualityStats() {
    const { data: oicCompetences } = await supabase
      .from('backup_oic_competences')
      .select('item_parent, rang, intitule, description');

    const totalOICCompetences = oicCompetences?.length || 0;
    const qualityCompetencesA = oicCompetences?.filter(c => 
      c.rang === 'A' && c.intitule?.length >= 15 && c.description?.length >= 20
    ).length || 0;
    const qualityCompetencesB = oicCompetences?.filter(c => 
      c.rang === 'B' && c.intitule?.length >= 15 && c.description?.length >= 20
    ).length || 0;

    const itemsCoveredA = new Set(
      oicCompetences?.filter(c => c.rang === 'A' && c.intitule?.length >= 15).map(c => c.item_parent)
    ).size;
    const itemsCoveredB = new Set(
      oicCompetences?.filter(c => c.rang === 'B' && c.intitule?.length >= 15).map(c => c.item_parent)
    ).size;

    return {
      totalOICCompetences,
      qualityCompetencesA,
      qualityCompetencesB,
      itemsCoveredA,
      itemsCoveredB
    };
  }

  /**
   * Générer des recommandations basées sur les problèmes détectés
   */
  private static generateRecommendations(
    issues: AuditIssue[], 
    statistics: any, 
    oicQuality: any
  ): string[] {
    const recommendations: string[] = [];

    // Recommandation 1: Régénération OIC
    const oicIssues = issues.filter(i => i.category === 'OIC' || i.category === 'Missing OIC');
    if (oicIssues.length > 50) {
      recommendations.push(
        `🔴 CRITIQUE: ${oicIssues.length} items ont des problèmes de compétences OIC. ` +
        `Exécuter la régénération OIC depuis le panel d'audit pour remplacer le contenu générique par les vraies compétences.`
      );
    }

    // Recommandation 2: Enrichissement données
    if (oicQuality.qualityCompetencesA < 2000 || oicQuality.qualityCompetencesB < 1500) {
      recommendations.push(
        `⚠️ Qualité des données OIC insuffisante. ` +
        `Rang A: ${oicQuality.qualityCompetencesA} compétences de qualité (objectif: 2000+). ` +
        `Rang B: ${oicQuality.qualityCompetencesB} compétences de qualité (objectif: 1500+).`
      );
    }

    // Recommandation 3: Items incomplets
    const completionRate = (statistics.itemsComplete / statistics.totalItems) * 100;
    if (completionRate < 100) {
      recommendations.push(
        `📊 Seulement ${completionRate.toFixed(1)}% des items (${statistics.itemsComplete}/${statistics.totalItems}) ` +
        `ont des compétences complètes (Rang A + Rang B). Objectif: 100%.`
      );
    }

    // Recommandation 4: Sections
    const sectionIssues = issues.filter(i => i.category === 'Sections');
    if (sectionIssues.length > 0) {
      recommendations.push(
        `🔧 ${sectionIssues.length} items ont des sections manquantes ou mal formées. ` +
        `Exécuter la fonction transform-edn-sections pour corriger.`
      );
    }

    // Recommandation finale
    if (recommendations.length === 0) {
      recommendations.push('✅ La plateforme est en excellent état ! Tous les audits sont passés avec succès.');
    } else {
      recommendations.push(
        `\n🎯 OBJECTIF: Atteindre 100% de compétences OIC réelles pour les ${statistics.totalItems} items EDN.`
      );
    }

    return recommendations;
  }
}
