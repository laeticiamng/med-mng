import React, { useState } from 'react';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Download, 
  FileText, 
  Table, 
  FileSpreadsheet, 
  Archive,
  Database,
  Music,
  Image,
  Video,
  CheckCircle
} from 'lucide-react';

const exportFormats = [
  {
    id: 'pdf',
    name: 'PDF',
    description: 'Document portable optimisé pour l\'impression',
    icon: FileText,
    extensions: ['.pdf'],
    suitable: ['Rapports', 'Documentation', 'Analyses']
  },
  {
    id: 'excel',
    name: 'Excel',
    description: 'Tableur avec formules et graphiques',
    icon: FileSpreadsheet,
    extensions: ['.xlsx', '.xls'],
    suitable: ['Données', 'Statistiques', 'Tableaux']
  },
  {
    id: 'csv',
    name: 'CSV',
    description: 'Données tabulaires séparées par virgules',
    icon: Table,
    extensions: ['.csv'],
    suitable: ['Données brutes', 'Import/Export', 'Analytics']
  },
  {
    id: 'zip',
    name: 'Archive ZIP',
    description: 'Fichiers compressés en archive',
    icon: Archive,
    extensions: ['.zip'],
    suitable: ['Multiples fichiers', 'Médias', 'Sauvegarde']
  }
];

const dataTypes = [
  {
    id: 'edn',
    name: 'Données EDN',
    description: 'Questions, réponses et statistiques EDN',
    icon: FileText,
    size: '45.2 MB',
    count: '12,456 items'
  },
  {
    id: 'ecos',
    name: 'Simulations ECOS',
    description: 'Scénarios et résultats ECOS',
    icon: Video,
    size: '128.7 MB',
    count: '3,789 simulations'
  },
  {
    id: 'music',
    name: 'Bibliothèque musicale',
    description: 'Morceaux et playlists thérapeutiques',
    icon: Music,
    size: '2.1 GB',
    count: '1,234 morceaux'
  },
  {
    id: 'analytics',
    name: 'Données d\'analyse',
    description: 'Métriques et performances utilisateur',
    icon: Database,
    size: '23.4 MB',
    count: '8,901 métriques'
  },
  {
    id: 'media',
    name: 'Fichiers média',
    description: 'Images, vidéos et documents',
    icon: Image,
    size: '892.3 MB',
    count: '4,567 fichiers'
  }
];

const recentExports = [
  {
    name: 'Rapport_EDN_2024.pdf',
    type: 'PDF',
    size: '12.4 MB',
    date: '2024-01-15 14:30',
    status: 'completed'
  },
  {
    name: 'Analytics_Data.xlsx',
    type: 'Excel', 
    size: '8.7 MB',
    date: '2024-01-14 09:15',
    status: 'completed'
  },
  {
    name: 'Music_Library.zip',
    type: 'ZIP',
    size: '245.8 MB',
    date: '2024-01-12 16:45',
    status: 'completed'
  }
];

export const Export: React.FC = () => {
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleDataTypeToggle = (typeId: string) => {
    setSelectedDataTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleExport = async () => {
    if (selectedDataTypes.length === 0) {
      toast.error('Veuillez sélectionner au moins un type de données');
      return;
    }
    
    if (!selectedFormat) {
      toast.error('Veuillez sélectionner un format d\'export');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    // Simulation du processus d'export
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setExportProgress(i);
    }

    toast.success('Export terminé avec succès !');
    setIsExporting(false);
    setExportProgress(0);
  };

  return (
    <PremiumLayout variant="gradient">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Centre d'Export MED-MNG
          </h1>
          <p className="text-white/80 text-lg">
            Exportez vos données dans le format de votre choix
          </p>
        </div>

        <Tabs defaultValue="export" className="space-y-8">
          <TabsList className="grid grid-cols-2 w-full max-w-lg">
            <TabsTrigger value="export">Nouvel Export</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Selection des données */}
              <div className="lg:col-span-2 space-y-6">
                <PremiumCard className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Sélection des données</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dataTypes.map((dataType) => {
                      const IconComponent = dataType.icon;
                      return (
                        <div
                          key={dataType.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedDataTypes.includes(dataType.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-primary/50'
                          }`}
                          onClick={() => handleDataTypeToggle(dataType.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={selectedDataTypes.includes(dataType.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <IconComponent className="w-4 h-4 text-primary" />
                                <h3 className="font-medium">{dataType.name}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {dataType.description}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>{dataType.size}</span>
                                <span>{dataType.count}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </PremiumCard>

                <PremiumCard className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Format d'export</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exportFormats.map((format) => {
                      const IconComponent = format.icon;
                      return (
                        <div
                          key={format.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedFormat === format.id
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedFormat(format.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium mb-1">{format.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {format.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {format.suitable.map((use) => (
                                  <Badge key={use} variant="secondary" className="text-xs">
                                    {use}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </PremiumCard>
              </div>

              {/* Options et aperçu */}
              <div className="space-y-6">
                <PremiumCard className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Options d'export</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dateRange" className="text-sm font-medium">
                        Période
                      </Label>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une période" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les données</SelectItem>
                          <SelectItem value="year">Cette année</SelectItem>
                          <SelectItem value="month">Ce mois</SelectItem>
                          <SelectItem value="week">Cette semaine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PremiumCard>

                <PremiumCard className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Aperçu</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Types sélectionnés:</span>
                      <span>{selectedDataTypes.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Format:</span>
                      <span>{selectedFormat || 'Non défini'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taille estimée:</span>
                      <span>~125.4 MB</span>
                    </div>
                  </div>

                  {isExporting && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Export en cours...</span>
                        <span className="text-sm">{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} />
                    </div>
                  )}

                  <PremiumButton 
                    onClick={handleExport}
                    className="w-full mt-6"
                    disabled={isExporting || selectedDataTypes.length === 0 || !selectedFormat}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? 'Export en cours...' : 'Démarrer l\'export'}
                  </PremiumButton>
                </PremiumCard>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <PremiumCard className="p-6">
              <h2 className="text-xl font-semibold mb-6">Historique des exports</h2>
              
              <div className="space-y-4">
                {recentExports.map((exportItem, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{exportItem.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{exportItem.type}</span>
                          <span>{exportItem.size}</span>
                          <span>{exportItem.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500/10 text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Terminé
                      </Badge>
                      <PremiumButton size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </PremiumButton>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumCard>
          </TabsContent>
        </Tabs>
      </div>
    </PremiumLayout>
  );
};

export default Export;