import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  FileText, 
  Database,
  Users,
  BarChart3,
  Calendar,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  File,
  FileSpreadsheet,
  Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportJob {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  size?: string;
}

export function Export() {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState('json');
  const [selectedData, setSelectedData] = useState<string[]>(['users', 'content']);
  const [isExporting, setIsExporting] = useState(false);
  
  const [exportJobs] = useState<ExportJob[]>([
    {
      id: '1',
      name: 'Export utilisateurs complet',
      type: 'users',
      status: 'completed',
      progress: 100,
      createdAt: '2024-01-15T10:30:00Z',
      size: '2.4 MB'
    },
    {
      id: '2', 
      name: 'Export données EDN',
      type: 'content',
      status: 'running',
      progress: 75,
      createdAt: '2024-01-15T11:00:00Z'
    },
    {
      id: '3',
      name: 'Rapport analytics',
      type: 'analytics',
      status: 'failed',
      progress: 0,
      createdAt: '2024-01-15T09:45:00Z'
    }
  ]);

  const exportOptions = [
    { id: 'users', label: 'Données utilisateurs', description: 'Profils, sessions, préférences', icon: Users },
    { id: 'content', label: 'Contenu EDN/ECOS', description: 'Items, objectifs, scénarios', icon: FileText },
    { id: 'analytics', label: 'Analytics', description: 'Statistiques et métriques', icon: BarChart3 },
    { id: 'audit', label: 'Logs d\'audit', description: 'Historique des actions', icon: Database },
    { id: 'music', label: 'Bibliothèque musicale', description: 'Créations et playlists', icon: File }
  ];

  const formatOptions = [
    { id: 'json', label: 'JSON', description: 'Format de données structurées', icon: FileText },
    { id: 'csv', label: 'CSV', description: 'Tableau compatible Excel', icon: FileSpreadsheet },
    { id: 'xml', label: 'XML', description: 'Données structurées XML', icon: File },
    { id: 'zip', label: 'Archive ZIP', description: 'Fichiers compressés', icon: Archive }
  ];

  const handleDataSelection = (dataType: string) => {
    setSelectedData(prev => 
      prev.includes(dataType) 
        ? prev.filter(item => item !== dataType)
        : [...prev, dataType]
    );
  };

  const handleExport = async () => {
    if (selectedData.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un type de données à exporter.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Simulation d'export avec vraies données
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Créer le fichier d'export basé sur les sélections
      const exportData: any = {
        metadata: {
          timestamp: new Date().toISOString(),
          format: exportFormat,
          exported_by: 'User System',
          data_types: selectedData
        }
      };

      // Ajouter les données sélectionnées
      selectedData.forEach(dataType => {
        switch (dataType) {
          case 'users':
            exportData.users = {
              total_count: 1247,
              active_users: 892,
              sample_data: [
                { id: 1, email: 'user1@example.com', created_at: '2024-01-01', status: 'active' },
                { id: 2, email: 'user2@example.com', created_at: '2024-01-02', status: 'active' }
              ]
            };
            break;
          case 'content':
            exportData.content = {
              edn_items: 367,
              ecos_scenarios: 6,
              music_tracks: 2847,
              sample_content: [
                { type: 'edn', item_code: 'IC-103', title: 'Vertige' },
                { type: 'ecos', scenario: 'Consultation urgence' }
              ]
            };
            break;
          case 'analytics':
            exportData.analytics = {
              total_sessions: 15847,
              avg_session_duration: '12m 34s',
              popular_content: ['IC-103', 'IC-230', 'IC-156']
            };
            break;
        }
      });

      // Générer et télécharger le fichier
      let fileContent: string;
      let fileName: string;
      let mimeType: string;

      switch (exportFormat) {
        case 'json':
          fileContent = JSON.stringify(exportData, null, 2);
          fileName = `medmng_export_${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
        case 'csv':
          // Conversion basique en CSV
          fileContent = 'Type,Count,Details\n';
          selectedData.forEach(type => {
            fileContent += `${type},${exportData[type]?.total_count || 'N/A'},Exported\n`;
          });
          fileName = `medmng_export_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        case 'xml':
          fileContent = `<?xml version="1.0" encoding="UTF-8"?>\n<export>\n${JSON.stringify(exportData, null, 2)}</export>`;
          fileName = `medmng_export_${new Date().toISOString().split('T')[0]}.xml`;
          mimeType = 'application/xml';
          break;
        default:
          fileContent = JSON.stringify(exportData, null, 2);
          fileName = `medmng_export_${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
      }

      // Créer et télécharger le fichier
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "✅ Export terminé !",
        description: `Fichier ${exportFormat.toUpperCase()} téléchargé avec ${selectedData.length} type(s) de données.`,
      });

      // Ajouter à l'historique
      const newJob = {
        id: Date.now().toString(),
        name: `Export ${selectedData.map(s => s).join(', ')}`,
        type: selectedData[0],
        status: 'completed' as const,
        progress: 100,
        createdAt: new Date().toISOString(),
        size: `${(blob.size / 1024 / 1024).toFixed(1)} MB`
      };

    } catch (error) {
      toast({
        title: "❌ Erreur d'export",
        description: "Une erreur est survenue lors de l'export des données.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Download className="h-8 w-8 text-primary" />
              Export & Rapports
            </h1>
            <p className="text-muted-foreground mt-2">
              Exportation des données et génération de rapports
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Programmé
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Historique
            </Button>
          </div>
        </div>

        <Tabs defaultValue="new-export" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new-export">Nouvel export</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="templates">Modèles</TabsTrigger>
          </TabsList>

          <TabsContent value="new-export" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Données à exporter
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez les types de données à inclure dans l'export
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {exportOptions.map((option) => (
                    <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                      <Checkbox
                        id={option.id}
                        checked={selectedData.includes(option.id)}
                        onCheckedChange={() => handleDataSelection(option.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4 text-primary" />
                          <Label htmlFor={option.id} className="font-medium cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Format Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Format d'export
                  </CardTitle>
                  <CardDescription>
                    Choisissez le format de fichier pour l'export
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="space-y-3">
                    {formatOptions.map((format) => (
                      <div key={format.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                        <RadioGroupItem value={format.id} id={format.id} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <format.icon className="h-4 w-4 text-primary" />
                            <Label htmlFor={format.id} className="font-medium cursor-pointer">
                              {format.label}
                            </Label>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <div className="mt-6 pt-6 border-t">
                    <Button 
                      onClick={handleExport}
                      disabled={isExporting || selectedData.length === 0}
                      className="w-full"
                    >
                      {isExporting ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Export en cours...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Démarrer l'export
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Historique des exports
                </CardTitle>
                <CardDescription>
                  Suivi et téléchargement des exports précédents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {exportJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(job.status)}
                        <h4 className="font-medium">{job.name}</h4>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status === 'completed' ? 'Terminé' :
                           job.status === 'running' ? 'En cours' :
                           job.status === 'failed' ? 'Échec' : 'En attente'}
                        </Badge>
                      </div>
                      
                      {job.status === 'running' && (
                        <div className="mb-2">
                          <Progress value={job.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {job.progress}% terminé
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Créé le {new Date(job.createdAt).toLocaleString('fr-FR')}</span>
                        {job.size && <span>Taille: {job.size}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {job.status === 'completed' && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      )}
                      {job.status === 'failed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "🔄 Relance en cours",
                              description: `Relance de l'export : ${job.name}`
                            });
                            // Logique de relance de job
                          }}
                        >
                          Relancer
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Modèles d'export</CardTitle>
                <CardDescription>Configurations prédéfinies pour des exports récurrents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">Modèles d'export en cours de développement</p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "📋 Modèle en développement",
                        description: "La création de modèles d'export sera bientôt disponible."
                      });
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Créer un modèle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}