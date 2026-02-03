import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Link2, 
  Link2Off, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Clock,
  Heart,
  TrendingUp,
  Compass,
  Settings,
  History,
  Zap,
  ArrowUpDown,
  Key
} from 'lucide-react';
import { usePlatformConnectors } from '@/hooks/usePlatformConnectors';
import { ConnectorType, SyncFrequency, AVAILABLE_CONNECTORS } from '@/types/connectors';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const connectorIcons: Record<ConnectorType, React.ReactNode> = {
  emotions_care: <Heart className="h-6 w-6 text-pink-500" />,
  growth_copilot: <TrendingUp className="h-6 w-6 text-green-500" />,
  system_compass: <Compass className="h-6 w-6 text-blue-500" />,
  custom: <Zap className="h-6 w-6 text-purple-500" />
};

const statusColors = {
  connected: 'bg-green-500',
  disconnected: 'bg-gray-500',
  error: 'bg-red-500',
  pending: 'bg-yellow-500'
};

const statusLabels = {
  connected: 'Connecté',
  disconnected: 'Déconnecté',
  error: 'Erreur',
  pending: 'En attente'
};

const frequencyLabels: Record<SyncFrequency, string> = {
  realtime: 'Temps réel',
  hourly: 'Toutes les heures',
  daily: 'Quotidien',
  weekly: 'Hebdomadaire',
  manual: 'Manuel'
};

