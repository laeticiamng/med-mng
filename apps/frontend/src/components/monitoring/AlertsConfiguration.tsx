import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, Slack, Phone, Webhook } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq';
  threshold: number;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, any>;
  enabled: boolean;
}

export const AlertsConfiguration = () => {
  const { toast } = useToast();
  
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: '1',
      name: 'CPU Usage High',
      metric: 'cpu_usage',
      operator: 'gt',
      threshold: 80,
      enabled: true,
      severity: 'high',
      channels: ['email', 'slack']
    },
    {
      id: '2',
      name: 'Memory Usage Critical',
      metric: 'memory_usage',
      operator: 'gt',
      threshold: 90,
      enabled: true,
      severity: 'critical',
      channels: ['email', 'slack', 'sms']
    },
    {
      id: '3',
      name: 'Response Time Slow',
      metric: 'response_time',
      operator: 'gt',
      threshold: 1000,
      enabled: true,
      severity: 'medium',
      channels: ['slack']
    }
  ]);

  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'email',
      name: 'Email Principal',
      type: 'email',
      config: { email: 'admin@med-mng.fr' },
      enabled: true
    },
    {
      id: 'slack',
      name: 'Canal Slack #alerts',
      type: 'slack',
      config: { webhook: 'https://hooks.slack.com/services/...' },
      enabled: true
    },
    {
      id: 'webhook',
      name: 'Webhook Custom',
      type: 'webhook',
      config: { url: 'https://api.med-mng.fr/alerts' },
      enabled: false
    }
  ]);

  const toggleRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const toggleChannel = (channelId: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId ? { ...channel, enabled: !channel.enabled } : channel
    ));
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'slack':
        return <Slack className="h-4 w-4" />;
      case 'webhook':
        return <Webhook className="h-4 w-4" />;
      case 'sms':
        return <Phone className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuration des Alertes</h1>
        <p className="text-muted-foreground">Gérez les règles d'alerte et les canaux de notification</p>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Règles d'Alerte</TabsTrigger>
          <TabsTrigger value="channels">Canaux de Notification</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Règles d'Alerte Actives</h2>
            <Button>Nouvelle Règle</Button>
          </div>

          <div className="grid gap-4">
            {alertRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge 
                          variant="outline" 
                          className={`${getSeverityColor(rule.severity)} text-white`}
                        >
                          {rule.severity}
                        </Badge>
                        <Switch 
                          checked={rule.enabled}
                          onCheckedChange={() => toggleRule(rule.id)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.metric} {rule.operator === 'gt' ? '>' : rule.operator === 'lt' ? '<' : '='} {rule.threshold}
                      </p>
                      <div className="flex gap-2">
                        {rule.channels.map(channel => (
                          <Badge key={channel} variant="secondary">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Canaux de Notification</h2>
            <Button>Nouveau Canal</Button>
          </div>

          <div className="grid gap-4">
            {channels.map((channel) => (
              <Card key={channel.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getChannelIcon(channel.type)}
                      <div>
                        <h3 className="font-medium">{channel.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Type: {channel.type}
                        </p>
                      </div>
                      <Switch 
                        checked={channel.enabled}
                        onCheckedChange={() => toggleChannel(channel.id)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Tester
                      </Button>
                      <Button variant="outline" size="sm">
                        Configurer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Généraux</CardTitle>
              <CardDescription>
                Configuration globale du système d'alertes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="alert-frequency">Fréquence de vérification</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 secondes</SelectItem>
                    <SelectItem value="30">30 secondes</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalation-delay">Délai d'escalade</Label>
                <Select defaultValue="300">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="900">15 minutes</SelectItem>
                    <SelectItem value="1800">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="quiet-hours" />
                <Label htmlFor="quiet-hours">Heures de silence (22h-6h)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto-resolve" />
                <Label htmlFor="auto-resolve">Résolution automatique</Label>
              </div>

              <Button>Sauvegarder les Paramètres</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};