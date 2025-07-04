import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EdnObjectifsExtractor } from '@/scripts/launch-edn-objectifs-extraction';
import { PlayCircle, Pause, RefreshCw, BarChart3, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ExtractionStatus {
  session_id: string;
  total_competences: number;
  competences_extraites: number;
  page_courante: number;
  total_pages: number;
  statut: 'en_cours' | 'termine' | 'erreur' | 'pause';
  derniere_activite: string;
  erreurs?: any[];
}

interface ExtractionStats {
  total_competences_extraites: number;
  total_competences_attendues: number;
  completude_globale: number;
  items_ern_couverts: number;
  repartition_par_item: Array<{
    item_parent: string;
    competences_attendues: number;
    competences_extraites: number;
    completude_pct: number;
    manquants: string[];
  }>;
}

export const EdnObjectifsExtraction: React.FC = () => {
  const [extractor] = useState(() => new EdnObjectifsExtractor());
  const [status, setStatus] = useState<ExtractionStatus | null>(null);
  const [stats, setStats] = useState<ExtractionStats | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeSessionId, setResumeSessionId] = useState<string>('');

  const handleStartExtraction = async () => {
    try {
      setError(null);
      setIsExtracting(true);
      
      const result = await extractor.startExtraction();
      
      // Démarre le polling du statut
      extractor.startStatusPolling((newStatus) => {
        setStatus(newStatus);
        
        if (newStatus.statut === 'termine' || newStatus.statut === 'erreur') {
          setIsExtracting(false);
          if (newStatus.statut === 'termine') {
            handleGenerateRapport();
          }
        }
      });
      
    } catch (err: any) {
      setError(err.message);
      setIsExtracting(false);
    }
  };

  const handleResumeExtraction = async () => {
    if (!resumeSessionId) {
      setError('Veuillez saisir un ID de session');
      return;
    }

    try {
      setError(null);
      setIsExtracting(true);
      
      await extractor.resumeExtraction(resumeSessionId);
      
      extractor.startStatusPolling((newStatus) => {
        setStatus(newStatus);
        
        if (newStatus.statut === 'termine' || newStatus.statut === 'erreur') {
          setIsExtracting(false);
          if (newStatus.statut === 'termine') {
            handleGenerateRapport();
          }
        }
      });
      
    } catch (err: any) {
      setError(err.message);
      setIsExtracting(false);
    }
  };

  const handleStopExtraction = () => {
    extractor.stopStatusPolling();
    setIsExtracting(false);
  };

  const handleGenerateRapport = async () => {
    try {
      setError(null);
      const rapport = await extractor.generateRapport();
      setStats(rapport);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'en_cours':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'termine':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'erreur':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pause':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_cours':
        return 'bg-blue-100 text-blue-800';
      case 'termine':
        return 'bg-green-100 text-green-800';
      case 'erreur':
        return 'bg-red-100 text-red-800';
      case 'pause':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    return () => {
      extractor.stopStatusPolling();
    };
  }, [extractor]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">
          🎫 Extraction des Objectifs EDN LISA UNESS
        </h1>
        <p className="text-muted-foreground">
          Automatisation de l'extraction des 4,872 compétences EDN depuis la plateforme LISA UNESS
        </p>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="extraction" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="extraction">Extraction</TabsTrigger>
          <TabsTrigger value="status">Statut</TabsTrigger>
          <TabsTrigger value="rapport">Rapport</TabsTrigger>
        </TabsList>

        <TabsContent value="extraction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Contrôles d'Extraction
              </CardTitle>
              <CardDescription>
                Démarrer une nouvelle extraction ou reprendre une extraction interrompue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={handleStartExtraction}
                  disabled={isExtracting}
                  size="lg"
                  className="flex-1"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  {isExtracting ? 'Extraction en cours...' : 'Démarrer l\'extraction'}
                </Button>
                
                {isExtracting && (
                  <Button 
                    onClick={handleStopExtraction}
                    variant="outline"
                    size="lg"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Arrêter
                  </Button>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Reprendre une extraction</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ID de session..."
                    value={resumeSessionId}
                    onChange={(e) => setResumeSessionId(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                  <Button 
                    onClick={handleResumeExtraction}
                    disabled={isExtracting || !resumeSessionId}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reprendre
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          {status && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getStatusIcon(status.statut)}
                    Statut de l'Extraction
                  </span>
                  <Badge className={getStatusColor(status.statut)}>
                    {status.statut.toUpperCase()}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Session: {status.session_id}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {status.competences_extraites}
                    </div>
                    <div className="text-sm text-muted-foreground">Extraits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {status.total_competences}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {status.page_courante}
                    </div>
                    <div className="text-sm text-muted-foreground">Page actuelle</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {Math.round((status.competences_extraites / status.total_competences) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Complété</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span>{status.competences_extraites} / {status.total_competences}</span>
                  </div>
                  <Progress 
                    value={(status.competences_extraites / status.total_competences) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pages</span>
                    <span>{status.page_courante} / {status.total_pages}</span>
                  </div>
                  <Progress 
                    value={(status.page_courante / status.total_pages) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  Dernière activité: {new Date(status.derniere_activite).toLocaleString()}
                </div>

                {status.erreurs && status.erreurs.length > 0 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {status.erreurs.length} erreur(s) détectée(s)
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {!status && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Aucune extraction en cours. Démarrez une extraction pour voir le statut.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rapport" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Rapport de Complétude</h2>
            <Button onClick={handleGenerateRapport} variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Extraits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {stats.total_competences_extraites.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      sur {stats.total_competences_attendues.toLocaleString()} attendues
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Complétude Globale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {stats.completude_globale}%
                    </div>
                    <Progress value={stats.completude_globale} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Items Couverts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.repartition_par_item.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      items EDN avec objectifs
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Répartition par Item EDN</CardTitle>
                  <CardDescription>
                    Complétude détaillée pour chaque item de compétence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="grid gap-2">
                      {stats.repartition_par_item
                        .sort((a, b) => b.completude_pct - a.completude_pct)
                        .map((item) => (
                        <div 
                          key={item.item_parent}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">
                              IC-{item.item_parent.toString().padStart(3, '0')}
                            </Badge>
                            <div className="text-sm">
                              <div className="font-medium">
                                {item.competences_extraites} / {item.competences_attendues} objectifs
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={item.completude_pct} 
                              className="w-20 h-2"
                            />
                            <span className="text-sm font-medium min-w-[3rem] text-right">
                              {Math.round(item.completude_pct)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!stats && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Cliquez sur "Actualiser" pour générer le rapport de complétude.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};