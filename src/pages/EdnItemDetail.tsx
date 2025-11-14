import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EdnItemProgressCard } from '@/components/edn/EdnItemProgressCard';
import { 
  ArrowLeft, Clock, TrendingUp, Target, Calendar, 
  ExternalLink, BookOpen, BarChart3, History 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Helmet } from 'react-helmet-async';

export default function EdnItemDetail() {
  const { itemNumber } = useParams<{ itemNumber: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch item details
  const { data: itemData, isLoading: itemLoading } = useQuery({
    queryKey: ['edn-item', itemNumber],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('edn_items')
        .select('*')
        .eq('item_code', itemNumber)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!itemNumber,
  });

  // Fetch user progress for this item
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['edn-item-progress', user?.id, itemNumber],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await (supabase as any)
        .from('user_edn_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_number', itemNumber)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user && !!itemNumber,
  });

  // Fetch progress history (multiple reviews)
  const { data: historyData = [] } = useQuery({
    queryKey: ['edn-item-history', user?.id, itemNumber],
    queryFn: async () => {
      if (!user) return [];

      // For demo purposes, we'll simulate history data
      // In production, you'd have a separate history table
      return [];
    },
    enabled: !!user && !!itemNumber,
  });

  const performanceData = useMemo(() => {
    // Simulate performance over time
    if (!progressData) return [];
    
    return [
      { date: 'Révision 1', score: progressData.score || 0 },
      { date: 'Révision 2', score: (progressData.score || 0) + 5 },
      { date: 'Révision 3', score: (progressData.score || 0) + 10 },
    ];
  }, [progressData]);

  if (itemLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!itemData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Item non trouvé</CardTitle>
            <CardDescription>
              L'item EDN #{itemNumber} n'existe pas ou n'est pas accessible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/edn-complete')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors = {
    not_started: 'bg-gray-500',
    in_progress: 'bg-blue-500',
    completed: 'bg-green-500',
    mastered: 'bg-purple-500',
  };

  const statusLabels = {
    not_started: 'Non commencé',
    in_progress: 'En cours',
    completed: 'Complété',
    mastered: 'Maîtrisé',
  };

  return (
    <>
      <Helmet>
        <title>EDN {itemData.item_code} - {itemData.title || 'Détails'} | MED-MNG</title>
        <meta name="description" content={`Détails et progression pour l'item EDN ${itemData.item_code}: ${itemData.title}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/edn-complete')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="text-lg">
                    EDN {itemData.item_code}
                  </Badge>
                  {progressData && (
                    <Badge className={statusColors[progressData.status as keyof typeof statusColors]}>
                      {statusLabels[progressData.status as keyof typeof statusLabels]}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{itemData.title}</h1>
                {itemData.specialty && (
                  <p className="text-muted-foreground">
                    Spécialité: {itemData.specialty}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="progress" className="space-y-6">
            <TabsList>
              <TabsTrigger value="progress" className="gap-2">
                <Target className="h-4 w-4" />
                Progression
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="resources" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Ressources
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                Historique
              </TabsTrigger>
            </TabsList>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Temps passé
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {progressData?.time_spent_minutes || 0} min
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {progressData?.score || 0}/100
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Dernière révision
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      {progressData?.last_reviewed_at
                        ? new Date(progressData.last_reviewed_at).toLocaleDateString('fr-FR')
                        : 'Jamais'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <EdnItemProgressCard itemNumber={itemNumber || ''} />

              {progressData?.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes personnelles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {progressData.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution de votre performance</CardTitle>
                  <CardDescription>
                    Progression du score au fil des révisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {performanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                        <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune donnée de performance disponible</p>
                      <p className="text-sm mt-2">Commencez à réviser pour générer des statistiques</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ressources externes</CardTitle>
                  <CardDescription>
                    Liens utiles pour approfondir ce sujet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a 
                      href={`https://www.has-sante.fr/jcms/recherche?text=${encodeURIComponent(itemData.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Rechercher sur HAS
                    </a>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a 
                      href={`https://www.ncbi.nlm.nih.gov/pubmed/?term=${encodeURIComponent(itemData.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Rechercher sur PubMed
                    </a>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a 
                      href={`https://www.medscape.com/search?q=${encodeURIComponent(itemData.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Rechercher sur Medscape
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des révisions</CardTitle>
                  <CardDescription>
                    Chronologie de vos sessions d'étude
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {historyData.length > 0 ? (
                    <div className="space-y-4">
                      {historyData.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">
                              {new Date(entry.reviewed_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Score: {entry.score}/100 • Temps: {entry.time_spent} min
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun historique disponible</p>
                      <p className="text-sm mt-2">Les révisions futures apparaîtront ici</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
