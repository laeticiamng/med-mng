import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Calendar, Mail, Smartphone, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences {
  enabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  dailyReminder: boolean;
  reminderTime: string;
  overdueAlerts: boolean;
  overdueThreshold: number;
  weeklyDigest: boolean;
  streakReminder: boolean;
}

interface SRSNotificationSettingsProps {
  userId: string;
}

export function SRSNotificationSettings({ userId }: SRSNotificationSettingsProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    enabled: false,
    pushEnabled: false,
    emailEnabled: false,
    dailyReminder: true,
    reminderTime: '09:00',
    overdueAlerts: true,
    overdueThreshold: 10,
    weeklyDigest: true,
    streakReminder: true,
  });
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    // Check push notification support
    setPushSupported('Notification' in window && 'serviceWorker' in navigator);
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }

    // Load preferences
    const stored = localStorage.getItem(`notification_prefs_${userId}`);
    if (stored) {
      setPrefs(JSON.parse(stored));
    }
  }, [userId]);

  const savePrefs = (newPrefs: NotificationPreferences) => {
    setPrefs(newPrefs);
    localStorage.setItem(`notification_prefs_${userId}`, JSON.stringify(newPrefs));
    toast({ title: 'Préférences sauvegardées' });
  };

  const requestPushPermission = async () => {
    if (!pushSupported) return;

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === 'granted') {
        savePrefs({ ...prefs, pushEnabled: true, enabled: true });
        
        // Show test notification
        new Notification('Notifications EDN activées', {
          body: 'Vous recevrez des rappels pour vos révisions SRS.',
          icon: '/favicon.ico',
        });
      } else {
        toast({ 
          title: 'Permission refusée', 
          description: 'Activez les notifications dans les paramètres de votre navigateur.',
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Push permission error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications & Rappels
        </CardTitle>
        <CardDescription>
          Configurez vos rappels de révision SRS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            {prefs.enabled ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Notifications</p>
              <p className="text-xs text-muted-foreground">
                {prefs.enabled ? 'Activées' : 'Désactivées'}
              </p>
            </div>
          </div>
          <Switch
            checked={prefs.enabled}
            onCheckedChange={(checked) => savePrefs({ ...prefs, enabled: checked })}
          />
        </div>

        {prefs.enabled && (
          <>
            {/* Notification channels */}
            <div className="space-y-3">
              <Label>Canaux de notification</Label>
              
              {/* Push notifications */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm">Notifications push</span>
                  {pushPermission === 'granted' && (
                    <Badge variant="outline" className="text-success border-success">
                      <Check className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  )}
                </div>
                {pushPermission !== 'granted' ? (
                  <Button 
                    size="sm" 
                    onClick={requestPushPermission}
                    disabled={!pushSupported}
                  >
                    Activer
                  </Button>
                ) : (
                  <Switch
                    checked={prefs.pushEnabled}
                    onCheckedChange={(checked) => savePrefs({ ...prefs, pushEnabled: checked })}
                  />
                )}
              </div>

              {/* Email notifications */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Notifications email</span>
                </div>
                <Switch
                  checked={prefs.emailEnabled}
                  onCheckedChange={(checked) => savePrefs({ ...prefs, emailEnabled: checked })}
                />
              </div>
            </div>

            {/* Daily reminder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Rappel quotidien
                </Label>
                <Switch
                  checked={prefs.dailyReminder}
                  onCheckedChange={(checked) => savePrefs({ ...prefs, dailyReminder: checked })}
                />
              </div>
              {prefs.dailyReminder && (
                <div className="pl-6">
                  <Label className="text-xs text-muted-foreground">Heure du rappel</Label>
                  <Input
                    type="time"
                    value={prefs.reminderTime}
                    onChange={(e) => savePrefs({ ...prefs, reminderTime: e.target.value })}
                    className="w-32 mt-1"
                  />
                </div>
              )}
            </div>

            {/* Overdue alerts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Alertes items en retard</Label>
                <Switch
                  checked={prefs.overdueAlerts}
                  onCheckedChange={(checked) => savePrefs({ ...prefs, overdueAlerts: checked })}
                />
              </div>
              {prefs.overdueAlerts && (
                <div className="pl-6">
                  <Label className="text-xs text-muted-foreground">Seuil d'alerte</Label>
                  <Select 
                    value={prefs.overdueThreshold.toString()}
                    onValueChange={(v) => savePrefs({ ...prefs, overdueThreshold: parseInt(v) })}
                  >
                    <SelectTrigger className="w-40 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5+ items</SelectItem>
                      <SelectItem value="10">10+ items</SelectItem>
                      <SelectItem value="20">20+ items</SelectItem>
                      <SelectItem value="50">50+ items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Additional options */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Résumé hebdomadaire</Label>
                  <p className="text-xs text-muted-foreground">Recap de votre semaine chaque dimanche</p>
                </div>
                <Switch
                  checked={prefs.weeklyDigest}
                  onCheckedChange={(checked) => savePrefs({ ...prefs, weeklyDigest: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Rappel de streak</Label>
                  <p className="text-xs text-muted-foreground">Alerte si vous risquez de perdre votre série</p>
                </div>
                <Switch
                  checked={prefs.streakReminder}
                  onCheckedChange={(checked) => savePrefs({ ...prefs, streakReminder: checked })}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
