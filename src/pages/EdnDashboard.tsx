import React, { useState, useEffect } from 'react';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Search, 
  Target, 
  TrendingUp, 
  Clock, 
  Star,
  Filter,
  BarChart3,
  CheckCircle2,
  PlayCircle,
  Brain,
  Stethoscope,
  Award,
  Calendar,
  ArrowRight,
  Eye,
  Music
} from 'lucide-react';
import { useNavAction } from '@/hooks/useNavAction';

// Mock data pour l'EDN
const mockEdnStats = {
  totalItems: 360,
  studiedItems: 243,
  completedItems: 189,
  averageScore: 87,
  studyStreak: 12,
  timeSpent: 156, // heures
  favoriteSpecialties: ['Cardiologie', 'Pneumologie', 'Neurologie'],
  weeklyProgress: 15,
  monthlyGoal: 50
};

const mockRecentItems = [
  { 
    id: 'IC-331', 
    title: 'Arrêt cardio-circulatoire', 
    specialty: 'Cardiologie',
    status: 'completed', 
    score: 92,
    studiedAt: '2024-01-15',
    difficulty: 'high',
    hasMusic: true,
    studyTime: 45
  },
  { 
    id: 'IC-290', 
    title: 'Épidémiologie descriptive', 
    specialty: 'Santé publique',
    status: 'in-progress', 
    progress: 65,
    studiedAt: '2024-01-14',
    difficulty: 'medium',
    hasMusic: false,
    studyTime: 32
  },
  { 
    id: 'IC-155', 
    title: 'Pneumothorax', 
    specialty: 'Pneumologie',
    status: 'studied', 
    score: 88,
    studiedAt: '2024-01-13',
    difficulty: 'medium',
    hasMusic: true,
    studyTime: 28
  }
];

const mockRecommendations = [
  {
    id: 'IC-360',
    title: 'Embolie pulmonaire',
    specialty: 'Pneumologie',
    reason: 'Complément de votre étude sur le pneumothorax',
    priority: 'high',
    estimatedTime: 35,
    difficulty: 'high'
  },
  {
    id: 'IC-201',
    title: 'Hypertension artérielle',
    specialty: 'Cardiologie',
    reason: 'Renforcement de vos connaissances en cardiologie',
    priority: 'medium',
    estimatedTime: 40,
    difficulty: 'medium'
  }
];

