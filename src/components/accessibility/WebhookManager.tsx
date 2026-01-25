import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Send, MessageSquare } from 'lucide-react';

interface WebhookSettings {
  id?: string;
  slack_webhook_url: string | null;
  discord_webhook_url: string | null;
  slack_enabled: boolean;
  discord_enabled: boolean;
}

export function WebhookManager() {
  const [settings, setSettings] = useState<WebhookSettings>({
    slack_webhook_url: null,
    discord_webhook_url: null,
    slack_enabled: false,
    discord_enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSlack, setTestingSlack] = useState(false);
  const [testingDiscord, setTestingDiscord] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { _data, _error } = await supabase
        .from('webhook_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (_error && _error.code !== 'PGRST116') {
        throw _error;
      }

      if (_data) {
        setSettings(_data);
      }
    } catch (error) {
      console.error('Error loading webhook settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const payload = {
        user_id: user.id,
        slack_webhook_url: settings.slack_webhook_url,
        discord_webhook_url: settings.discord_webhook_url,
        slack_enabled: settings.slack_enabled,
        discord_enabled: settings.discord_enabled,
      };

      const { _error } = await supabase
        .from('webhook_settings')
        .upsert(payload, { onConflict: 'user_id' });

      if (_error) throw _error;

      toast.success('Paramètres enregistrés avec succès');
    } catch (error) {
      console.error('Error saving webhook settings:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const testWebhook = async (type: 'slack' | 'discord') => {
    const webhookUrl = type === 'slack' ? settings.slack_webhook_url : settings.discord_webhook_url;
    
    if (!webhookUrl) {
      toast.error(`URL webhook ${type === 'slack' ? 'Slack' : 'Discord'} manquante`);
      return;
    }

    const setTesting = type === 'slack' ? setTestingSlack : setTestingDiscord;
    
    try {
      setTesting(true);
      const { _data, error } = await supabase.functions.invoke('test-webhook', {
        body: { webhookUrl, type },
      });

      if (error) throw error;

      if (_data?.success) {
        toast.success(_data.message);
      } else {
        toast.error(_data?.error || 'Test échoué');
      }
    } catch (error: any) {
      console.error(`Error testing ${type} webhook:`, error);
      toast.error(`Erreur lors du test: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Configuration des Webhooks
        </CardTitle>
        <CardDescription>
          Configurez vos webhooks Slack et Discord pour recevoir des notifications lors de la fin des tests A/B
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Slack Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="slack-enabled" className="text-base font-semibold">
              Slack
            </Label>
            <Switch
              id="slack-enabled"
              checked={settings.slack_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, slack_enabled: checked })
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slack-webhook">URL Webhook Slack</Label>
            <Input
              id="slack-webhook"
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              value={settings.slack_webhook_url || ''}
              onChange={(e) =>
                setSettings({ ...settings, slack_webhook_url: e.target.value })
              }
              disabled={!settings.slack_enabled}
            />
            <p className="text-sm text-muted-foreground">
              Créez un webhook sur{' '}
              <a
                href="https://api.slack.com/messaging/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                api.slack.com/messaging/webhooks
              </a>
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => testWebhook('slack')}
            disabled={!settings.slack_enabled || !settings.slack_webhook_url || testingSlack}
          >
            {testingSlack ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Tester Slack
              </>
            )}
          </Button>
        </div>

        <div className="border-t pt-6" />

        {/* Discord Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="discord-enabled" className="text-base font-semibold">
              Discord
            </Label>
            <Switch
              id="discord-enabled"
              checked={settings.discord_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, discord_enabled: checked })
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="discord-webhook">URL Webhook Discord</Label>
            <Input
              id="discord-webhook"
              type="url"
              placeholder="https://discord.com/api/webhooks/..."
              value={settings.discord_webhook_url || ''}
              onChange={(e) =>
                setSettings({ ...settings, discord_webhook_url: e.target.value })
              }
              disabled={!settings.discord_enabled}
            />
            <p className="text-sm text-muted-foreground">
              Créez un webhook dans les paramètres de votre serveur Discord
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => testWebhook('discord')}
            disabled={!settings.discord_enabled || !settings.discord_webhook_url || testingDiscord}
          >
            {testingDiscord ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Tester Discord
              </>
            )}
          </Button>
        </div>

        <div className="border-t pt-6" />

        <Button onClick={saveSettings} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer les paramètres'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
