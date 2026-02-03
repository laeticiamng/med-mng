import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  Loader2,
  Database,
  Calendar,
  BookOpen,
  Music,
  Brain,
  Trophy,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ExportFormat = 'json' | 'csv';

interface ExportModule {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  tables: string[];
  estimatedSize: string;
}

const EXPORT_MODULES: ExportModule[] = [
  {
    id: 'progress',
    name: 'Progression globale',
    description: 'Statistiques, XP, niveau, streaks',
    icon: Trophy,
    tables: ['gamification_activities', 'user_badges', 'activity_sessions'],
    estimatedSize: '~50 KB'
  },
  {
    id: 'flashcards',
    name: 'Flashcards & SRS',
    description: 'Decks, cartes, historique de révision',
    icon: Brain,
    tables: ['flashcard_decks', 'flashcards', 'flashcard_reviews'],
    estimatedSize: '~200 KB'
  },
  {
    id: 'exams',
    name: 'Examens & QCM',
    description: 'Résultats, réponses, scores',
    icon: BookOpen,
    tables: ['ai_exam_history'],
    estimatedSize: '~100 KB'
  },
  {
    id: 'music',
    name: 'Musique générée',
    description: 'Chansons, playlists, favoris',
    icon: Music,
    tables: ['emotionscare_songs', 'emotionscare_user_songs'],
    estimatedSize: '~30 KB'
  },
  {
    id: 'chat',
    name: 'Conversations IA',
    description: 'Historique MedChat',
    icon: MessageSquare,
    tables: ['chat_conversations', 'chat_messages'],
    estimatedSize: '~150 KB'
  },
  {
    id: 'planner',
    name: 'Planning & objectifs',
    description: 'Sessions d\'étude, objectifs',
    icon: Calendar,
    tables: ['study_sessions', 'study_goals'],
    estimatedSize: '~40 KB'
  },
];

/**
 * Gestionnaire d'export de données pour interopérabilité
 */
export const DataExportManager: React.FC = () => {
  const { user } = useAuth();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [format, setFormat] = useState<ExportFormat>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportedFiles, setExportedFiles] = useState<string[]>([]);

  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectAll = () => {
    setSelectedModules(EXPORT_MODULES.map(m => m.id));
  };

  const selectNone = () => {
    setSelectedModules([]);
  };

  // Convertir les données en CSV
  const toCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value).includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  };

  // Exporter les données
  const handleExport = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour exporter vos données');
      return;
    }

    if (selectedModules.length === 0) {
      toast.error('Sélectionnez au moins un module à exporter');
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setExportedFiles([]);

    const exportData: Record<string, any> = {
      exportDate: new Date().toISOString(),
      userId: user.id,
      platform: 'MED-MNG',
      version: '9.5',
      modules: {}
    };

    try {
      const totalModules = selectedModules.length;
      let completed = 0;

      for (const moduleId of selectedModules) {
        const module = EXPORT_MODULES.find(m => m.id === moduleId);
        if (!module) continue;

        const moduleData: Record<string, any[]> = {};

        for (const tableName of module.tables) {
          try {
            const { data, error } = await supabase
              .from(tableName as any)
              .select('*')
              .eq('user_id', user.id)
              .limit(10000);

            if (error) {
              console.warn(`Erreur pour ${tableName}:`, error);
              moduleData[tableName] = [];
            } else {
              moduleData[tableName] = data || [];
            }
          } catch (err) {
            console.warn(`Table ${tableName} non accessible:`, err);
            moduleData[tableName] = [];
          }
        }

        exportData.modules[moduleId] = {
          name: module.name,
          data: moduleData,
          exportedAt: new Date().toISOString()
        };

        completed++;
        setProgress(Math.round((completed / totalModules) * 100));
      }

      // Générer le fichier
      const timestamp = new Date().toISOString().split('T')[0];
      let filename: string;
      let content: string;
      let mimeType: string;

      if (format === 'json') {
        filename = `med-mng-export-${timestamp}.json`;
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
      } else {
        // Pour CSV, on crée un fichier par module/table
        const csvParts: string[] = [];
        
        for (const [moduleId, moduleInfo] of Object.entries(exportData.modules as Record<string, any>)) {
          for (const [tableName, tableData] of Object.entries(moduleInfo.data as Record<string, any[]>)) {
            if (tableData.length > 0) {
              csvParts.push(`# ${moduleId} - ${tableName}`);
              csvParts.push(toCSV(tableData));
              csvParts.push('');
            }
          }
        }
        
        filename = `med-mng-export-${timestamp}.csv`;
        content = csvParts.join('\n');
        mimeType = 'text/csv';
      }

      // Télécharger
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportedFiles([filename]);
      toast.success(`Export réussi : ${filename}`);
    } catch (error) {
      console.error('Erreur d\'export:', error);
      toast.error('Erreur lors de l\'export des données');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Exporter mes données</CardTitle>
            <CardDescription>
              Téléchargez vos données pour les utiliser dans d'autres outils (LMS, Anki, etc.)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Format selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Format d'export</Label>
          <RadioGroup
            value={format}
            onValueChange={(v) => setFormat(v as ExportFormat)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="format-json" />
              <Label htmlFor="format-json" className="flex items-center gap-2 cursor-pointer">
                <FileJson className="h-4 w-4 text-primary" />
                JSON (structuré, complet)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="format-csv" />
              <Label htmlFor="format-csv" className="flex items-center gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                CSV (Excel, tableurs)
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <Separator />
        
        {/* Module selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Modules à exporter</Label>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                Tout sélectionner
              </Button>
              <Button variant="ghost" size="sm" onClick={selectNone}>
                Tout désélectionner
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXPORT_MODULES.map(module => {
              const isSelected = selectedModules.includes(module.id);
              const Icon = module.icon;
              
              return (
                <motion.div
                  key={module.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleModule(module.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-medium">{module.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {module.description}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {module.estimatedSize}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Export button & progress */}
        <div className="space-y-4">
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Export en cours...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          {exportedFiles.length > 0 && !isExporting && (
            <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg text-accent-foreground">
              <CheckCircle className="h-5 w-5" />
              <span>Fichier exporté : {exportedFiles[0]}</span>
            </div>
          )}
          
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleExport}
            disabled={isExporting || selectedModules.length === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exporter {selectedModules.length} module{selectedModules.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
        
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            📤 Vos données vous appartiennent. Exportez-les à tout moment conformément au RGPD.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExportManager;
