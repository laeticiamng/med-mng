import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const ItemCompetencesChecker = () => {
  const [itemCode, setItemCode] = useState('001');
  const [isChecking, setIsChecking] = useState(false);
  const [report, setReport] = useState<any>(null);
  const { toast } = useToast();

  const checkCompetences = async () => {
    setIsChecking(true);
    setReport(null);

    try {
      const { data, error } = await supabase.functions.invoke('check-item-competences', {
        body: { item_code: itemCode }
      });

      if (error) throw error;

      setReport(data);
      toast({
        title: '✅ Vérification terminée',
        description: `Score de complétude: ${data.analysis.score_completude}%`,
      });
    } catch (error: any) {
      console.error('Erreur vérification:', error);
      toast({
        title: '❌ Erreur',
        description: error.message || 'Impossible de vérifier les compétences',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getQualityColor = (qualite: string) => {
    switch (qualite) {
      case 'excellent': return 'bg-green-500';
      case 'bon': return 'bg-blue-500';
      case 'moyen': return 'bg-yellow-500';
      case 'faible': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🤖 Vérification IA des Compétences</CardTitle>
          <CardDescription>
            Utilise Lovable AI pour analyser la complétude des compétences OIC d'un item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Item code (ex: 001)"
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              className="max-w-xs"
            />
            <Button 
              onClick={checkCompetences} 
              disabled={isChecking || !itemCode}
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification en cours...
                </>
              ) : (
                'Vérifier avec IA'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <div className="space-y-4">
          {/* Score global */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>📊 Résultat pour {report.item_code} - {report.item_title}</span>
                <span className={`text-4xl font-bold ${getScoreColor(report.analysis.score_completude)}`}>
                  {report.analysis.score_completude}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{report.analysis.resume}</p>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>📈 Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Rang A</div>
                  <div className="text-2xl font-bold">
                    {report.statistiques.rang_a_presentes} / {report.statistiques.rang_a_attendues}
                  </div>
                  <Badge className={getQualityColor(report.analysis.rang_a.qualite)}>
                    {report.analysis.rang_a.qualite}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Rang B</div>
                  <div className="text-2xl font-bold">
                    {report.statistiques.rang_b_presentes} / {report.statistiques.rang_b_attendues}
                  </div>
                  <Badge className={getQualityColor(report.analysis.rang_b.qualite)}>
                    {report.analysis.rang_b.qualite}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rang A */}
          <Card>
            <CardHeader>
              <CardTitle>🅰️ Compétences Rang A</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-green-600 mb-2 flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Compétences présentes ({report.analysis.rang_a.presentes.length})
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {report.analysis.rang_a.presentes.map((comp: string, idx: number) => (
                    <li key={idx} className="text-muted-foreground">{comp}</li>
                  ))}
                </ul>
              </div>

              {report.analysis.rang_a.manquantes.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2 flex items-center">
                    <XCircle className="mr-2 h-4 w-4" />
                    Compétences manquantes ({report.analysis.rang_a.manquantes.length})
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {report.analysis.rang_a.manquantes.map((comp: string, idx: number) => (
                      <li key={idx} className="text-muted-foreground">{comp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rang B */}
          <Card>
            <CardHeader>
              <CardTitle>🅱️ Compétences Rang B</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-green-600 mb-2 flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Compétences présentes ({report.analysis.rang_b.presentes.length})
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {report.analysis.rang_b.presentes.map((comp: string, idx: number) => (
                    <li key={idx} className="text-muted-foreground">{comp}</li>
                  ))}
                </ul>
              </div>

              {report.analysis.rang_b.manquantes.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2 flex items-center">
                    <XCircle className="mr-2 h-4 w-4" />
                    Compétences manquantes ({report.analysis.rang_b.manquantes.length})
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {report.analysis.rang_b.manquantes.map((comp: string, idx: number) => (
                      <li key={idx} className="text-muted-foreground">{comp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommandations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                💡 Recommandations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.analysis.recommandations.map((reco: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span className="text-sm">{reco}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
