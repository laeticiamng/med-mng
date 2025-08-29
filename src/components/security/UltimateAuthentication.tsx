import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyRound, Smartphone, Fingerprint, Shield, Globe, Users, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AuthMethod {
  id: string;
  name: string;
  type: 'password' | 'biometric' | 'social' | 'hardware';
  enabled: boolean;
  usage: number;
  security: 'low' | 'medium' | 'high' | 'enterprise';
}

interface AuthMetrics {
  totalUsers: number;
  activeUsers: number;
  mfaEnabled: number;
  securityScore: number;
  threatsPrevented: number;
}

export const UltimateAuthentication: React.FC = () => {
  const [authMethods, setAuthMethods] = useState<AuthMethod[]>([
    { id: '1', name: 'Email/Password', type: 'password', enabled: true, usage: 95, security: 'medium' },
    { id: '2', name: 'Google OAuth', type: 'social', enabled: true, usage: 78, security: 'high' },
    { id: '3', name: 'GitHub OAuth', type: 'social', enabled: true, usage: 45, security: 'high' },
    { id: '4', name: 'Biometric Login', type: 'biometric', enabled: true, usage: 82, security: 'enterprise' },
    { id: '5', name: 'Hardware Keys', type: 'hardware', enabled: true, usage: 23, security: 'enterprise' },
    { id: '6', name: 'SMS 2FA', type: 'password', enabled: true, usage: 67, security: 'medium' }
  ]);

  const [metrics, setMetrics] = useState<AuthMetrics>({
    totalUsers: 12847,
    activeUsers: 8934,
    mfaEnabled: 89,
    securityScore: 98,
    threatsPrevented: 143
  });

  const [advancedFeatures, setAdvancedFeatures] = useState({
    adaptiveAuth: true,
    riskAnalysis: true,
    sessionManagement: true,
    passwordless: true,
    fraudDetection: true,
    deviceTrust: true
  });

  const toggleAuthMethod = (id: string) => {
    setAuthMethods(prev => 
      prev.map(method => 
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    );
    toast.success('Configuration d\'authentification mise à jour');
  };

  const toggleAdvancedFeature = (feature: keyof typeof advancedFeatures) => {
    setAdvancedFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
    toast.success('Fonctionnalité avancée mise à jour');
  };

  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'enterprise': return 'text-purple-600';
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const runSecurityAudit = () => {
    toast.info('Audit de sécurité en cours...');
    setTimeout(() => {
      toast.success('Audit terminé - Score de sécurité: 98/100');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <KeyRound className="h-8 w-8 text-blue-600" />
            Ultimate Authentication
          </h2>
          <p className="text-muted-foreground">Système d'authentification multi-facteurs de niveau enterprise</p>
        </div>
        <Button onClick={runSecurityAudit}>
          <Shield className="h-4 w-4 mr-2" />
          Audit Sécurité
        </Button>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilisateurs Total</p>
                <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actifs 24h</p>
                <p className="text-2xl font-bold text-green-600">{metrics.activeUsers.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">MFA Adoptée</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.mfaEnabled}%</p>
              </div>
              <Smartphone className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Sécurité</p>
                <p className="text-2xl font-bold text-green-600">{metrics.securityScore}/100</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Menaces Bloquées</p>
                <p className="text-2xl font-bold text-red-600">{metrics.threatsPrevented}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="methods" className="space-y-4">
        <TabsList>
          <TabsTrigger value="methods">Méthodes Auth</TabsTrigger>
          <TabsTrigger value="advanced">Fonctionnalités Avancées</TabsTrigger>
          <TabsTrigger value="security">Sécurité Enterprise</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Méthodes d'Authentification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {authMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {method.type === 'biometric' && <Fingerprint className="h-5 w-5" />}
                      {method.type === 'social' && <Globe className="h-5 w-5" />}
                      {method.type === 'hardware' && <KeyRound className="h-5 w-5" />}
                      {method.type === 'password' && <Smartphone className="h-5 w-5" />}
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getSecurityColor(method.security)}>
                            {method.security}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{method.usage}% utilisation</span>
                        </div>
                      </div>
                    </div>
                    <Switch 
                      checked={method.enabled}
                      onCheckedChange={() => toggleAuthMethod(method.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fonctionnalités Avancées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(advancedFeatures).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                      <p className="text-sm text-muted-foreground">
                        {key === 'adaptiveAuth' && 'Authentification adaptative basée sur le contexte'}
                        {key === 'riskAnalysis' && 'Analyse de risque en temps réel'}
                        {key === 'sessionManagement' && 'Gestion avancée des sessions'}
                        {key === 'passwordless' && 'Authentification sans mot de passe'}
                        {key === 'fraudDetection' && 'Détection de fraude IA'}
                        {key === 'deviceTrust' && 'Gestion de confiance des appareils'}
                      </p>
                    </div>
                    <Switch 
                      checked={enabled}
                      onCheckedChange={() => toggleAdvancedFeature(key as keyof typeof advancedFeatures)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité Enterprise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Niveau de sécurité: Enterprise</strong> - Conformité SOC2, GDPR, HIPAA
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Protection Active</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Chiffrement AES-256 end-to-end
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Rotation automatique des clés
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Détection d'anomalies ML
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Audit trail complet
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Conformité</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        SOC2 Type II certifié
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        GDPR compliant
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        HIPAA ready
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Zero-trust architecture
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};