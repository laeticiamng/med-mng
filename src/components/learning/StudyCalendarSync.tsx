import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSRS } from '@/hooks/useSRS';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Download } from 'lucide-react';
import { useCallback, useState } from 'react';

export function StudyCalendarSync() {
  const { toast } = useToast();
  const { getReviewForecast, stats } = useSRS();
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
    const ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MED-MNG//Study Calendar//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:MED-MNG Révisions',
      'X-WR-TIMEZONE:Europe/Paris'
    ];

    // Add events for each day with reviews
    forecast.forEach((day, _index) => {
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
        ical.push(`LOCATION:${window.location.origin}/srs-review`);
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
      ical.push(`LOCATION:${window.location.origin}/exam-mode`);
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Exporter vers votre calendrier
        </CardTitle>
        <CardDescription>
          Vos révisions prévues sur 30 jours, à importer dans votre agenda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Retirés le 25/09/2026 : l'interrupteur « Synchronisation automatique »
            (sans effet), l'« URL de synchronisation » (/api/calendar/<id>.ics :
            aucune route ne la sert) et « Ajouter à Google Calendar » (qui
            s'abonnait à cette URL inexistante). Reste l'export réel en .ics. */}
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={downloadICal}
          disabled={loading}
        >
          <Download className="h-4 w-4" />
          Télécharger le fichier .ics
          <Badge variant="secondary" className="ml-auto text-xs">Apple, Google, Outlook</Badge>
        </Button>

        {/* Stats preview */}
        {stats && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm">
              <span className="font-medium text-primary">{stats.dueToday}</span> items à réviser aujourd'hui
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Le fichier reflète les révisions prévues au moment du téléchargement
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StudyCalendarSync;
