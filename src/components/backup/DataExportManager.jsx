import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Database, 
  FileText, 
  Music, 
  Users, 
  Calendar,
  Shield,
  Archive,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

/**
 * Gestionnaire d'Export et Backup de Données
 */
export const DataExportManager = () => {
  const [selectedTables, setSelectedTables] = useState({
    users: true,
    profiles: true,
    songs: true,
    playlists: false,
    assessments: true,
    audit_reports: false,
    clinical_responses: true
  });

  const [exportFormat, setExportFormat] = useState('json');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const tables = [
    { key: 'users', label: 'Utilisateurs', icon: Users, description: 'Données des comptes utilisateurs', size: '2.3 MB' },
    { key: 'profiles', label: 'Profils', icon: Users, description: 'Informations des profils utilisateurs', size: '890 KB' },
    { key: 'songs', label: 'Musiques', icon: Music, description: 'Bibliothèque de contenus musicaux', size: '156 MB' },
    { key: 'playlists', label: 'Playlists', icon: Music, description: 'Playlists créées par les utilisateurs', size: '445 KB' },
    { key: 'assessments', label: 'Évaluations', icon: FileText, description: 'Données d\'évaluation clinique', size: '12 MB' },
    { key: 'audit_reports', label: 'Rapports d\'audit', icon: Shield, description: 'Historique des audits système', size: '8.7 MB' },
    { key: 'clinical_responses', label: 'Réponses cliniques', icon: FileText, description: 'Réponses aux instruments cliniques', size: '45 MB' }
  ];

  const recentExports = [
    { id: 1, name: 'Export_Medical_Data_2024-01-15.json', date: '2024-01-15', size: '67 MB', status: 'completed' },
    { id: 2, name: 'Backup_Users_2024-01-10.csv', date: '2024-01-10', size: '3.2 MB', status: 'completed' },
    { id: 3, name: 'Clinical_Export_2024-01-05.xlsx', date: '2024-01-05', size: '28 MB', status: 'failed' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulation du processus d'export
    const selectedCount = Object.values(selectedTables).filter(Boolean).length;
    const progressStep = 100 / selectedCount;

    for (let i = 0; i < selectedCount; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setExportProgress(prev => Math.min(prev + progressStep, 100));
    }

    setTimeout(() => {
      setIsExporting(false);
      setExportProgress(0);
    }, 1000);
  };

  const toggleTable = (tableKey) => {
    setSelectedTables(prev => ({
      ...prev,
      [tableKey]: !prev[tableKey]
    }));
  };

  const selectedCount = Object.values(selectedTables).filter(Boolean).length;
  const totalSize = tables
    .filter(table => selectedTables[table.key])
    .reduce((total, table) => {
      const size = parseFloat(table.size.replace(/[^0-9.]/g, ''));
      const unit = table.size.includes('MB') ? 1000000 : 1000;
      return total + (size * unit);
    }, 0);

  const formatSize = (bytes) => {
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
    return `${(bytes / 1000).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Export de Données</h1>
          <p className="text-muted-foreground">Sauvegarde et export des données de la plateforme</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Archive className="w-4 h-4" />
          Système de Backup
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration d'Export */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Sélection des Données
              </CardTitle>
              <CardDescription>
                Choisissez les tables à inclure dans l'export
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tables.map((table) => {
                const IconComponent = table.icon;
                return (
                  <div key={table.key} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={selectedTables[table.key]}
                      onCheckedChange={() => toggleTable(table.key)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="w-4 h-4 text-primary" />
                        <span className="font-medium">{table.label}</span>
                        <Badge variant="outline" className="text-xs">{table.size}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{table.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Configuration d'Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Format d'export</label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                      <SelectItem value="sql">SQL Dump</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Compression</label>
                  <Select defaultValue="zip">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      <SelectItem value="zip">ZIP</SelectItem>
                      <SelectItem value="gzip">GZIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isExporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Export en cours...</span>
                    <span>{exportProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Résumé et Actions */}
        <div className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="text-base">Résumé de l'Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tables sélectionnées:</span>
                  <span className="font-medium">{selectedCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taille estimée:</span>
                  <span className="font-medium">{formatSize(totalSize)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Format:</span>
                  <span className="font-medium uppercase">{exportFormat}</span>
                </div>
              </div>

              <Button 
                className="w-full medical-btn-primary" 
                onClick={handleExport}
                disabled={selectedCount === 0 || isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Export en cours...' : 'Lancer l\'Export'}
              </Button>

              {selectedCount === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Sélectionnez au moins une table pour continuer
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="text-base">Exports Récents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentExports.map((exportItem) => (
                <div key={exportItem.id} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{exportItem.name}</span>
                    {exportItem.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    ) : exportItem.status === 'failed' ? (
                      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-warning flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{exportItem.date}</span>
                    <span>{exportItem.size}</span>
                  </div>
                  {exportItem.status === 'completed' && (
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      <Download className="w-3 h-3 mr-1" />
                      Télécharger
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataExportManager;