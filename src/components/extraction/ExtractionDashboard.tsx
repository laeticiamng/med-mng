import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, PlayCircle, PauseCircle, CheckCircle, XCircle, Clock, Database, Target, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExtractionStatus {
  session_id: string;
  extraction_type: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  progress: {
    total: number;
    processed: number;
    errors: number;
    success_rate: number;
  };
  last_activity: string;
  error_message?: string;
}

interface ExtractionSession {
  type: 'edn' | 'oic' | 'ecos';
  session_id: string | null;
  status: ExtractionStatus | null;
  config: {
    batch_size: number;
    max_concurrent: number;
    description: string;
    icon: React.ReactNode;
    expected: number;
  };
}

export default function ExtractionDashboard() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ExtractionSession[]>([
    {
      type: 'edn',
      session_id: null,
      status: null,
      config: {
        batch_size: 50,
        max_concurrent: 6,
        description: 'Items de connaissance E-LiSA',
        icon: <Database className="h-5 w-5" />,
        expected: 367
      }
    },
    {
      type: 'oic',
      session_id: null,
      status: null,
      config: {
        batch_size: 100,
        max_concurrent: 10,
        description: 'Compétences et objectifs',
        icon: <Target className="h-5 w-5" />,
        expected: 4872
      }
    },
    {
      type: 'ecos',
      session_id: null,
      status: null,
      config: {
        batch_size: 30,
        max_concurrent: 5,
        description: 'Situations cliniques',
        icon: <Stethoscope className="h-5 w-5" />,
        expected: 150
      }
    }
  ]);

  const [globalStats, setGlobalStats] = useState({
    totalProcessed: 0,
    totalExpected: 0,
    globalSuccessRate: 0,
    totalErrors: 0,
    completedPhases: 0
  });

  const [isAutoExtracting, setIsAutoExtracting] = useState(false);

  // Lancement automatique de toutes les extractions
  const launchCompleteExtraction = async () => {
    setIsAutoExtracting(true);
    toast({
      title: "🚀 Extraction automatique lancée",
      description: "Lancement de EDN → OIC → ECOS en cours...",
    });

    try {
      const newSessions = [...sessions];

      for (let i = 0; i < sessions.length; i++) {
        const session = sessions[i];
        
        console.log(`🚀 Lancement ${session.type.toUpperCase()}...`);
        
        const { data, error } = await supabase.functions.invoke('extract-uness-enhanced', {
          body: {
            action: 'start',
            extraction_type: session.type,
            batch_size: session.config.batch_size,
            max_concurrent: session.config.max_concurrent
          }
        });

        if (error) {
          console.error(`❌ Erreur ${session.type.toUpperCase()}:`, error);
          toast({
            title: `❌ Erreur ${session.type.toUpperCase()}`,
            description: error.message,
            variant: "destructive"
          });
          continue;
        }

        newSessions[i].session_id = data.session_id;
        console.log(`✅ ${session.type.toUpperCase()} lancé - Session: ${data.session_id}`);
        
        // Pause entre les lancements
        if (i < sessions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      setSessions(newSessions);
      
      toast({
        title: "✅ Toutes les extractions lancées",
        description: "Monitoring automatique activé",
      });

    } catch (error) {
      console.error('💥 Erreur critique:', error);
      toast({
        title: "💥 Erreur critique",
        description: "Échec du lancement automatique",
        variant: "destructive"
      });
    } finally {
      setIsAutoExtracting(false);
    }
  };

  // Monitoring automatique
  useEffect(() => {
    const activeSessions = sessions.filter(s => s.session_id && s.status?.status === 'running');
    
    if (activeSessions.length === 0) return;

    const interval = setInterval(async () => {
      const updatedSessions = [...sessions];
      let totalProcessed = 0;
      let totalExpected = 0;
      let totalErrors = 0;
      let completedCount = 0;

      for (let i = 0; i < updatedSessions.length; i++) {
        const session = updatedSessions[i];
        
        if (!session.session_id || session.status?.status === 'completed' || session.status?.status === 'failed') {
          if (session.status?.status === 'completed') completedCount++;
          if (session.status) {
            totalProcessed += session.status.progress.processed;
            totalExpected += session.status.progress.total;
            totalErrors += session.status.progress.errors;
          }
          continue;
        }

        try {
          const { data, error } = await supabase.functions.invoke('extract-uness-enhanced', {
            body: {
              action: 'status',
              session_id: session.session_id
            }
          });

          if (!error && data) {
            updatedSessions[i].status = data;
            
            totalProcessed += data.progress.processed;
            totalExpected += data.progress.total;
            totalErrors += data.progress.errors;
            
            if (data.status === 'completed') {
              completedCount++;
              toast({
                title: `🎉 ${session.type.toUpperCase()} terminé!`,
                description: `${data.progress.processed} éléments extraits avec ${data.progress.success_rate.toFixed(1)}% de réussite`,
              });
            } else if (data.status === 'failed') {
              toast({
                title: `❌ ${session.type.toUpperCase()} échoué`,
                description: data.error_message,
                variant: "destructive"
              });
            }
          }
        } catch (error) {
          console.error(`Erreur monitoring ${session.type}:`, error);
        }
      }

      setSessions(updatedSessions);
      setGlobalStats({
        totalProcessed,
        totalExpected,
        globalSuccessRate: totalProcessed > 0 ? ((totalProcessed - totalErrors) / totalProcessed * 100) : 0,
        totalErrors,
        completedPhases: completedCount
      });

    }, 5000);

    return () => clearInterval(interval);
  }, [sessions, toast]);

  // Auto-lancement au chargement de la page
  useEffect(() => {
    const autoStart = setTimeout(() => {
      launchCompleteExtraction();
    }, 2000);

    return () => clearTimeout(autoStart);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused': return <PauseCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      running: "default",
      completed: "secondary", 
      failed: "destructive",
      paused: "secondary"
    };
    
    return <Badge variant={variants[status] || "secondary"}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            🤖 Extraction Autonome UNESS
          </h1>
          <p className="text-lg text-muted-foreground">
            Système d'extraction automatisée des données médicales
          </p>
        </div>

        {/* Stats globales */}
        <Card className="bg-gradient-to-r from-primary/10 to-blue-600/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Statistiques Globales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {globalStats.totalProcessed.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Éléments traités</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {globalStats.globalSuccessRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Taux de réussite</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {globalStats.completedPhases}/3
                </div>
                <div className="text-sm text-muted-foreground">Phases terminées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {globalStats.totalErrors}
                </div>
                <div className="text-sm text-muted-foreground">Erreurs</div>
              </div>
            </div>
            
            {globalStats.totalExpected > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progrès global</span>
                  <span>{Math.round((globalStats.totalProcessed / globalStats.totalExpected) * 100)}%</span>
                </div>
                <Progress 
                  value={(globalStats.totalProcessed / globalStats.totalExpected) * 100} 
                  className="h-3"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contrôles */}
        <div className="flex justify-center">
          <Button 
            onClick={launchCompleteExtraction}
            disabled={isAutoExtracting}
            size="lg"
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
          >
            {isAutoExtracting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Lancement en cours...
              </>
            ) : (
              <>
                <PlayCircle className="h-5 w-5 mr-2" />
                Lancer l'extraction complète
              </>
            )}
          </Button>
        </div>

        {/* Sessions d'extraction */}
        <div className="grid md:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card key={session.type} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-blue-600/50" />
              
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {session.config.icon}
                    {session.type.toUpperCase()}
                  </div>
                  {session.status && getStatusBadge(session.status.status)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {session.config.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {session.status ? (
                  <>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(session.status.status)}
                      <span className="text-sm font-medium">
                        {session.status.status === 'running' ? 'En cours...' :
                         session.status.status === 'completed' ? 'Terminé' :
                         session.status.status === 'failed' ? 'Échoué' : 'En pause'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progrès</span>
                        <span>
                          {session.status.progress.processed.toLocaleString()} / {session.status.progress.total.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={(session.status.progress.processed / session.status.progress.total) * 100}
                        className="h-2"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-green-600">
                          {session.status.progress.success_rate.toFixed(1)}%
                        </div>
                        <div className="text-muted-foreground">Réussite</div>
                      </div>
                      <div>
                        <div className="font-medium text-red-600">
                          {session.status.progress.errors}
                        </div>
                        <div className="text-muted-foreground">Erreurs</div>
                      </div>
                    </div>
                    
                    {session.status.error_message && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        {session.status.error_message}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">En attente...</span>
                    </div>
                    <div className="text-sm">
                      <div>Batch: {session.config.batch_size}</div>
                      <div>Parallèle: {session.config.max_concurrent}</div>
                      <div>Attendu: ~{session.config.expected.toLocaleString()}</div>
                    </div>
                  </div>
                )}
                
                {session.session_id && (
                  <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                    Session: {session.session_id.substring(0, 8)}...
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">ℹ️ Comment ça marche</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• L'extraction se lance automatiquement au chargement de cette page</li>
              <li>• Les 3 phases (EDN → OIC → ECOS) s'exécutent en parallèle</li>
              <li>• Le monitoring se met à jour toutes les 5 secondes</li>
              <li>• Focus principal: <strong>4,872 compétences OIC</strong></li>
              <li>• Objectif: Plus de 90% de taux de réussite</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}