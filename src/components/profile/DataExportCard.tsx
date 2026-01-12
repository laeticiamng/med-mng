import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  Loader2,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { useToast } from '@/hooks/use-toast';

interface DataExportCardProps {
  className?: string;
}

export const DataExportCard: React.FC<DataExportCardProps> = ({ className = '' }) => {
  const [exporting, setExporting] = useState<'json' | 'csv' | null>(null);
  const { exportActivityData } = useActivityTracking();
  const { data: analytics } = useUserAnalytics();
  const { toast } = useToast();

  const handleExportJSON = async () => {
    setExporting('json');
    try {
      const data = await exportActivityData(365);
      
      // Add analytics data
      const fullExport = {
        ...JSON.parse(data),
        analytics: analytics ? {
          progression: {
            totalItems: analytics.totalItems,
            revisedItems: analytics.revisedItems,
            inProgressItems: analytics.inProgressItems,
            progressPercentage: analytics.progressPercentage,
          },
          gamification: {
            currentStreak: analytics.currentStreak,
            bestStreak: analytics.bestStreak,
            totalXP: analytics.totalXP,
            level: analytics.level,
            badgesUnlocked: analytics.badgesUnlocked,
          },
          music: {
            songsInLibrary: analytics.songsInLibrary,
            favoriteSongsCount: analytics.favoriteSongsCount,
            totalListeningMinutes: analytics.totalListeningMinutes,
          },
          study: {
            totalStudyMinutes: analytics.totalStudyMinutes,
            studySessionsCount: analytics.studySessionsCount,
            averageSessionMinutes: analytics.averageSessionMinutes,
          },
          specialtyPerformance: analytics.specialtyPerformance,
        } : null
      };

      const blob = new Blob([JSON.stringify(fullExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `med-mng-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: '✅ Export réussi',
        description: 'Vos données ont été téléchargées au format JSON.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter vos données.',
        variant: 'destructive',
      });
    } finally {
      setExporting(null);
    }
  };

  const handleExportCSV = async () => {
    setExporting('csv');
    try {
      const data = await exportActivityData(365);
      const parsed = JSON.parse(data);
      
      // Convert daily data to CSV
      const headers = ['Date', 'Total Activités', 'Reviews', 'Exams', 'Flashcards', 'Cas Cliniques', 'Études'];
      const rows = (parsed.dailyData || []).map((day: any) => [
        day.date,
        day.count,
        day.activities?.srs_review || 0,
        day.activities?.exam || 0,
        day.activities?.flashcard || 0,
        day.activities?.clinical_case || 0,
        day.activities?.study || 0,
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((row: any[]) => row.join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `med-mng-activites-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: '✅ Export réussi',
        description: 'Vos activités ont été téléchargées au format CSV.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter vos données.',
        variant: 'destructive',
      });
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card className={`border-border/30 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Exporter mes données
        </CardTitle>
        <CardDescription>
          Téléchargez vos statistiques et activités (RGPD)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-foreground">Données des 12 derniers mois incluses</p>
            <p className="text-muted-foreground text-xs mt-1">
              Progression, activités, gamification, musique
            </p>
          </div>
        </div>

        {/* Export buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleExportJSON}
            disabled={exporting !== null}
            className="gap-2"
          >
            {exporting === 'json' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileJson className="h-4 w-4" />
            )}
            JSON complet
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={exporting !== null}
            className="gap-2"
          >
            {exporting === 'csv' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            CSV (activités)
          </Button>
        </div>

        {/* Features included */}
        <div className="space-y-2 pt-2">
          <p className="text-xs text-muted-foreground font-medium">Données incluses :</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              Progression
            </Badge>
            <Badge variant="secondary" className="text-xs gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              Activités
            </Badge>
            <Badge variant="secondary" className="text-xs gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              Streaks
            </Badge>
            <Badge variant="secondary" className="text-xs gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              Badges
            </Badge>
            <Badge variant="secondary" className="text-xs gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              Spécialités
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExportCard;
