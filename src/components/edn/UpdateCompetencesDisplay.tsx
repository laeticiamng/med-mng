import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';

interface UpdateCompetencesDisplayProps {
  itemCode: string;
  onUpdate?: () => void;
}

interface UpdateResult {
  timestamp: string;
  rangA: number;
  rangB: number;
}

export const UpdateCompetencesDisplay = ({ itemCode, onUpdate }: UpdateCompetencesDisplayProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<UpdateResult | null>(null);
  
  const { toast } = useToast();

  const updateItemCompetences = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      // Extraire le numéro d'item
      const itemNumber = itemCode.replace('IC-', '').padStart(3, '0');
      
      toast({
        title: "🔄 Mise à jour des compétences",
        description: `Récupération des compétences OIC pour ${itemCode}...`,
      });

      // Récupérer les compétences OIC Rang A
      const { data: oicRangA, error: errorA } = await supabase
        .from('backup_oic_competences')
        .select(`
          objectif_id,
          intitule,
          description,
          rubrique,
          rang,
          item_parent,
          ordre,
          url_source
        `)
        .eq('item_parent', itemNumber)
        .eq('rang', 'A')
          .in('completion_status', ['completed', 'updated', 'verified_unchanged', 'skipped_error'])
        .not('description', 'is', null)
        .order('ordre');

      if (errorA) {
        throw new Error(`Erreur récupération Rang A: ${errorA.message}`);
      }

      // Récupérer les compétences OIC Rang B
      const { data: oicRangB, error: errorB } = await supabase
        .from('backup_oic_competences')
        .select(`
          objectif_id,
          intitule,
          description,
          rubrique,
          rang,
          item_parent,
          ordre,
          url_source
        `)
        .eq('item_parent', itemNumber)
        .eq('rang', 'B')
        .in('completion_status', ['completed', 'updated', 'verified_unchanged', 'skipped_error'])
        .not('description', 'is', null)
        .order('ordre');

      if (errorB) {
        throw new Error(`Erreur récupération Rang B: ${errorB.message}`);
      }

      // Filtrer les compétences avec descriptions complètes
      const competencesRangA = (oicRangA || []).filter(comp => 
        comp.objectif_id && comp.intitule && comp.description && comp.description.length > 20
      );

      const competencesRangB = (oicRangB || []).filter(comp => 
        comp.objectif_id && comp.intitule && comp.description && comp.description.length > 20
      );

      // Construire les tableaux structurés
      const tableauRangA = {
        title: `${itemCode} Rang A - Compétences fondamentales`,
        sections: competencesRangA.map((comp, index) => ({
          title: comp.intitule,
          content: comp.description,
          keywords: extractKeywords(comp.intitule + ' ' + comp.description),
          competence_id: comp.objectif_id,
          rubrique: comp.rubrique,
          url_source: comp.url_source
        }))
      };

      const tableauRangB = {
        title: `${itemCode} Rang B - Compétences avancées`,
        sections: competencesRangB.map((comp, index) => ({
          title: comp.intitule,
          content: comp.description,
          keywords: extractKeywords(comp.intitule + ' ' + comp.description),
          competence_id: comp.objectif_id,
          rubrique: comp.rubrique,
          url_source: comp.url_source
        }))
      };

      // Mettre à jour l'item EDN
      const { error: updateError } = await supabase
        .from('edn_items_complete')
        .update({
          competences_oic_rang_a: competencesRangA,
          competences_oic_rang_b: competencesRangB,
          competences_count_rang_a: competencesRangA.length,
          competences_count_rang_b: competencesRangB.length,
          competences_count_total: competencesRangA.length + competencesRangB.length,
          tableau_rang_a: tableauRangA,
          tableau_rang_b: tableauRangB,
          updated_at: new Date().toISOString()
        })
        .eq('item_code', itemCode);

      if (updateError) {
        throw new Error(`Erreur mise à jour: ${updateError.message}`);
      }

      setLastUpdate({
        timestamp: new Date().toISOString(),
        rangA: competencesRangA.length,
        rangB: competencesRangB.length
      });

      toast({
        title: "✅ Mise à jour réussie",
        description: `${competencesRangA.length} compétences Rang A + ${competencesRangB.length} compétences Rang B mises à jour`,
      });

      // Notifier le parent pour recharger les données
      onUpdate?.();

    } catch (error) {
      logger.error('Erreur mise à jour compétences', {
        component: 'UpdateCompetencesDisplay',
        action: 'updateItemCompetences',
        metadata: { itemCode, error }
      });
      toast({
        title: "❌ Erreur de mise à jour",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Fonction utilitaire pour extraire les mots-clés
  const extractKeywords = (text: string): string[] => {
    if (!text) return [];
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter((word, index, arr) => arr.indexOf(word) === index)
      .slice(0, 10);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5" />
          Mise à jour des compétences OIC
        </CardTitle>
        <CardDescription>
          Synchroniser l'affichage avec les dernières données de backup_oic_competences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={updateItemCompetences} 
            disabled={isUpdating}
            className="min-w-[180px]"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
          
          <Badge variant="outline" className="text-xs">
            Item: {itemCode}
          </Badge>
        </div>

        {lastUpdate && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Dernière mise à jour réussie
              </span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p>Timestamp: {new Date(lastUpdate.timestamp).toLocaleString('fr-FR')}</p>
              <p>Compétences Rang A: {lastUpdate.rangA}</p>
              <p>Compétences Rang B: {lastUpdate.rangB}</p>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>Cette action va :</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Récupérer les compétences OIC avec statut 'completed', 'updated', 'verified_unchanged' ou 'skipped_error'</li>
            <li>Filtrer celles avec des descriptions complètes (&gt;20 caractères)</li>
            <li>Mettre à jour les tableaux Rang A et Rang B</li>
            <li>Actualiser les compteurs de compétences</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};