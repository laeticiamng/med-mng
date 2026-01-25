import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
    AlertCircle,
    Calendar,
    CheckCircle, Clock,
    Link2,
    RefreshCw, Settings,
    Unlink
} from 'lucide-react';
import React, { useState } from 'react';

interface CalendarConnection {
  id: string;
  provider: 'google' | 'outlook' | 'apple' | 'ical';
  name: string;
  connected: boolean;
  lastSync?: Date;
  autoSync: boolean;
}

interface ScheduledReview {
  id: string;
  itemCode: string;
  itemTitle: string;
  scheduledAt: Date;
  duration: number;
  synced: boolean;
}

export const CalendarSync: React.FC = () => {
  const [connections, setConnections] = useState<CalendarConnection[]>([
    { id: '1', provider: 'google', name: 'Google Calendar', connected: false, autoSync: true },
    { id: '2', provider: 'outlook', name: 'Outlook', connected: false, autoSync: false },
    { id: '3', provider: 'apple', name: 'Apple Calendar', connected: false, autoSync: false },
    { id: '4', provider: 'ical', name: 'iCal Export', connected: true, autoSync: false }
  ]);

  const [scheduledReviews, setScheduledReviews] = useState<ScheduledReview[]>([
    {
      id: '1',
      itemCode: 'IC-1',
      itemTitle: 'Relations médecin-malade',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      duration: 30,
      synced: false
    },
    {
      id: '2',
      itemCode: 'IC-228',
      itemTitle: 'Douleur thoracique aiguë',
      scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      duration: 45,
      synced: true
    },
    {
      id: '3',
      itemCode: 'IC-232',
      itemTitle: 'Insuffisance cardiaque',
      scheduledAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      duration: 30,
      synced: false
    }
  ]);

  const [syncSettings, setSyncSettings] = useState({
    defaultDuration: 30,
    reminderMinutes: 15,
    calendarName: 'MED MNG - Révisions',
    includeNotes: true
  });

  const { toast } = useToast();

  const getProviderIcon = (provider: CalendarConnection['provider']) => {
    switch (provider) {
      case 'google':
        return '📅';
      case 'outlook':
        return '📆';
      case 'apple':
        return '🍎';
      case 'ical':
        return '📋';
    }
  };

  const getProviderColor = (provider: CalendarConnection['provider']) => {
    switch (provider) {
      case 'google':
        return 'bg-blue-500/10 text-blue-500';
      case 'outlook':
        return 'bg-sky-500/10 text-sky-500';
      case 'apple':
        return 'bg-gray-500/10 text-gray-500';
      case 'ical':
        return 'bg-purple-500/10 text-purple-500';
    }
  };

  const connectCalendar = async (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;

    if (connection.provider === 'ical') {
      // Générer le fichier iCal
      generateICalFile();
      return;
    }

    // Simulation de connexion OAuth
    toast({
      title: 'Connexion en cours...',
      description: `Redirection vers ${connection.name}...`,
    });

    // Simuler un délai
    setTimeout(() => {
      setConnections(prev => prev.map(c => 
        c.id === connectionId 
          ? { ...c, connected: true, lastSync: new Date() }
          : c
      ));
      toast({
        title: 'Connexion réussie',
        description: `${connection.name} est maintenant connecté.`,
      });
    }, 1500);
  };

  const disconnectCalendar = (connectionId: string) => {
    setConnections(prev => prev.map(c => 
      c.id === connectionId 
        ? { ...c, connected: false, lastSync: undefined }
        : c
    ));
    toast({
      title: 'Déconnecté',
      description: 'Le calendrier a été déconnecté.',
    });
  };

  const toggleAutoSync = (connectionId: string) => {
    setConnections(prev => prev.map(c => 
      c.id === connectionId ? { ...c, autoSync: !c.autoSync } : c
    ));
  };

  const syncAllReviews = async () => {
    toast({
      title: 'Synchronisation...',
      description: 'Envoi des révisions vers vos calendriers...',
    });

    setTimeout(() => {
      setScheduledReviews(prev => prev.map(r => ({ ...r, synced: true })));
      toast({
        title: 'Synchronisation terminée',
        description: `${scheduledReviews.length} révisions synchronisées.`,
      });
    }, 2000);
  };

  const generateICalFile = () => {
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MED MNG//Révisions//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...scheduledReviews.map(review => {
        const startDate = review.scheduledAt;
        const endDate = new Date(startDate.getTime() + review.duration * 60 * 1000);
        const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        return [
          'BEGIN:VEVENT',
          `UID:${review.id}@medmng.app`,
          `DTSTAMP:${formatDate(new Date())}`,
          `DTSTART:${formatDate(startDate)}`,
          `DTEND:${formatDate(endDate)}`,
          `SUMMARY:📚 Révision ${review.itemCode}`,
          `DESCRIPTION:${review.itemTitle}`,
          'END:VEVENT'
        ].join('\r\n');
      }),
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medmng-revisions.ics';
    a.click();

    toast({
      title: 'Fichier iCal généré',
      description: 'Importez ce fichier dans votre application de calendrier.',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Synchronisation Calendrier
          </CardTitle>
          <CardDescription>
            Synchronisez vos révisions avec vos calendriers externes
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Connexions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calendriers connectés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {connections.map((connection) => (
            <div 
              key={connection.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${getProviderColor(connection.provider)}`}>
                  <span className="text-xl">{getProviderIcon(connection.provider)}</span>
                </div>
                <div>
                  <p className="font-medium">{connection.name}</p>
                  {connection.connected && connection.lastSync && (
                    <p className="text-xs text-muted-foreground">
                      Dernière sync: {connection.lastSync.toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {connection.connected && connection.provider !== 'ical' && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={connection.autoSync}
                      onCheckedChange={() => toggleAutoSync(connection.id)}
                    />
                    <Label className="text-sm">Auto-sync</Label>
                  </div>
                )}
                {connection.connected ? (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-success/10 text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connecté
                    </Badge>
                    {connection.provider !== 'ical' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => disconnectCalendar(connection.id)}
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => connectCalendar(connection.id)}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    {connection.provider === 'ical' ? 'Télécharger' : 'Connecter'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Révisions programmées */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Révisions à synchroniser</CardTitle>
            <Button onClick={syncAllReviews}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tout synchroniser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduledReviews.map((review) => (
              <div 
                key={review.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${review.synced ? 'bg-success/10' : 'bg-muted'}`}>
                    {review.synced ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{review.itemCode}</Badge>
                      <span className="font-medium">{review.itemTitle}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {review.scheduledAt.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} • {review.duration} min
                    </p>
                  </div>
                </div>
                <Badge variant={review.synced ? 'default' : 'secondary'}>
                  {review.synced ? 'Synchronisé' : 'En attente'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Paramètres de sync */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres de synchronisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duration">Durée par défaut (min)</Label>
              <Select
                value={syncSettings.defaultDuration.toString()}
                onValueChange={(v) => setSyncSettings({ ...syncSettings, defaultDuration: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder">Rappel avant (min)</Label>
              <Select
                value={syncSettings.reminderMinutes.toString()}
                onValueChange={(v) => setSyncSettings({ ...syncSettings, reminderMinutes: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendarName">Nom du calendrier</Label>
              <Input
                id="calendarName"
                value={syncSettings.calendarName}
                onChange={(e) => setSyncSettings({ ...syncSettings, calendarName: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-3 pt-6">
              <Switch
                checked={syncSettings.includeNotes}
                onCheckedChange={(checked) => setSyncSettings({ ...syncSettings, includeNotes: checked })}
              />
              <Label>Inclure les notes dans les événements</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note d'information */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-primary">Astuce</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Pour une synchronisation automatique, connectez Google Calendar ou Outlook. 
                Pour les autres applications, utilisez l'export iCal et importez le fichier manuellement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
