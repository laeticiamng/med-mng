import React, { useState } from 'react';
import { SubPageLayout } from '@/components/platform/SubPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Database, Music, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export const Export: React.FC = () => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState('json');
  const [isExporting, setIsExporting] = useState(false);

  const exportOptions = [
    {
      id: 'edn-items',
      label: 'Items EDN',
      description: 'Tous les items de connaissances EDN',
      icon: FileText,
      count: '2,847 items'
    },
    {
      id: 'ecos-scenarios',
      label: 'Scénarios ECOS',
      description: 'Examens cliniques objectifs structurés',
      icon: Users,
      count: '156 scénarios'
    },
    {
      id: 'music-library',
      label: 'Bibliothèque Musicale',
      description: 'Musiques générées et métadonnées',
      icon: Music,
      count: '15,632 pistes'
    },
    {
      id: 'user-progress',
      label: 'Progression Utilisateurs',
      description: 'Données d\'apprentissage et scores',
      icon: Database,
      count: '8,523 profils'
    },
    {
      id: 'analytics-data',
      label: 'Données Analytics',
      description: 'Statistiques et métriques',
      icon: Calendar,
      count: '90 jours'
    }
  ];

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleExport = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un élément à exporter.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Simulation d'export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Export réussi",
        description: `${selectedItems.length} élément(s) exporté(s) au format ${exportFormat.toUpperCase()}`,
      });
      
      // Ici, déclencher le téléchargement réel
      const filename = `med-mng-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      console.log(`Exporting as: ${filename}`, selectedItems);
      
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'export. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SubPageLayout
      title="Export de Données"
      subtitle="Exportez vos données MED-MNG dans différents formats"
      breadcrumbs={[
        { label: 'Accueil', href: '/' },
        { label: 'Export', href: '/export' }
      ]}
    >
      <div className="space-y-6">
        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration de l'Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Format d'Export</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Sélection des Données</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choisissez les données que vous souhaitez inclure dans l'export
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exportOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 p-4 rounded-lg border">
                  <Checkbox
                    id={option.id}
                    checked={selectedItems.includes(option.id)}
                    onCheckedChange={() => handleItemToggle(option.id)}
                  />
                  <div className="flex-1 flex items-start gap-3">
                    <option.icon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <label 
                        htmlFor={option.id} 
                        className="text-sm font-medium cursor-pointer"
                      >
                        {option.label}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {option.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Summary */}
        {selectedItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Résumé de l'Export</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">{selectedItems.length}</span> élément(s) sélectionné(s)
                </p>
                <p className="text-sm">
                  Format: <span className="font-medium">{exportFormat.toUpperCase()}</span>
                </p>
                <div className="pt-4">
                  <Button 
                    onClick={handleExport} 
                    disabled={isExporting}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? 'Export en cours...' : 'Démarrer l\'Export'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export History */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des Exports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: '2024-01-15', type: 'Items EDN', format: 'JSON', size: '2.4 MB' },
                { date: '2024-01-10', type: 'Analytics', format: 'CSV', size: '890 KB' },
                { date: '2024-01-05', type: 'Bibliothèque', format: 'Excel', size: '15.2 MB' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{item.type}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{item.format} - {item.size}</p>
                    <Button variant="ghost" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SubPageLayout>
  );
};

export default Export;