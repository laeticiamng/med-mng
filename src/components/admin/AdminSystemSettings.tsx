import React, { useState, useEffect } from 'react';
import { 
  Settings, Shield, Database, Mail, Zap, 
  AlertTriangle, CheckCircle, RefreshCw, Save, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminSecurityAudit } from './AdminSecurityAudit';
import { AdminChatMonitoring } from './AdminChatMonitoring';

interface SystemSettings {
  maintenance_mode: boolean;
  max_daily_credits: number;
  max_music_generations: number;
  email_notifications: boolean;
  rate_limit_enabled: boolean;
  backup_frequency: string;
  ai_services_enabled: boolean;
  debug_mode: boolean;
}

interface SystemHealth {
  database_status: 'healthy' | 'warning' | 'error';
  ai_services_status: 'healthy' | 'warning' | 'error';
  email_service_status: 'healthy' | 'warning' | 'error';
  storage_usage: number;
  active_connections: number;
  last_backup: string;
}

export const AdminSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    max_daily_credits: 100,
    max_music_generations: 10,
    email_notifications: true,
    rate_limit_enabled: true,
    backup_frequency: 'daily',
    ai_services_enabled: true,
    debug_mode: false
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database_status: 'healthy',
    ai_services_status: 'healthy',
    email_service_status: 'healthy',
    storage_usage: 65,
    active_connections: 142,
    last_backup: new Date().toISOString()
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSystemSettings();
    fetchSystemHealth();
  }, []);

  const fetchSystemSettings = async () => {
    try {
      // Simulation de récupération des paramètres système
      // Dans une vraie application, vous récupéreriez ces données depuis la base
      const mockSettings: SystemSettings = {
        maintenance_mode: false,
        max_daily_credits: 100,
        max_music_generations: 10,
        email_notifications: true,
        rate_limit_enabled: true,
        backup_frequency: 'daily',
        ai_services_enabled: true,
        debug_mode: false
      };
      
      setSettings(mockSettings);
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    }
  };

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);

      // Vérification de la base de données
      const { error: dbError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact' })
        .limit(1);

      const databaseStatus = dbError ? 'error' : 'healthy';

      // Simulation des autres métriques
      const mockHealth: SystemHealth = {
        database_status: databaseStatus,
        ai_services_status: 'healthy',
        email_service_status: 'healthy',
        storage_usage: Math.floor(Math.random() * 30) + 50, // 50-80%
        active_connections: Math.floor(Math.random() * 100) + 100, // 100-200
        last_backup: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      };

      setSystemHealth(mockHealth);
    } catch (error) {
      console.error('Erreur vérification santé système:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Simulation de sauvegarde
      // Dans une vraie application, vous sauvegarderiez en base
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const runSystemMaintenance = async () => {
    try {
      setLoading(true);
      
      // Simulation de maintenance
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Maintenance système exécutée avec succès');
      fetchSystemHealth();
    } catch (error) {
      console.error('Erreur maintenance:', error);
      toast.error('Erreur lors de la maintenance');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setLoading(true);
      
      // Simulation de backup
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setSystemHealth(prev => ({
        ...prev,
        last_backup: new Date().toISOString()
      }));
      
      toast.success('Sauvegarde créée avec succès');
    } catch (error) {
      console.error('Erreur backup:', error);
      toast.error('Erreur lors de la création de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Paramètres Système
        </h2>
        <p className="text-muted-foreground">
          Configuration et monitoring du système
        </p>
      </div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList>
          <TabsTrigger value="security">Sécurité Streaming</TabsTrigger>
          <TabsTrigger value="chat">Chat IA</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
          <TabsTrigger value="health">Santé Système</TabsTrigger>
        </TabsList>

          <TabsContent value="security">
            <AdminSecurityAudit />
          </TabsContent>

          <TabsContent value="chat">
            <AdminChatMonitoring />
          </TabsContent>

        <TabsContent value="settings">
          {/* Mode maintenance alerte */}
          {settings.maintenance_mode && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Mode maintenance activé. Les utilisateurs ne peuvent pas accéder à la plateforme.
              </AlertDescription>
            </Alert>
          )}

          {/* Configuration système */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration système</CardTitle>
              <CardDescription>
                Gérez les paramètres globaux de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode maintenance */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mode maintenance</Label>
                  <div className="text-sm text-muted-foreground">
                    Empêche l'accès des utilisateurs pour maintenance
                  </div>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, maintenance_mode: checked }))
                  }
                />
              </div>

              <Separator />

              {/* Limites de quotas */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Limites de quotas</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_daily_credits">Crédits quotidiens maximum</Label>
                    <Input
                      id="max_daily_credits"
                      type="number"
                      value={settings.max_daily_credits}
                      onChange={(e) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          max_daily_credits: parseInt(e.target.value) || 0 
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_music_generations">Générations musicales max/jour</Label>
                    <Input
                      id="max_music_generations"
                      type="number"
                      value={settings.max_music_generations}
                      onChange={(e) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          max_music_generations: parseInt(e.target.value) || 0 
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Services */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Services</Label>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Services IA activés</Label>
                      <div className="text-sm text-muted-foreground">
                        Autoriser l'utilisation des services d'IA
                      </div>
                    </div>
                    <Switch
                      checked={settings.ai_services_enabled}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, ai_services_enabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mode debug</Label>
                      <div className="text-sm text-muted-foreground">
                        Activer les logs détaillés (performance réduite)
                      </div>
                    </div>
                    <Switch
                      checked={settings.debug_mode}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, debug_mode: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button 
                  onClick={fetchSystemSettings} 
                  variant="outline"
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={saveSettings} 
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          {/* Santé du système */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Santé du système
              </CardTitle>
              <CardDescription>
                Surveillez l'état des services et des composants système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Base de données</span>
                    <Badge className={getStatusColor(systemHealth.database_status)}>
                      {getStatusIcon(systemHealth.database_status)}
                      <span className="ml-1 capitalize">{systemHealth.database_status}</span>
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {systemHealth.active_connections} connexions actives
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Services IA</span>
                    <Badge className={getStatusColor(systemHealth.ai_services_status)}>
                      {getStatusIcon(systemHealth.ai_services_status)}
                      <span className="ml-1 capitalize">{systemHealth.ai_services_status}</span>
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Suno, OpenAI, DALL-E
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Stockage</span>
                    <Badge variant="outline">
                      {systemHealth.storage_usage}% utilisé
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Dernière sauvegarde : {new Date(systemHealth.last_backup).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={fetchSystemHealth} 
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
                <Button 
                  onClick={runSystemMaintenance} 
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Maintenance
                </Button>
                <Button 
                  onClick={createBackup} 
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Créer sauvegarde
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};