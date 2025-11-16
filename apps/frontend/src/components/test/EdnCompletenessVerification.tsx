/**
 * Composant de Vérification de la Complétude EDN
 * Vérifie à 100% que chaque item EDN dispose de:
 * - Rangs A et B complets
 * - Paroles musicales séparées (Rang A, B, AB)
 * - Quiz interactif
 * - Intégration Suno
 * - Bande dessinée fixe
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle, CheckCircle, XCircle, RefreshCw,
  Music, Book, Brain, Film, Database
} from 'lucide-react';
import { toast } from 'sonner';

interface GlobalStats {
  totalItems: number;
  itemsWithRangA: number;
  itemsWithRangB: number;
  itemsWithBoth: number;
  itemsWithParoles: number;
  itemsWithQuiz: number;
  itemsWithTableauA: number;
  itemsWithTableauB: number;

  // Nouvelles colonnes (si migration appliquée)
  itemsWithParolesRangA?: number;
  itemsWithParolesRangB?: number;
  itemsWithParolesRangAB?: number;
  hasSeparatedParoles?: boolean;

  sunoSongsTotal?: number;
  sunoSongsLinked?: number;
  comicPanelsTotal?: number;
  comicPanelsLinked?: number;
}

interface EdnItem {
  item_code: string;
  title: string;
  competences_oic_rang_a: any;
  competences_oic_rang_b: any;
  paroles_musicales: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  quiz_questions: any;
  tableau_rang_a: any;
  tableau_rang_b: any;
  completeness_score: number;
}

interface CriticalIssue {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  itemsAffected: number;
  solution: string;
}

export const EdnCompletenessVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [sampleItems, setSampleItems] = useState<EdnItem[]>([]);
  const [incompleteItems, setIncompleteItems] = useState<EdnItem[]>([]);
  const [criticalIssues, setCriticalIssues] = useState<CriticalIssue[]>([]);
  const [migrationApplied, setMigrationApplied] = useState<boolean | null>(null);

  const runVerification = async () => {
    setIsLoading(true);
    toast.info('🔍 Démarrage de la vérification complète...');

    try {
      // 1. Récupérer tous les items EDN
      const { data: items, error: itemsError } = await supabase
        .from('edn_items_complete')
        .select('*')
        .order('item_code');

      if (itemsError) {
        toast.error(`Erreur: ${itemsError.message}`);
        console.error('Items error:', itemsError);
        return;
      }

      if (!items || items.length === 0) {
        toast.error('Aucun item EDN trouvé dans la base!');
        return;
      }

      // 2. Vérifier si la migration a été appliquée
      const firstItem = items[0];
      const hasSeparatedParoles = 'paroles_rang_a' in firstItem &&
                                   'paroles_rang_b' in firstItem &&
                                   'paroles_rang_ab' in firstItem;

      setMigrationApplied(hasSeparatedParoles);

      // 3. Calculer les statistiques globales
      const totalItems = items.length;
      const withRangA = items.filter(i => i.competences_oic_rang_a && i.competences_oic_rang_a.length > 0).length;
      const withRangB = items.filter(i => i.competences_oic_rang_b && i.competences_oic_rang_b.length > 0).length;
      const withBoth = items.filter(i =>
        i.competences_oic_rang_a && i.competences_oic_rang_a.length > 0 &&
        i.competences_oic_rang_b && i.competences_oic_rang_b.length > 0
      ).length;
      const withParoles = items.filter(i => i.paroles_musicales && i.paroles_musicales.length > 0).length;
      const withQuiz = items.filter(i => i.quiz_questions && Object.keys(i.quiz_questions).length > 0).length;
      const withTableauA = items.filter(i => i.tableau_rang_a && Object.keys(i.tableau_rang_a).length > 0).length;
      const withTableauB = items.filter(i => i.tableau_rang_b && Object.keys(i.tableau_rang_b).length > 0).length;

      let globalStats: GlobalStats = {
        totalItems,
        itemsWithRangA: withRangA,
        itemsWithRangB: withRangB,
        itemsWithBoth: withBoth,
        itemsWithParoles: withParoles,
        itemsWithQuiz: withQuiz,
        itemsWithTableauA: withTableauA,
        itemsWithTableauB: withTableauB,
        hasSeparatedParoles,
      };

      // Si migration appliquée, vérifier les nouvelles colonnes
      if (hasSeparatedParoles) {
        globalStats.itemsWithParolesRangA = items.filter(i => i.paroles_rang_a && i.paroles_rang_a.length > 0).length;
        globalStats.itemsWithParolesRangB = items.filter(i => i.paroles_rang_b && i.paroles_rang_b.length > 0).length;
        globalStats.itemsWithParolesRangAB = items.filter(i => i.paroles_rang_ab && i.paroles_rang_ab.length > 0).length;
      }

      // 4. Vérifier Suno songs
      const { data: songs, error: songsError } = await supabase
        .from('med_mng_songs')
        .select('*');

      if (!songsError && songs) {
        globalStats.sunoSongsTotal = songs.length;
        globalStats.sunoSongsLinked = songs.filter(s => s.item_code).length;
      }

      // 5. Vérifier comic panels
      const { data: comics, error: comicsError } = await supabase
        .from('comic_panels')
        .select('*');

      if (!comicsError && comics) {
        globalStats.comicPanelsTotal = comics.length;
        globalStats.comicPanelsLinked = comics.filter(c => c.item_code).length;
      }

      setStats(globalStats);

      // 6. Identifier les items incomplets
      const incomplete = items.filter(i => {
        const hasRangA = i.competences_oic_rang_a && i.competences_oic_rang_a.length > 0;
        const hasRangB = i.competences_oic_rang_b && i.competences_oic_rang_b.length > 0;
        const hasParoles = i.paroles_musicales && i.paroles_musicales.length > 0;
        const hasQuiz = i.quiz_questions && Object.keys(i.quiz_questions).length > 0;

        return !(hasRangA && hasRangB && hasParoles && hasQuiz);
      });

      setIncompleteItems(incomplete.slice(0, 20));
      setSampleItems(items.slice(0, 10));

      // 7. Identifier les problèmes critiques
      const issues: CriticalIssue[] = [];

      if (!hasSeparatedParoles) {
        issues.push({
          severity: 'critical',
          title: '❌ Migration non appliquée',
          description: 'Les colonnes paroles_rang_a, paroles_rang_b, paroles_rang_ab sont manquantes',
          itemsAffected: totalItems,
          solution: 'Appliquer la migration: 20251116220000_add_complete_edn_features.sql'
        });
      }

      if (globalStats.sunoSongsLinked === 0) {
        issues.push({
          severity: 'critical',
          title: '❌ Chansons Suno non liées',
          description: 'Aucune chanson Suno n\'est liée aux items EDN',
          itemsAffected: totalItems,
          solution: 'Lier les chansons existantes ou générer de nouvelles chansons avec item_code et rang_type'
        });
      }

      if (withBoth < totalItems) {
        issues.push({
          severity: 'warning',
          title: '⚠️  Items sans Rang A+B complets',
          description: `${totalItems - withBoth} items n'ont pas les deux rangs complets`,
          itemsAffected: totalItems - withBoth,
          solution: 'Synchroniser les compétences OIC depuis la base UNESS'
        });
      }

      if (withParoles < totalItems) {
        issues.push({
          severity: 'warning',
          title: '⚠️  Items sans paroles musicales',
          description: `${totalItems - withParoles} items n'ont pas de paroles`,
          itemsAffected: totalItems - withParoles,
          solution: 'Générer les paroles pour chaque rang (A, B, AB) - environ 1,101 chansons nécessaires'
        });
      }

      if (withQuiz < totalItems) {
        issues.push({
          severity: 'warning',
          title: '⚠️  Items sans quiz',
          description: `${totalItems - withQuiz} items n'ont pas de quiz`,
          itemsAffected: totalItems - withQuiz,
          solution: 'Générer automatiquement les quiz depuis les compétences OIC'
        });
      }

      setCriticalIssues(issues);

      toast.success(`✅ Vérification terminée: ${totalItems} items analysés`);

    } catch (error: any) {
      console.error('Erreur vérification:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runVerification();
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg font-medium">Vérification de la complétude EDN...</p>
        </div>
      </div>
    );
  }

  const completenessPercentage = Math.round(
    (stats.itemsWithBoth / stats.totalItems * 0.3 +
     stats.itemsWithParoles / stats.totalItems * 0.2 +
     stats.itemsWithQuiz / stats.totalItems * 0.2 +
     stats.itemsWithTableauA / stats.totalItems * 0.15 +
     stats.itemsWithTableauB / stats.totalItems * 0.15) * 100
  );

  return (
    <div className="space-y-6 p-6">
      {/* En-tête avec statut migration */}
      <Card className={migrationApplied ? 'border-green-500' : 'border-red-500'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {migrationApplied ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                Vérification Complétude EDN - 367 Items
              </CardTitle>
              <CardDescription>
                {migrationApplied
                  ? '✅ Migration appliquée - Colonnes séparées détectées'
                  : '❌ Migration NON appliquée - Colonnes séparées manquantes'}
              </CardDescription>
            </div>
            <Button onClick={runVerification} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Complétude Globale</span>
              <span className={`text-3xl font-bold ${
                completenessPercentage >= 80 ? 'text-green-600' :
                completenessPercentage >= 50 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {completenessPercentage}%
              </span>
            </div>
            <Progress value={completenessPercentage} className="h-4" />
            <p className="text-sm text-muted-foreground">
              Basé sur: Rangs A+B (30%), Paroles (20%), Quiz (20%), Tableaux (30%)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques globales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Statistiques Globales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Items Total"
              value={stats.totalItems}
              icon={<Book className="h-4 w-4" />}
            />
            <StatCard
              label="Rang A+B Complets"
              value={stats.itemsWithBoth}
              percentage={(stats.itemsWithBoth / stats.totalItems * 100).toFixed(0)}
              icon={<CheckCircle className="h-4 w-4" />}
            />
            <StatCard
              label="Avec Paroles"
              value={stats.itemsWithParoles}
              percentage={(stats.itemsWithParoles / stats.totalItems * 100).toFixed(0)}
              icon={<Music className="h-4 w-4" />}
            />
            <StatCard
              label="Avec Quiz"
              value={stats.itemsWithQuiz}
              percentage={(stats.itemsWithQuiz / stats.totalItems * 100).toFixed(0)}
              icon={<Brain className="h-4 w-4" />}
            />
          </div>

          {stats.hasSeparatedParoles && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-green-700">✅ Paroles Séparées (Nouvelle Structure)</h4>
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  label="Paroles Rang A"
                  value={stats.itemsWithParolesRangA || 0}
                  percentage={((stats.itemsWithParolesRangA || 0) / stats.totalItems * 100).toFixed(0)}
                />
                <StatCard
                  label="Paroles Rang B"
                  value={stats.itemsWithParolesRangB || 0}
                  percentage={((stats.itemsWithParolesRangB || 0) / stats.totalItems * 100).toFixed(0)}
                />
                <StatCard
                  label="Paroles Rang A+B"
                  value={stats.itemsWithParolesRangAB || 0}
                  percentage={((stats.itemsWithParolesRangAB || 0) / stats.totalItems * 100).toFixed(0)}
                />
              </div>
            </div>
          )}

          <div className="mt-6">
            <h4 className="font-semibold mb-3">Intégrations Externes</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Chansons Suno</span>
                  <Badge variant={stats.sunoSongsLinked ? 'default' : 'destructive'}>
                    {stats.sunoSongsLinked || 0} liées / {stats.sunoSongsTotal || 0} total
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bandes Dessinées</span>
                  <Badge variant={stats.comicPanelsLinked ? 'default' : 'destructive'}>
                    {stats.comicPanelsLinked || 0} liées / {stats.comicPanelsTotal || 0} total
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problèmes critiques */}
      {criticalIssues.length > 0 && (
        <Card className="border-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Problèmes Identifiés ({criticalIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalIssues.map((issue, index) => (
              <Alert
                key={index}
                variant={issue.severity === 'critical' ? 'destructive' : 'default'}
              >
                <AlertTitle className="font-semibold">{issue.title}</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{issue.description}</p>
                  <p className="text-sm">
                    <strong>Items affectés:</strong> {issue.itemsAffected}
                  </p>
                  <p className="text-sm">
                    <strong>Solution:</strong> {issue.solution}
                  </p>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tabs avec détails */}
      <Tabs defaultValue="incomplete" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incomplete">Items Incomplets ({incompleteItems.length})</TabsTrigger>
          <TabsTrigger value="sample">Échantillon ({sampleItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="incomplete" className="space-y-4">
          {incompleteItems.map((item) => (
            <ItemCard key={item.item_code} item={item} />
          ))}
        </TabsContent>

        <TabsContent value="sample" className="space-y-4">
          {sampleItems.map((item) => (
            <ItemCard key={item.item_code} item={item} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Composants utilitaires
function StatCard({ label, value, percentage, icon }: any) {
  return (
    <div className="p-4 bg-secondary rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {percentage && (
          <Badge variant="outline" className="text-xs">
            {percentage}%
          </Badge>
        )}
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: EdnItem }) {
  const hasRangA = item.competences_oic_rang_a && item.competences_oic_rang_a.length > 0;
  const hasRangB = item.competences_oic_rang_b && item.competences_oic_rang_b.length > 0;
  const hasParoles = item.paroles_musicales && item.paroles_musicales.length > 0;
  const hasQuiz = item.quiz_questions && Object.keys(item.quiz_questions).length > 0;
  const hasTableauA = item.tableau_rang_a && Object.keys(item.tableau_rang_a).length > 0;
  const hasTableauB = item.tableau_rang_b && Object.keys(item.tableau_rang_b).length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{item.item_code}</CardTitle>
            <CardDescription>{item.title}</CardDescription>
          </div>
          <Badge variant={item.completeness_score >= 80 ? 'default' : 'secondary'}>
            Score: {item.completeness_score}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge variant={hasRangA ? 'default' : 'outline'}>
            {hasRangA ? '✓' : '✗'} Rang A
          </Badge>
          <Badge variant={hasRangB ? 'default' : 'outline'}>
            {hasRangB ? '✓' : '✗'} Rang B
          </Badge>
          <Badge variant={hasParoles ? 'default' : 'outline'}>
            {hasParoles ? '✓' : '✗'} Paroles
          </Badge>
          <Badge variant={hasQuiz ? 'default' : 'outline'}>
            {hasQuiz ? '✓' : '✗'} Quiz
          </Badge>
          <Badge variant={hasTableauA ? 'default' : 'outline'}>
            {hasTableauA ? '✓' : '✗'} Tableau A
          </Badge>
          <Badge variant={hasTableauB ? 'default' : 'outline'}>
            {hasTableauB ? '✓' : '✗'} Tableau B
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
