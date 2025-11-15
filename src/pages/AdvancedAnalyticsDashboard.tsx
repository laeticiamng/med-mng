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
import { useAuth } from '@/components/med-mng/AuthProvider'
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Tableau de Bord Analytique Avancé
              </h1>
              <p className="text-lg text-gray-600">Analysez vos données d'engagement et de contenu</p>
            </div>

            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Exporter le rapport
            </Button>
          </div>

          {/* Time Range Selector */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Période:</span>
                <div className="flex gap-2">
                  <Button
                    variant={timeRange === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange('week')}
                  >
                    Cette semaine
                  </Button>
                  <Button
                    variant={timeRange === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange('month')}
                  >
                    Ce mois
                  </Button>
                  <Button
                    variant={timeRange === 'year' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange('year')}
                  >
                    Cette année
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Vues totales</p>
                    <p className="text-3xl font-bold text-gray-900">12,450</p>
                    <p className="text-xs text-green-600 mt-2">↑ 12% vs semaine dernière</p>
                  </div>
                  <Eye className="w-10 h-10 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Likes</p>
                    <p className="text-3xl font-bold text-gray-900">3,240</p>
                    <p className="text-xs text-green-600 mt-2">↑ 8% vs semaine dernière</p>
                  </div>
                  <Heart className="w-10 h-10 text-red-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Commentaires</p>
                    <p className="text-3xl font-bold text-gray-900">892</p>
                    <p className="text-xs text-green-600 mt-2">↑ 15% vs semaine dernière</p>
                  </div>
                  <MessageCircle className="w-10 h-10 text-purple-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Engagement</p>
                    <p className="text-3xl font-bold text-gray-900">8.2%</p>
                    <p className="text-xs text-green-600 mt-2">↑ 3% vs semaine dernière</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <Tabs defaultValue="engagement" className="space-y-6 mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
            </TabsList>

            {/* Engagement Tab */}
            <TabsContent value="engagement" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendance d'engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="views" stroke="#3b82f6" />
                      <Line type="monotone" dataKey="likes" stroke="#ef4444" />
                      <Line type="monotone" dataKey="comments" stroke="#8b5cf6" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Posts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Posts les plus vus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topPosts.map((post, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2 line-clamp-1">
                            {post.title}
                          </h4>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{post.views} vues</span>
                            <span>{post.likes} likes</span>
                            <span>{post.comments} commentaires</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Engagement Rate */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Engagement par type</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance du contenu</CardTitle>
                </CardHeader>
                <CardContent>
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
                      <Bar dataKey="views" fill="#3b82f6" />
                      <Bar dataKey="likes" fill="#ef4444" />
                      <Bar dataKey="comments" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contenu publié</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">27</p>
                    <p className="text-sm text-gray-600 mt-1">articles et posts</p>
                    <p className="text-xs text-green-600 mt-2">↑ 3 cette semaine</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Moyenne de vues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">461</p>
                    <p className="text-sm text-gray-600 mt-1">par article</p>
                    <p className="text-xs text-green-600 mt-2">↑ 12% vs mois dernier</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Taux d'engagement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">8.2%</p>
                    <p className="text-sm text-gray-600 mt-1">de vues engagées</p>
                    <p className="text-xs text-green-600 mt-2">↑ 2% vs mois dernier</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Audience Tab */}
            <TabsContent value="audience" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Croissance de l'audience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={engagementData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="views" stroke="#3b82f6" name="Vues" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques d'audience</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600">Lecteurs uniques</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">1,240</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-gray-600">Retours en arrière</p>
                      <p className="text-2xl font-bold text-purple-600 mt-1">34%</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600">Temps de lecture moyen</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">4m 32s</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer Info */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
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
