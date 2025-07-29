#!/usr/bin/env node

/**
 * 🔍 MED-MNG Completeness Audit Script
 * 
 * Script automatisé pour vérifier la complétude des items EDN
 * Vérifie que tous les tableaux A/B, BD, romans, QCM sont présents
 * Génère des alertes et bloque le déploiement si nécessaire
 */

import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import { writeFileSync } from 'fs';

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error(chalk.red('❌ SUPABASE_SERVICE_ROLE_KEY required'));
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Critères de complétude
const COMPLETENESS_CRITERIA = {
  tableau_rang_a: {
    weight: 25,
    check: (item) => {
      if (!item.tableau_rang_a) return false;
      const tableau = typeof item.tableau_rang_a === 'string' 
        ? JSON.parse(item.tableau_rang_a) 
        : item.tableau_rang_a;
      return tableau?.title && tableau?.sections?.length > 0;
    }
  },
  tableau_rang_b: {
    weight: 25,
    check: (item) => {
      if (!item.tableau_rang_b) return false;
      const tableau = typeof item.tableau_rang_b === 'string' 
        ? JSON.parse(item.tableau_rang_b) 
        : item.tableau_rang_b;
      return tableau?.title && tableau?.sections?.length > 0;
    }
  },
  quiz_questions: {
    weight: 20,
    check: (item) => {
      if (!item.quiz_questions) return false;
      const quiz = typeof item.quiz_questions === 'string' 
        ? JSON.parse(item.quiz_questions) 
        : item.quiz_questions;
      return Array.isArray(quiz) && quiz.length >= 2;
    }
  },
  scene_immersive: {
    weight: 15,
    check: (item) => {
      if (!item.scene_immersive) return false;
      const scene = typeof item.scene_immersive === 'string' 
        ? JSON.parse(item.scene_immersive) 
        : item.scene_immersive;
      return scene?.theme && scene?.interactions;
    }
  },
  paroles_musicales: {
    weight: 10,
    check: (item) => {
      return item.paroles_musicales && 
             Array.isArray(item.paroles_musicales) && 
             item.paroles_musicales.length > 0;
    }
  },
  basic_fields: {
    weight: 5,
    check: (item) => {
      return item.item_code && 
             item.title && 
             item.slug;
    }
  }
};

class CompletenessAuditor {
  constructor() {
    this.results = {
      totalItems: 0,
      completeItems: 0,
      incompleteItems: [],
      criticalIssues: [],
      warnings: [],
      averageScore: 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calcule le score de complétude d'un item
   */
  calculateItemScore(item) {
    let totalScore = 0;
    const details = {};

    for (const [criteriaName, criteria] of Object.entries(COMPLETENESS_CRITERIA)) {
      const isValid = criteria.check(item);
      const score = isValid ? criteria.weight : 0;
      totalScore += score;
      
      details[criteriaName] = {
        valid: isValid,
        score: score,
        maxScore: criteria.weight
      };
    }

    return { totalScore, details };
  }

  /**
   * Audit complet de tous les items
   */
  async auditAllItems() {
    console.log(chalk.blue('🔍 Démarrage de l\'audit de complétude MED-MNG...'));
    
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
        throw new Error('Aucun item trouvé dans la base de données');
      }

      console.log(chalk.green(`📊 ${items.length} items à auditer`));

      this.results.totalItems = items.length;
      let totalScores = 0;

      // Audit de chaque item
      for (const item of items) {
        const { totalScore, details } = this.calculateItemScore(item);
        totalScores += totalScore;

        const itemResult = {
          item_code: item.item_code,
          title: item.title,
          score: totalScore,
          maxScore: 100,
          percentage: totalScore,
          details: details,
          status: totalScore >= 90 ? 'complete' : totalScore >= 70 ? 'partial' : 'incomplete'
        };

        if (totalScore >= 90) {
          this.results.completeItems++;
        } else {
          this.results.incompleteItems.push(itemResult);
          
          if (totalScore < 50) {
            this.results.criticalIssues.push({
              item_code: item.item_code,
              issue: `Score critique: ${totalScore}%`,
              severity: 'critical'
            });
          } else if (totalScore < 70) {
            this.results.warnings.push({
              item_code: item.item_code,
              issue: `Score faible: ${totalScore}%`,
              severity: 'warning'
            });
          }
        }

        // Log progressif
        if (totalScore < 70) {
          console.log(chalk.yellow(`⚠️  ${item.item_code}: ${totalScore}% - ${itemResult.status}`));
        }
      }

      this.results.averageScore = Math.round(totalScores / items.length);

    } catch (error) {
      console.error(chalk.red(`❌ Erreur lors de l'audit: ${error.message}`));
      throw error;
    }
  }

  /**
   * Sauvegarde les alertes dans la base
   */
  async saveAlertsToDatabase() {
    console.log(chalk.blue('💾 Sauvegarde des alertes en base...'));

    try {
      // Supprimer les anciennes alertes
      await supabase
        .from('completeness_alerts')
        .delete()
        .eq('alert_type', 'automated_audit');

      // Créer nouvelles alertes
      const alerts = [];

      // Alertes critiques
      for (const issue of this.results.criticalIssues) {
        alerts.push({
          item_code: issue.item_code,
          alert_type: 'automated_audit',
          severity: 'critical',
          message: `Item incomplet: ${issue.issue}`,
          metadata: { audit_timestamp: this.results.timestamp },
          resolved: false
        });
      }

      // Alertes warning
      for (const warning of this.results.warnings) {
        alerts.push({
          item_code: warning.item_code,
          alert_type: 'automated_audit',
          severity: 'warning',
          message: `Item partiellement complet: ${warning.issue}`,
          metadata: { audit_timestamp: this.results.timestamp },
          resolved: false
        });
      }

      if (alerts.length > 0) {
        const { error } = await supabase
          .from('completeness_alerts')
          .insert(alerts);

        if (error) {
          console.error(chalk.red(`❌ Erreur sauvegarde alertes: ${error.message}`));
        } else {
          console.log(chalk.green(`✅ ${alerts.length} alertes sauvegardées`));
        }
      }

    } catch (error) {
      console.error(chalk.red(`❌ Erreur sauvegarde: ${error.message}`));
    }
  }

