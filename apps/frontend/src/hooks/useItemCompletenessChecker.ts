import logger from '@/lib/logger';
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FieldAnalysis {
  fieldName: string;
  status: 'empty' | 'incomplete' | 'partial' | 'complete';
  currentLength?: number;
  expectedLength?: number;
  details?: string;
}

interface CompletenessResult {
  itemId: string;
  itemCode: string;
  title: string;
  completenessScore: number;
  status: 'complete' | 'incomplete' | 'critical';
  missingFields: string[];
  partialFields: string[];
  fieldAnalysis: FieldAnalysis[];
  lastChecked: string;
}

interface CompletenessReport {
  summary: {
    totalItems: number;
    completeItems: number;
    incompleteItems: number;
    criticalItems: number;
    averageCompleteness: number;
  };
  items: CompletenessResult[];
  recommendations: string[];
}

export const useItemCompletenessChecker = () => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [lastReport, setLastReport] = useState<CompletenessReport | null>(null);
  const [itemResults, setItemResults] = useState<Map<string, CompletenessResult>>(new Map());

  // Vérifier un item spécifique
  const checkItemCompleteness = useCallback(async (itemId: string): Promise<CompletenessResult | null> => {
    try {
      setIsChecking(true);
      logger.debug(`🔍 Vérification complétude item: ${itemId}`);

      const { data, error } = await supabase.functions.invoke('items-completeness-check', {
        body: JSON.stringify({ itemId })
      });

      if (error) {
        throw error;
      }

      const result = data as CompletenessResult;
      
      // Stocker le résultat
      setItemResults(prev => new Map(prev.set(itemId, result)));

      // Log détaillé
      logger.debug(`📊 Complétude ${result.itemCode}: ${result.completenessScore}%`, {
        status: result.status,
        missingFields: result.missingFields,
        partialFields: result.partialFields
      });

      return result;

    } catch (error) {
      logger.error('❌ Erreur vérification item:', error);
      toast({
        title: "Erreur de vérification",
        description: `Impossible de vérifier l'item: ${error.message}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [toast]);

  // Vérifier tous les items
  const checkAllItemsCompleteness = useCallback(async (): Promise<CompletenessReport | null> => {
    try {
      setIsChecking(true);
      logger.debug('🔍 Vérification complétude de tous les items...');

      const { data, error } = await supabase.functions.invoke('items-completeness-check');

      if (error) {
        throw error;
      }

      const report = data as CompletenessReport;
      setLastReport(report);

      // Stocker tous les résultats individuels
      const newItemResults = new Map();
      report.items.forEach(item => {
        newItemResults.set(item.itemId, item);
      });
      setItemResults(newItemResults);

      // Log du rapport complet
      console.group('📊 RAPPORT COMPLÉTUDE GLOBAL');
      logger.debug(`📈 Items complets: ${report.summary.completeItems}/${report.summary.totalItems} (${((report.summary.completeItems/report.summary.totalItems)*100).toFixed(1)}%)`);
      logger.debug(`⚠️ Items incomplets: ${report.summary.incompleteItems}`);
      logger.debug(`🚨 Items critiques: ${report.summary.criticalItems}`);
      logger.debug(`📊 Score moyen: ${report.summary.averageCompleteness}%`);
      
      if (report.recommendations.length > 0) {
        logger.debug('💡 Recommandations:');
        report.recommendations.forEach(rec => logger.debug(`  • ${rec}`));
      }
      console.groupEnd();

      // Toast de synthèse
      if (report.summary.criticalItems > 0) {
        toast({
          title: "⚠️ Items critiques détectés",
          description: `${report.summary.criticalItems} items nécessitent une attention urgente`,
          variant: "destructive"
        });
      } else if (report.summary.averageCompleteness < 80) {
        toast({
          title: "📈 Complétude à améliorer", 
          description: `Score moyen: ${report.summary.averageCompleteness}% (objectif: 80%+)`,
        });
      } else {
        toast({
          title: "✅ Complétude satisfaisante",
          description: `Score moyen: ${report.summary.averageCompleteness}%`,
        });
      }

      return report;

    } catch (error) {
      logger.error('❌ Erreur vérification globale:', error);
      toast({
        title: "Erreur de vérification globale",
        description: `Impossible de vérifier tous les items: ${error.message}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [toast]);

  // Obtenir le statut de complétude d'un item (avec cache)
  const getItemCompleteness = useCallback((itemId: string): CompletenessResult | null => {
    return itemResults.get(itemId) || null;
  }, [itemResults]);

  // Vérifier si un item est incomplet
  const isItemIncomplete = useCallback((itemId: string): boolean => {
    const result = itemResults.get(itemId);
    return result ? result.status !== 'complete' : false;
  }, [itemResults]);

  // Obtenir les items par statut
  const getItemsByStatus = useCallback((status: 'complete' | 'incomplete' | 'critical'): CompletenessResult[] => {
    return Array.from(itemResults.values()).filter(item => item.status === status);
  }, [itemResults]);

  // Générer un rapport de synthèse depuis le cache
  const getCachedSummary = useCallback(() => {
    if (itemResults.size === 0) return null;

    const items = Array.from(itemResults.values());
    const completeItems = items.filter(item => item.status === 'complete').length;
    const incompleteItems = items.filter(item => item.status === 'incomplete').length;
    const criticalItems = items.filter(item => item.status === 'critical').length;
    const averageCompleteness = Math.round(
      items.reduce((sum, item) => sum + item.completenessScore, 0) / items.length
    );

    return {
      totalItems: items.length,
      completeItems,
      incompleteItems, 
      criticalItems,
      averageCompleteness
    };
  }, [itemResults]);

  return {
    // State
    isChecking,
    lastReport,
    itemResults: Array.from(itemResults.values()),
    
    // Actions
    checkItemCompleteness,
    checkAllItemsCompleteness,
    getItemCompleteness,
    isItemIncomplete,
    getItemsByStatus,
    getCachedSummary
  };
};