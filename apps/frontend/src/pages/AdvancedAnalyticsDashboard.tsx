import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Activity,
  AlertCircle,
  Loader,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Sample data for charts
const engagementData = [
  { date: '01 Nov', views: 400, likes: 240, comments: 120 },
  { date: '02 Nov', views: 500, likes: 300, comments: 150 },
  { date: '03 Nov', views: 600, likes: 360, comments: 180 },
  { date: '04 Nov', views: 700, likes: 420, comments: 200 },
  { date: '05 Nov', views: 800, likes: 480, comments: 240 },
  { date: '06 Nov', views: 900, likes: 540, comments: 270 },
  { date: '07 Nov', views: 950, likes: 570, comments: 300 },
]

const contentTypeData = [
  { name: 'Posts', value: 45, color: '#3b82f6' },
  { name: 'Fiches', value: 30, color: '#8b5cf6' },
  { name: 'Collections', value: 25, color: '#10b981' },
]

const topPosts = [
  { title: 'Getting Started with React', views: 2400, likes: 1200, comments: 400 },
  { title: 'Advanced TypeScript Patterns', views: 1900, likes: 950, comments: 320 },
  { title: 'Database Design Best Practices', views: 1700, likes: 850, comments: 280 },
  { title: 'API Design Guide', views: 1500, likes: 750, comments: 240 },
  { title: 'Security Tips', views: 1200, likes: 600, comments: 200 },
]

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981']

