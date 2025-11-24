import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LearningAnalytics } from '@/components/analytics/LearningAnalytics';
import { SmartRecommendations } from '@/components/recommendations/SmartRecommendations';
import { BarChart3, Target, Lightbulb, Settings } from 'lucide-react';

export default function LearningDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Tableau de Bord d'Apprentissage
          </h1>
          <p className="text-muted-foreground">
            Suivez votre progression, analysez vos performances et découvrez des recommandations personnalisées
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommandations
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objectifs
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="analytics" className="space-y-6">
              <LearningAnalytics />
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <SmartRecommendations />
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              {/* Current Goals */}
              <Card>
                <CardHeader>
                  <CardTitle>Objectifs Actuels</CardTitle>
                  <CardDescription>
                    Suivez vos objectifs d'apprentissage en cours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Goal 1 */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <Target className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Compléter 50 items EDN par semaine</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Progression hebdomadaire pour améliorer vos connaissances
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-blue-600">68%</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">34 / 50 items complétés</span>
                        <span className="text-muted-foreground">3 jours restants</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Goal 2 */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                          <BarChart3 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Atteindre 80% de réussite moyenne</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Objectif de performance sur tous les items
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">95%</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">76% de réussite actuelle</span>
                        <span className="text-green-600 font-medium">Presque atteint!</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Goal 3 */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <Lightbulb className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Réviser les items rang A</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Focus sur les items les plus importants pour l'examen
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-purple-600">42%</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">147 / 350 items rang A révisés</span>
                        <span className="text-muted-foreground">Objectif à long terme</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Objectifs actifs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Target className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Objectifs atteints</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                        <BarChart3 className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">68%</div>
                        <p className="text-xs text-muted-foreground">Taux de réussite</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Create New Goal */}
              <Card>
                <CardHeader>
                  <CardTitle>Créer un Nouvel Objectif</CardTitle>
                  <CardDescription>
                    Définissez un objectif personnalisé pour structurer votre apprentissage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Ajouter un nouvel objectif</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Définissez vos propres objectifs d'apprentissage pour rester motivé
                    </p>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                      Créer un objectif
                    </button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres d'Apprentissage</CardTitle>
                  <CardDescription>
                    Personnalisez votre expérience d'apprentissage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Notifications d'étude</h4>
                        <p className="text-sm text-muted-foreground">
                          Recevoir des rappels pour vos sessions d'étude
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="h-4 w-4 text-primary"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Recommandations automatiques</h4>
                        <p className="text-sm text-muted-foreground">
                          Activer les suggestions d'items basées sur vos performances
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="h-4 w-4 text-primary"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Analytics détaillées</h4>
                        <p className="text-sm text-muted-foreground">
                          Collecter des données détaillées sur votre progression
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="h-4 w-4 text-primary"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Mode adaptatif</h4>
                        <p className="text-sm text-muted-foreground">
                          Ajuster automatiquement la difficulté selon vos performances
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="h-4 w-4 text-primary"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}