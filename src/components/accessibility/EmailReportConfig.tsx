import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Key,
    Mail,
    Plus,
    Send,
    Trash2,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface EmailConfig {
  id: string;
  enabled: boolean;
  frequency: 'weekly' | 'monthly';
  recipients: string[];
  send_day: number;
  send_hour: number;
  last_sent_at: string | null;
  github_token: string | null;
}

interface ReportHistory {
  id: string;
  sent_at: string;
  recipients: string[];
  status: 'success' | 'failed';
  error_message: string | null;
}

export const EmailReportConfig: React.FC = () => {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
    loadHistory();
  }, []);

  const loadConfig = async () => {
    try {
      const { _data, _error } = await supabase
        .from('accessibility_report_config')
        .select('*')
        .maybeSingle();

      if (_error && _error.code !== 'PGRST116') throw _error;

      if (_data) {
        setConfig(_data as EmailConfig);
        setShowTokenInput(!_data.github_token);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const { _data, _error } = await supabase
        .from('accessibility_report_history')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(10);

      if (_error) throw _error;
      setHistory((_data || []) as ReportHistory[]);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const saveConfig = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const updateData: any = {
        enabled: config.enabled,
        frequency: config.frequency,
        recipients: config.recipients,
        send_day: config.send_day,
        send_hour: config.send_hour,
      };

      // Ajouter le token seulement s'il a été modifié
      if (githubToken) {
        updateData.github_token = githubToken;
      }

      const { _error } = await supabase
        .from('accessibility_report_config')
        .update(updateData)
        .eq('id', config.id);

      if (_error) throw _error;

      toast({
        title: 'Configuration sauvegardée',
        description: 'Les paramètres d\'envoi automatique ont été mis à jour',
      });

      setShowTokenInput(false);
      setGithubToken('');
      await loadConfig();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const addRecipient = () => {
    if (!newRecipient || !config) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient)) {
      toast({
        title: 'Email invalide',
        description: 'Veuillez saisir une adresse email valide',
        variant: 'destructive'
      });
      return;
    }

    if (config.recipients.includes(newRecipient)) {
      toast({
        title: 'Email déjà ajouté',
        description: 'Cette adresse est déjà dans la liste',
        variant: 'destructive'
      });
      return;
    }

    setConfig({
      ...config,
      recipients: [...config.recipients, newRecipient]
    });
    setNewRecipient('');
  };

  const removeRecipient = (email: string) => {
    if (!config) return;
    setConfig({
      ...config,
      recipients: config.recipients.filter(r => r !== email)
    });
  };

  const sendTestReport = async () => {
    if (!config || config.recipients.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Ajoutez au moins un destinataire',
        variant: 'destructive'
      });
      return;
    }

    if (!config.github_token && !githubToken) {
      toast({
        title: 'Token GitHub requis',
        description: 'Configurez d\'abord votre token GitHub',
        variant: 'destructive'
      });
      setShowTokenInput(true);
      return;
    }

    setSending(true);
    try {
      // Sauvegarder d'abord si nécessaire
      if (githubToken) {
        await saveConfig();
      }

      const { _data, error } = await supabase.functions.invoke('send-accessibility-report', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: 'Email envoyé',
        description: `Rapport envoyé à ${config.recipients.length} destinataire(s)`,
      });

      await loadHistory();
    } catch (error) {
      console.error('Error sending test report:', error);
      toast({
        title: 'Erreur d\'envoi',
        description: error instanceof Error ? error.message : 'Impossible d\'envoyer le rapport',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Envoi Automatique des Rapports
          </CardTitle>
          <CardDescription>
            Configurez l'envoi automatique des rapports d'accessibilité par email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activation */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex-1">
              <Label htmlFor="enabled" className="text-base font-semibold">
                Activer l'envoi automatique
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Les rapports seront envoyés selon la fréquence configurée
              </p>
            </div>
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
            />
          </div>

          {/* Token GitHub */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Key className="h-4 w-4" />
                Token GitHub
              </Label>
              {config.github_token && !showTokenInput && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTokenInput(true)}
                >
                  Modifier
                </Button>
              )}
            </div>

            {showTokenInput || !config.github_token ? (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Token GitHub avec permissions <code>repo</code> et <code>read:org</code>
                </p>
              </div>
            ) : (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Token GitHub configuré</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Fréquence */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fréquence d'envoi
            </Label>
            <Select
              value={config.frequency}
              onValueChange={(value: 'weekly' | 'monthly') =>
                setConfig({ ...config, frequency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="monthly">Mensuel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jour et heure */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>Jour du mois</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={config.send_day || 1}
                onChange={(e) =>
                  setConfig({ ...config, send_day: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">
                {config.frequency === 'monthly' ? '1-31' : '1-7 (1=Lundi)'}
              </p>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Heure d'envoi
              </Label>
              <Input
                type="number"
                min="0"
                max="23"
                value={config.send_hour}
                onChange={(e) =>
                  setConfig({ ...config, send_hour: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">Format 24h (0-23)</p>
            </div>
          </div>

          {/* Destinataires */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Destinataires</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@exemple.com"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
              />
              <Button onClick={addRecipient} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {config.recipients.length > 0 ? (
              <div className="space-y-2">
                {config.recipients.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <span className="text-sm">{email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRecipient(email)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Aucun destinataire configuré
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={saveConfig} disabled={saving} className="flex-1">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button
              variant="outline"
              onClick={sendTestReport}
              disabled={sending || config.recipients.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Envoi...' : 'Test'}
            </Button>
          </div>

          {config.last_sent_at && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Dernier envoi: {new Date(config.last_sent_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Historique */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Envois</CardTitle>
          <CardDescription>10 derniers rapports envoyés</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucun envoi effectué pour le moment</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {item.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm font-medium">
                        {new Date(item.sent_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.recipients.length} destinataire(s)
                      {item.error_message && `: ${item.error_message}`}
                    </div>
                  </div>
                  <Badge variant={item.status === 'success' ? 'default' : 'destructive'}>
                    {item.status === 'success' ? 'Envoyé' : 'Échoué'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
