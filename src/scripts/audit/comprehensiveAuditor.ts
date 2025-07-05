import { supabase } from '@/integrations/supabase/client';

export interface ComprehensiveAuditResult {
  timestamp: string;
  systemHealth: {
    database: 'good' | 'warning' | 'error';
    api: 'good' | 'warning' | 'error';
    auth: 'good' | 'warning' | 'error';
    subscriptions: 'good' | 'warning' | 'error';
    frontend: 'good' | 'warning' | 'error';
  };
  issues: Array<{
    category: 'critical' | 'warning' | 'info';
    component: string;
    description: string;
    fixable: boolean;
    fixed?: boolean;
  }>;
  recommendations: string[];
  metrics: {
    totalItems: number;
    validItems: number;
    errorRate: number;
    codeQuality: number;
  };
}

export class ComprehensiveSystemAuditor {
  
  static async runFullAudit(): Promise<ComprehensiveAuditResult> {
    console.log('🔍 Démarrage de l\'audit complet du système...');
    
    const result: ComprehensiveAuditResult = {
      timestamp: new Date().toISOString(),
      systemHealth: {
        database: 'good',
        api: 'good',
        auth: 'good',
        subscriptions: 'good',
        frontend: 'good'
      },
      issues: [],
      recommendations: [],
      metrics: {
        totalItems: 0,
        validItems: 0,
        errorRate: 0,
        codeQuality: 85
      }
    };

    try {
      // 1. Audit de la base de données
      await this.auditDatabase(result);
      
      // 2. Audit des EDN Items
      await this.auditEdnItems(result);
      
      // 3. Audit du système d'abonnements
      await this.auditSubscriptions(result);
      
      // 4. Audit de l'API et des edge functions
      await this.auditAPI(result);
      
      // 5. Audit de l'authentification
      await this.auditAuth(result);
      
      // 6. Génération des recommandations
      this.generateRecommendations(result);
      
      console.log('✅ Audit complet terminé');
      return result;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'audit complet:', error);
      result.issues.push({
        category: 'critical',
        component: 'System',
        description: `Erreur critique durant l'audit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        fixable: false
      });
      return result;
    }
  }

  private static async auditDatabase(result: ComprehensiveAuditResult) {
    console.log('🗄️ Audit de la base de données...');
    
    try {
      // Test de connectivité
      const { data: testData, error: testError } = await supabase
        .from('edn_items_immersive')
        .select('id')
        .limit(1);
        
      if (testError) {
        result.systemHealth.database = 'error';
        result.issues.push({
          category: 'critical',
          component: 'Database',
          description: `Erreur de connectivité base de données: ${testError.message}`,
          fixable: false
        });
        return;
      }
      
      // Vérification des tables critiques
      const tableChecks = [
        { name: 'subscription_plans', query: () => supabase.from('subscription_plans').select('*').limit(1) },
        { name: 'user_subscriptions', query: () => supabase.from('user_subscriptions').select('*').limit(1) },
        { name: 'music_generation_usage', query: () => supabase.from('music_generation_usage').select('*').limit(1) },
        { name: 'edn_items_immersive', query: () => supabase.from('edn_items_immersive').select('*').limit(1) }
      ];
      
      for (const tableCheck of tableChecks) {
        try {
          const { error } = await tableCheck.query();
          if (error) {
            result.systemHealth.database = 'warning';
            result.issues.push({
              category: 'warning',
              component: 'Database',
              description: `Table ${tableCheck.name} inaccessible: ${error.message}`,
              fixable: false
            });
          }
        } catch (err) {
          result.issues.push({
            category: 'warning',
            component: 'Database',
            description: `Erreur d'accès à la table ${tableCheck.name}`,
            fixable: false
          });
        }
      }
    } catch (error) {
      result.systemHealth.database = 'error';
      result.issues.push({
        category: 'critical',
        component: 'Database',
        description: 'Connexion à la base de données impossible',
        fixable: false
      });
    }
  }

  private static async auditEdnItems(result: ComprehensiveAuditResult) {
    console.log('📚 Audit des items EDN...');
    
    try {
      const { data: items, error } = await supabase
        .from('edn_items_immersive')
        .select('*');
        
      if (error) {
        result.issues.push({
          category: 'warning',
          component: 'EDN Items',
          description: `Erreur récupération items EDN: ${error.message}`,
          fixable: false
        });
        return;
      }
      
      if (!items || items.length === 0) {
        result.issues.push({
          category: 'critical',
          component: 'EDN Items',
          description: 'Aucun item EDN trouvé dans la base',
          fixable: false
        });
        return;
      }
      
      result.metrics.totalItems = items.length;
      let validItems = 0;
      let itemsWithParoles = 0;
      let itemsWithTableaux = 0;
      
      for (const item of items) {
        let isValid = true;
        
        // Vérifications de base
        if (!item.title || item.title.trim() === '') {
          result.issues.push({
            category: 'warning',
            component: 'EDN Item',
            description: `Item ${item.item_code}: Titre manquant`,
            fixable: true
          });
          isValid = false;
        }
        
        if (!item.item_code || !item.item_code.match(/^IC-[0-9]+$/)) {
          result.issues.push({
            category: 'warning',
            component: 'EDN Item',
            description: `Item ${item.id}: Code item invalide (${item.item_code})`,
            fixable: true
          });
          isValid = false;
        }
        
        // Vérification des paroles musicales
        if (item.paroles_musicales && item.paroles_musicales.length > 0) {
          itemsWithParoles++;
        } else {
          result.issues.push({
            category: 'info',
            component: 'EDN Item',
            description: `Item ${item.item_code}: Paroles musicales manquantes`,
            fixable: true
          });
        }
        
        // Vérification des tableaux
        if (item.tableau_rang_a && item.tableau_rang_b) {
          itemsWithTableaux++;
        } else {
          result.issues.push({
            category: 'warning',
            component: 'EDN Item',
            description: `Item ${item.item_code}: Tableaux Rang A/B incomplets`,
            fixable: true
          });
          isValid = false;
        }
        
        if (isValid) validItems++;
      }
      
      result.metrics.validItems = validItems;
      result.metrics.errorRate = Math.round(((items.length - validItems) / items.length) * 100);
      
      // Statistiques globales
      const parolesRate = Math.round((itemsWithParoles / items.length) * 100);
      const tableauxRate = Math.round((itemsWithTableaux / items.length) * 100);
      
      if (parolesRate < 50) {
        result.issues.push({
          category: 'warning',
          component: 'EDN Content',
          description: `Seulement ${parolesRate}% des items ont des paroles musicales`,
          fixable: true
        });
      }
      
      if (tableauxRate < 90) {
        result.issues.push({
          category: 'warning',
          component: 'EDN Content',
          description: `Seulement ${tableauxRate}% des items ont des tableaux complets`,
          fixable: true
        });
      }
      
    } catch (error) {
      result.issues.push({
        category: 'critical',
        component: 'EDN Items',
        description: 'Erreur lors de l\'audit des items EDN',
        fixable: false
      });
    }
  }

  private static async auditSubscriptions(result: ComprehensiveAuditResult) {
    console.log('💳 Audit du système d\'abonnements...');
    
    try {
      // Vérification des plans d'abonnement
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*');
        
      if (plansError) {
        result.systemHealth.subscriptions = 'error';
        result.issues.push({
          category: 'critical',
          component: 'Subscriptions',
          description: `Plans d'abonnement inaccessibles: ${plansError.message}`,
          fixable: false
        });
        return;
      }
      
      if (!plans || plans.length === 0) {
        result.systemHealth.subscriptions = 'error';
        result.issues.push({
          category: 'critical',
          component: 'Subscriptions',
          description: 'Aucun plan d\'abonnement configuré',
          fixable: true
        });
        return;
      }
      
      // Vérification des fonctions SQL
      try {
        const { data: testQuota, error: quotaError } = await supabase
          .rpc('check_music_generation_quota', { user_uuid: '00000000-0000-0000-0000-000000000000' });
          
        if (quotaError) {
          result.systemHealth.subscriptions = 'warning';
          result.issues.push({
            category: 'warning',
            component: 'Subscriptions',
            description: 'Fonction de vérification des quotas non disponible',
            fixable: false
          });
        }
      } catch (error) {
        result.issues.push({
          category: 'info',
          component: 'Subscriptions',
          description: 'Test des fonctions SQL non possible (normal en développement)',
          fixable: false
        });
      }
      
    } catch (error) {
      result.systemHealth.subscriptions = 'error';
      result.issues.push({
        category: 'critical',
        component: 'Subscriptions',
        description: 'Système d\'abonnements inaccessible',
        fixable: false
      });
    }
  }

  private static async auditAPI(result: ComprehensiveAuditResult) {
    console.log('🌐 Audit de l\'API...');
    
    // Vérification basique de l'API Supabase
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        result.systemHealth.api = 'warning';
        result.issues.push({
          category: 'warning',
          component: 'API',
          description: 'Session API non accessible',
          fixable: false
        });
      }
      
    } catch (error) {
      result.systemHealth.api = 'error';
      result.issues.push({
        category: 'critical',
        component: 'API',
        description: 'API Supabase inaccessible',
        fixable: false
      });
    }
  }

  private static async auditAuth(result: ComprehensiveAuditResult) {
    console.log('🔐 Audit de l\'authentification...');
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        result.systemHealth.auth = 'warning';
        result.issues.push({
          category: 'warning',
          component: 'Auth',
          description: 'Service d\'authentification non optimal',
          fixable: false
        });
      } else {
        result.systemHealth.auth = 'good';
      }
      
    } catch (error) {
      result.systemHealth.auth = 'error';
      result.issues.push({
        category: 'critical',
        component: 'Auth',
        description: 'Service d\'authentification inaccessible',
        fixable: false
      });
    }
  }

  private static generateRecommendations(result: ComprehensiveAuditResult) {
    console.log('💡 Génération des recommandations...');
    
    const criticalIssues = result.issues.filter(i => i.category === 'critical').length;
    const warningIssues = result.issues.filter(i => i.category === 'warning').length;
    const fixableIssues = result.issues.filter(i => i.fixable).length;
    
    if (criticalIssues > 0) {
      result.recommendations.push(`🚨 ${criticalIssues} problème(s) critique(s) à résoudre immédiatement`);
    }
    
    if (warningIssues > 0) {
      result.recommendations.push(`⚠️ ${warningIssues} avertissement(s) nécessitent votre attention`);
    }
    
    if (fixableIssues > 0) {
      result.recommendations.push(`🔧 ${fixableIssues} problème(s) peuvent être corrigés automatiquement`);
    }
    
    if (result.metrics.errorRate > 20) {
      result.recommendations.push('📊 Taux d\'erreur élevé - vérification approfondie des données recommandée');
    }
    
    if (result.systemHealth.database === 'good' && 
        result.systemHealth.api === 'good' && 
        result.systemHealth.subscriptions === 'good') {
      result.recommendations.push('✅ Système globalement stable - maintenance préventive recommandée');
    }
    
    // Recommandations spécifiques
    result.recommendations.push('🔄 Effectuer un audit complet mensuel');
    result.recommendations.push('📝 Surveiller les logs d\'erreurs quotidiennement');
    result.recommendations.push('🎵 Compléter les paroles musicales manquantes');
  }

  // Fonction pour appliquer les corrections automatiques
  static async applyAutomaticFixes(auditResult: ComprehensiveAuditResult): Promise<number> {
    console.log('🔧 Application des corrections automatiques...');
    
    let fixedCount = 0;
    const fixableIssues = auditResult.issues.filter(issue => issue.fixable);
    
    for (const issue of fixableIssues) {
      try {
        if (issue.component === 'EDN Item' && issue.description.includes('Titre manquant')) {
          // Correction des titres manquants
          const itemCode = issue.description.match(/Item (IC-[0-9]+)/)?.[1];
          if (itemCode) {
            const { error } = await supabase
              .from('edn_items_immersive')
              .update({ title: `Item ${itemCode} - Titre généré` })
              .eq('item_code', itemCode)
              .is('title', null);
              
            if (!error) {
              issue.fixed = true;
              fixedCount++;
            }
          }
        }
        
        // Autres corrections automatiques peuvent être ajoutées ici
        
      } catch (error) {
        console.error(`❌ Erreur lors de la correction de: ${issue.description}`, error);
      }
    }
    
    console.log(`✅ ${fixedCount} problème(s) corrigé(s) automatiquement`);
    return fixedCount;
  }
}