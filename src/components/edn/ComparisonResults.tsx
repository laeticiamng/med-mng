import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComparisonSummary {
  total_items: number;
  items_with_official_content: number;
  items_with_differences: number;
  average_similarity: number;
  completion_rate: number;
}

interface ComparisonResult {
  item_code: string;
  title: string;
  official_content?: string;
  our_rang_a_count: number;
  our_rang_b_count: number;
  official_rang_a?: string[];
  official_rang_b?: string[];
  differences: string[];
  similarity_score: number;
}

interface ComparisonResponse {
  success: boolean;
  summary: ComparisonSummary;
  comparisons: ComparisonResult[];
  total_comparisons: number;
  error?: string;
}

export const ComparisonResults = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ComparisonResponse | null>(null);
  const { toast } = useToast();

  const runComparison = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('compare-official-content');
      
      if (error) {
        throw error;
      }
      
      setResults(data);
      toast({
        title: "Comparaison terminée",
        description: `${data.summary.total_items} items analysés avec ${data.summary.average_similarity}% de similarité moyenne`
      });
    } catch (error) {
      console.error('Error running comparison:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la comparaison avec le contenu officiel",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSimilarityIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Comparaison avec le Contenu Officiel EDN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runComparison} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Comparaison en cours...
              </>
            ) : (
              'Lancer la comparaison'
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <>
          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé de la Comparaison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{results.summary.total_items}</div>
                  <div className="text-sm text-muted-foreground">Items Totaux</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.summary.items_with_official_content}</div>
                  <div className="text-sm text-muted-foreground">Avec Contenu Officiel</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{results.summary.items_with_differences}</div>
                  <div className="text-sm text-muted-foreground">Avec Différences</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.summary.average_similarity}%</div>
                  <div className="text-sm text-muted-foreground">Similarité Moyenne</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Résultats Détaillés (50 premiers items)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {results.comparisons.map((comparison) => (
                  <div key={comparison.item_code} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{comparison.item_code}</h3>
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          {comparison.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSimilarityIcon(comparison.similarity_score)}
                        <span className={`font-semibold ${getSimilarityColor(comparison.similarity_score)}`}>
                          {comparison.similarity_score}%
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm">
                      <Badge variant="outline">
                        Rang A: {comparison.our_rang_a_count} concepts
                      </Badge>
                      <Badge variant="outline">
                        Rang B: {comparison.our_rang_b_count} concepts
                      </Badge>
                      {comparison.official_rang_a && (
                        <Badge variant="secondary">
                          Officiel A: {comparison.official_rang_a.length}
                        </Badge>
                      )}
                      {comparison.official_rang_b && (
                        <Badge variant="secondary">
                          Officiel B: {comparison.official_rang_b.length}
                        </Badge>
                      )}
                    </div>

                    {comparison.differences.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-red-600">Différences détectées:</p>
                        {comparison.differences.map((diff, index) => (
                          <p key={index} className="text-xs text-muted-foreground ml-2">
                            {diff}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};