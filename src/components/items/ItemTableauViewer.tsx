import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Clock, FileText, Users, BookOpen } from 'lucide-react';
import { useItemsCompleteness } from '@/hooks/useItemsCompleteness';
import { supabase } from '@/integrations/supabase/client';

interface TableauSection {
  title: string;
  content: string;
  keywords?: string[];
}

interface TableauData {
  title: string;
  sections: TableauSection[];
}

interface ItemTableauViewerProps {
  itemCode: string;
  showCompletenessAlerts?: boolean;
}

export const ItemTableauViewer: React.FC<ItemTableauViewerProps> = ({ 
  itemCode, 
  showCompletenessAlerts = true 
}) => {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('rang-a');
  
  const { getItemStatus } = useItemsCompleteness();
  const [completenessStatus, setCompletenessStatus] = useState<any>(null);

  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true);
        setError(null);

        // Charger l'item depuis Supabase
        const { data: itemData, error: itemError } = await supabase
          .from('edn_items_complete')
          .select('*')
          .eq('item_code', itemCode)
          .single();

        if (itemError) {
          throw itemError;
        }

        setItem(itemData);

        // Charger le statut de complétude si demandé
        if (showCompletenessAlerts) {
          const status = await getItemStatus(itemCode);
          setCompletenessStatus(status);
        }

      } catch (err) {
        console.error('Error loading item:', err);
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    if (itemCode) {
      loadItem();
    }
  }, [itemCode, showCompletenessAlerts, getItemStatus]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Chargement des tableaux...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement de l'item {itemCode}: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!item) {
    return (
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Item {itemCode} non trouvé dans la base de données.
        </AlertDescription>
      </Alert>
    );
  }

  const renderTableau = (tableauData: TableauData | null, type: 'A' | 'B') => {
    if (!tableauData || !tableauData.sections || tableauData.sections.length === 0) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tableau Rang {type} manquant ou incomplet pour l'item {itemCode}.
            {showCompletenessAlerts && (
              <div className="mt-2">
                <Button size="sm" variant="outline">
                  Signaler le problème
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold">{tableauData.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">
              {tableauData.sections.length} section{tableauData.sections.length > 1 ? 's' : ''}
            </Badge>
            {type === 'A' && (
              <Badge variant="secondary">
                <BookOpen className="h-3 w-3 mr-1" />
                Fondamentaux
              </Badge>
            )}
            {type === 'B' && (
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                Expertise
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {tableauData.sections.map((section, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{section.content}</p>
                {section.keywords && section.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {section.keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header avec informations de l'item */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{item.title}</h2>
          <p className="text-muted-foreground">
            Code: <code className="bg-muted px-2 py-1 rounded text-sm">{itemCode}</code>
          </p>
          {item.subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{item.subtitle}</p>
          )}
        </div>

        {/* Statut de complétude */}
        {showCompletenessAlerts && completenessStatus && (
          <div className="flex items-center gap-2">
            <Badge 
              variant={
                completenessStatus.status === 'complete' 
                  ? 'default' 
                  : completenessStatus.status === 'critical' 
                  ? 'destructive' 
                  : 'secondary'
              }
            >
              {completenessStatus.completeness_score}% complété
            </Badge>
            {completenessStatus.status === 'complete' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        )}
      </div>

      {/* Alertes de complétude */}
      {showCompletenessAlerts && completenessStatus && completenessStatus.alerts && completenessStatus.alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Problèmes détectés:</p>
              <ul className="list-disc list-inside space-y-1">
                {completenessStatus.alerts.map((alert: string, index: number) => (
                  <li key={index} className="text-sm">{alert}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs pour Rang A et Rang B */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rang-a" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Tableau Rang A
            {!item.tableau_rang_a && (
              <AlertTriangle className="h-3 w-3 text-red-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="rang-b" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tableau Rang B
            {!item.tableau_rang_b && (
              <AlertTriangle className="h-3 w-3 text-red-500" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rang-a" className="space-y-4">
          {renderTableau(item.tableau_rang_a, 'A')}
        </TabsContent>

        <TabsContent value="rang-b" className="space-y-4">
          {renderTableau(item.tableau_rang_b, 'B')}
        </TabsContent>
      </Tabs>

      {/* Informations supplémentaires */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Dernière mise à jour: {new Date(item.updated_at).toLocaleDateString()}
        </div>
        {item.quiz_questions && (
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {Array.isArray(item.quiz_questions) ? item.quiz_questions.length : 0} questions QCM
          </div>
        )}
      </div>
    </div>
  );
};