import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileSpreadsheet, Link2, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImportBatch {
  [key: string]: any;
}

interface GoogleSheetsIntegration {
  [key: string]: any;
}

export default function AdminImport() {
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);
  const [googleIntegrations, setGoogleIntegrations] = useState<GoogleSheetsIntegration[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [mappingConfig, setMappingConfig] = useState<Record<string, string>>({});
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  
  // Configuration par défaut pour le mapping
  const defaultMapping = {
    'Code Item': 'item_code',
    'Titre': 'title',
    'Sous-titre': 'subtitle',
    'Slug': 'slug',
    'Tableau Rang A': 'tableau_rang_a',
    'Tableau Rang B': 'tableau_rang_b',
    'Paroles Musicales': 'paroles_musicales',
    'Scène Immersive': 'scene_immersive',
    'Questions Quiz': 'quiz_questions',
    'Pitch Intro': 'pitch_intro'
  };

  const dbFields = [
    'item_code', 'title', 'subtitle', 'slug', 'tableau_rang_a', 
    'tableau_rang_b', 'paroles_musicales', 'scene_immersive', 
    'quiz_questions', 'pitch_intro'
  ];

  const { toast } = useToast();

  useEffect(() => {
    fetchImportBatches();
    fetchGoogleIntegrations();
    
    // Rafraîchir les données toutes les 5 secondes
    const interval = setInterval(() => {
      fetchImportBatches();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchImportBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('import_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setImportBatches(data || []);
    } catch (error) {
      console.error('Error fetching import batches:', error);
    }
  };

  const fetchGoogleIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('google_sheets_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoogleIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching Google integrations:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Lire le fichier pour extraire les headers
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        setCsvHeaders(headers);
        setCsvData(text);
        
        // Auto-mapping basé sur les noms de colonnes
        const autoMapping: Record<string, string> = {};
        headers.forEach(header => {
          const mappedField = Object.entries(defaultMapping).find(([key]) => 
            key.toLowerCase() === header.toLowerCase()
          );
          if (mappedField) {
            autoMapping[header] = mappedField[1];
          }
        });
        setMappingConfig(autoMapping);
      }
    };
    reader.readAsText(file);
  };

  const handleCsvPaste = (text: string) => {
    setCsvData(text);
    setSelectedFile(null);
    
    const lines = text.split('\n');
    if (lines.length > 0) {
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      setCsvHeaders(headers);
      
      // Auto-mapping
      const autoMapping: Record<string, string> = {};
      headers.forEach(header => {
        const mappedField = Object.entries(defaultMapping).find(([key]) => 
          key.toLowerCase() === header.toLowerCase()
        );
        if (mappedField) {
          autoMapping[header] = mappedField[1];
        }
      });
      setMappingConfig(autoMapping);
    }
  };

  const handleImport = async () => {
    if (!csvData && !selectedFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier ou coller des données CSV",
        variant: "destructive"
      });
      return;
    }

    // Vérifier que les champs obligatoires sont mappés
    const requiredFields = ['item_code', 'title'];
    const mappedFields = Object.values(mappingConfig);
    const missingFields = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingFields.length > 0) {
      toast({
        title: "Mapping incomplet",
        description: `Les champs obligatoires suivants doivent être mappés: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Créer le batch d'import
      const { data: batch, error: batchError } = await supabase
        .from('import_batches')
        .insert({
          filename: selectedFile?.name || `csv-paste-${Date.now()}`,
          mapping_config: mappingConfig
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Appeler l'edge function d'import
      const { data: importResult, error: importError } = await supabase.functions.invoke('import-edn-data', {
        body: {
          batchId: batch.id,
          csvData: csvData,
          mappingConfig: mappingConfig
        }
      });

      if (importError) throw importError;

      toast({
        title: "Import lancé",
        description: "L'import a été lancé avec succès. Vous pouvez suivre le progrès ci-dessous.",
      });

      // Réinitialiser le formulaire
      setSelectedFile(null);
      setCsvData('');
      setCsvHeaders([]);
      setMappingConfig({});
      
      // Rafraîchir la liste
      fetchImportBatches();

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Erreur d'import",
        description: error.message || "Une erreur est survenue lors de l'import",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const createGoogleSheetsIntegration = async (sheetId: string, sheetName: string) => {
    try {
      const { data, error } = await supabase
        .from('google_sheets_integrations')
        .insert({
          sheet_id: sheetId,
          sheet_name: sheetName,
          mapping_config: defaultMapping
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Intégration créée",
        description: `L'intégration Google Sheets "${sheetName}" a été créée avec succès`,
      });

      fetchGoogleIntegrations();
      return data;
    } catch (error) {
      console.error('Error creating Google Sheets integration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'intégration Google Sheets",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing': return <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <X className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import de Fiches EDN</h1>
          <p className="text-gray-600 mt-2">Importez vos fiches pédagogiques en masse depuis CSV, Excel ou Google Sheets</p>
        </div>
      </div>

      <Tabs defaultValue="csv" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import CSV/Excel
          </TabsTrigger>
          <TabsTrigger value="google" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Google Sheets
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import CSV/Excel
              </CardTitle>
              <CardDescription>
                Importez vos fiches depuis un fichier CSV ou Excel, ou collez directement vos données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Zone de sélection de fichier */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Sélectionner un fichier</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                </div>
                
                <div className="text-center text-gray-500">ou</div>
                
                <div>
                  <Label htmlFor="csv-data">Coller les données CSV</Label>
                  <Textarea
                    id="csv-data"
                    placeholder="Collez vos données CSV ici..."
                    value={csvData}
                    onChange={(e) => handleCsvPaste(e.target.value)}
                    className="mt-1 min-h-[120px] font-mono text-sm"
                  />
                </div>
              </div>

              {/* Mapping des colonnes */}
              {csvHeaders.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configuration du mapping</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {csvHeaders.map((header) => (
                      <div key={header} className="space-y-2">
                        <Label>{header}</Label>
                        <Select
                          value={mappingConfig[header] || ''}
                          onValueChange={(value) => setMappingConfig(prev => ({
                            ...prev,
                            [header]: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un champ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">-- Non mappé --</SelectItem>
                            {dbFields.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton d'import */}
              <Button
                onClick={handleImport}
                disabled={isUploading || (!csvData && !selectedFile)}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Lancer l'import
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="google" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Intégration Google Sheets
              </CardTitle>
              <CardDescription>
                Configurez l'import automatique depuis Google Sheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Les intégrations Google Sheets permettent un import automatique à chaque modification de votre feuille.
              </p>
              
              {googleIntegrations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune intégration Google Sheets configurée</p>
                  <p className="text-sm">Contactez l'administrateur pour configurer une intégration</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {googleIntegrations.map((integration) => (
                    <div key={integration.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{integration.sheet_name}</h4>
                          <p className="text-sm text-gray-600">ID: {integration.sheet_id}</p>
                          {integration.last_sync && (
                            <p className="text-xs text-gray-500">
                              Dernière sync: {new Date(integration.last_sync).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <Badge className={integration.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {integration.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm font-mono">
                        <p className="text-xs text-gray-600 mb-1">URL Webhook:</p>
                        <p className="break-all">
                          {window.location.origin}/functions/v1/google-sheets-webhook?token={integration.webhook_token}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historique des imports
              </CardTitle>
              <CardDescription>
                Suivez le statut de vos imports en cours et passés
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importBatches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun import effectué</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {importBatches.map((batch) => (
                    <div key={batch.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(batch.status)}
                          <div>
                            <h4 className="font-medium">{batch.filename}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(batch.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(batch.status)}>
                          {batch.status}
                        </Badge>
                      </div>

                      {batch.total_rows > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progression</span>
                            <span>{batch.processed_rows} / {batch.total_rows}</span>
                          </div>
                          <Progress value={(batch.processed_rows / batch.total_rows) * 100} />
                          
                          <div className="flex justify-between text-sm text-gray-600">
                            <span className="text-green-600">✓ {batch.success_rows} réussies</span>
                            {batch.error_rows > 0 && (
                              <span className="text-red-600">✗ {batch.error_rows} erreurs</span>
                            )}
                          </div>
                        </div>
                      )}

                      {batch.errors && batch.errors.length > 0 && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm text-red-600">
                            Voir les erreurs ({batch.errors.length})
                          </summary>
                          <div className="mt-2 p-3 bg-red-50 rounded text-sm">
                            {batch.errors.slice(0, 5).map((error, index) => (
                              <div key={index} className="text-red-700">
                                Ligne {error.row}: {error.error}
                              </div>
                            ))}
                            {batch.errors.length > 5 && (
                              <div className="text-red-600 mt-1">
                                ... et {batch.errors.length - 5} autres erreurs
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}