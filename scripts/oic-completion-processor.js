#!/usr/bin/env node
// scripts/oic-completion-processor.js
// Processeur intelligent pour compléter les compétences OIC manquantes ou incomplètes

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration
const config = {
  supabase: {
    url: process.env.SUPABASE_URL || 'https://yaincoxihiqdksxgrsrk.supabase.co',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  batchSize: 50,
  maxRetries: 3
};

// Mapping des rubriques pour complétion intelligente
const RUBRIQUES_MAP = {
  '01': 'Génétique',
  '02': 'Immunopathologie', 
  '03': 'Inflammation',
  '04': 'Cancérologie',
  '05': 'Pharmacologie',
  '06': 'Douleur',
  '07': 'Santé publique',
  '08': 'Thérapeutique',
  '09': 'Urgences',
  '10': 'Vieillissement',
  '11': 'Interprétation'
};

// Spécialités médicales par plage d'items
const SPECIALITES_MAP = {
  '001-022': 'Fondamentaux médicaux',
  '023-042': 'Gynécologie-Obstétrique',
  '043-065': 'Médecine interne',
  '066-089': 'Psychiatrie',
  '090-120': 'Pédiatrie',
  '121-150': 'Chirurgie',
  '151-180': 'Cardiologie',
  '181-210': 'Pneumologie',
  '211-240': 'Gastroentérologie',
  '241-270': 'Neurologie',
  '271-300': 'Rhumatologie',
  '301-330': 'Cancérologie',
  '331-367': 'Médecine d\'urgence'
};

class OICCompletionProcessor {
  constructor() {
    this.supabase = createClient(config.supabase.url, config.supabase.serviceKey);
    this.stats = {
      total: 0,
      completed: 0,
      errors: 0,
      created: 0,
      updated: 0
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logMessage);
  }

  // Analyser et compléter une compétence incomplète
  completeCompetence(competence) {
    const completed = { ...competence };
    let hasChanges = false;

    // Compléter l'intitulé si manquant
    if (!completed.intitule && completed.objectif_id) {
      completed.intitule = this.generateIntitule(completed.objectif_id);
      hasChanges = true;
    }

    // Compléter la rubrique si manquante
    if (!completed.rubrique && completed.objectif_id) {
      const rubriqueCode = this.extractRubriqueCode(completed.objectif_id);
      if (rubriqueCode && RUBRIQUES_MAP[rubriqueCode]) {
        completed.rubrique = RUBRIQUES_MAP[rubriqueCode];
        hasChanges = true;
      }
    }

    // Compléter la description si manquante
    if (!completed.description && completed.objectif_id) {
      completed.description = this.generateDescription(completed);
      hasChanges = true;
    }

    // Compléter item_parent si manquant
    if (!completed.item_parent && completed.objectif_id) {
      const itemParent = this.extractItemParent(completed.objectif_id);
      if (itemParent) {
        completed.item_parent = itemParent;
        hasChanges = true;
      }
    }

    // Compléter rang si manquant
    if (!completed.rang && completed.objectif_id) {
      const rang = this.extractRang(completed.objectif_id);
      if (rang) {
        completed.rang = rang;
        hasChanges = true;
      }
    }

    // Compléter ordre si manquant
    if (!completed.ordre && completed.objectif_id) {
      const ordre = this.extractOrdre(completed.objectif_id);
      if (ordre) {
        completed.ordre = ordre;
        hasChanges = true;
      }
    }

    // Générer URL source si manquante
    if (!completed.url_source && completed.objectif_id) {
      completed.url_source = `https://livret.uness.fr/lisa/2025/${encodeURIComponent(completed.objectif_id)}`;
      hasChanges = true;
    }

    // Mettre à jour les métadonnées
    if (hasChanges) {
      completed.updated_at = new Date().toISOString();
      completed.extraction_status = 'completed_auto';
    }

    return { completed, hasChanges };
  }

  // Générer un intitulé basé sur l'objectif_id
  generateIntitule(objectifId) {
    const itemMatch = objectifId.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/);
    if (!itemMatch) return `Objectif ${objectifId}`;

    const [, itemNum, rubriqueCode, rang, ordre] = itemMatch;
    const rubrique = RUBRIQUES_MAP[rubriqueCode] || 'Médecine générale';
    const specialite = this.getSpecialiteByItem(itemNum);
    
    return `${specialite} - ${rubrique} (Rang ${rang})`;
  }

  // Générer une description intelligente
  generateDescription(competence) {
    const { objectif_id, intitule, rubrique } = competence;
    const itemMatch = objectif_id?.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/);
    
    if (!itemMatch) return `Compétence médicale ${objectif_id || 'non définie'}`;

    const [, itemNum, rubriqueCode, rang] = itemMatch;
    const specialite = this.getSpecialiteByItem(itemNum);
    const rubriqueNom = rubrique || RUBRIQUES_MAP[rubriqueCode] || 'médecine générale';
    
    const descriptions = {
      'A': `Connaissances fondamentales en ${rubriqueNom.toLowerCase()} dans le contexte de ${specialite.toLowerCase()}. Objectifs de base à maîtriser pour la formation médicale.`,
      'B': `Connaissances approfondies en ${rubriqueNom.toLowerCase()} dans le domaine de ${specialite.toLowerCase()}. Compétences avancées et spécialisées.`
    };

    return descriptions[rang] || `Compétence en ${rubriqueNom.toLowerCase()} - ${specialite}`;
  }

  // Extraire le code rubrique de l'objectif_id
  extractRubriqueCode(objectifId) {
    const match = objectifId.match(/OIC-\d{3}-(\d{2})-[AB]-\d{2}/);
    return match ? match[1] : null;
  }

  // Extraire l'item parent
  extractItemParent(objectifId) {
    const match = objectifId.match(/OIC-(\d{3})-\d{2}-[AB]-\d{2}/);
    return match ? `IC-${match[1]}` : null;
  }

  // Extraire le rang
  extractRang(objectifId) {
    const match = objectifId.match(/OIC-\d{3}-\d{2}-([AB])-\d{2}/);
    return match ? match[1] : null;
  }

  // Extraire l'ordre
  extractOrdre(objectifId) {
    const match = objectifId.match(/OIC-\d{3}-\d{2}-[AB]-(\d{2})/);
    return match ? parseInt(match[1], 10) : null;
  }

  // Obtenir la spécialité par numéro d'item
  getSpecialiteByItem(itemNum) {
    const num = parseInt(itemNum, 10);
    
    for (const [range, specialite] of Object.entries(SPECIALITES_MAP)) {
      const [start, end] = range.split('-').map(n => parseInt(n, 10));
      if (num >= start && num <= end) {
        return specialite;
      }
    }
    
    return 'Médecine générale';
  }

  // Récupérer les compétences incomplètes
  async getIncompleteCompetences() {
    try {
      const { data, error } = await this.supabase
        .from('backup_oic_competences')
        .select('*')
        .or('intitule.is.null,description.is.null,rubrique.is.null,item_parent.is.null,rang.is.null,ordre.is.null')
        .order('objectif_id');

      if (error) throw error;

      this.log(`📋 ${data?.length || 0} compétences incomplètes trouvées`);
      return data || [];
    } catch (error) {
      this.log(`❌ Erreur récupération compétences: ${error.message}`, 'error');
      throw error;
    }
  }

  // Mettre à jour une compétence
  async updateCompetence(competence) {
    try {
      const { error } = await this.supabase
        .from('backup_oic_competences')
        .update(competence)
        .eq('objectif_id', competence.objectif_id);

      if (error) throw error;
      
      this.stats.updated++;
      return true;
    } catch (error) {
      this.log(`❌ Erreur mise à jour ${competence.objectif_id}: ${error.message}`, 'error');
      this.stats.errors++;
      return false;
    }
  }

  // Traiter toutes les compétences incomplètes
  async processIncompleteCompetences() {
    this.log('🚀 Démarrage du processus de complétion OIC');
    
    const incompleteCompetences = await this.getIncompleteCompetences();
    this.stats.total = incompleteCompetences.length;

    if (this.stats.total === 0) {
      this.log('✅ Aucune compétence incomplète trouvée');
      return this.stats;
    }

    this.log(`📊 Traitement de ${this.stats.total} compétences...`);

    // Traiter par batch
    for (let i = 0; i < incompleteCompetences.length; i += config.batchSize) {
      const batch = incompleteCompetences.slice(i, i + config.batchSize);
      await this.processBatch(batch, i / config.batchSize + 1);
      
      // Pause entre les batchs
      if (i + config.batchSize < incompleteCompetences.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.log('🎯 Processus de complétion terminé');
    this.log(`📈 Résultats: ${this.stats.completed}/${this.stats.total} complétées, ${this.stats.errors} erreurs`);

    return this.stats;
  }

  // Traiter un batch de compétences
  async processBatch(batch, batchNumber) {
    this.log(`📦 Batch ${batchNumber}: traitement de ${batch.length} compétences`);

    for (const competence of batch) {
      try {
        const { completed, hasChanges } = this.completeCompetence(competence);
        
        if (hasChanges) {
          const success = await this.updateCompetence(completed);
          if (success) {
            this.stats.completed++;
            this.log(`✅ ${competence.objectif_id} complété`, 'debug');
          }
        } else {
          this.log(`ℹ️ ${competence.objectif_id} déjà complet`, 'debug');
        }
      } catch (error) {
        this.log(`❌ Erreur traitement ${competence.objectif_id}: ${error.message}`, 'error');
        this.stats.errors++;
      }
    }
  }

  // Générer un rapport de complétion
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      processing_date: new Date().toLocaleDateString('fr-FR'),
      statistics: this.stats,
      completion_rate: this.stats.total > 0 ? 
        Math.round((this.stats.completed / this.stats.total) * 100) : 100,
      success_rate: this.stats.total > 0 ? 
        Math.round(((this.stats.completed) / this.stats.total) * 100) : 100,
      recommendations: []
    };

    // Ajouter des recommandations
    if (this.stats.errors > 0) {
      report.recommendations.push(`${this.stats.errors} erreurs détectées - vérifier les logs`);
    }
    
    if (report.completion_rate < 90) {
      report.recommendations.push('Taux de complétion faible - relancer le processus');
    }

    if (this.stats.total === 0) {
      report.recommendations.push('Aucune donnée incomplète - base de données en bon état');
    }

    return report;
  }
}

// Fonction principale
async function main() {
  if (!config.supabase.serviceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant');
    process.exit(1);
  }

  const processor = new OICCompletionProcessor();
  
  try {
    const stats = await processor.processIncompleteCompetences();
    const report = processor.generateReport();
    
    // Sauvegarder le rapport
    const reportFile = `oic-completion-report-${new Date().toISOString().slice(0,10)}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log('\n📊 RAPPORT DE COMPLÉTION');
    console.log('========================');
    console.log(`📅 Date: ${report.processing_date}`);
    console.log(`📈 Complétées: ${stats.completed}/${stats.total}`);
    console.log(`💯 Taux succès: ${report.success_rate}%`);
    console.log(`❌ Erreurs: ${stats.errors}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n🎯 RECOMMANDATIONS:');
      report.recommendations.forEach((rec, i) => {
        console.log(`   ${i+1}. ${rec}`);
      });
    }
    
    console.log(`\n📄 Rapport sauvegardé: ${reportFile}`);
    
    process.exit(stats.errors > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = { OICCompletionProcessor };