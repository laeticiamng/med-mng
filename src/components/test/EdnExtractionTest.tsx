import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ExtractionResult {
  success: boolean;
  message: string;
  stats: {
    totalProcessed: number;
    totalErrors: number;
    extractedItems: any[];
    itemsFound: number;
    lastProcessedItem: number;
  };
}

interface EdnItemUness {
  item_id: number;
  intitule: string;
  rangs_a: string[];
  rangs_b: string[];
  contenu_complet_html: string;
  date_import: string;
}

interface EdnItemPlatform {
  item_code: string;
  title: string;
  tableau_rang_a: any;
  tableau_rang_b: any;
  paroles_musicales: string[];
}

export const EdnExtractionTest = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [extractedItems, setExtractedItems] = useState<EdnItemUness[]>([]);
  const [currentItems, setCurrentItems] = useState<EdnItemPlatform[]>([]);

  const runExtractionTest = async () => {
    setIsExtracting(true);
    setExtractionResult(null);
    
    try {
      toast.info("🚀 Démarrage du test d'authentification UNESS...");
      
      const { data, error } = await supabase.functions.invoke('extract-edn-uness', {
        body: {
          action: 'test', // Test avec les nouveaux credentials
          resumeFromItem: 1,
          maxItems: 3
        }
      });

      if (error) {
        throw error;
      }

      setExtractionResult(data);
      toast.success(`✅ Extraction terminée: ${data.stats.totalProcessed} items traités`);
      
      // Récupérer les items extraits depuis la base
      await loadExtractedItems();
      
    } catch (error) {
      console.error('Erreur extraction:', error);
      toast.error(`❌ Erreur: ${error.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const runFullExtraction = async () => {
    setIsExtracting(true);
    setExtractionResult(null);
    
    try {
      toast.info("🚀 Démarrage de l'extraction COMPLÈTE (367 items)...");
      
      const { data, error } = await supabase.functions.invoke('extract-edn-uness', {
        body: {
          action: 'extract',
          resumeFromItem: 1,
          maxItems: 367,
          fullExtraction: true
        }
      });

      if (error) {
        throw error;
      }

      setExtractionResult(data);
      toast.success(`✅ Extraction complète terminée: ${data.stats.totalProcessed} items traités`);
      
      // Récupérer les items extraits depuis la base
      await loadExtractedItems();
      
    } catch (error) {
      console.error('Erreur extraction complète:', error);
      toast.error(`❌ Erreur: ${error.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const loadExtractedItems = async () => {
    try {
      toast.info("🔄 Chargement des items extraits...");
      
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erreur Supabase:', error);
        toast.error(`❌ Erreur chargement: ${error.message}`);
        return;
      }

      // Transform data to match expected interface
      const transformedData = data?.map(item => ({
        item_id: parseInt(item.item_code.replace('IC-', '')) || 0,
        intitule: item.title,
        rangs_a: [], // Legacy compatibility
        rangs_b: [], // Legacy compatibility
        date_import: item.updated_at,
        contenu_complet_html: item.title
      })) || [];

      setExtractedItems(transformedData);
      toast.success(`✅ ${transformedData.length} items chargés`);
    } catch (error) {
      console.error('Erreur chargement items:', error);
      toast.error('❌ Erreur lors du chargement');
    }
  };

  const loadCurrentItems = async () => {
    try {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title, tableau_rang_a, tableau_rang_b, paroles_musicales')
        .order('item_code')
        .limit(10);

      if (error) throw error;
      setCurrentItems(data || []);
    } catch (error) {
      console.error('Erreur chargement items actuels:', error);
    }
  };

  React.useEffect(() => {
    loadExtractedItems();
    loadCurrentItems();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Test d'Extraction EDN UNESS Complète
          </CardTitle>
          <CardDescription>
            Test de la nouvelle fonction d'extraction qui récupère le contenu unique de chaque item via les versions imprimables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={runExtractionTest}
              disabled={isExtracting}
              variant="outline"
            >
              {isExtracting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isExtracting ? 'Extraction en cours...' : '🧪 Test (3 items)'}
            </Button>
            
            <Button 
              onClick={runFullExtraction}
              disabled={isExtracting}
              variant="default"
            >
              {isExtracting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isExtracting ? 'Extraction en cours...' : '🚀 Extraction Complète (367 items)'}
            </Button>
          </div>

          {extractionResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {extractionResult.success ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  Résultats de l'extraction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">
                      {extractionResult.stats.totalProcessed}
                    </div>
                    <div className="text-sm text-muted-foreground">Items traités</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">
                      {extractionResult.stats.totalErrors}
                    </div>
                    <div className="text-sm text-muted-foreground">Erreurs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {extractionResult.stats.itemsFound}
                    </div>
                    <div className="text-sm text-muted-foreground">Items trouvés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {extractionResult.stats.extractedItems?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Échantillons</div>
                  </div>
                </div>
                
                {extractionResult.stats.extractedItems && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Échantillon d'items extraits :</h4>
                    <div className="space-y-2">
                      {extractionResult.stats.extractedItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">Item {item.item_id}</Badge>
                          <span className="flex-1">{item.item_title}</span>
                          <Badge variant={item.extraction_status === 'success' ? 'default' : 'destructive'}>
                            {item.extraction_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="extracted" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="extracted">Items UNESS Extraits</TabsTrigger>
          <TabsTrigger value="current">Items Actuels (Plateforme)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="extracted" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Items extraits depuis UNESS ({extractedItems.length})</h3>
            <Button variant="outline" onClick={loadExtractedItems}>
              🔄 Actualiser
            </Button>
          </div>
          
          <div className="grid gap-4">
            {extractedItems.map((item) => (
              <Card key={item.item_id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Item {item.item_id}</CardTitle>
                    <Badge variant="outline">
                      {new Date(item.date_import).toLocaleDateString()}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {item.intitule}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Badge variant="secondary">Rang A</Badge>
                        {item.rangs_a?.length || 0} compétences
                      </h5>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {item.rangs_a?.slice(0, 2).map((rang, index) => (
                          <div key={index} className="truncate">
                            • {rang.substring(0, 100)}...
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Badge variant="secondary">Rang B</Badge>
                        {item.rangs_b?.length || 0} compétences
                      </h5>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {item.rangs_b?.slice(0, 2).map((rang, index) => (
                          <div key={index} className="truncate">
                            • {rang.substring(0, 100)}...
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="current" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Items actuels de la plateforme ({currentItems.length})</h3>
            <Button variant="outline" onClick={loadCurrentItems}>
              🔄 Actualiser
            </Button>
          </div>
          
          <div className="grid gap-4">
            {currentItems.map((item) => (
              <Card key={item.item_code}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{item.item_code}</CardTitle>
                    <div className="flex gap-2">
                      {item.tableau_rang_a && (
                        <Badge variant="default">Rang A ✓</Badge>
                      )}
                      {item.tableau_rang_b && (
                        <Badge variant="default">Rang B ✓</Badge>
                      )}
                      {item.paroles_musicales && (
                        <Badge variant="secondary">Musique ✓</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {item.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="font-medium">Rang A:</span>
                      <div className="text-muted-foreground">
                        {item.tableau_rang_a ? 
                          (() => {
                            try {
                              const parsed = JSON.parse(item.tableau_rang_a);
                              return `${parsed?.sections?.[0]?.concepts?.length || 0} concepts`;
                            } catch {
                              return 'Format invalide';
                            }
                          })() :
                          'Non défini'
                        }
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Rang B:</span>
                      <div className="text-muted-foreground">
                        {item.tableau_rang_b ? 
                          (() => {
                            try {
                              const parsed = JSON.parse(item.tableau_rang_b);
                              return `${parsed?.sections?.[0]?.concepts?.length || 0} concepts`;
                            } catch {
                              return 'Format invalide';
                            }
                          })() :
                          'Non défini'
                        }
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Paroles:</span>
                      <div className="text-muted-foreground">
                        {item.paroles_musicales ? 
                          `${item.paroles_musicales.length} lignes` :
                          'Non définies'
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};