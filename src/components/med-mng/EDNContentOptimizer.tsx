import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, Target, Brain, Clock, Trophy, Filter, Download } from 'lucide-react';
import { useAllEdnItems } from '@/hooks/useAllEdnItems';
import { useEdnItemLyrics } from '@/hooks/useEdnItemLyrics';

export const EDNContentOptimizer = () => {
  const { items, loading, error } = useAllEdnItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { lyrics } = useEdnItemLyrics(selectedItem);
  
  const [studyStats, setStudyStats] = useState({
    totalItems: 367,
    completedItems: 289,
    studyStreak: 15,
    averageScore: 87.5
  });

  const specialties = [
    'all', 'Cardiologie', 'Neurologie', 'Gastroentérologie', 
    'Pneumologie', 'Endocrinologie', 'Psychiatrie', 'Urgences'
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            item.subtitle?.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const progress = (studyStats.completedItems / studyStats.totalItems) * 100;

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Items EDN</p>
                <p className="text-2xl font-bold">{studyStats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Complétés</p>
                <p className="text-2xl font-bold">{studyStats.completedItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{studyStats.studyStreak}j</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Score moyen</p>
                <p className="text-2xl font-bold">{studyStats.averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de progression globale */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression globale EDN</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {studyStats.completedItems} sur {studyStats.totalItems} items maîtrisés
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Interface principale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Optimiseur de Contenu EDN
          </CardTitle>
          <CardDescription>
            Interface avancée pour maîtriser les 367 items EDN avec IA personnalisée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="items" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="items">Items EDN</TabsTrigger>
              <TabsTrigger value="study">Plan d'Étude</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
            
            <TabsContent value="items" className="space-y-4">
              {/* Filtres et recherche */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un item EDN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty === 'all' ? 'Toutes spécialités' : specialty}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
              </div>

              {/* Liste des items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="col-span-full text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Chargement des items EDN...</p>
                  </div>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <Card key={item.item_code} className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedItem(item.item_code)}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <Badge variant="outline">{item.item_code}</Badge>
                            <Badge variant="secondary">Rang A/B</Badge>
                          </div>
                          <h3 className="font-medium text-sm leading-tight">{item.title}</h3>
                          {item.subtitle && (
                            <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                          )}
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="text-xs">
                              Étudier
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              Quiz
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">Aucun item trouvé</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="study" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plan d'Étude Personnalisé</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Objectif quotidien</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">5 items</Button>
                        <Button size="sm" variant="default">10 items</Button>
                        <Button size="sm" variant="outline">15 items</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Spécialités prioritaires</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge>Cardiologie</Badge>
                        <Badge>Neurologie</Badge>
                        <Badge>Urgences</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Révisions Intelligentes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm">Items à réviser aujourd'hui</p>
                      <p className="text-2xl font-bold text-orange-500">23</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">Items maîtrisés cette semaine</p>
                      <p className="text-2xl font-bold text-green-500">47</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance par Spécialité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['Cardiologie', 'Neurologie', 'Gastroentérologie', 'Pneumologie'].map((specialty, index) => (
                        <div key={specialty} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{specialty}</span>
                            <span>{85 + index * 3}%</span>
                          </div>
                          <Progress value={85 + index * 3} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Temps d'Étude</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Cette semaine</p>
                        <p className="text-2xl font-bold">12h 30min</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Moyenne quotidienne</p>
                        <p className="text-xl font-semibold">1h 47min</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export de Données</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter Progression (PDF)
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter Analytics (Excel)
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Plan d'Étude Personnalisé
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Synchronisation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm">Dernière sync: Il y a 2 minutes</p>
                      <Button className="w-full">Synchroniser maintenant</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};