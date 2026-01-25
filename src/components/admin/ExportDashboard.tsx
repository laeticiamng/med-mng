import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Calendar, Database, Download, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const AVAILABLE_TABLES = [
  { id: 'edn_items_immersive', name: 'Items EDN Immersifs', description: 'Contenu pédagogique principal' },
  { id: 'operation_logs', name: 'Logs Opération', description: 'Historique des opérations système' },
  { id: 'user_activity_logs', name: 'Logs Activité', description: 'Activité des utilisateurs' },
  { id: 'data_integrity_reports', name: 'Rapports Intégrité', description: 'Résultats des vérifications d\'intégrité' },
  { id: 'audit_reports', name: 'Rapports Audit', description: 'Rapports d\'audit système' },
  { id: 'extraction_logs', name: 'Logs Extraction', description: 'Historique des extractions de données' },
  { id: 'profiles', name: 'Profils Utilisateurs', description: 'Données des profils utilisateurs' },
];

export const ExportDashboard = () => {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleTableSelection = (tableId: string, checked: boolean) => {
    if (checked) {
      setSelectedTables(prev => [...prev, tableId]);
    } else {
      setSelectedTables(prev => prev.filter(id => id !== tableId));
    }
  };

  const handleExport = async () => {
    if (selectedTables.length === 0) {
      toast.error('Veuillez sélectionner au moins une table à exporter');
      return;
    }

    setIsExporting(true);
    
    try {
      console.log('Démarrage export admin avec:', {
        format,
        tables: selectedTables,
        dateRange: dateRange.start && dateRange.end ? dateRange : undefined,
        includeMetadata
      });

      const { data, error } = await supabase.functions.invoke('admin-export', {
        body: {
          format,
          tables: selectedTables,
          dateRange: dateRange.start && dateRange.end ? dateRange : undefined,
          includeMetadata
        }
      });

      if (error) {
        console.error('Erreur export:', error);
        toast.error(`Erreur lors de l'export: ${error.message}`);
        return;
      }

      // Créer le fichier et déclencher le téléchargement
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `admin-export-${timestamp}.${format}`;
      
      const blob = new Blob([_data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Export ${format.toUpperCase()} généré avec succès!`);
      
    } catch (exportError) {
      console.error('Erreur export:', exportError);
      toast.error('Erreur lors de la génération de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickExport = async (preset: 'all' | 'logs' | 'content') => {
    let tables: string[] = [];
    
    switch (preset) {
      case 'all':
        tables = AVAILABLE_TABLES.map(t => t.id);
        break;
      case 'logs':
        tables = ['operation_logs', 'user_activity_logs', 'extraction_logs'];
        break;
      case 'content':
        tables = ['edn_items_immersive', 'audit_reports', 'data_integrity_reports'];
        break;
    }
    
    setSelectedTables(tables);
    setTimeout(handleExport, 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Export CSV & Reporting Admin
          </CardTitle>
          <CardDescription>
            Exportez les données d'administration en CSV ou JSON avec filtres personnalisés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Actions rapides */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Actions rapides</Label>
            <div className="flex gap-3 flex-wrap">
              <Button 
                variant="outline" 
                onClick={() => handleQuickExport('all')}
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter tout
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleQuickExport('logs')}
                disabled={isExporting}
              >
                <FileText className="h-4 w-4 mr-2" />
                Logs seulement
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleQuickExport('content')}
                disabled={isExporting}
              >
                <Database className="h-4 w-4 mr-2" />
                Contenu seulement
              </Button>
            </div>
          </div>

          {/* Sélection des tables */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Tables à exporter</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_TABLES.map((table) => (
                <div key={table.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={table.id}
                    checked={selectedTables.includes(table.id)}
                    onCheckedChange={(checked) => handleTableSelection(table.id, checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={table.id} className="text-sm font-medium cursor-pointer">
                      {table.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {table.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options d'export */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Format d'export</Label>
              <Select value={format} onValueChange={(value: 'csv' | 'json') => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel compatible)</SelectItem>
                  <SelectItem value="json">JSON (Structure complète)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="metadata"
                checked={includeMetadata}
                onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
              />
              <Label htmlFor="metadata" className="text-sm">
                Inclure les métadonnées d'export
              </Label>
            </div>
          </div>

          {/* Filtre par date */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Filtre par période (optionnel)
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Date de début</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Date de fin</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Avertissement */}
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-warning">Information importante</p>
              <p className="text-warning/80">
                Les exports sont limités à 10 000 enregistrements par table pour des raisons de performance. 
                Pour des exports plus volumineux, contactez l'équipe technique.
              </p>
            </div>
          </div>

          {/* Bouton d'export */}
          <Button 
            onClick={handleExport} 
            disabled={isExporting || selectedTables.length === 0}
            className="w-full"
            size="lg"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Génération en cours...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Générer l'export {format.toUpperCase()}
              </>
            )}
          </Button>

          {selectedTables.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedTables.length} table(s) sélectionnée(s): {selectedTables.join(', ')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};