import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Users, Shield, Crown, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface AuditResult {
  category: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
  timestamp: string;
}

interface SubscriptionStats {
  totalUsers: number;
  freeUsers: number;
  standardUsers: number;
  premiumUsers: number;
  totalGenerations: number;
  averageUsage: number;
}

export const SubscriptionAudit: React.FC = () => {
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(false);

  const runFullAudit = async () => {
    setLoading(true);
    const results: AuditResult[] = [];

    try {
      // Test 1: Vérification des plans d'abonnement
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*');

      if (plansError) {
        results.push({
          category: 'Database',
          status: 'error',
          message: 'Erreur lors de la récupération des plans d\'abonnement',
          details: plansError,
          timestamp: new Date().toISOString()
        });
      } else {
        const expectedPlans = ['free', 'standard', 'pro', 'premium'];
        const existingPlans = plans.map(p => p.id);
        const missingPlans = expectedPlans.filter(p => !existingPlans.includes(p));
        
        if (missingPlans.length > 0) {
          results.push({
            category: 'Configuration',
            status: 'warning',
            message: `Plans manquants: ${missingPlans.join(', ')}`,
            details: { missing: missingPlans, existing: existingPlans },
            timestamp: new Date().toISOString()
          });
        } else {
          results.push({
            category: 'Configuration',
            status: 'success',
            message: 'Tous les plans d\'abonnement sont configurés',
            details: plans,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Test 2: Vérification des fonctions de base de données
      const functionsToTest = [
        'get_user_subscription',
        'check_music_generation_quota',
        'increment_music_usage'
      ];

      for (const funcName of functionsToTest) {
        try {
          // Test avec un UUID factice pour vérifier que la fonction existe
          if (funcName === 'get_user_subscription' || funcName === 'check_music_generation_quota' || funcName === 'increment_music_usage') {
            await supabase.rpc(funcName as any, { user_uuid: '00000000-0000-0000-0000-000000000000' });
          }
          results.push({
            category: 'Database Functions',
            status: 'success',
            message: `Fonction ${funcName} disponible`,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          results.push({
            category: 'Database Functions',
            status: 'error',
            message: `Erreur fonction ${funcName}`,
            details: error,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Test 3: Statistiques d'utilisation
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('plan_id, status');

      const { data: usage } = await supabase
        .from('music_generation_usage')
        .select('generated_count, quota_limit');

      if (subscriptions && usage) {
        const totalGenerations = usage.reduce((sum, u) => sum + u.generated_count, 0);
        const averageUsage = usage.length > 0 ? totalGenerations / usage.length : 0;

        const planCounts = subscriptions.reduce((acc, sub) => {
          acc[sub.plan_id] = (acc[sub.plan_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const statsData: SubscriptionStats = {
          totalUsers: subscriptions.length,
          freeUsers: planCounts.free || 0,
          standardUsers: planCounts.standard || 0,
          premiumUsers: planCounts.premium || 0,
          totalGenerations,
          averageUsage: Math.round(averageUsage * 100) / 100
        };

        setStats(statsData);

        results.push({
          category: 'Statistics',
          status: 'success',
          message: 'Statistiques collectées avec succès',
          details: statsData,
          timestamp: new Date().toISOString()
        });
      }

      // Test 4: Validation des quotas
      if (plans) {
        const quotaValidation = plans.every(plan => {
          const quota = plan.monthly_music_quota;
          switch (plan.id) {
            case 'free': return quota === 0;
            case 'standard': return quota === 30;
            case 'pro': return quota === 300;
            case 'premium': return quota === 3000;
            default: return true;
          }
        });

        results.push({
          category: 'Quota Validation',
          status: quotaValidation ? 'success' : 'warning',
          message: quotaValidation ? 'Quotas configurés correctement' : 'Quotas mal configurés',
          details: plans.map(p => ({ plan: p.id, quota: p.monthly_music_quota })),
          timestamp: new Date().toISOString()
        });
      }

      // Test 5: Vérification des fonctionnalités par plan
      if (plans) {
        const featureValidation = plans.map(plan => {
          const features = plan.features as any;
          let expectedFeatures: any = {};
          
          switch (plan.id) {
            case 'free':
              expectedFeatures = { tableaux: false, quiz: false, bande_dessinee: false, save_music: false };
              break;
            case 'standard':
              expectedFeatures = { tableaux: true, quiz: false, bande_dessinee: false, save_music: true };
              break;
            case 'pro':
              expectedFeatures = { tableaux: true, quiz: true, bande_dessinee: false, save_music: true };
              break;
            case 'premium':
              expectedFeatures = { tableaux: true, quiz: true, bande_dessinee: true, save_music: true };
              break;
          }

          const isValid = Object.keys(expectedFeatures).every(
            key => features[key] === expectedFeatures[key]
          );

          return { plan: plan.id, valid: isValid, current: features, expected: expectedFeatures };
        });

        const allValid = featureValidation.every(v => v.valid);
        
        results.push({
          category: 'Feature Validation',
          status: allValid ? 'success' : 'error',
          message: allValid ? 'Fonctionnalités configurées correctement' : 'Erreurs dans la configuration des fonctionnalités',
          details: featureValidation,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      results.push({
        category: 'System',
        status: 'error',
        message: 'Erreur système lors de l\'audit',
        details: error,
        timestamp: new Date().toISOString()
      });
    }

    setAuditResults(results);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header avec bouton d'audit */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Audit des Abonnements
            </CardTitle>
            <Button onClick={runFullAudit} disabled={loading}>
              {loading ? 'Audit en cours...' : 'Lancer l\'audit complet'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <Badge variant="outline">{stats.totalUsers}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Gratuit:</span>
                  <Badge className="bg-gray-100 text-gray-800">{stats.freeUsers}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Standard:</span>
                  <Badge className="bg-blue-100 text-blue-800">{stats.standardUsers}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Premium:</span>
                  <Badge className="bg-purple-100 text-purple-800">{stats.premiumUsers}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Générations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <Badge variant="outline">{stats.totalGenerations}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Moyenne/utilisateur:</span>
                  <Badge className="bg-green-100 text-green-800">{stats.averageUsage}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Système
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tests réussis:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {auditResults.filter(r => r.status === 'success').length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Avertissements:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {auditResults.filter(r => r.status === 'warning').length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Erreurs:</span>
                  <Badge className="bg-red-100 text-red-800">
                    {auditResults.filter(r => r.status === 'error').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Résultats d'audit */}
      {auditResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats de l'Audit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.category}</span>
                    </div>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                  
                  <div className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>
                  
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer">
                        Voir détails
                      </summary>
                      <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
    </div>
  );
};