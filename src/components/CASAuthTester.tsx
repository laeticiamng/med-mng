import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { testOICAccessWithRealCAS, extractOICWithCASCookies } from '@/utils/testOICAccessWithCAS';
import { validateCASCookies } from '@/utils/getCASCookies';
import { CASAuthResult, CASExample } from '@/types/cas';
import { logger } from '@/lib/logger';

export default function CASAuthTester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CASAuthResult | null>(null);
  const [cookies, setCookies] = useState('');
  
  const testCASAuthentication = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      logger.info('Test authentification CAS', { 
        component: 'CASAuthTester',
        action: 'testCASAuthentication'
      });
      
      const { data, error } = await supabase.functions.invoke('cas-auth-puppeteer', {
        body: { action: 'authenticate', testOnly: true }
      });
      
      if (error) {
        throw error;
      }
      
      logger.info('Résultat authentification CAS', { 
        component: 'CASAuthTester',
        metadata: { 
          success: data?.success,
          hasData: !!data 
        }
      });
      setResult(data);
      
      if (data.success) {
        toast.success('Authentification CAS réussie !');
      } else {
        toast.error('Authentification CAS requise');
      }
      
    } catch (error: unknown) {
      console.error('❌ Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setResult({ 
        success: false, 
        error: errorMessage
      });
      toast.error('Erreur lors du test CAS');
    } finally {
      setLoading(false);
    }
  };
  
  const validateCookies = async () => {
    if (!cookies.trim()) {
      toast.error('Veuillez entrer les cookies à valider');
      return;
    }
    
    setLoading(true);
    
    try {
      logger.info('Validation cookies CAS', { 
        component: 'CASAuthTester',
        action: 'validateCookies'
      });
      
      const validationResult = await validateCASCookies(cookies.trim());
      
      logger.info('Résultat validation cookies', { 
        component: 'CASAuthTester',
        metadata: {
          success: validationResult.success
        }
      });
      
      if (validationResult.success) {
        setResult({ 
          success: true, 
          valid: true, 
          pages_accessible: 'Test réussi avec cookies',
          examples: []
        });
        toast.success('✅ Cookies CAS valides !');
      } else {
        setResult({ 
          success: false, 
          error: validationResult.error,
          valid: false 
        });
        toast.error('❌ Cookies invalides ou expirés');
      }
      
    } catch (error: unknown) {
      console.error('❌ Erreur validation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur validation cookies';
      setResult({ 
        success: false, 
        error: errorMessage
      });
      toast.error('Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  const testRealCASAccess = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      logger.info('Test complet accès OIC avec CAS', { 
        component: 'CASAuthTester',
        action: 'testRealCASAccess'
      });
      toast.info('Test d\'accès complet en cours...');
      
      const testResult = await testOICAccessWithRealCAS();
      
      logger.info('Résultat test complet OIC', { 
        component: 'CASAuthTester',
        metadata: {
          success: testResult.success,
          improvement: testResult.improvement
        }
      });
      
      if (testResult.success) {
        setResult({ 
          success: true, 
          pages_found: testResult.withAuth.count,
          pages_accessible: testResult.withAuth.count,
          examples: [],
          improvement: testResult.improvement
        });
        
        if (testResult.improvement > 0) {
          toast.success(`🎉 Authentification CAS fonctionne ! +${testResult.improvement} pages avec auth`);
        } else {
          toast.success(`✅ Accès direct possible - ${testResult.withAuth.count} pages`);
        }
      } else {
        setResult({ 
          success: false, 
          error: testResult.error,
          instructions: {
            message: 'Authentification CAS manuelle requise',
            next_steps: testResult.nextSteps || []
          }
        });
        toast.error('❌ Authentification CAS requise');
      }
      
    } catch (error: unknown) {
      console.error('❌ Erreur test complet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur test complet';
      setResult({ 
        success: false, 
        error: errorMessage
      });
      toast.error('Erreur lors du test complet');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔐 Test Authentification CAS UNESS
          </CardTitle>
          <CardDescription>
            Testez l'authentification CAS et validez les cookies de session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Test complet avec injection réelle */}
          <div className="space-y-3">
            <h3 className="font-medium">1. 🎯 Test COMPLET avec injection réelle des cookies</h3>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p className="font-medium">⚡ Test corrigé qui injecte VRAIMENT les cookies CAS dans les requêtes API</p>
              <p>Ce test montre la différence entre les appels avec et sans authentification.</p>
            </div>
            <Button 
              onClick={testRealCASAccess}
              disabled={loading}
              className="w-full"
              variant="default"
            >
              {loading ? '🔄 Test complet en cours...' : '🚀 TEST COMPLET - Accès OIC avec CAS réel'}
            </Button>
          </div>

          {/* Test d'authentification basique */}
          <div className="space-y-3">
            <h3 className="font-medium">2. Test d'accès CAS (basique)</h3>
            <Button 
              onClick={testCASAuthentication}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? '🔄 Test en cours...' : '🔍 Tester l\'authentification CAS (Edge Function)'}
            </Button>
          </div>
          
          {/* Validation de cookies */}
          <div className="space-y-3">
            <h3 className="font-medium">3. Validation de cookies (manuel)</h3>
            <Textarea
              placeholder="Collez ici vos cookies CAS (ex: PHPSESSID=abc123; autre_cookie=def456)"
              value={cookies}
              onChange={(e) => setCookies(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={validateCookies}
              disabled={loading || !cookies.trim()}
              variant="outline"
              className="w-full"
            >
              {loading ? '🔄 Validation...' : '🍪 Valider les cookies manuellement'}
            </Button>
          </div>
          
          {/* Résultats */}
          {result && (
            <Card className={`mt-4 ${result.success ? 'border-green-200' : 'border-red-200'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {result.success ? '✅' : '❌'} 
                  {result.success ? 'Succès' : 'Échec'}
                  {result.pages_found !== undefined && (
                    <Badge variant="secondary">
                      {result.pages_found} pages trouvées
                    </Badge>
                  )}
                  {result.pages_accessible !== undefined && (
                    <Badge variant="secondary">
                      {result.pages_accessible} pages accessibles
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                
                {/* Message d'erreur */}
                {result.error && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-red-700 font-medium">Erreur:</p>
                    <p className="text-red-600 text-sm">{result.error}</p>
                  </div>
                )}
                
                {/* Instructions CAS */}
                {result.instructions && (
                  <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                    <p className="text-blue-700 font-medium">Instructions:</p>
                    <p className="text-blue-600 text-sm">{result.instructions.message}</p>
                    {result.instructions.next_steps && (
                      <ul className="text-blue-600 text-sm space-y-1">
                        {result.instructions.next_steps.map((step: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="font-mono text-xs mt-0.5">{index + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                
                {/* URL CAS */}
                {result.cas_url && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-700 font-medium">URL CAS détectée:</p>
                    <p className="text-yellow-600 text-sm break-all">{result.cas_url}</p>
                  </div>
                )}
                
                {/* Exemples de pages */}
                {result.examples && result.examples.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-green-700 font-medium">Exemples de pages accessibles:</p>
                    <ul className="text-green-600 text-sm space-y-1 mt-2">
                      {result.examples.slice(0, 3).map((page: CASExample, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="font-mono text-xs mt-0.5">•</span>
                          <span>{page.title} (ID: {page.pageid})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
              </CardContent>
            </Card>
          )}
          
        </CardContent>
      </Card>
      
      {/* Instructions d'utilisation */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Instructions d'utilisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <p><strong>Option 1:</strong> Test automatique avec Edge Function (recommandé)</p>
            <p className="text-muted-foreground pl-4">
              Cliquez sur "Tester l'authentification CAS" pour vérifier si les secrets CAS permettent l'accès aux données.
            </p>
          </div>
          
          <div className="space-y-2">
            <p><strong>Option 2:</strong> Validation manuelle de cookies</p>
            <p className="text-muted-foreground pl-4">
              Si vous avez obtenu des cookies CAS manuellement, collez-les dans le champ texte et validez-les.
            </p>
          </div>
          
          <div className="space-y-2">
            <p><strong>Prochaine étape:</strong></p>
            <p className="text-muted-foreground pl-4">
              Une fois l'authentification validée, nous pourrons lancer l'extraction complète des 4,872 compétences OIC.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}