export function ConnectorsDashboard() {
  const {
    connectors,
    syncLogs,
    isSyncing,
    availableConnectors,
    configureConnector,
    testConnection,
    syncData,
    toggleFeature,
    setSyncFrequency,
    disconnectConnector,
    getConnectorSyncLogs,
    getConnectorsStatus
  } = usePlatformConnectors();

  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedConnectorType, setSelectedConnectorType] = useState<ConnectorType | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [additionalConfig, setAdditionalConfig] = useState<Record<string, string>>({});
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);

  const status = getConnectorsStatus();

  const handleConfigure = () => {
    if (!selectedConnectorType || !apiKey) return;
    const connector = configureConnector(selectedConnectorType, apiKey, additionalConfig);
    if (connector) {
      setIsConfigDialogOpen(false);
      setApiKey('');
      setAdditionalConfig({});
      setSelectedConnectorType(null);
    }
  };

  const selectedConnectorConfig = selectedConnectorType 
    ? availableConnectors.find(c => c.type === selectedConnectorType)
    : null;

  const activeConnector = selectedConnector 
    ? connectors.find(c => c.id === selectedConnector) 
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Connecteurs Inter-Plateformes</h2>
          <p className="text-muted-foreground">
            Synchronisez vos données avec EmotionsCare, Growth-Copilot et System-Compass
          </p>
        </div>
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Link2 className="h-4 w-4 mr-2" />
              Nouveau Connecteur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Configurer un Connecteur</DialogTitle>
              <DialogDescription>
                Connectez une plateforme externe pour synchroniser vos données
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!selectedConnectorType ? (
                <div className="grid grid-cols-1 gap-3">
                  {availableConnectors.map(config => {
                    const isAlreadyConfigured = connectors.some(c => c.type === config.type);
                    return (
                      <div
                        key={config.type}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                          isAlreadyConfigured ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => !isAlreadyConfigured && setSelectedConnectorType(config.type)}
                      >
                        <div className="flex items-center gap-3">
                          {connectorIcons[config.type]}
                          <div className="flex-1">
                            <h4 className="font-medium">{config.name}</h4>
                            <p className="text-sm text-muted-foreground">{config.description}</p>
                          </div>
                          {isAlreadyConfigured && (
                            <Badge variant="secondary">Déjà configuré</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-accent">
                    {connectorIcons[selectedConnectorType]}
                    <div>
                      <h4 className="font-medium">{selectedConnectorConfig?.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedConnectorConfig?.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Clé API</Label>
                    <Input
                      type="password"
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      placeholder="Votre clé API..."
                    />
                  </div>

                  {selectedConnectorConfig?.required_fields
                    .filter(f => f !== 'api_key')
                    .map(field => (
                      <div key={field} className="space-y-2">
                        <Label>{field.replace(/_/g, ' ')}</Label>
                        <Input
                          value={additionalConfig[field] || ''}
                          onChange={e => setAdditionalConfig(prev => ({ ...prev, [field]: e.target.value }))}
                          placeholder={`Entrez ${field.replace(/_/g, ' ')}`}
                        />
                      </div>
                    ))}

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedConnectorType(null)}>
                      Retour
                    </Button>
                    <Button onClick={handleConfigure} disabled={!apiKey} className="flex-1">
                      <Key className="h-4 w-4 mr-2" />
                      Configurer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connecteurs configurés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connectés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{status.connected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En erreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{status.errors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Santé globale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Progress value={status.health} className="flex-1" />
              <span className="text-sm font-medium">{status.health}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connectors List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Mes Connecteurs</CardTitle>
          </CardHeader>
          <CardContent>
            {connectors.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun connecteur configuré
              </p>
            ) : (
              <div className="space-y-3">
                {connectors.map(connector => (
                  <div
                    key={connector.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                      selectedConnector === connector.id ? 'bg-accent border-primary' : ''
                    }`}
                    onClick={() => setSelectedConnector(connector.id)}
                  >
                    <div className="flex items-center gap-3">
                      {connectorIcons[connector.type]}
                      <div className="flex-1">
                        <h4 className="font-medium">{connector.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={statusColors[connector.status]}>
                            {statusLabels[connector.status]}
                          </Badge>
                          {connector.last_sync_at && (
                            <span className="text-xs text-muted-foreground">
                              Sync: {format(new Date(connector.last_sync_at), 'HH:mm', { locale: fr })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connector Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {activeConnector ? activeConnector.name : 'Détails du connecteur'}
            </CardTitle>
            {activeConnector && (
              <CardDescription>
                Configuré le {format(new Date(activeConnector.created_at), 'PPP', { locale: fr })}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {activeConnector ? (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                  <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
                  <TabsTrigger value="logs">Historique</TabsTrigger>
                  <TabsTrigger value="settings">Paramètres</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => testConnection(activeConnector.id)}
                      disabled={isSyncing[activeConnector.id]}
                    >
                      {isSyncing[activeConnector.id] ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Tester la connexion
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => syncData(activeConnector.id, 'export')}
                      disabled={isSyncing[activeConnector.id] || activeConnector.status !== 'connected'}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Synchroniser
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => disconnectConnector(activeConnector.id)}
                    >
                      <Link2Off className="h-4 w-4 mr-2" />
                      Déconnecter
                    </Button>
                  </div>

                  {/* Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <div className="flex items-center gap-2 mt-1">
                        {activeConnector.status === 'connected' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : activeConnector.status === 'error' ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        <span className="font-medium">{statusLabels[activeConnector.status]}</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Fréquence de sync</p>
                      <p className="font-medium mt-1">{frequencyLabels[activeConnector.sync_frequency]}</p>
                    </div>
                  </div>

                  {activeConnector.error_message && (
                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        <p>{activeConnector.error_message}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="features">
                  <div className="space-y-3">
                    {availableConnectors
                      .find(c => c.type === activeConnector.type)
                      ?.features.map(feature => (
                        <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{feature.name}</p>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {feature.sync_direction === 'import' ? '← Import' : 
                               feature.sync_direction === 'export' ? '→ Export' : '↔ Bidirectionnel'}
                            </Badge>
                          </div>
                          <Switch
                            checked={activeConnector.enabled_features.includes(feature.id)}
                            onCheckedChange={(checked) => toggleFeature(activeConnector.id, feature.id, checked)}
                          />
                        </div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="logs">
                  <ScrollArea className="h-[300px]">
                    {getConnectorSyncLogs(activeConnector.id).length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Aucune synchronisation effectuée
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {getConnectorSyncLogs(activeConnector.id).map(log => (
                          <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            {log.status === 'success' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : log.status === 'partial' ? (
                              <AlertCircle className="h-5 w-5 text-yellow-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">
                                {log.direction === 'import' ? 'Import' : 'Export'} - {log.records_processed} enregistrements
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(log.started_at), 'PPpp', { locale: fr })}
                              </p>
                              {log.records_failed > 0 && (
                                <p className="text-sm text-red-600">
                                  {log.records_failed} erreurs
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="settings">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Fréquence de synchronisation</Label>
                      <Select
                        value={activeConnector.sync_frequency}
                        onValueChange={(v: SyncFrequency) => setSyncFrequency(activeConnector.id, v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(frequencyLabels).map(([freq, label]) => (
                            <SelectItem key={freq} value={freq}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm font-medium mb-2">Documentation</p>
                      <a
                        href={availableConnectors.find(c => c.type === activeConnector.type)?.documentation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Voir la documentation de l'API →
                      </a>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Sélectionnez un connecteur pour voir les détails
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ConnectorsDashboard;
