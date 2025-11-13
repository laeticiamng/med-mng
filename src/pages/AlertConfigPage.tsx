import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQualityAlertConfig } from '@/hooks/useQualityAlertConfig';
import { Bell, Mail, X } from 'lucide-react';

export default function AlertConfigPage() {
  const { config, isLoading, saveConfig, isSaving } = useQualityAlertConfig();
  
  const [minSeverity, setMinSeverity] = useState<string>('high');
  const [notificationFrequency, setNotificationFrequency] = useState<string>('immediate');
  const [digestEnabled, setDigestEnabled] = useState(false);
  const [digestFrequency, setDigestFrequency] = useState<string>('daily');
  const [digestDay, setDigestDay] = useState<string>('1');
  const [digestTime, setDigestTime] = useState('09:00');
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    if (config) {
      setMinSeverity(config.min_severity);
      setNotificationFrequency(config.notification_frequency);
      setDigestEnabled(config.digest_enabled);
      setDigestFrequency(config.digest_frequency);
      setDigestDay(String(config.digest_day || 1));
      setDigestTime(config.digest_time);
      setEmailRecipients(config.email_recipients);
    }
  }, [config]);

  const handleAddEmail = () => {
    if (newEmail && !emailRecipients.includes(newEmail)) {
      setEmailRecipients([...emailRecipients, newEmail]);
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmailRecipients(emailRecipients.filter(e => e !== email));
  };

  const handleSave = () => {
    saveConfig({
      min_severity: minSeverity as any,
      notification_frequency: notificationFrequency as any,
      digest_enabled: digestEnabled,
      digest_frequency: digestFrequency as any,
      digest_day: digestFrequency === 'weekly' ? parseInt(digestDay) : null,
      digest_time: digestTime,
      email_recipients: emailRecipients,
    });
  };

  if (isLoading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuration des alertes qualité</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les seuils d'alerte et les notifications par email
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Seuils d'alerte
          </CardTitle>
          <CardDescription>
            Définissez quand vous souhaitez être notifié
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Sévérité minimale</Label>
            <Select value={minSeverity} onValueChange={setMinSeverity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Faible</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Vous serez notifié uniquement pour les problèmes de cette sévérité ou supérieure
            </p>
          </div>

          <div className="space-y-2">
            <Label>Fréquence des notifications</Label>
            <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immédiate</SelectItem>
                <SelectItem value="hourly">Toutes les heures</SelectItem>
                <SelectItem value="daily">Quotidienne</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Destinataires
          </CardTitle>
          <CardDescription>
            Ajoutez les adresses email qui recevront les alertes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="email@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
            />
            <Button onClick={handleAddEmail}>Ajouter</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {emailRecipients.map((email) => (
              <Badge key={email} variant="secondary" className="gap-1">
                {email}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleRemoveEmail(email)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Digest périodique</CardTitle>
          <CardDescription>
            Recevez un résumé régulier de la qualité du code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Activer le digest</Label>
            <Switch checked={digestEnabled} onCheckedChange={setDigestEnabled} />
          </div>

          {digestEnabled && (
            <>
              <div className="space-y-2">
                <Label>Fréquence</Label>
                <Select value={digestFrequency} onValueChange={setDigestFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Quotidien</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {digestFrequency === 'weekly' && (
                <div className="space-y-2">
                  <Label>Jour de la semaine</Label>
                  <Select value={digestDay} onValueChange={setDigestDay}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Lundi</SelectItem>
                      <SelectItem value="2">Mardi</SelectItem>
                      <SelectItem value="3">Mercredi</SelectItem>
                      <SelectItem value="4">Jeudi</SelectItem>
                      <SelectItem value="5">Vendredi</SelectItem>
                      <SelectItem value="6">Samedi</SelectItem>
                      <SelectItem value="0">Dimanche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Heure d'envoi</Label>
                <Input
                  type="time"
                  value={digestTime}
                  onChange={(e) => setDigestTime(e.target.value)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? 'Enregistrement...' : 'Enregistrer la configuration'}
      </Button>
    </div>
  );
}
