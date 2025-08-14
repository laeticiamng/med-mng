import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CompetenceStatus {
  item_code: string;
  title: string;
  competences_count_rang_a: number;
  competences_count_rang_b: number;
  competences_oic_rang_a: any;
  competences_oic_rang_b: any;
  last_oic_update: string;
  needs_update: boolean;
}

export function CompetencesUpdateChecker() {
  const [items, setItems] = useState<CompetenceStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();

  const checkCompetencesStatus = async () => {
    setChecking(true);
    try {
      console.log('🔍 Vérification du statut des compétences OIC...');
      
      // Récupérer les items EDN avec leurs compétences
      const { data: edmItems, error: edmError } = await supabase
        .from('edn_items_complete')
        .select(`
          item_code, title, 
          competences_count_rang_a, competences_count_rang_b,
          competences_oic_rang_a, competences_oic_rang_b,
          updated_at
        `)
        .order('item_code');

      if (edmError) {
        throw edmError;
      }

      // Vérifier la dernière mise à jour des compétences OIC dans backup_oic_competences
      const { data: oicData, error: oicError } = await supabase
        .from('backup_oic_competences')
        .select('item_parent, completion_updated_at, updated_at')
        .not('completion_updated_at', 'is', null)
        .order('completion_updated_at', { ascending: false });

      if (oicError) {
        console.warn('Impossible de récupérer les dates de mise à jour OIC:', oicError);
      }

      const statusItems: CompetenceStatus[] = (edmItems || []).map(item => {
        // Extraire le numéro d'item (IC-123 -> 123)
        const itemNumber = item.item_code.replace('IC-', '');
        
        // Trouver les mises à jour OIC correspondantes
        const relatedOicUpdates = (oicData || []).filter(oic => 
          oic.item_parent === `IC-${itemNumber}`
        );
        
        const lastOicUpdate = relatedOicUpdates.length > 0 
          ? relatedOicUpdates[0].completion_updated_at || relatedOicUpdates[0].updated_at
          : null;

        // Vérifier si les compétences OIC ont été mises à jour après l'item EDN
        const itemUpdateDate = new Date(item.updated_at);
        const oicUpdateDate = lastOicUpdate ? new Date(lastOicUpdate) : null;
        
        const needsUpdate = oicUpdateDate && oicUpdateDate > itemUpdateDate;

        return {
          item_code: item.item_code,
          title: item.title,
          competences_count_rang_a: item.competences_count_rang_a || 0,
          competences_count_rang_b: item.competences_count_rang_b || 0,
          competences_oic_rang_a: item.competences_oic_rang_a,
          competences_oic_rang_b: item.competences_oic_rang_b,
          last_oic_update: lastOicUpdate || '',
          needs_update: needsUpdate || false
        };
      });

      setItems(statusItems);
      
      const itemsNeedingUpdate = statusItems.filter(item => item.needs_update);
      
      toast({
        title: "Vérification terminée",
        description: `${itemsNeedingUpdate.length} items nécessitent une mise à jour des compétences`,
        variant: itemsNeedingUpdate.length > 0 ? "destructive" : "default"
      });

    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le statut des compétences",
        variant: "destructive"
      });
    } finally {
      setChecking(false);
    }
  };

  const updateItemCompetences = async (itemCode: string) => {
    setLoading(true);
    try {
      console.log(`🔄 Mise à jour des compétences pour ${itemCode}...`);
      
      // Appeler la fonction Edge qui met à jour les compétences
      const { data, error } = await supabase.functions.invoke('update-edn-competences', {
        body: { item_code: itemCode }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Mise à jour réussie",
        description: `Compétences de ${itemCode} mises à jour`,
      });

      // Re-vérifier le statut
      await checkCompetencesStatus();

    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour ${itemCode}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const itemsNeedingUpdate = items.filter(item => item.needs_update);
  const totalItems = items.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Vérification des Compétences</h2>
          <p className="text-slate-600">Statut de synchronisation entre les items EDN et les compétences OIC</p>
        </div>
        <Button 
          onClick={checkCompetencesStatus}
          disabled={checking}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Vérification...' : 'Vérifier'}
        </Button>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{totalItems}</p>
                  <p className="text-sm text-muted-foreground">Items total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{totalItems - itemsNeedingUpdate.length}</p>
                  <p className="text-sm text-muted-foreground">À jour</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{itemsNeedingUpdate.length}</p>
                  <p className="text-sm text-muted-foreground">À mettre à jour</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(((totalItems - itemsNeedingUpdate.length) / totalItems) * 100)}%</p>
                  <p className="text-sm text-muted-foreground">Synchronisé</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {itemsNeedingUpdate.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {itemsNeedingUpdate.length} items ont des compétences OIC plus récentes et nécessitent une mise à jour.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {itemsNeedingUpdate.map(item => (
          <Card key={item.item_code} className="border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{item.item_code}</CardTitle>
                  <CardDescription className="text-sm">{item.title}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-100">
                    Rang A: {item.competences_count_rang_a}
                  </Badge>
                  <Badge variant="outline" className="bg-orange-100">
                    Rang B: {item.competences_count_rang_b}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => updateItemCompetences(item.item_code)}
                    disabled={loading}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Mettre à jour
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Dernière mise à jour OIC: {item.last_oic_update ? new Date(item.last_oic_update).toLocaleString('fr-FR') : 'Aucune'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length > 0 && itemsNeedingUpdate.length === 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">Tout est à jour !</h3>
            <p className="text-green-700">Toutes les compétences des items EDN sont synchronisées avec les dernières données OIC.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}