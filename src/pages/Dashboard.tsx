// Main Dashboard Page - Complete implementation
import React from "react";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Music, 
  Stethoscope, 
  TrendingUp, 
  Clock, 
  Award, 
  Users, 
  Target,
  PlayCircle,
  HeadphonesIcon,
  Calendar,
  BarChart3,
  Star,
  ArrowRight
} from "lucide-react";
import { useNavAction } from "@/hooks/useNavAction";
import { analytics } from "@/lib/analytics";
import { t } from "@/lib/i18n/keys";

// Mock data - replace with actual API calls
const mockUserStats = {
  totalSongs: 24,
  totalListens: 156,
  totalStudyTime: 45, // hours
  currentStreak: 7, // days
  completedEcos: 12,
  completedEdn: 89,
  rank: "Étudiant Avancé",
  points: 2450
};

const mockRecentActivity = [
  { id: 1, type: "ecos", title: "Simulation Cardiologie", date: "2024-01-15", score: 85 },
  { id: 2, type: "music", title: "IC-290 - Épidémiologie", date: "2024-01-14", duration: 180 },
  { id: 3, type: "edn", title: "IC-331 - Arrêt cardio-circulatoire", date: "2024-01-14", progress: 100 },
  { id: 4, type: "ecos", title: "Cas Clinique Neurologie", date: "2024-01-13", score: 92 }
];

const mockRecommendations = [
  { 
    id: 1, 
    type: "edn", 
    title: "IC-360 - Pneumothorax", 
    reason: "Complément de votre dernière session", 
    priority: "high" 
  },
  { 
    id: 2, 
    type: "ecos", 
    title: "Simulation Pédiatrie", 
    reason: "Renforcement spécialité", 
    priority: "medium" 
  },
  { 
    id: 3, 
    type: "music", 
    title: "Révisions Cardiologie", 
    reason: "Basé sur vos préférences", 
    priority: "low" 
  }
];

export default function Dashboard() {
  const executeAction = useNavAction();

  React.useEffect(() => {
    analytics.track('page', 'dashboard_view');
  }, []);

  const handleQuickAction = async (action: string, target?: string) => {
    analytics.trackUserAction('quick_action', action);
    
    switch (action) {
      case 'create_song':
        await executeAction({ type: "route", to: "/med-mng/create" });
        break;
      case 'browse_edn':
        await executeAction({ type: "route", to: "/edn" });
        break;
      case 'start_ecos':
        await executeAction({ type: "route", to: "/ecos" });
        break;
      case 'view_library':
        await executeAction({ type: "route", to: "/med-mng/library" });
        break;
      default:
        if (target) {
          await executeAction({ type: "route", to: target });
        }
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }: any) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  const ActivityItem = ({ item }: { item: any }) => {
    const getIcon = () => {
      switch (item.type) {
        case 'ecos': return <Stethoscope className="h-4 w-4" />;
        case 'music': return <Music className="h-4 w-4" />;
        case 'edn': return <BookOpen className="h-4 w-4" />;
        default: return <BookOpen className="h-4 w-4" />;
      }
    };

    const getBadgeVariant = () => {
      if (item.score) return item.score >= 80 ? 'default' : 'secondary';
      if (item.progress) return item.progress === 100 ? 'default' : 'outline';
      return 'outline';
    };

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-full">
            {getIcon()}
          </div>
          <div>
            <p className="font-medium text-sm">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {item.score && (
            <Badge variant={getBadgeVariant()}>
              {item.score}%
            </Badge>
          )}
          {item.duration && (
            <Badge variant="outline">
              {Math.floor(item.duration / 60)}min
            </Badge>
          )}
          {item.progress && (
            <Badge variant={getBadgeVariant()}>
              {item.progress}%
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Tableau de bord"
      subtitle="Bienvenue sur votre espace d'apprentissage médical"
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleQuickAction('view_library')}
          >
            <HeadphonesIcon className="w-4 h-4 mr-2" />
            Ma Bibliothèque
          </Button>
          <Button 
            size="sm"
            onClick={() => handleQuickAction('create_song')}
          >
            <Music className="w-4 h-4 mr-2" />
            Créer une chanson
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Music}
            title="Chansons créées"
            value={mockUserStats.totalSongs}
            subtitle="Ce mois"
            color="purple"
          />
          <StatCard
            icon={PlayCircle}
            title="Écoutes totales"
            value={mockUserStats.totalListens}
            subtitle="Cette semaine"
            color="green"
          />
          <StatCard
            icon={Clock}
            title="Temps d'étude"
            value={`${mockUserStats.totalStudyTime}h`}
            subtitle="Ce mois"
            color="blue"
          />
          <StatCard
            icon={Target}
            title="Série actuelle"
            value={`${mockUserStats.currentStreak} jours`}
            subtitle="Objectif: 30 jours"
            color="orange"
          />
        </div>

        {/* User Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Progression générale
                </CardTitle>
                <CardDescription>
                  Rang actuel: {mockUserStats.rank} • {mockUserStats.points} points
                </CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Niveau 7
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>ECOS complétés</span>
                  <span>{mockUserStats.completedEcos}/50</span>
                </div>
                <Progress value={(mockUserStats.completedEcos / 50) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Items EDN étudiés</span>
                  <span>{mockUserStats.completedEdn}/360</span>
                </div>
                <Progress value={(mockUserStats.completedEdn / 360) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity">Activité récente</TabsTrigger>
            <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
            <TabsTrigger value="analytics">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Activité récente
                </CardTitle>
                <CardDescription>
                  Vos dernières sessions d'apprentissage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockRecentActivity.map((item) => (
                    <ActivityItem key={item.id} item={item} />
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleQuickAction('view_history')}
                  >
                    Voir tout l'historique
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockRecommendations.map((rec) => (
                <Card key={rec.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={
                          rec.priority === 'high' ? 'default' : 
                          rec.priority === 'medium' ? 'secondary' : 'outline'
                        }
                      >
                        {rec.priority === 'high' ? 'Priorité haute' : 
                         rec.priority === 'medium' ? 'Priorité moyenne' : 'Suggéré'}
                      </Badge>
                      {rec.type === 'edn' && <BookOpen className="h-4 w-4" />}
                      {rec.type === 'ecos' && <Stethoscope className="h-4 w-4" />}
                      {rec.type === 'music' && <Music className="h-4 w-4" />}
                    </div>
                    <CardTitle className="text-base">{rec.title}</CardTitle>
                    <CardDescription>{rec.reason}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => handleQuickAction(`start_${rec.type}`, `/${rec.type}`)}
                    >
                      Commencer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance ECOS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Score moyen</span>
                      <span className="font-semibold">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Meilleur score</span>
                      <span className="font-semibold">95%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Temps moyen</span>
                      <span className="font-semibold">12min</span>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tendances d'apprentissage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sessions cette semaine</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Spécialité favorite</span>
                      <span className="font-semibold">Cardiologie</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Heure préférée</span>
                      <span className="font-semibold">20h-22h</span>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        Analytics complètes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accédez rapidement à vos fonctionnalités favorites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => handleQuickAction('create_song')}
              >
                <Music className="h-6 w-6" />
                <span className="text-sm">Créer une chanson</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => handleQuickAction('start_ecos')}
              >
                <Stethoscope className="h-6 w-6" />
                <span className="text-sm">Simulation ECOS</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => handleQuickAction('browse_edn')}
              >
                <BookOpen className="h-6 w-6" />
                <span className="text-sm">Items EDN</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => handleQuickAction('view_library')}
              >
                <HeadphonesIcon className="h-6 w-6" />
                <span className="text-sm">Ma Bibliothèque</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}