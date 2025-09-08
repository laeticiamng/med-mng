import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Brain, 
  Activity, 
  Users, 
  TrendingUp, 
  FileText, 
  Calendar,
  Star,
  Music,
  BookOpen,
  Target,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MedicalData {
  id: string;
  type: 'profile' | 'composition' | 'session' | 'progress';
  title: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  progress: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface DataStats {
  totalProfiles: number;
  activeCompositions: number;
  completedSessions: number;
  progressEntries: number;
  averageProgress: number;
}

export const MedicalDataManager: React.FC = () => {
  const [data, setData] = useState<MedicalData[]>([]);
  const [stats, setStats] = useState<DataStats>({
    totalProfiles: 0,
    activeCompositions: 0,
    completedSessions: 0,
    progressEntries: 0,
    averageProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadMedicalData();
  }, []);

  const loadMedicalData = async () => {
    try {
      setLoading(true);
      
      // Simuler des données médicales pour démonstration
      const mockData: MedicalData[] = [
        {
          id: '1',
          type: 'profile',
          title: 'Profil Patient - Cardiologie',
          description: 'Suivi cardiologique avec données ECG',
          status: 'active',
          progress: 85,
          metadata: { specialty: 'cardiologie', lastVisit: '2024-01-15' },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        },
        {
          id: '2',
          type: 'composition',
          title: 'Composition Thérapeutique - Neurologie',
          description: 'Mélodie pour mémorisation des pathologies neurologiques',
          status: 'completed',
          progress: 100,
          metadata: { genre: 'éducatif', duration: 180 },
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-20T00:00:00Z'
        },
        {
          id: '3',
          type: 'session',
          title: 'Session Thérapie - Gestion Stress',
          description: 'Séance de musicothérapie pour réduction du stress',
          status: 'completed',
          progress: 95,
          metadata: { duration: 45, effectiveness: 'high' },
          created_at: '2024-01-12T00:00:00Z',
          updated_at: '2024-01-12T00:00:00Z'
        },
        {
          id: '4',
          type: 'progress',
          title: 'Progrès Apprentissage - EDN Items',
          description: 'Évolution sur les 367 items EDN',
          status: 'active',
          progress: 72,
          metadata: { itemsCompleted: 264, totalItems: 367 },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-20T00:00:00Z'
        }
      ];

      setData(mockData);
      
      // Calculer les statistiques
      const newStats: DataStats = {
        totalProfiles: mockData.filter(d => d.type === 'profile').length,
        activeCompositions: mockData.filter(d => d.type === 'composition' && d.status === 'active').length,
        completedSessions: mockData.filter(d => d.type === 'session' && d.status === 'completed').length,
        progressEntries: mockData.filter(d => d.type === 'progress').length,
        averageProgress: mockData.reduce((acc, d) => acc + d.progress, 0) / mockData.length
      };
      
      setStats(newStats);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données médicales:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données médicales",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      completed: 'secondary',
      pending: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status === 'active' ? 'Actif' : status === 'completed' ? 'Terminé' : 'En attente'}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'profile': return <Heart className="w-4 h-4" />;
      case 'composition': return <Music className="w-4 h-4" />;
      case 'session': return <Brain className="w-4 h-4" />;
      case 'progress': return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestionnaire de Données Médicales</h1>
          <p className="text-muted-foreground">
            Suivi centralisé des données patients et sessions thérapeutiques
          </p>
        </div>
        <Button onClick={loadMedicalData} variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques Générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-pink-500" />
              <div>
                <p className="text-sm text-muted-foreground">Profils Patients</p>
                <p className="text-2xl font-bold">{stats.totalProfiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Music className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Compositions Actives</p>
                <p className="text-2xl font-bold">{stats.activeCompositions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Sessions Terminées</p>
                <p className="text-2xl font-bold">{stats.completedSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Progrès Moyen</p>
                <p className="text-2xl font-bold">{Math.round(stats.averageProgress)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets de Données */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="profiles">Profils</TabsTrigger>
          <TabsTrigger value="compositions">Compositions</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(item.type)}
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                  <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                    <span>Créé: {new Date(item.created_at).toLocaleDateString()}</span>
                    <span>MAJ: {new Date(item.updated_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Profils Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.filter(d => d.type === 'profile').map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{profile.title}</h3>
                      <p className="text-sm text-muted-foreground">{profile.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={profile.progress} className="w-20 h-2" />
                      <span className="text-sm">{profile.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compositions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Music className="w-5 h-5 mr-2" />
                Compositions Thérapeutiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.filter(d => d.type === 'composition').map((composition) => (
                  <div key={composition.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{composition.title}</h3>
                      <p className="text-sm text-muted-foreground">{composition.description}</p>
                      {composition.metadata.duration && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Durée: {composition.metadata.duration}s
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(composition.status)}
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Sessions Thérapeutiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.filter(d => d.type === 'session').map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{session.title}</h3>
                      <p className="text-sm text-muted-foreground">{session.description}</p>
                      {session.metadata.effectiveness && (
                        <Badge variant="outline" className="mt-2">
                          Efficacité: {session.metadata.effectiveness}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={session.progress} className="w-20 h-2" />
                      <span className="text-sm">{session.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};