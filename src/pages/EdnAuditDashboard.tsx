import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, RefreshCw, CheckCircle, AlertCircle, XCircle, 
  TrendingUp, TrendingDown, Loader2, ArrowLeft, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuditResult {
  id: string;
  item_code: string;
  completeness_score: number;
  rang_a_complete: boolean;
  rang_b_complete: boolean;
  missing_rang_a: string[];
  missing_rang_b: string[];
  suggestions: string;
  status: string;
  audit_date: string;
}

export const EdnAuditDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    analyzing: 0,
    completed: 0,
    failed: 0,
    total: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  const loadAuditResults = async () => {
    const { data, error } = await supabase
      .from('edn_items_audit')
      .select('*')
      .order('completeness_score', { ascending: true });

    if (error) {
      console.error('Error loading audit results:', error);
      return;
    }

    setAuditResults(data || []);
  };

  const startAudit = async () => {
    setIsAuditing(true);
    try {
      // Lancer l'audit global
      const { data, error } = await supabase.functions.invoke('audit-edn-completeness', {
        body: { action: 'start-audit' }
      });

      if (error) throw error;

      toast({
        title: "✅ Audit lancé",
        description: `Analyse de ${data.itemCount} items en cours...`,
      });

      // Récupérer tous les items à analyser
      const { data: items } = await supabase
        .from('edn_items_immersive')
        .select('item_code')
        .order('item_code');

      // Analyser chaque item (par batch de 5 pour éviter la surcharge)
      const batchSize = 5;
      for (let i = 0; i < (items?.length || 0); i += batchSize) {
        const batch = items?.slice(i, i + batchSize) || [];
        
        await Promise.all(
          batch.map(item => 
            supabase.functions.invoke('audit-edn-completeness', {
              body: { action: 'analyze-item', itemCode: item.item_code }
            })
          )
        );

        // Rafraîchir les résultats après chaque batch
        await loadAuditResults();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Pause 1s entre batches
      }

      toast({
        title: "🎉 Audit terminé",
        description: "Tous les items ont été analysés",
      });

    } catch (error) {
      console.error('Error starting audit:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de lancer l'audit",
        variant: "destructive",
      });
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    loadAuditResults();
    const interval = setInterval(loadAuditResults, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const filteredResults = auditResults.filter(result =>
    result.item_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgScore = auditResults.length > 0
    ? Math.round(auditResults.reduce((sum, r) => sum + (r.completeness_score || 0), 0) / auditResults.length)
    : 0;

  const incompleteItems = auditResults.filter(r => r.completeness_score < 80).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/edn-complete')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audit de Complétude EDN</h1>
              <p className="text-gray-600">Analyse IA des 367 items</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={loadAuditResults}
              variant="outline"
              disabled={isAuditing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isAuditing ? 'animate-spin' : ''}`} />
              Rafraîchir
            </Button>
            <Button 
              onClick={startAudit}
              disabled={isAuditing}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {isAuditing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Lancer l'audit
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Score moyen</p>
                  <p className="text-3xl font-bold text-blue-600">{avgScore}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Items complets</p>
                  <p className="text-3xl font-bold text-green-600">
                    {auditResults.filter(r => r.completeness_score >= 80).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">À améliorer</p>
                  <p className="text-3xl font-bold text-orange-600">{incompleteItems}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total analysé</p>
                  <p className="text-3xl font-bold text-gray-900">{auditResults.length}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Résultats de l'audit</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-lg">{result.item_code}</span>
                          <Badge variant={result.completeness_score >= 80 ? "default" : "destructive"}>
                            {result.completeness_score}%
                          </Badge>
                          {result.rang_a_complete && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Rang A ✓
                            </Badge>
                          )}
                          {result.rang_b_complete && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Rang B ✓
                            </Badge>
                          )}
                        </div>
                        <Progress value={result.completeness_score} className="mb-2" />
                      </div>
                    </div>

                    {(result.missing_rang_a?.length > 0 || result.missing_rang_b?.length > 0) && (
                      <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm font-medium text-orange-900 mb-2">Compétences manquantes:</p>
                        {result.missing_rang_a?.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-bold text-orange-700">Rang A: </span>
                            <span className="text-xs text-orange-600">{result.missing_rang_a.join(', ')}</span>
                          </div>
                        )}
                        {result.missing_rang_b?.length > 0 && (
                          <div>
                            <span className="text-xs font-bold text-orange-700">Rang B: </span>
                            <span className="text-xs text-orange-600">{result.missing_rang_b.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {result.suggestions && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-900">{result.suggestions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