export default function EdnDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const executeAction = useNavAction();

  const handleItemAction = async (action: string, itemId?: string) => {
    switch (action) {
      case 'study_item':
        if (itemId) {
          await executeAction({ type: "route", to: `/edn/${itemId}` });
        }
        break;
      case 'immersive_mode':
        if (itemId) {
          await executeAction({ type: "route", to: `/edn/${itemId}/immersive` });
        }
        break;
      case 'browse_all':
        await executeAction({ type: "route", to: "/edn" });
        break;
      case 'create_music':
        await executeAction({ type: "route", to: "/med-mng/create" });
        break;
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, progress, color = "primary" }: any) => (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>}
        {progress !== undefined && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{progress}% complété</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ItemCard = ({ item }: { item: any }) => {
    const getStatusBadge = () => {
      switch (item.status) {
        case 'completed':
          return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Terminé</Badge>;
        case 'in-progress':
          return <Badge variant="secondary">En cours</Badge>;
        default:
          return <Badge variant="outline">Étudié</Badge>;
      }
    };

    const getDifficultyColor = () => {
      switch (item.difficulty) {
        case 'high': return 'text-red-600';
        case 'medium': return 'text-yellow-600';
        default: return 'text-green-600';
      }
    };

    return (
      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-1">
              <h4 className="font-semibold text-base text-foreground">{item.title}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{item.id}</span>
                <span>•</span>
                <span>{item.specialty}</span>
                <span>•</span>
                <span className={getDifficultyColor()}>
                  {item.difficulty === 'high' ? 'Difficile' : item.difficulty === 'medium' ? 'Moyen' : 'Facile'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.hasMusic && (
                <Badge variant="outline" className="text-purple-600">
                  <Music className="w-3 h-3 mr-1" />
                  Chanson
                </Badge>
              )}
              {getStatusBadge()}
            </div>
          </div>

          {item.progress !== undefined && (
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Progression</span>
                <span>{item.progress}%</span>
              </div>
              <Progress value={item.progress} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.studyTime}min
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(item.studiedAt).toLocaleDateString('fr-FR')}
              </span>
              {item.score && (
                <span className="flex items-center gap-1 text-green-600">
                  <Star className="w-3 h-3" />
                  {item.score}%
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleItemAction('study_item', item.id)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Étudier
              </Button>
              <Button 
                size="sm"
                onClick={() => handleItemAction('immersive_mode', item.id)}
              >
                <PlayCircle className="w-4 h-4 mr-1" />
                Mode immersif
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <ConsistentBackground variant="primary">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Tableau de bord EDN"
          subtitle="Suivez votre progression dans les 360 items EDN"
          icon={BookOpen}
          actions={
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={() => handleItemAction('create_music')}
              >
                <Music className="w-4 h-4 mr-2" />
                Créer une chanson
              </Button>
              <Button 
                onClick={() => handleItemAction('browse_all')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Parcourir tout
              </Button>
            </div>
          }
        />

        <div className="space-y-8">
          {/* Statistics Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={BookOpen}
              title="Items étudiés"
              value={mockEdnStats.studiedItems}
              subtitle={`Sur ${mockEdnStats.totalItems} items`}
              progress={(mockEdnStats.studiedItems / mockEdnStats.totalItems) * 100}
            />
            <StatCard
              icon={CheckCircle2}
              title="Items maîtrisés"
              value={mockEdnStats.completedItems}
              subtitle="Score ≥ 80%"
              progress={(mockEdnStats.completedItems / mockEdnStats.studiedItems) * 100}
              color="green-600"
            />
            <StatCard
              icon={Target}
              title="Score moyen"
              value={`${mockEdnStats.averageScore}%`}
              subtitle="Toutes spécialités confondues"
              color="blue-600"
            />
            <StatCard
              icon={TrendingUp}
              title="Série d'étude"
              value={`${mockEdnStats.studyStreak} jours`}
              subtitle="Objectif: 30 jours"
              color="orange-600"
            />
          </div>

          {/* Progress Goal */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Objectif mensuel
                  </CardTitle>
                  <CardDescription>
                    Progresser sur {mockEdnStats.monthlyGoal} nouveaux items ce mois
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {mockEdnStats.weeklyProgress}/{mockEdnStats.monthlyGoal}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress 
                  value={(mockEdnStats.weeklyProgress / mockEdnStats.monthlyGoal) * 100} 
                  className="h-3"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progression: {Math.round((mockEdnStats.weeklyProgress / mockEdnStats.monthlyGoal) * 100)}%</span>
                  <span>{mockEdnStats.monthlyGoal - mockEdnStats.weeklyProgress} items restants</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs defaultValue="recent" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <TabsList className="grid w-full sm:w-auto grid-cols-3">
                <TabsTrigger value="recent">Récents</TabsTrigger>
                <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher un item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="recent" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Items récemment étudiés
                  </CardTitle>
                  <CardDescription>
                    Continuez là où vous vous êtes arrêté
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecentItems.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {mockRecommendations.map((rec) => (
                  <Card key={rec.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <Badge 
                            variant={rec.priority === 'high' ? 'default' : 'secondary'}
                            className="w-fit"
                          >
                            {rec.priority === 'high' ? 'Priorité haute' : 'Recommandé'}
                          </Badge>
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                          <CardDescription className="text-sm font-medium text-primary">
                            {rec.id} • {rec.specialty}
                          </CardDescription>
                        </div>
                        <Brain className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {rec.reason}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ~{rec.estimatedTime}min
                          </span>
                          <span className={
                            rec.difficulty === 'high' ? 'text-red-600' : 
                            rec.difficulty === 'medium' ? 'text-yellow-600' : 'text-green-600'
                          }>
                            {rec.difficulty === 'high' ? 'Difficile' : rec.difficulty === 'medium' ? 'Moyen' : 'Facile'}
                          </span>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleItemAction('study_item', rec.id)}
                        >
                          Commencer
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Spécialités préférées
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockEdnStats.favoriteSpecialties.map((specialty, index) => (
                        <div key={specialty} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{specialty}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${100 - (index * 20)}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {100 - (index * 20)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Temps d'étude total</span>
                        <span className="font-semibold">{mockEdnStats.timeSpent}h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Moyenne par item</span>
                        <span className="font-semibold">38min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Items cette semaine</span>
                        <span className="font-semibold">{mockEdnStats.weeklyProgress}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <Button variant="outline" size="sm" className="w-full">
                          Voir analytics détaillées
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ConsistentBackground>
  );
}