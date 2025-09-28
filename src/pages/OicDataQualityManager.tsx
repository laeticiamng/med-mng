import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, Database, Loader2, Play, Search } from 'lucide-react';

interface AnalysisResult {
  analysis: {
    totalCompetences: number;
    emptyDescriptions: number;
    tooShortDescriptions: number;
    htmlEntitiesCorrupted: number;
    fragmentsIncomplete: number;
    intitulesCorrupted: number;
    wikitablesDetected: number;
    samples: any;
  };
  percentages: {
    emptyDescriptions: string;
    tooShortDescriptions: string;
    htmlEntitiesCorrupted: string;
    fragmentsIncomplete: string;
    intitulesCorrupted: string;
    wikitablesDetected: string;
  };
  totalProblems: number;
  healthScore: string;
}

interface FixResult {
  report: {
    totalProcessed: number;
    htmlEntitiesFixed: number;
    fragmentsReconstructed: number;
    emptyDescriptionsHandled: number;
    wikitablesCleaned: number;
    intitulesFixed: number;
    errors: string[];
    samples: any[];
  };
  totalFixed: number;
  successRate: string;
}

const OicDataQualityManager = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('🔍 Starting OIC data quality analysis...');
      
      const { data, error } = await supabase.functions.invoke('fix-oic-data-quality', {
        body: { action: 'analyze' }
      });
      
      if (error) throw error;
      
      setAnalysisResult(data);
      console.log('✅ Analysis completed:', data);
      
    } catch (err: any) {
      console.error('❌ Analysis failed:', err);
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runFixes = async () => {
    setIsFixing(true);
    setError(null);
    
    try {
      console.log('🛠️ Starting OIC data quality fixes...');
      
      const { data, error } = await supabase.functions.invoke('fix-oic-data-quality', {
        body: { action: 'fix' }
      });
      
      if (error) throw error;
      
      setFixResult(data);
      console.log('✅ Fixes completed:', data);
      
      // Relancer l'analyse pour voir les améliorations
      setTimeout(() => {
        runAnalysis();
      }, 1000);
      
    } catch (err: any) {
      console.error('❌ Fix failed:', err);
      setError(`Fix failed: ${err.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  const getHealthScoreColor = (score: string) => {
    const numScore = parseFloat(score);
    if (numScore >= 80) return 'text-green-600';
    if (numScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
          <Database className="h-8 w-8 text-primary" />
          Gestionnaire de Qualité des Données OIC
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Analysez et corrigez automatiquement les problèmes de qualité des compétences OIC extraites de la base de données.
          Ce système détecte et répare les balises HTML corrompues, les fragments incomplets, et les descriptions manquantes.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel d'analyse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Analyse de Qualité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runAnalysis} 
              disabled={isAnalyzing}
              className="w-full"
              variant="outline"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyser les Données OIC
                </>
              )}
            </Button>

            {analysisResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Score de Santé</span>
                  <span className={`text-2xl font-bold ${getHealthScoreColor(analysisResult.healthScore)}`}>
                    {analysisResult.healthScore}%
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {analysisResult.analysis.totalCompetences} compétences analysées
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Descriptions vides</span>
                    <Badge variant={analysisResult.analysis.emptyDescriptions > 0 ? "destructive" : "secondary"}>
                      {analysisResult.analysis.emptyDescriptions} ({analysisResult.percentages.emptyDescriptions}%)
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>HTML corrompu</span>
                    <Badge variant={analysisResult.analysis.htmlEntitiesCorrupted > 0 ? "destructive" : "secondary"}>
                      {analysisResult.analysis.htmlEntitiesCorrupted} ({analysisResult.percentages.htmlEntitiesCorrupted}%)
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Fragments incomplets</span>
                    <Badge variant={analysisResult.analysis.fragmentsIncomplete > 0 ? "destructive" : "secondary"}>
                      {analysisResult.analysis.fragmentsIncomplete} ({analysisResult.percentages.fragmentsIncomplete}%)
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Intitulés corrompus</span>
                    <Badge variant={analysisResult.analysis.intitulesCorrupted > 0 ? "destructive" : "secondary"}>
                      {analysisResult.analysis.intitulesCorrupted} ({analysisResult.percentages.intitulesCorrupted}%)
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel de correction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Correction Automatique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runFixes} 
              disabled={isFixing || !analysisResult}
              className="w-full"
              variant="default"
            >
              {isFixing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Correction en cours...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Lancer les Corrections
                </>
              )}
            </Button>

            {!analysisResult && (
              <p className="text-sm text-muted-foreground">
                Lancez d'abord une analyse pour activer les corrections.
              </p>
            )}

            {fixResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Corrections Terminées</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total traité</span>
                    <Badge variant="secondary">{fixResult.report.totalProcessed}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total corrigé</span>
                    <Badge variant="default">{fixResult.totalFixed}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux de succès</span>
                    <Badge variant="default">{fixResult.successRate}%</Badge>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div>🔧 HTML nettoyé: {fixResult.report.htmlEntitiesFixed}</div>
                  <div>📝 Fragments reconstruits: {fixResult.report.fragmentsReconstructed}</div>
                  <div>❌ Descriptions créées: {fixResult.report.emptyDescriptionsHandled}</div>
                  <div>📋 Tables nettoyées: {fixResult.report.wikitablesCleaned}</div>
                  <div>💥 Intitulés corrigés: {fixResult.report.intitulesFixed}</div>
                </div>

                {fixResult.report.errors.length > 0 && (
                  <div className="text-sm text-red-600">
                    ⚠️ {fixResult.report.errors.length} erreurs détectées
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions d'utilisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>1. Analyse :</strong> Scanne toutes les compétences OIC pour identifier les problèmes de qualité des données.
          </div>
          <div>
            <strong>2. Correction :</strong> Applique automatiquement des corrections pour résoudre :
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
              <li>Entités HTML corrompues (&amp;lt;, &amp;gt;, &amp;nbsp;)</li>
              <li>Fragments de texte incomplets</li>
              <li>Descriptions vides ou manquantes</li>
              <li>Tables MediaWiki non converties</li>
              <li>Intitulés avec balises corrompues</li>
            </ul>
          </div>
          <div>
            <strong>3. Re-analyse :</strong> Après correction, une nouvelle analyse est automatiquement lancée pour mesurer l'amélioration.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OicDataQualityManager;