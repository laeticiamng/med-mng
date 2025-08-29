import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  FileText, 
  Database, 
  Archive, 
  Clock,
  CheckCircle,
  AlertCircle,
  Music,
  BookOpen,
  Settings,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Export() {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportName, setExportName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportOptions = [
    {
      id: 'edn-items',
      name: 'Items EDN Complets',
      description: 'Tous les contenus pédagogiques EDN avec tableaux, quiz et musiques',
      icon: BookOpen,
      estimatedTime: '5-10 min',
      dataSize: '2.3 GB',
    },
    {
      id: 'music-library',
      name: 'Bibliothèque Musicale',
      description: 'Collections musicales personnalisées et métadonnées',
      icon: Music,
      estimatedTime: '15-30 min',
      dataSize: '5.7 GB',
    },
    {
      id: 'user-analytics',
      name: 'Analytics Personnelles',
      description: 'Statistiques d\'utilisation et progression d\'apprentissage',
      icon: FileText,
      estimatedTime: '2-5 min',
      dataSize: '45 MB',
    },
    {
      id: 'complete-backup',
      name: 'Sauvegarde Complète',
      description: 'Exportation intégrale de toutes vos données',
      icon: Archive,
      estimatedTime: '45-90 min',
      dataSize: '12.8 GB',
    }
  ];

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
    setExportProgress(0);

    // Simulation du processus d'export
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setExportProgress(i);
    }

    setIsExporting(false);
    toast({
      title: "Export terminé !",
      description: `${selectedItems.length} élément(s) exporté(s) avec succès.`,
    });
  };

  const handleItemSelection = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4 flex items-center justify-center gap-3">
            <Download className="h-10 w-10" />
            Centre d'Export
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Exportez et sauvegardez vos données MED-MNG dans différents formats
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration d'Export
              </CardTitle>
              <CardDescription>
                Sélectionnez les données à exporter et configurez les paramètres
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {exportOptions.map((option) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={option.id}
                    checked={selectedItems.includes(option.id)}
                    onCheckedChange={(checked) => handleItemSelection(option.id, checked as boolean)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <option.icon className="h-4 w-4 text-primary flex-shrink-0" />
                      <Label htmlFor={option.id} className="font-medium cursor-pointer">
                        {option.name}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {option.description}
                    </p>
                    <div className="flex gap-2 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {option.estimatedTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        {option.dataSize}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Paramètres d'Export</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="export-format">Format de sortie</Label>
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                        <SelectItem value="zip">Archive (ZIP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="export-name">Nom de l'export</Label>
                    <Input
                      id="export-name"
                      placeholder="Mon export personnalisé"
                      value={exportName}
                      onChange={(e) => setExportName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {isExporting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 p-4 bg-primary/5 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary animate-pulse" />
                    <span className="font-medium">Export en cours...</span>
                  </div>
                  <Progress value={exportProgress} />
                  <p className="text-sm text-muted-foreground">
                    {exportProgress}% complété - Traitement des données sélectionnées
                  </p>
                </motion.div>
              )}

              <Button
                onClick={handleExport}
                disabled={selectedItems.length === 0 || isExporting}
                size="lg"
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Clock className="mr-2 h-5 w-5 animate-spin" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Lancer l'export ({selectedItems.length} sélectionné{selectedItems.length > 1 ? 's' : ''})
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Historique des Exports
              </CardTitle>
              <CardDescription>
                Vos exports récents et leur statut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: '1', name: 'Export Analytics Décembre 2024', status: 'completed', size: '45.2 MB', date: '2024-01-15' },
                  { id: '2', name: 'Sauvegarde Items EDN', status: 'processing', size: '2.1 GB', date: '2024-01-14' },
                  { id: '3', name: 'Export Musiques Personnel', status: 'pending', size: '890 MB', date: '2024-01-14' }
                ].map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 border rounded-lg space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{task.name}</p>
                        <p className="text-sm text-muted-foreground">{task.date}</p>
                      </div>
                      {task.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {task.status === 'processing' && <Clock className="h-4 w-4 text-blue-500 animate-spin" />}
                      {task.status === 'pending' && <AlertCircle className="h-4 w-4 text-gray-400" />}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <Badge className={
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {task.status}
                      </Badge>
                      <span className="text-muted-foreground">{task.size}</span>
                    </div>
                    
                    {task.status === 'completed' && (
                      <Button size="sm" variant="outline" className="w-full">
                        <Download className="mr-2 h-3 w-3" />
                        Télécharger
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}