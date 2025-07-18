import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Shield, Crown, Zap } from 'lucide-react';

interface TestAccount {
  email: string;
  password: string;
  plan: string;
  status: 'created' | 'testing' | 'verified' | 'error';
  quotaUsed?: number;
  quotaLimit?: number;
}

export const SubscriptionTestPanel: React.FC = () => {
  const [testAccounts, setTestAccounts] = useState<TestAccount[]>([
    { email: 'test-free@example.com', password: 'TestPass123!', plan: 'free', status: 'created' },
    { email: 'test-standard@example.com', password: 'TestPass123!', plan: 'standard', status: 'created' },
    { email: 'test-premium@example.com', password: 'TestPass123!', plan: 'premium', status: 'created' }
  ]);
  
  const [currentTest, setCurrentTest] = useState<string>('');
  const [testResults, setTestResults] = useState<any[]>([]);

  const createTestAccount = async (account: TestAccount) => {
    try {
      // Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            full_name: `Test User ${account.plan}`,
            test_account: true
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Créer l'abonnement pour les comptes payants
        if (account.plan !== 'free') {
          const { error: subError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: authData.user.id,
              plan_id: account.plan,
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });

          if (subError) throw subError;
        }

        toast.success(`Compte test ${account.plan} créé avec succès`);
        return true;
      }
    } catch (error) {
      console.error('Erreur création compte test:', error);
      toast.error(`Erreur création compte ${account.plan}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      return false;
    }
  };

  const testSubscriptionFeatures = async (account: TestAccount) => {
    try {
      // Connexion avec le compte test
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (loginError) throw loginError;

      // Test des quotas de génération musicale
      const { data: quotaData, error: quotaError } = await supabase
        .rpc('check_music_generation_quota', { user_uuid: loginData.user.id });

      if (quotaError) throw quotaError;

      // Test des fonctionnalités accessibles
      const { data: subData, error: subError } = await supabase
        .rpc('get_user_subscription', { user_uuid: loginData.user.id });

      if (subError) throw subError;

      const results = {
        plan: account.plan,
        quota: quotaData[0],
        features: subData[0]?.features || { tableaux: false, quiz: false, bande_dessinee: false, save_music: false },
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [...prev, results]);
      
      // Mise à jour du statut du compte
      setTestAccounts(prev => prev.map(acc => 
        acc.email === account.email 
          ? { ...acc, status: 'verified', quotaUsed: quotaData[0]?.current_usage, quotaLimit: quotaData[0]?.quota_limit }
          : acc
      ));

      toast.success(`Test réussi pour ${account.plan}`);
      
      // Déconnexion
      await supabase.auth.signOut();
      
    } catch (error) {
      console.error('Erreur test abonnement:', error);
      toast.error(`Erreur test ${account.plan}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      
      setTestAccounts(prev => prev.map(acc => 
        acc.email === account.email ? { ...acc, status: 'error' } : acc
      ));
    }
  };

  const simulateUsage = async (account: TestAccount, generations: number) => {
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (loginError) throw loginError;

      // Simuler plusieurs générations
      for (let i = 0; i < generations; i++) {
        const { error } = await supabase
          .rpc('increment_music_usage', { user_uuid: loginData.user.id });
        
        if (error) {
          console.log(`Génération ${i + 1} bloquée pour ${account.plan} - Quota atteint`);
          break;
        }
      }

      await supabase.auth.signOut();
      toast.success(`Simulation de ${generations} générations pour ${account.plan}`);
      
    } catch (error) {
      console.error('Erreur simulation:', error);
      toast.error(`Erreur simulation ${account.plan}`);
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free': return Users;
      case 'standard': return Shield;
      case 'premium': return Crown;
      default: return Zap;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'text-gray-600';
      case 'standard': return 'text-blue-600';
      case 'premium': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-gray-100 text-gray-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Panel de Test des Abonnements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {testAccounts.map((account, index) => {
              const Icon = getPlanIcon(account.plan);
              return (
                <Card key={index} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${getPlanColor(account.plan)}`} />
                        <span className="font-semibold capitalize">{account.plan}</span>
                      </div>
                      <Badge className={getStatusColor(account.status)}>
                        {account.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <div>Email: {account.email}</div>
                      {account.quotaLimit !== undefined && (
                        <div>Quota: {account.quotaUsed || 0}/{account.quotaLimit}</div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => createTestAccount(account)}
                        disabled={account.status === 'testing'}
                      >
                        Créer Compte
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => testSubscriptionFeatures(account)}
                        disabled={account.status === 'testing'}
                      >
                        Tester Features
                      </Button>
                      
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => simulateUsage(account, 5)}
                          className="flex-1"
                        >
                          +5 Gen
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => simulateUsage(account, 50)}
                          className="flex-1"
                        >
                          +50 Gen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats des Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="capitalize">
                      {result.plan}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Quota Musical:</strong>
                      <div>Utilisé: {result.quota?.current_usage || 0}</div>
                      <div>Limite: {result.quota?.quota_limit || 0}</div>
                      <div>Peut générer: {result.quota?.can_generate ? '✅' : '❌'}</div>
                    </div>
                    
                    <div>
                      <strong>Fonctionnalités:</strong>
                      <div>Tableaux: {result.features.tableaux ? '✅' : '❌'}</div>
                      <div>Quiz: {result.features.quiz ? '✅' : '❌'}</div>
                      <div>BD: {result.features.bande_dessinee ? '✅' : '❌'}</div>
                      <div>Sauvegarde: {result.features.save_music ? '✅' : '❌'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};