import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download, Database, FileText, Table, Archive,
  Calendar, Filter, Settings, Clock, CheckCircle,
  AlertTriangle, RefreshCw, Zap, FileSpreadsheet
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExportJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  fileSize?: string;
  downloadUrl?: string;
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
}

interface TableInfo {
  name: string;
  count: number;
  selected: boolean;
  lastUpdated: string;
  size: string;
}

interface ExportConfig {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  dateRange: {
    from: string;
    to: string;
  };
  includeMetadata: boolean;
  compression: boolean;
  encryption: boolean;
  filter: string;
}

export const AdvancedDataExport = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [config, setConfig] = useState<ExportConfig>({
    format: 'csv',
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0]
    },
    includeMetadata: true,
    compression: true,
    encryption: false,
    filter: ''
  });

  useEffect(() => {
    fetchTableInfo();
    fetchExportJobs();
  }, []);

  const fetchTableInfo = async () => {
    try {
      setLoading(true);
      
      // Get table information from various sources
      const tableQueries = [
        { name: 'profiles', query: supabase.from('profiles').select('*', { count: 'exact', head: true }) },
        { name: 'user_subscriptions', query: supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }) },
        { name: 'edn_items_complete', query: supabase.from('edn_items_complete').select('*', { count: 'exact', head: true }) },
        { name: 'emotionscare_songs', query: supabase.from('emotionscare_songs').select('*', { count: 'exact', head: true }) },
        { name: 'user_activity_logs', query: supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }) },
        { name: 'operation_logs', query: supabase.from('operation_logs').select('*', { count: 'exact', head: true }) }
      ];

      const results = await Promise.allSettled(
        tableQueries.map(({ query }) => query)
      );

      const tableData: TableInfo[] = tableQueries.map(({ name }, index) => {
        const result = results[index];
        const count = result.status === 'fulfilled' ? result.value.count || 0 : 0;
        
        return {
          name,
          count,
          selected: false,
          lastUpdated: new Date().toISOString(),
          size: `${Math.round(count * 0.5)}KB` // Estimation
        };
      });

      setTables(tableData);
    } catch (error) {
      console.error('Error fetching table info:', error);
      toast.error('Erreur lors de la récupération des informations des tables');
    } finally {
      setLoading(false);
    }
  };

  const fetchExportJobs = async () => {
    // Mock export jobs for demonstration
    const mockJobs: ExportJob[] = [
      {
        id: '1',
        name: 'Export complet utilisateurs',
        status: 'completed',
        progress: 100,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        fileSize: '2.3 MB',
        downloadUrl: '#',
        format: 'csv'
      },
      {
        id: '2',
        name: 'Rapport analytics mensuel',
        status: 'running',
        progress: 65,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        format: 'xlsx'
      },
      {
        id: '3',
        name: 'Export logs sécurité',
        status: 'failed',
        progress: 0,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        format: 'json'
      }
    ];
    
    setExportJobs(mockJobs);
  };

  const toggleTableSelection = (tableName: string) => {
    setTables(prev => 
      prev.map(table => 
        table.name === tableName 
          ? { ...table, selected: !table.selected }
          : table
      )
    );
  };

  const selectAllTables = () => {
    setTables(prev => prev.map(table => ({ ...table, selected: true })));
  };

  const deselectAllTables = () => {
    setTables(prev => prev.map(table => ({ ...table, selected: false })));
  };

  const startExport = async () => {
    try {
      setExporting(true);
      
      const selectedTables = tables.filter(table => table.selected);
      if (selectedTables.length === 0) {
        toast.error('Veuillez sélectionner au moins une table');
        return;
      }

      toast.loading('Préparation de l\'export...', { id: 'export' });

      // Create new export job
      const newJob: ExportJob = {
        id: Date.now().toString(),
        name: `Export ${selectedTables.length} tables - ${config.format.toUpperCase()}`,
        status: 'running',
        progress: 0,
        createdAt: new Date().toISOString(),
        format: config.format
      };

      setExportJobs(prev => [newJob, ...prev]);

      // Simulate export progress
      const progressSteps = [10, 25, 50, 75, 90, 100];
      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setExportJobs(prev => 
          prev.map(job => 
            job.id === newJob.id 
              ? { ...job, progress: step }
              : job
          )
        );
        
        toast.loading(`Export en cours... ${step}%`, { id: 'export' });
      }

      // Complete the export
      setExportJobs(prev => 
        prev.map(job => 
          job.id === newJob.id 
            ? { 
                ...job, 
                status: 'completed', 
                progress: 100,
                completedAt: new Date().toISOString(),
                fileSize: `${Math.round(selectedTables.reduce((sum, t) => sum + t.count, 0) * 0.8)}KB`,
                downloadUrl: '#'
              }
            : job
        )
      );

      toast.success('Export terminé avec succès', { id: 'export' });

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export', { id: 'export' });
    } finally {
      setExporting(false);
    }
  };

  const downloadExport = (job: ExportJob) => {
    // Simulate file download
    const csvContent = `# Export ${job.name}\n# Generated: ${job.createdAt}\n# Format: ${job.format}\n\nid,name,created_at\n1,Sample Data,${new Date().toISOString()}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.name.toLowerCase().replace(/\s+/g, '-')}.${job.format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Téléchargement démarré');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv': return <Table className="h-4 w-4" />;
      case 'json': return <FileText className="h-4 w-4" />;
      case 'xlsx': return <FileSpreadsheet className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Download className="h-8 w-8" />
            Export de Données Avancé
          </h1>
          <p className="text-muted-foreground">
            Exportation complète avec formats multiples et options avancées
          </p>
        </div>
        <Button 
          onClick={fetchTableInfo} 
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration d'Export
            </CardTitle>
            <CardDescription>
              Sélectionnez les tables et configurez les options d'export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tables" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tables">Tables</TabsTrigger>
                <TabsTrigger value="format">Format</TabsTrigger>
                <TabsTrigger value="options">Options</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tables" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button size="sm" variant="outline" onClick={selectAllTables}>
                    Tout sélectionner
                  </Button>
                  <Button size="sm" variant="outline" onClick={deselectAllTables}>
                    Tout désélectionner
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {tables.map((table) => (
                    <div key={table.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={table.selected}
                          onCheckedChange={() => toggleTableSelection(table.name)}
                        />
                        <div>
                          <div className="font-medium">{table.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {table.count.toLocaleString()} enregistrements • {table.size}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {table.count > 1000 ? 'Grande table' : 'Table normale'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="format" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { format: 'csv', label: 'CSV', desc: 'Fichier texte séparé par virgules' },
                    { format: 'json', label: 'JSON', desc: 'Format JavaScript Object Notation' },
                    { format: 'xlsx', label: 'Excel', desc: 'Fichier Microsoft Excel' },
                    { format: 'pdf', label: 'PDF', desc: 'Document portable (rapport)' }
                  ].map(({ format, label, desc }) => (
                    <div 
                      key={format}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        config.format === format 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:bg-muted'
                      }`}
                      onClick={() => setConfig(prev => ({ ...prev, format: format as any }))}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getFormatIcon(format)}
                        <span className="font-medium">{label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="options" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date-from">Date de début</Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={config.dateRange.from}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, from: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date-to">Date de fin</Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={config.dateRange.to}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, to: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="filter">Filtre (SQL WHERE clause)</Label>
                    <Input
                      id="filter"
                      placeholder="ex: status = 'active'"
                      value={config.filter}
                      onChange={(e) => setConfig(prev => ({ ...prev, filter: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="metadata"
                        checked={config.includeMetadata}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({ ...prev, includeMetadata: !!checked }))
                        }
                      />
                      <Label htmlFor="metadata">Inclure les métadonnées</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="compression"
                        checked={config.compression}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({ ...prev, compression: !!checked }))
                        }
                      />
                      <Label htmlFor="compression">Compression ZIP</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="encryption"
                        checked={config.encryption}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({ ...prev, encryption: !!checked }))
                        }
                      />
                      <Label htmlFor="encryption">Chiffrement AES</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex items-center gap-3 mt-6 pt-6 border-t">
              <Button 
                onClick={startExport} 
                disabled={exporting || !tables.some(t => t.selected)}
                className="flex items-center gap-2"
              >
                <Zap className={`h-4 w-4 ${exporting ? 'animate-pulse' : ''}`} />
                {exporting ? 'Export en cours...' : 'Démarrer Export'}
              </Button>
              <div className="text-sm text-muted-foreground">
                {tables.filter(t => t.selected).length} table(s) sélectionnée(s)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Tâches d'Export
            </CardTitle>
            <CardDescription>
              Historique et statut des exports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {exportJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <span className="font-medium text-sm">{job.name}</span>
                    </div>
                    <Badge variant={
                      job.status === 'completed' ? 'default' :
                      job.status === 'running' ? 'secondary' :
                      job.status === 'failed' ? 'destructive' : 'outline'
                    }>
                      {job.status}
                    </Badge>
                  </div>
                  
                  {job.status === 'running' && (
                    <div className="mb-2">
                      <Progress value={job.progress} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {job.progress}% terminé
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Créé: {new Date(job.createdAt).toLocaleString()}</div>
                    {job.completedAt && (
                      <div>Terminé: {new Date(job.completedAt).toLocaleString()}</div>
                    )}
                    {job.fileSize && (
                      <div>Taille: {job.fileSize}</div>
                    )}
                  </div>
                  
                  {job.status === 'completed' && job.downloadUrl && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={() => downloadExport(job)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Télécharger
                    </Button>
                  )}
                </div>
              ))}
              
              {exportJobs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune tâche d'export</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};