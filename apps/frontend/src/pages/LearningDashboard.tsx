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
              <Card>
                <CardHeader>
                  <CardTitle>Objectifs d'Apprentissage</CardTitle>
                  <CardDescription>
                    Définissez et suivez vos objectifs d'étude personnalisés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Fonctionnalité en cours de développement</h3>
                    <p className="text-muted-foreground">
                      La gestion des objectifs sera bientôt disponible pour vous aider à structurer votre apprentissage.
                    </p>
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