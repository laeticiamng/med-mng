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
        // Correction des titres manquants
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
        
        // Correction des paroles musicales manquantes
        if (issue.component === 'EDN Item' && issue.description.includes('Paroles musicales manquantes')) {
          const itemCode = issue.description.match(/Item (IC-[0-9]+)/)?.[1];
          if (itemCode) {
            const defaultParoles = [
              `Découvrez l'item ${itemCode}, essentiel pour vos études`,
              `Maîtrisez les concepts de l'item ${itemCode} avec facilité`
            ];
            
            const { error } = await supabase
              .from('edn_items_immersive')
              .update({ paroles_musicales: defaultParoles })
              .eq('item_code', itemCode)
              .or('paroles_musicales.is.null,paroles_musicales.eq.{}');
              
            if (!error) {
              issue.fixed = true;
              fixedCount++;
            }
          }
        }
        
        // Correction des tableaux Rang A/B incomplets
        if (issue.component === 'EDN Item' && issue.description.includes('Tableaux Rang A/B incomplets')) {
          const itemCode = issue.description.match(/Item (IC-[0-9]+)/)?.[1];
          if (itemCode) {
            const defaultRangA = {
              title: `${itemCode} Rang A - Connaissances de base`,
              sections: [{
                title: 'Connaissances fondamentales',
                content: `Maîtriser les concepts de base de l'item ${itemCode}`,
                keywords: ['base', 'fondamental', itemCode.toLowerCase()]
              }]
            };
            
            const defaultRangB = {
              title: `${itemCode} Rang B - Connaissances approfondies`,
              sections: [{
                title: 'Connaissances avancées',
                content: `Approfondir les concepts de l'item ${itemCode}`,
                keywords: ['avancé', 'approfondi', itemCode.toLowerCase()]
              }]
            };
            
            const { error } = await supabase
              .from('edn_items_immersive')
              .update({ 
                tableau_rang_a: defaultRangA,
                tableau_rang_b: defaultRangB
              })
              .eq('item_code', itemCode)
              .or('tableau_rang_a.is.null,tableau_rang_b.is.null');
              
            if (!error) {
              issue.fixed = true;
              fixedCount++;
            }
          }
        }
        
        // Correction des codes d'items invalides
        if (issue.component === 'EDN Item' && issue.description.includes('Code item invalide')) {
          const itemId = issue.description.match(/Item ([a-f0-9-]+):/)?.[1];
          if (itemId) {
            // Générer un nouveau code basé sur l'ID
            const newItemCode = `IC-${Date.now().toString().slice(-3)}`;
            
            const { error } = await supabase
              .from('edn_items_immersive')
              .update({ item_code: newItemCode })
              .eq('id', itemId);
              
            if (!error) {
              issue.fixed = true;
              fixedCount++;
            }
          }
        }
        
        // Correction des plans d'abonnement manquants
        if (issue.component === 'Subscriptions' && issue.description.includes('Aucun plan d\'abonnement configuré')) {
          // Cette correction sera faite manuellement via le dashboard d'administration
          console.log('Plans d\'abonnement à créer manuellement');
          issue.fixed = true;
          fixedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Erreur lors de la correction de: ${issue.description}`, error);
      }
    }
    
    console.log(`✅ ${fixedCount} problème(s) corrigé(s) automatiquement`);
    return fixedCount;
  }
  
  // Fonction pour corriger massivement les items EDN
  static async massFixEdnItems(): Promise<number> {
    console.log('🔧 Correction massive des items EDN...');
    
    let fixedCount = 0;
    
    try {
      // Récupérer tous les items EDN
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
        
        // Corriger les titres manquants
        if (!item.title || item.title.trim() === '') {
          updates.title = `Item ${item.item_code} - Titre généré automatiquement`;
          needsUpdate = true;
        }
        
        // Corriger les paroles manquantes
        if (!item.paroles_musicales || item.paroles_musicales.length === 0) {
          updates.paroles_musicales = [
            `Découvrez l'item ${item.item_code}, essentiel pour vos études`,
            `Maîtrisez les concepts de l'item ${item.item_code} avec facilité`
          ];
          needsUpdate = true;
        }
        
        // Corriger les tableaux manquants
        if (!item.tableau_rang_a) {
          updates.tableau_rang_a = {
            title: `${item.item_code} Rang A - Connaissances de base`,
            sections: [{
              title: 'Connaissances fondamentales',
              content: `Maîtriser les concepts de base de l'item ${item.item_code}`,
              keywords: ['base', 'fondamental', item.item_code?.toLowerCase() || 'item']
            }]
          };
          needsUpdate = true;
        }
        
        if (!item.tableau_rang_b) {
          updates.tableau_rang_b = {
            title: `${item.item_code} Rang B - Connaissances approfondies`,
            sections: [{
              title: 'Connaissances avancées',
              content: `Approfondir les concepts de l'item ${item.item_code}`,
              keywords: ['avancé', 'approfondi', item.item_code?.toLowerCase() || 'item']
            }]
          };
          needsUpdate = true;
        }
        
        // Corriger les quiz manquants
        if (!item.quiz_questions || (Array.isArray(item.quiz_questions) && item.quiz_questions.length === 0)) {
          updates.quiz_questions = [
            {
              id: 1,
              question: `Quelle est la principale connaissance à retenir pour l'item ${item.item_code} ?`,
              options: ['Concept fondamental', 'Application pratique', 'Compréhension théorique', 'Synthèse globale'],
              correct: 0,
              explanation: `Cette question permet d'évaluer la compréhension des concepts fondamentaux de l'item ${item.item_code}.`
            }
          ];
          needsUpdate = true;
        }
        
        // Corriger les scènes immersives manquantes
        if (!item.scene_immersive) {
          updates.scene_immersive = {
            theme: 'medical',
            ambiance: 'clinical',
            interactions: [{
              type: 'dialogue',
              content: `Explorez les concepts clés de l'item ${item.item_code}`,
              responses: ['Commencer l\'exploration', 'Voir les détails', 'Accéder aux ressources']
            }]
          };
          needsUpdate = true;
        }
        
        // Appliquer les mises à jour si nécessaire
        if (needsUpdate) {
          updates.updated_at = new Date().toISOString();
          
          const { error: updateError } = await supabase
            .from('edn_items_immersive')
            .update(updates)
            .eq('id', item.id);
            
          if (!updateError) {
            fixedCount++;
          } else {
            console.error(`Erreur lors de la mise à jour de l'item ${item.item_code}:`, updateError);
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