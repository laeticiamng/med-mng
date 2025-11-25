import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useFetchPreferences, useUpdatePreferences } from '@/hooks/useNotificationsService';
import { toast } from 'sonner';
import type { NotificationPreferences } from '@shared/services/notifications.service';
import { BellRing, Info, ShieldCheck } from 'lucide-react';

interface NotificationPreferencesProps {
  userId: string;
}

export default function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const { data: preferences, isLoading } = useFetchPreferences(userId);
  const updateMutation = useUpdatePreferences(userId);

  const [formData, setFormData] = useState<Partial<NotificationPreferences>>({});
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  const handleToggle = (field: keyof NotificationPreferences, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSelectChange = (field: keyof NotificationPreferences, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleTimeChange = (field: keyof NotificationPreferences, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData);
      setIsSaved(true);
      toast.success('Préférences de notification mises à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour des préférences');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded" />
        ))}
      </div>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Impossible de charger les préférences de notification
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!isSaved && (
        <Card className="border-amber-200 bg-amber-50/80 dark:border-amber-700 dark:bg-amber-900/30">
          <CardContent className="flex flex-col gap-3 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-amber-100 p-2 text-amber-700 dark:bg-amber-800/70 dark:text-amber-100">
                <Info className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Modifications non enregistrées</p>
                <p className="text-sm text-muted-foreground">
                  Vous avez ajusté vos préférences. Enregistrez pour les appliquer à vos prochaines
                  notifications.
                </p>
              </div>
            </div>
            <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Enregistrement...' : 'Sauvegarder maintenant'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Types de notifications</CardTitle>
              <CardDescription>
                Choisissez les types de notifications que vous souhaitez recevoir
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
              <div>
                <Label htmlFor="likes" className="text-base font-medium cursor-pointer">
                  J'aime sur vos posts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recevez une alerte lorsqu'un utilisateur aime votre contenu.
                </p>
              </div>
              <Switch
                id="likes"
                checked={formData.likes_enabled ?? true}
                onCheckedChange={checked => handleToggle('likes_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
              <div>
                <Label htmlFor="comments" className="text-base font-medium cursor-pointer">
                  Commentaires sur vos posts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Soyez alerté en cas de retour direct sur vos publications.
                </p>
              </div>
              <Switch
                id="comments"
                checked={formData.comments_enabled ?? true}
                onCheckedChange={checked => handleToggle('comments_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
              <div>
                <Label htmlFor="follows" className="text-base font-medium cursor-pointer">
                  Nouveaux followers
                </Label>
                <p className="text-xs text-muted-foreground">
                  Prévenez-vous lorsqu'une nouvelle personne suit vos activités.
                </p>
              </div>
              <Switch
                id="follows"
                checked={formData.follows_enabled ?? true}
                onCheckedChange={checked => handleToggle('follows_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
              <div>
                <Label htmlFor="mentions" className="text-base font-medium cursor-pointer">
                  Mentions de votre profil
                </Label>
                <p className="text-xs text-muted-foreground">
                  Restez informé lorsqu'un collègue cite votre profil.
                </p>
              </div>
              <Switch
                id="mentions"
                checked={formData.mentions_enabled ?? true}
                onCheckedChange={checked => handleToggle('mentions_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3 sm:col-span-2">
              <div>
                <Label htmlFor="system" className="text-base font-medium cursor-pointer">
                  Notifications système
                </Label>
                <p className="text-xs text-muted-foreground">
                  Mises à jour critiques et alertes techniques concernant votre compte.
                </p>
              </div>
              <Switch
                id="system"
                checked={formData.system_enabled ?? true}
                onCheckedChange={checked => handleToggle('system_enabled', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fréquence des emails</CardTitle>
          <CardDescription>
            Contrôlez la fréquence à laquelle vous recevez des emails de résumé des notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.email_frequency || 'daily'}
            onValueChange={(value: NotificationPreferences['email_frequency']) =>
              handleSelectChange('email_frequency', value)
            }
          >
            <SelectTrigger data-testid="email-frequency-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instant">Instantané</SelectItem>
              <SelectItem value="daily">Quotidien</SelectItem>
              <SelectItem value="weekly">Hebdomadaire</SelectItem>
              <SelectItem value="never">Jamais</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Notifications push</CardTitle>
              <CardDescription>
                Recevez des notifications push en temps réel sur votre appareil
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <Label htmlFor="push" className="text-base font-medium cursor-pointer">
            Activer les notifications push
          </Label>
          <Switch
            id="push"
            checked={formData.push_enabled ?? true}
            onCheckedChange={checked => handleToggle('push_enabled', checked)}
          />
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Heures silencieuses</CardTitle>
          <CardDescription>
            Désactiver les notifications pendant une période définie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <Label htmlFor="quietHours" className="text-base font-medium cursor-pointer">
              Activer les heures silencieuses
            </Label>
            <Switch
              id="quietHours"
              checked={formData.quiet_hours_enabled ?? false}
              onCheckedChange={checked => handleToggle('quiet_hours_enabled', checked)}
            />
          </div>

          {formData.quiet_hours_enabled && (
            <>
              <div>
                <Label htmlFor="quietHoursStart" className="text-sm font-medium">
                  Début des heures silencieuses
                </Label>
                <Input
                  id="quietHoursStart"
                  type="time"
                  value={formData.quiet_hours_start || '22:00'}
                  onChange={e => handleTimeChange('quiet_hours_start', e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="quietHoursEnd" className="text-sm font-medium">
                  Fin des heures silencieuses
                </Label>
                <Input
                  id="quietHoursEnd"
                  type="time"
                  value={formData.quiet_hours_end || '08:00'}
                  onChange={e => handleTimeChange('quiet_hours_end', e.target.value)}
                  className="mt-2"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaved || updateMutation.isPending}
        className="w-full"
        data-testid="save-preferences-button"
      >
        {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Les préférences sont appliquées immédiatement après sauvegarde et peuvent être modifiées à
        tout moment.
      </p>
    </div>
  );
}