  /**
   * Génère un rapport détaillé
   */
  generateReport() {
    const report = {
      summary: {
        totalItems: this.results.totalItems,
        completeItems: this.results.completeItems,
        incompleteItems: this.results.incompleteItems.length,
        averageScore: this.results.averageScore,
        completionRate: Math.round((this.results.completeItems / this.results.totalItems) * 100)
      },
      issues: {
        critical: this.results.criticalIssues.length,
        warnings: this.results.warnings.length
      },
      recommendations: this.generateRecommendations(),
      detailedResults: this.results.incompleteItems,
      timestamp: this.results.timestamp
    };

    return report;
  }

  /**
   * Génère des recommandations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.results.criticalIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Corriger les items critiques avant déploiement',
        count: this.results.criticalIssues.length
      });
    }

    if (this.results.warnings.length > 0) {
      recommendations.push({
        priority: 'medium',
        action: 'Compléter les items partiels',
        count: this.results.warnings.length
      });
    }

    const completionRate = (this.results.completeItems / this.results.totalItems) * 100;
    if (completionRate < 80) {
      recommendations.push({
        priority: 'high',
        action: `Améliorer le taux de complétude global (${Math.round(completionRate)}%)`
      });
    }

    return recommendations;
  }

  /**
   * Affiche le rapport dans la console
   */
  displayReport() {
    console.log('\n' + chalk.bold.blue('📊 RAPPORT D\'AUDIT MED-MNG'));
    console.log(chalk.blue('═'.repeat(50)));

    const completionRate = Math.round((this.results.completeItems / this.results.totalItems) * 100);
    
    console.log(chalk.green(`✅ Items complets: ${this.results.completeItems}/${this.results.totalItems} (${completionRate}%)`));
    console.log(chalk.yellow(`⚠️  Items incomplets: ${this.results.incompleteItems.length}`));
    console.log(chalk.red(`🚨 Issues critiques: ${this.results.criticalIssues.length}`));
    console.log(chalk.blue(`📈 Score moyen: ${this.results.averageScore}%`));

    if (this.results.criticalIssues.length > 0) {
      console.log('\n' + chalk.red.bold('🚨 ISSUES CRITIQUES:'));
      this.results.criticalIssues.forEach(issue => {
        console.log(chalk.red(`   • ${issue.item_code}: ${issue.issue}`));
      });
    }

    if (this.results.warnings.length > 0) {
      console.log('\n' + chalk.yellow.bold('⚠️  WARNINGS:'));
      this.results.warnings.slice(0, 10).forEach(warning => {
        console.log(chalk.yellow(`   • ${warning.item_code}: ${warning.issue}`));
      });
      if (this.results.warnings.length > 10) {
        console.log(chalk.yellow(`   ... et ${this.results.warnings.length - 10} autres`));
      }
    }

    console.log('\n' + chalk.blue('═'.repeat(50)));
  }

  /**
   * Détermine si le déploiement doit être bloqué
   */
  shouldBlockDeployment() {
    const completionRate = (this.results.completeItems / this.results.totalItems) * 100;
    const hasCriticalIssues = this.results.criticalIssues.length > 0;
    const lowCompletionRate = completionRate < 70;

    return hasCriticalIssues || lowCompletionRate;
  }
}

/**
 * Fonction principale
 */
async function main() {
  const auditor = new CompletenessAuditor();
  
  try {
    // Audit complet
    await auditor.auditAllItems();
    
    // Sauvegarde en base
    await auditor.saveAlertsToDatabase();
    
    // Génération du rapport
    const report = auditor.generateReport();
    
    // Sauvegarde du rapport JSON
    writeFileSync('audit-report.json', JSON.stringify(report, null, 2));
    console.log(chalk.green('📄 Rapport sauvegardé: audit-report.json'));
    
    // Affichage console
    auditor.displayReport();
    
    // Vérification blocage déploiement
    if (auditor.shouldBlockDeployment()) {
      console.log('\n' + chalk.red.bold('🚫 DÉPLOIEMENT BLOQUÉ'));
      console.log(chalk.red('Veuillez corriger les issues critiques avant de déployer.'));
      process.exit(1);
    } else {
      console.log('\n' + chalk.green.bold('✅ AUDIT RÉUSSI - Déploiement autorisé'));
      process.exit(0);
    }
    
  } catch (error) {
    console.error(chalk.red(`❌ Échec de l'audit: ${error.message}`));
    process.exit(1);
  }
}

// Arguments CLI
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📋 Script d'audit de complétude MED-MNG

Usage:
  node audit-completeness.js [options]

Options:
  --help, -h        Affiche cette aide
  --json-only       Génère seulement le rapport JSON
  --no-block        N'interrompt pas même en cas d'erreur critique

Variables d'environnement:
  SUPABASE_URL              URL Supabase
  SUPABASE_SERVICE_ROLE_KEY Clé service Supabase (required)

Exemples:
  node audit-completeness.js
  node audit-completeness.js --json-only
  SUPABASE_SERVICE_ROLE_KEY=xxx node audit-completeness.js
`);
  process.exit(0);
}

// Démarrage
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}