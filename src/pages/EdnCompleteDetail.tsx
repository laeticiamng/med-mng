import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Award, Users, Calendar, Tag, Music, Brain, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useEdnItemComplete } from '@/hooks/useEdnItemsComplete';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EdnCompleteDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, error } = useEdnItemComplete(slug!);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompletenessColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletenessText = (score?: number) => {
    if (!score) return 'Non évalué';
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Bon';
    return 'À améliorer';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link to="/edn-complete">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Item non trouvé'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec navigation */}
        <div className="mb-6">
          <Link to="/edn-complete">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
          </Link>
        </div>

        {/* Titre et informations principales */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {item.item_code}
                </Badge>
                {item.is_validated && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Validé
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
              {item.subtitle && (
                <p className="text-lg text-muted-foreground">{item.subtitle}</p>
              )}
            </div>
            
            <div className="flex flex-col items-start lg:items-end gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getCompletenessColor(item.completeness_score)}`}>
                  {item.completeness_score}%
                </span>
                <span className="text-muted-foreground">
                  {getCompletenessText(item.completeness_score)}
                </span>
              </div>
              <Progress 
                value={item.completeness_score || 0} 
                className="w-32"
              />
            </div>
          </div>

          {/* Métadonnées */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {item.specialite && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Spécialité</p>
                      <p className="font-medium">{item.specialite}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {item.domaine_medical && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Domaine</p>
                      <p className="font-medium">{item.domaine_medical}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Compétences</p>
                    <p className="font-medium">{item.competences_count_total || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mis à jour</p>
                    <p className="font-medium text-sm">
                      {formatDate(item.updated_at).split(' ')[0]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="competences" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="competences">Compétences</TabsTrigger>
                <TabsTrigger value="contenu">Contenu</TabsTrigger>
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
                <TabsTrigger value="scene">Scène</TabsTrigger>
              </TabsList>

              <TabsContent value="competences" className="space-y-6">
                {/* Compétences Rang A */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-500" />
                      Compétences Rang A
                      <Badge variant="secondary">{item.competences_count_rang_a || 0}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Compétences fondamentales à maîtriser
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {item.competences_oic_rang_a && Array.isArray(item.competences_oic_rang_a) ? (
                      <div className="space-y-4">
                        {item.competences_oic_rang_a.map((comp: any, idx: number) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{comp.intitule}</h4>
                              {comp.objectif_id && (
                                <Badge variant="outline">{comp.objectif_id}</Badge>
                              )}
                            </div>
                            {comp.description && (
                              <p className="text-sm text-muted-foreground">{comp.description}</p>
                            )}
                            {comp.rubrique && (
                              <Badge variant="secondary" className="mt-2">
                                {comp.rubrique}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Aucune compétence Rang A disponible</p>
                    )}
                  </CardContent>
                </Card>

                {/* Compétences Rang B */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-500" />
                      Compétences Rang B
                      <Badge variant="secondary">{item.competences_count_rang_b || 0}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Compétences avancées et spécialisées
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {item.competences_oic_rang_b && Array.isArray(item.competences_oic_rang_b) ? (
                      <div className="space-y-4">
                        {item.competences_oic_rang_b.map((comp: any, idx: number) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{comp.intitule}</h4>
                              {comp.objectif_id && (
                                <Badge variant="outline">{comp.objectif_id}</Badge>
                              )}
                            </div>
                            {comp.description && (
                              <p className="text-sm text-muted-foreground">{comp.description}</p>
                            )}
                            {comp.rubrique && (
                              <Badge variant="secondary" className="mt-2">
                                {comp.rubrique}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Aucune compétence Rang B disponible</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contenu" className="space-y-6">
                {/* Pitch d'introduction */}
                {item.pitch_intro && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Introduction</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{item.pitch_intro}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Tableaux Rang A et B */}
                {item.tableau_rang_a && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tableau Rang A</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                        {JSON.stringify(item.tableau_rang_a, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {item.tableau_rang_b && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tableau Rang B</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                        {JSON.stringify(item.tableau_rang_b, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="quiz">
                <Card>
                  <CardHeader>
                    <CardTitle>Questions de Quiz</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {item.quiz_questions ? (
                      <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                        {JSON.stringify(item.quiz_questions, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-muted-foreground">Aucune question de quiz disponible</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scene">
                <Card>
                  <CardHeader>
                    <CardTitle>Scène Immersive</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {item.scene_immersive ? (
                      <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                        {JSON.stringify(item.scene_immersive, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-muted-foreground">Aucune scène immersive disponible</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Paroles musicales */}
            {item.paroles_musicales && item.paroles_musicales.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-pink-500" />
                    Paroles Musicales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {item.paroles_musicales.map((parole, idx) => (
                      <div key={idx} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{parole}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mots-clés */}
            {item.mots_cles && item.mots_cles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Mots-clés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {item.mots_cles.map((keyword, idx) => (
                      <Badge key={idx} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags médicaux */}
            {item.tags_medicaux && item.tags_medicaux.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags Médicaux</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {item.tags_medicaux.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informations techniques */}
            <Card>
              <CardHeader>
                <CardTitle>Informations Techniques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Créé le</p>
                  <p className="text-sm font-medium">{formatDate(item.created_at)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Dernière modification</p>
                  <p className="text-sm font-medium">{formatDate(item.updated_at)}</p>
                </div>
                {item.validation_date && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Date de validation</p>
                      <p className="text-sm font-medium">{formatDate(item.validation_date)}</p>
                    </div>
                  </>
                )}
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                    {item.status || 'Actif'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}