export default function AdvancedAnalyticsDashboard() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentification requise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Vous devez être connecté pour accéder au tableau de bord analytique.
            </p>
            <Link to={ROUTE_PATHS.medMngLogin}>
              <Button className="w-full">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Tableau de Bord Analytique Avancé | Med-Mng</title>
        <meta name="description" content="Analyser vos données d'engagement et de contenu" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="mb-8 flex items-center justify-between" role="banner">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2" id="analytics-title">
                Tableau de Bord Analytique Avancé
              </h1>
              <p className="text-lg text-gray-600" id="analytics-description">
                Analysez vos données d'engagement et de contenu
              </p>
            </div>

            <Button className="gap-2" aria-label="Exporter le rapport d'analytique au format PDF">
              <Download className="w-4 h-4" aria-hidden="true" />
              Exporter le rapport
            </Button>
          </header>

          {/* Time Range Selector */}
          <Card className="mb-8" role="region" aria-labelledby="timerange-label">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <span id="timerange-label" className="text-sm font-medium text-gray-700">
                  Période:
                </span>
                <div className="flex gap-2" role="group" aria-labelledby="timerange-label">
                  <Button
                    variant={timeRange === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange('week')}
                    aria-pressed={timeRange === 'week'}
                    aria-label="Afficher les données de cette semaine"
                  >
                    Cette semaine
                  </Button>
                  <Button
                    variant={timeRange === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange('month')}
                    aria-pressed={timeRange === 'month'}
                    aria-label="Afficher les données de ce mois"
                  >
                    Ce mois
                  </Button>
                  <Button
                    variant={timeRange === 'year' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange('year')}
                    aria-pressed={timeRange === 'year'}
                    aria-label="Afficher les données de cette année"
                  >
                    Cette année
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Cards */}
          <section
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            role="region"
            aria-labelledby="kpi-heading"
          >
            <h2 id="kpi-heading" className="sr-only">
              Indicateurs clés de performance
            </h2>

            <Card role="article" aria-labelledby="kpi-views">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1" id="kpi-views">
                      Vues totales
                    </p>
                    <p className="text-3xl font-bold text-gray-900" aria-label="12 450 vues totales">
                      12,450
                    </p>
                    <p className="text-xs text-green-600 mt-2" aria-label="Augmentation de 12% par rapport à la semaine dernière">
                      ↑ 12% vs semaine dernière
                    </p>
                  </div>
                  <Eye className="w-10 h-10 text-blue-500 opacity-20" aria-hidden="true" />
                </div>
              </CardContent>
            </Card>

            <Card role="article" aria-labelledby="kpi-likes">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1" id="kpi-likes">
                      Likes
                    </p>
                    <p className="text-3xl font-bold text-gray-900" aria-label="3 240 likes">
                      3,240
                    </p>
                    <p className="text-xs text-green-600 mt-2" aria-label="Augmentation de 8% par rapport à la semaine dernière">
                      ↑ 8% vs semaine dernière
                    </p>
                  </div>
                  <Heart className="w-10 h-10 text-red-500 opacity-20" aria-hidden="true" />
                </div>
              </CardContent>
            </Card>

            <Card role="article" aria-labelledby="kpi-comments">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1" id="kpi-comments">
                      Commentaires
                    </p>
                    <p className="text-3xl font-bold text-gray-900" aria-label="892 commentaires">
                      892
                    </p>
                    <p className="text-xs text-green-600 mt-2" aria-label="Augmentation de 15% par rapport à la semaine dernière">
                      ↑ 15% vs semaine dernière
                    </p>
                  </div>
                  <MessageCircle className="w-10 h-10 text-purple-500 opacity-20" aria-hidden="true" />
                </div>
              </CardContent>
            </Card>

            <Card role="article" aria-labelledby="kpi-engagement">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1" id="kpi-engagement">
                      Engagement
                    </p>
                    <p className="text-3xl font-bold text-gray-900" aria-label="Taux d'engagement de 8,2%">
                      8.2%
                    </p>
                    <p className="text-xs text-green-600 mt-2" aria-label="Augmentation de 3% par rapport à la semaine dernière">
                      ↑ 3% vs semaine dernière
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-500 opacity-20" aria-hidden="true" />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Charts Section */}
          <Tabs
            defaultValue="engagement"
            className="space-y-6 mb-8"
            aria-labelledby="charts-section-title"
          >
            <h2 id="charts-section-title" className="sr-only">
              Graphiques et visualisations de données
            </h2>
            <TabsList className="grid w-full grid-cols-3" role="tablist" aria-label="Catégories de données analytiques">
              <TabsTrigger value="engagement" aria-label="Graphiques d'engagement">
                Engagement
              </TabsTrigger>
              <TabsTrigger value="content" aria-label="Graphiques de contenu">
                Contenu
              </TabsTrigger>
              <TabsTrigger value="audience" aria-label="Graphiques d'audience">
                Audience
              </TabsTrigger>
            </TabsList>

            {/* Engagement Tab */}
            <TabsContent
              value="engagement"
              className="space-y-6"
              role="tabpanel"
              aria-labelledby="tab-engagement"
              tabIndex={0}
            >
              <Card role="region" aria-labelledby="engagement-trend-title">
                <CardHeader>
                  <CardTitle id="engagement-trend-title">Tendance d'engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div role="img" aria-label="Graphique en ligne montrant les tendances de vues, likes et commentaires sur 7 jours">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={engagementData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="views" stroke="#3b82f6" name="Vues" />
                        <Line type="monotone" dataKey="likes" stroke="#ef4444" name="Likes" />
                        <Line type="monotone" dataKey="comments" stroke="#8b5cf6" name="Commentaires" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Posts */}
                <Card role="region" aria-labelledby="top-posts-title">
                  <CardHeader>
                    <CardTitle className="text-lg" id="top-posts-title">
                      Posts les plus vus
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4" role="list" aria-label="Classement des posts les plus performants">
                      {topPosts.map((post, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg" role="listitem">
                          <h4 className="font-medium text-gray-900 mb-2 line-clamp-1">
                            {post.title}
                          </h4>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span aria-label={`${post.views} vues`}>{post.views} vues</span>
                            <span aria-label={`${post.likes} likes`}>{post.likes} likes</span>
                            <span aria-label={`${post.comments} commentaires`}>{post.comments} commentaires</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Engagement Rate */}
                <Card role="region" aria-labelledby="engagement-type-title">
                  <CardHeader>
                    <CardTitle className="text-lg" id="engagement-type-title">
                      Engagement par type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div role="img" aria-label="Graphique circulaire montrant la répartition: Posts 45%, Fiches 30%, Collections 25%">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={contentTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {contentTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent
              value="content"
              className="space-y-6"
              role="tabpanel"
              aria-labelledby="tab-content"
              tabIndex={0}
            >
              <Card role="region" aria-labelledby="content-performance-title">
                <CardHeader>
                  <CardTitle id="content-performance-title">Performance du contenu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div role="img" aria-label="Graphique en barres comparant les performances des 5 meilleurs posts en termes de vues, likes et commentaires">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topPosts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="title"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="views" fill="#3b82f6" name="Vues" />
                        <Bar dataKey="likes" fill="#ef4444" name="Likes" />
                        <Bar dataKey="comments" fill="#8b5cf6" name="Commentaires" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="list">
                <Card role="listitem" aria-labelledby="content-published-title">
                  <CardHeader>
                    <CardTitle className="text-lg" id="content-published-title">
                      Contenu publié
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900" aria-label="27 articles et posts publiés">
                      27
                    </p>
                    <p className="text-sm text-gray-600 mt-1">articles et posts</p>
                    <p className="text-xs text-green-600 mt-2" aria-label="Augmentation de 3 cette semaine">
                      ↑ 3 cette semaine
                    </p>
                  </CardContent>
                </Card>

                <Card role="listitem" aria-labelledby="avg-views-title">
                  <CardHeader>
                    <CardTitle className="text-lg" id="avg-views-title">
                      Moyenne de vues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900" aria-label="461 vues en moyenne par article">
                      461
                    </p>
                    <p className="text-sm text-gray-600 mt-1">par article</p>
                    <p className="text-xs text-green-600 mt-2" aria-label="Augmentation de 12% par rapport au mois dernier">
                      ↑ 12% vs mois dernier
                    </p>
                  </CardContent>
                </Card>

                <Card role="listitem" aria-labelledby="engagement-rate-title">
                  <CardHeader>
                    <CardTitle className="text-lg" id="engagement-rate-title">
                      Taux d'engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900" aria-label="Taux d'engagement de 8,2%">
                      8.2%
                    </p>
                    <p className="text-sm text-gray-600 mt-1">de vues engagées</p>
                    <p className="text-xs text-green-600 mt-2" aria-label="Augmentation de 2% par rapport au mois dernier">
                      ↑ 2% vs mois dernier
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Audience Tab */}
            <TabsContent
              value="audience"
              className="space-y-6"
              role="tabpanel"
              aria-labelledby="tab-audience"
              tabIndex={0}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card role="region" aria-labelledby="audience-growth-title">
                  <CardHeader>
                    <CardTitle id="audience-growth-title">Croissance de l'audience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div role="img" aria-label="Graphique en ligne montrant la croissance de l'audience sur 7 jours">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={engagementData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="views" stroke="#3b82f6" name="Vues" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card role="region" aria-labelledby="audience-stats-title">
                  <CardHeader>
                    <CardTitle id="audience-stats-title">Statistiques d'audience</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200" role="group">
                      <p className="text-sm text-gray-600">Lecteurs uniques</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1" aria-label="1240 lecteurs uniques">
                        1,240
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200" role="group">
                      <p className="text-sm text-gray-600">Retours en arrière</p>
                      <p className="text-2xl font-bold text-purple-600 mt-1" aria-label="34% de taux de retour">
                        34%
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200" role="group">
                      <p className="text-sm text-gray-600">Temps de lecture moyen</p>
                      <p className="text-2xl font-bold text-green-600 mt-1" aria-label="Temps de lecture moyen de 4 minutes et 32 secondes">
                        4m 32s
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer Info */}
          <Alert className="bg-blue-50 border-blue-200" role="note">
            <AlertCircle className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <AlertDescription className="text-blue-800">
              Les données sont mises à jour en temps réel et reflètent les activités des 7 derniers
              jours. Pour plus de détails, consultez votre profil analytique.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </>
  )
}
