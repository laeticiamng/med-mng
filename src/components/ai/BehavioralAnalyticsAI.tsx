import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  Activity, 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Eye, 
  MousePointer,
  Zap,
  BookOpen,
  Headphones,
  Coffee,
  Moon
} from 'lucide-react';
import { toast } from 'sonner';

interface BehaviorPattern {
  id: string;
  type: 'study' | 'break' | 'music' | 'navigation' | 'interaction';
  timestamp: Date;
  duration: number;
  context: string;
  efficiency: number;
  focus_score: number;
}

interface LearningInsight {
  category: 'productivity' | 'attention' | 'retention' | 'wellbeing';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  confidence: number;
}

interface UserMetrics {
  studyEfficiency: number;
  attentionSpan: number;
  retentionRate: number;
  stressLevel: number;
  engagementScore: number;
  peakHours: string[];
}

const BehavioralAnalyticsAI: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('efficiency');
  const [behaviorData, setBehaviorData] = useState<BehaviorPattern[]>([]);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    studyEfficiency: 78,
    attentionSpan: 85,
    retentionRate: 72,
    stressLevel: 35,
    engagementScore: 89,
    peakHours: ['09:00', '14:00', '20:00']
  });

  // Données simulées pour les graphiques
  const weeklyData = [
    { day: 'Lun', efficiency: 75, attention: 80, retention: 70, stress: 40 },
    { day: 'Mar', efficiency: 82, attention: 85, retention: 78, stress: 35 },
    { day: 'Mer', efficiency: 68, attention: 70, retention: 65, stress: 55 },
    { day: 'Jeu', efficiency: 90, attention: 92, retention: 85, stress: 25 },
    { day: 'Ven', efficiency: 85, attention: 88, retention: 82, stress: 30 },
    { day: 'Sam', efficiency: 70, attention: 75, retention: 68, stress: 45 },
    { day: 'Dim', efficiency: 60, attention: 65, retention: 58, stress: 50 }
  ];

  const hourlyPatterns = [
    { hour: '6h', focus: 30, activity: 10 },
    { hour: '8h', focus: 70, activity: 60 },
    { hour: '10h', focus: 90, activity: 85 },
    { hour: '12h', focus: 65, activity: 70 },
    { hour: '14h', focus: 85, activity: 90 },
    { hour: '16h', focus: 75, activity: 80 },
    { hour: '18h', focus: 50, activity: 60 },
    { hour: '20h', focus: 80, activity: 75 },
    { hour: '22h', focus: 40, activity: 30 }
  ];

  const activityDistribution = [
    { name: 'Étude Active', value: 45, color: '#8884d8' },
    { name: 'Lecture', value: 25, color: '#82ca9d' },
    { name: 'Écoute Musicale', value: 15, color: '#ffc658' },
    { name: 'Pauses', value: 10, color: '#ff7300' },
    { name: 'Navigation', value: 5, color: '#0088fe' }
  ];

  useEffect(() => {
    generateInsights();
    generateBehaviorData();
  }, [timeRange]);

  const generateInsights = () => {
    const newInsights: LearningInsight[] = [
      {
        category: 'productivity',
        title: 'Pic de Performance Matinal',
        description: 'Votre efficacité est 34% plus élevée entre 9h-11h',
        impact: 'high',
        recommendation: 'Planifiez vos sessions les plus importantes le matin',
        confidence: 92
      },
      {
        category: 'attention',
        title: 'Durée d\'Attention Optimale',
        description: 'Sessions de 45min avec 15min de pause montrent +28% de rétention',
        impact: 'high',
        recommendation: 'Adoptez la technique Pomodoro adaptée',
        confidence: 87
      },
      {
        category: 'wellbeing',
        title: 'Impact de la Musique Binaurale',
        description: 'Amélioration de 23% de la concentration avec sons binauraux',
        impact: 'medium',
        recommendation: 'Intégrez la musique focus dans vos sessions',
        confidence: 79
      },
      {
        category: 'retention',
        title: 'Pattern de Révision Optimal',
        description: 'Révisions espacées augmentent la rétention de 41%',
        impact: 'high',
        recommendation: 'Utilisez l\'algorithme de répétition espacée',
        confidence: 94
      }
    ];
    
    setInsights(newInsights);
  };

  const generateBehaviorData = () => {
    // Simulation de données comportementales
    const patterns: BehaviorPattern[] = Array.from({ length: 50 }, (_, i) => ({
      id: i.toString(),
      type: ['study', 'break', 'music', 'navigation', 'interaction'][Math.floor(Math.random() * 5)] as any,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      duration: Math.random() * 120 + 15,
      context: 'medical_study',
      efficiency: Math.random() * 40 + 60,
      focus_score: Math.random() * 30 + 70
    }));
    
    setBehaviorData(patterns);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return <Zap className="h-4 w-4" />;
      case 'attention': return <Eye className="h-4 w-4" />;
      case 'retention': return <Brain className="h-4 w-4" />;
      case 'wellbeing': return <Activity className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-50 to-cyan-50 border-indigo-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100">
              <Activity className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-indigo-900">Analyse Comportementale IA</CardTitle>
              <CardDescription className="text-indigo-700">
                Tracking avancé et métriques d'apprentissage personnalisées
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">24h</SelectItem>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">3 mois</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="efficiency">Efficacité</SelectItem>
              <SelectItem value="attention">Attention</SelectItem>
              <SelectItem value="retention">Rétention</SelectItem>
              <SelectItem value="stress">Stress</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={generateInsights} variant="outline">
          <Brain className="h-4 w-4 mr-2" />
          Actualiser Analyse
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights IA
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommandations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{userMetrics.studyEfficiency}%</div>
                    <div className="text-xs text-muted-foreground">Efficacité</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{userMetrics.attentionSpan}%</div>
                    <div className="text-xs text-muted-foreground">Attention</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold">{userMetrics.retentionRate}%</div>
                    <div className="text-xs text-muted-foreground">Rétention</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold">{userMetrics.stressLevel}%</div>
                    <div className="text-xs text-muted-foreground">Stress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold">{userMetrics.engagementScore}%</div>
                    <div className="text-xs text-muted-foreground">Engagement</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Évolution Hebdomadaire</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey={selectedMetric} 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Répartition des Activités</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={activityDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {activityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patterns d'Activité Horaire</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="focus" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="activity" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Heures Optimales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userMetrics.peakHours.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="text-sm font-medium">{hour}</span>
                      <Badge variant="secondary">Peak</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Sessions Préférées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Durée moyenne</span>
                    <span className="font-medium">47 min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pauses optimales</span>
                    <span className="font-medium">12 min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Efficacité max</span>
                    <span className="font-medium">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Headphones className="h-4 w-4" />
                  Préférences Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Musique focus</span>
                    <span className="font-medium">73%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sons nature</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Silence</span>
                    <span className="font-medium">28%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-gray-100">
                      {getCategoryIcon(insight.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {insight.confidence}% confiance
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {insight.description}
                      </p>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-800">
                          💡 Recommandation IA
                        </div>
                        <div className="text-sm text-blue-700">
                          {insight.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Optimisations Immédiates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 flex items-center gap-2">
                    <Coffee className="h-4 w-4" />
                    Pause Optimisée
                  </h4>
                  <p className="text-sm text-green-700">
                    Prendre une pause de 15min après 45min d'étude
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horaire Optimal
                  </h4>
                  <p className="text-sm text-blue-700">
                    Planifier les sessions importantes entre 9h-11h
                  </p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 flex items-center gap-2">
                    <Headphones className="h-4 w-4" />
                    Audio Focus
                  </h4>
                  <p className="text-sm text-purple-700">
                    Utiliser des sons binauraux 40Hz pour la concentration
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Améliorations Long Terme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Sommeil & Performance
                  </h4>
                  <p className="text-sm text-orange-700">
                    7-8h de sommeil améliore la rétention de 34%
                  </p>
                </div>
                
                <div className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-800 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Exercice Physique
                  </h4>
                  <p className="text-sm text-red-700">
                    30min d'exercice quotidien booste la concentration
                  </p>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-800 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Révision Espacée
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Système de répétition optimisé par IA
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BehavioralAnalyticsAI;