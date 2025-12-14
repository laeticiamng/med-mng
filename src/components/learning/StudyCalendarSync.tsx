import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar, Download, Link2, RefreshCw, Check, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSRS } from '@/hooks/useSRS';

interface CalendarEvent {
  title: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
}

export function StudyCalendarSync() {
  const { toast } = useToast();
  const { getReviewForecast, stats } = useSRS();
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [icalUrl, setIcalUrl] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Generate iCal file from study sessions
   */
  const generateICal = useCallback(async (): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return '';

    // Get review forecast for next 30 days
    const forecast = await getReviewForecast(user.id, 30);
    
    // Create iCal content
    let ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MED-MNG//Study Calendar//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:MED-MNG Révisions',
      'X-WR-TIMEZONE:Europe/Paris'
    ];

    // Add timezone definition
    ical.push('BEGIN:VTIMEZONE');
    ical.push('TZID:Europe/Paris');
    ical.push('END:VTIMEZONE');

    // Add events for each day with reviews
    forecast.forEach((day, index) => {
      if (day.count > 0) {
        const startDate = new Date(day.date);
        startDate.setHours(9, 0, 0, 0); // Default to 9 AM
        
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + Math.min(60, day.count * 3)); // 3 min per item, max 1h

        const uid = `${day.date}-${user.id}@med-mng.com`;
        const dtstart = formatICalDate(startDate);
        const dtend = formatICalDate(endDate);
        const dtstamp = formatICalDate(new Date());

        ical.push('BEGIN:VEVENT');
        ical.push(`UID:${uid}`);
        ical.push(`DTSTAMP:${dtstamp}`);
        ical.push(`DTSTART:${dtstart}`);
        ical.push(`DTEND:${dtend}`);
        ical.push(`SUMMARY:📚 MED-MNG: ${day.count} items à réviser`);
        ical.push(`DESCRIPTION:Vous avez ${day.count} items EDN à réviser aujourd'hui.\\nConnectez-vous à MED-MNG pour commencer !`);
        ical.push('LOCATION:https://med-mng.com/srs-review');
        ical.push('STATUS:CONFIRMED');
        ical.push('TRANSP:OPAQUE');
        ical.push('BEGIN:VALARM');
        ical.push('TRIGGER:-PT30M');
        ical.push('ACTION:DISPLAY');
        ical.push(`DESCRIPTION:Rappel: ${day.count} items EDN à réviser`);
        ical.push('END:VALARM');
        ical.push('END:VEVENT');
      }
    });

    // Add weekly exam reminder
    for (let week = 0; week < 4; week++) {
      const examDate = new Date();
      examDate.setDate(examDate.getDate() + (7 * (week + 1)) - examDate.getDay() + 6); // Saturday
      examDate.setHours(14, 0, 0, 0);

      const endExamDate = new Date(examDate);
      endExamDate.setHours(15, 0, 0, 0);

      const uid = `exam-${week}-${user.id}@med-mng.com`;

      ical.push('BEGIN:VEVENT');
      ical.push(`UID:${uid}`);
      ical.push(`DTSTAMP:${formatICalDate(new Date())}`);
      ical.push(`DTSTART:${formatICalDate(examDate)}`);
      ical.push(`DTEND:${formatICalDate(endExamDate)}`);
      ical.push('SUMMARY:🎯 MED-MNG: Examen blanc hebdomadaire');
      ical.push('DESCRIPTION:Session d\'examen blanc recommandee pour tester vos connaissances. Mode examen IA disponible !');
      ical.push('LOCATION:https://med-mng.com/exam-mode');
      ical.push('STATUS:CONFIRMED');
      ical.push('END:VEVENT');
    }

    ical.push('END:VCALENDAR');

    return ical.join('\r\n');
  }, [getReviewForecast]);

  /**
   * Format date for iCal
   */
  const formatICalDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  /**
   * Download iCal file
   */
  const downloadICal = async () => {
    setLoading(true);
    try {
      const icalContent = await generateICal();
      
      if (!icalContent) {
        toast({
          title: "Erreur",
          description: "Connectez-vous pour générer le calendrier",
          variant: "destructive"
        });
        return;
      }

      const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'med-mng-revisions.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Calendrier téléchargé",
        description: "Importez le fichier .ics dans votre application calendrier"
      });
    } catch (error) {
      console.error('Error generating iCal:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le calendrier",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate subscribable iCal URL
   */
  const generateICalUrl = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          variant: "destructive"
        });
        return;
      }

      // In production, this would be a real URL from an edge function
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/api/calendar/${user.id}.ics`;
      setIcalUrl(url);

      toast({
        title: "URL générée",
        description: "Copiez cette URL pour synchroniser automatiquement"
      });
    } catch (error) {
      console.error('Error generating URL:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copy URL to clipboard
   */
  const copyUrl = async () => {
    if (!icalUrl) return;
    await navigator.clipboard.writeText(icalUrl);
    toast({
      title: "Copié !",
      description: "URL copiée dans le presse-papier"
    });
  };

  /**
   * Open Google Calendar add subscription
   */
  const addToGoogleCalendar = () => {
    const googleUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(icalUrl || window.location.origin + '/api/calendar.ics')}`;
    window.open(googleUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Synchronisation Calendrier
        </CardTitle>
        <CardDescription>
          Synchronisez vos sessions de révision avec votre calendrier
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <RefreshCw className={`h-4 w-4 ${syncEnabled ? 'text-success' : 'text-muted-foreground'}`} />
            <div>
              <p className="text-sm font-medium">Synchronisation automatique</p>
              <p className="text-xs text-muted-foreground">Mises à jour en temps réel</p>
            </div>
          </div>
          <Switch
            checked={syncEnabled}
            onCheckedChange={setSyncEnabled}
          />
        </div>

        {/* Export options */}
        <div className="grid gap-3">
          {/* iCal download */}
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={downloadICal}
            disabled={loading}
          >
            <Download className="h-4 w-4" />
            Télécharger fichier .ics
            <Badge variant="secondary" className="ml-auto text-xs">Apple/Outlook</Badge>
          </Button>

          {/* Generate URL */}
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={generateICalUrl}
            disabled={loading}
          >
            <Link2 className="h-4 w-4" />
            Générer URL de synchronisation
          </Button>

          {/* URL display */}
          {icalUrl && (
            <div className="space-y-2">
              <Label className="text-xs">URL iCal (pour abonnement)</Label>
              <div className="flex gap-2">
                <Input
                  value={icalUrl}
                  readOnly
                  className="text-xs font-mono"
                />
                <Button size="sm" variant="ghost" onClick={copyUrl}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Google Calendar */}
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={addToGoogleCalendar}
          >
            <ExternalLink className="h-4 w-4" />
            Ajouter à Google Calendar
            <Badge variant="secondary" className="ml-auto text-xs">Recommandé</Badge>
          </Button>
        </div>

        {/* Stats preview */}
        {stats && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm">
              <span className="font-medium text-primary">{stats.dueToday}</span> items à réviser aujourd'hui
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ces sessions seront ajoutées à votre calendrier
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StudyCalendarSync;
