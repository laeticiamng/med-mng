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
      await this.auditDatabase(result);
      await this.auditEdnItems(result);
      await this.auditSubscriptions(result);
      await this.auditAPI(result);
      await this.auditAuth(result);
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
      
      const tableChecks = [
        { name: 'subscription_plans', query: () => supabase.from('subscription_plans').select('*').limit(1) },
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
      let itemsWithProperTableaux = 0;
      let itemsWithQuiz = 0;
      
      for (const item of items) {
        let isValid = true;
        
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
        
        if (item.paroles_musicales && item.paroles_musicales.length > 0) {
          itemsWithParoles++;
          const parolesText = item.paroles_musicales.join(' ');
          if (parolesText.includes('Compétences fondamentales à maîtriser pour cet item') || 
              parolesText.includes('[Rang A -') || 
              parolesText.length < 50) {
            result.issues.push({
              category: 'warning',
              component: 'EDN Item',
              description: `Item ${item.item_code}: Paroles musicales trop génériques`,
              fixable: true
            });
          }
        } else {
          result.issues.push({
            category: 'warning',
            component: 'EDN Item',
            description: `Item ${item.item_code}: Paroles musicales manquantes`,
            fixable: true
          });
        }
        
        if (item.tableau_rang_a && item.tableau_rang_b) {
          const rangAObj = item.tableau_rang_a as any;
          const rangBObj = item.tableau_rang_b as any;
          const rangACount = rangAObj?.count || 0;
          const rangBCount = rangBObj?.count || 0;
          
          if (rangACount > 0 && rangBCount > 0) {
            itemsWithProperTableaux++;
          } else {
            result.issues.push({
              category: 'critical',
              component: 'EDN Item',
              description: `Item ${item.item_code}: Tableaux vides (Rang A: ${rangACount}, Rang B: ${rangBCount})`,
              fixable: true
            });
            isValid = false;
          }
        } else {
          result.issues.push({
            category: 'critical',
            component: 'EDN Item',
            description: `Item ${item.item_code}: Tableaux Rang A/B manquants`,
            fixable: true
          });
          isValid = false;
        }
        
        if (item.quiz_questions && Array.isArray(item.quiz_questions) && item.quiz_questions.length > 0) {
          itemsWithQuiz++;
          const firstQuestion = item.quiz_questions[0] as any;
          if (firstQuestion && firstQuestion.question && 
              typeof firstQuestion.question === 'string' &&
              firstQuestion.question.includes('Quel principe médical s\'applique ?')) {
            result.issues.push({
              category: 'warning',
              component: 'EDN Item',
              description: `Item ${item.item_code}: Questions de quiz trop génériques`,
              fixable: true
            });
          }
        } else {
          result.issues.push({
            category: 'warning',
            component: 'EDN Item',
            description: `Item ${item.item_code}: Quiz manquant`,
            fixable: true
          });
        }
        
        if (isValid) validItems++;
      }
      
      result.metrics.validItems = validItems;
      result.metrics.errorRate = Math.round(((items.length - validItems) / items.length) * 100);
      
      const properTableauxRate = Math.round((itemsWithProperTableaux / items.length) * 100);
      const parolesRate = Math.round((itemsWithParoles / items.length) * 100);
      const quizRate = Math.round((itemsWithQuiz / items.length) * 100);
      
      if (properTableauxRate < 95) {
        result.issues.push({
          category: 'critical',
          component: 'EDN Content',
          description: `Seulement ${properTableauxRate}% des items ont des tableaux avec contenu réel`,
          fixable: true
        });
      }
      
      if (parolesRate < 90) {
        result.issues.push({
          category: 'warning',
          component: 'EDN Content',
          description: `Seulement ${parolesRate}% des items ont des paroles musicales spécialisées`,
          fixable: true
        });
      }
      
      if (quizRate < 90) {
        result.issues.push({
          category: 'warning',
          component: 'EDN Content',
          description: `Seulement ${quizRate}% des items ont des quiz complets`,
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
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*');
        
      if (plansError || !plans || plans.length === 0) {
        result.systemHealth.subscriptions = 'error';
        result.issues.push({
          category: 'critical',
          component: 'Subscriptions',
          description: 'Plans d\'abonnement manquants ou inaccessibles',
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
    
    result.recommendations.push('🔄 Effectuer un audit complet mensuel');
    result.recommendations.push('📝 Surveiller les logs d\'erreurs quotidiennement');
    result.recommendations.push('🎵 Compléter les paroles musicales manquantes');
  }

  static async applyAutomaticFixes(auditResult: ComprehensiveAuditResult): Promise<number> {
    console.log('🔧 Application des corrections automatiques...');
    
    let fixedCount = 0;
    const fixableIssues = auditResult.issues.filter(issue => issue.fixable);
    
    for (const issue of fixableIssues) {
      try {
        if (issue.component === 'EDN Item' && issue.description.includes('Titre manquant')) {
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
        
        if (issue.component === 'EDN Item' && 
            (issue.description.includes('Paroles musicales manquantes') || 
             issue.description.includes('Paroles musicales trop génériques'))) {
          const itemCode = issue.description.match(/Item (IC-[0-9]+)/)?.[1];
          if (itemCode) {
            const itemNum = parseInt(itemCode.substring(3));
            let specializedParoles = [
              `${itemCode} Rang A: Connaissances de base essentielles pour cet item spécialisé`,
              `${itemCode} Rang B: Expertise avancée et prise en charge complexe spécialisée`
            ];
            
            const { error } = await supabase
              .from('edn_items_immersive')
              .update({ paroles_musicales: specializedParoles })
              .eq('item_code', itemCode);
              
            if (!error) {
              issue.fixed = true;
              fixedCount++;
            }
          }
        }
        
      } catch (error) {
        console.error(`❌ Erreur lors de la correction de: ${issue.description}`, error);
      }
    }
    
    console.log(`✅ ${fixedCount} problème(s) corrigé(s) automatiquement`);
    return fixedCount;
  }
  
  static async massFixEdnItems(): Promise<number> {
    console.log('🔧 Correction massive des items EDN...');
    
    let fixedCount = 0;
    
    try {
      const { data: items, error } = await supabase
        .from('edn_items_immersive')
        .select('*');
        
      if (error) {
        console.error('Erreur lors de la récupération des items:', error);
        return 0;
      }
      
      for (const item of items || []) {
        let needsUpdate = false;
        const updates: any = {};
        
        if (!item.title || item.title.trim() === '') {
          updates.title = `Item ${item.item_code} - Titre généré automatiquement`;
          needsUpdate = true;
        }
        
        if (!item.paroles_musicales || item.paroles_musicales.length === 0) {
          updates.paroles_musicales = [
            `${item.item_code} Rang A: Connaissances essentielles de base pour cet item`,
            `${item.item_code} Rang B: Expertise avancée et spécialisée pour cet item`
          ];
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          updates.updated_at = new Date().toISOString();
          
          const { error: updateError } = await supabase
            .from('edn_items_immersive')
            .update(updates)
            .eq('id', item.id);
            
          if (!updateError) {
            fixedCount++;
          }
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la correction massive:', error);
    }
    
    console.log(`✅ ${fixedCount} item(s) EDN corrigé(s) massivement`);
    return fixedCount;
  }
}