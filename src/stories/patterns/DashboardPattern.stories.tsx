import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Calendar,
  MoreVertical,
} from 'lucide-react';

const meta = {
  title: 'Patterns/Dashboard',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Pattern complet de dashboard avec layout responsive, sidebar navigation, cartes de métriques et graphiques Recharts.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Données simulées pour les graphiques
const revenueData = [
  { month: 'Jan', revenue: 12000, expenses: 8000, profit: 4000 },
  { month: 'Fév', revenue: 15000, expenses: 9000, profit: 6000 },
  { month: 'Mar', revenue: 18000, expenses: 10000, profit: 8000 },
  { month: 'Avr', revenue: 22000, expenses: 11000, profit: 11000 },
  { month: 'Mai', revenue: 25000, expenses: 12000, profit: 13000 },
  { month: 'Juin', revenue: 28000, expenses: 13000, profit: 15000 },
];

const trafficData = [
  { day: 'Lun', visitors: 2400, pageViews: 4800 },
  { day: 'Mar', visitors: 3200, pageViews: 6400 },
  { day: 'Mer', visitors: 2800, pageViews: 5600 },
  { day: 'Jeu', visitors: 3800, pageViews: 7600 },
  { day: 'Ven', visitors: 4200, pageViews: 8400 },
  { day: 'Sam', visitors: 3600, pageViews: 7200 },
  { day: 'Dim', visitors: 3000, pageViews: 6000 },
];

const categoryData = [
  { name: 'Électronique', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Vêtements', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Alimentation', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'Maison', value: 12, color: 'hsl(var(--chart-4))' },
  { name: 'Autres', value: 8, color: 'hsl(var(--chart-5))' },
];

// Composant de métrique KPI
const MetricCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
}) => {
  const isPositive = trend === 'up';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs mt-1">
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 text-success" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-destructive" />
          )}
          <span
            className={
              isPositive
                ? 'text-success'
                : 'text-destructive'
            }
          >
            {change}
          </span>
          <span className="text-muted-foreground ml-1">vs mois dernier</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Dashboard complet avec sidebar
const CompleteDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Analytics Platform</p>
        </div>
        <Separator />
        <nav className="p-4 space-y-2">
          <Button variant="default" className="w-full justify-start">
            <Activity className="mr-2 h-4 w-4" />
            Vue d'ensemble
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" />
            Clients
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Commandes
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <DollarSign className="mr-2 h-4 w-4" />
            Revenus
          </Button>
        </nav>
        <Separator className="my-4" />
        <div className="px-4 space-y-2">
          <h3 className="text-sm font-semibold px-2">Raccourcis</h3>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
            Rapports mensuels
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
            Export de données
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-bold">Vue d'ensemble</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenue dans votre tableau de bord
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                {selectedPeriod === '7days' ? '7 jours' : '30 jours'}
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtres
              </Button>
              <Button size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Revenu total"
              value="45 231 €"
              change="+20.1%"
              trend="up"
              icon={DollarSign}
            />
            <MetricCard
              title="Commandes"
              value="2,350"
              change="+15.3%"
              trend="up"
              icon={ShoppingCart}
            />
            <MetricCard
              title="Clients actifs"
              value="1,234"
              change="-5.2%"
              trend="down"
              icon={Users}
            />
            <MetricCard
              title="Taux de conversion"
              value="3.24%"
              change="+2.5%"
              trend="up"
              icon={TrendingUp}
            />
          </div>

          {/* Charts Section */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Revenus et dépenses</CardTitle>
                <CardDescription>Évolution mensuelle sur 6 mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenus"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="hsl(var(--destructive))"
                      fillOpacity={1}
                      fill="url(#colorExpenses)"
                      name="Dépenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Traffic Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Trafic du site</CardTitle>
                <CardDescription>Visiteurs et pages vues par jour</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="visitors"
                      fill="hsl(var(--primary))"
                      name="Visiteurs"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="pageViews"
                      fill="hsl(var(--accent))"
                      name="Pages vues"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Category Distribution */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Ventes par catégorie</CardTitle>
                <CardDescription>Répartition des revenus</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.name}</span>
                      </div>
                      <span className="font-semibold">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Commandes récentes</CardTitle>
                    <CardDescription>Dernières transactions</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    Voir tout
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: '#12345',
                      customer: 'Jean Dupont',
                      amount: '159.00 €',
                      status: 'Livré',
                      color: 'default',
                    },
                    {
                      id: '#12346',
                      customer: 'Marie Martin',
                      amount: '89.50 €',
                      status: 'En cours',
                      color: 'secondary',
                    },
                    {
                      id: '#12347',
                      customer: 'Pierre Dubois',
                      amount: '249.99 €',
                      status: 'En préparation',
                      color: 'secondary',
                    },
                    {
                      id: '#12348',
                      customer: 'Sophie Bernard',
                      amount: '45.00 €',
                      status: 'Livré',
                      color: 'default',
                    },
                  ].map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={order.color as any}>{order.status}</Badge>
                        <p className="text-sm font-semibold w-20 text-right">
                          {order.amount}
                        </p>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Indicateurs de performance</CardTitle>
              <CardDescription>Objectifs mensuels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Objectif de ventes</span>
                  <span className="text-muted-foreground">75% (30,000 € / 40,000 €)</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Acquisition de clients</span>
                  <span className="text-muted-foreground">60% (120 / 200)</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Satisfaction client</span>
                  <span className="text-muted-foreground">92% (4.6/5.0)</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

// Stories
export const Default: Story = {
  render: () => <CompleteDashboard />,
};

export const ResponsiveView: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-bold">Dashboard Responsive</h2>
        <p className="text-sm text-muted-foreground">
          Testez différentes tailles d'écran dans Storybook
        </p>
      </div>
      <CompleteDashboard />
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
  },
};

export const ChartsShowcase: Story = {
  render: () => (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2">Bibliothèque de graphiques</h2>
        <p className="text-sm text-muted-foreground">
          Graphiques Recharts intégrés avec le design system
        </p>
      </div>

      <Tabs defaultValue="area" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="area">Area</TabsTrigger>
          <TabsTrigger value="bar">Bar</TabsTrigger>
          <TabsTrigger value="line">Line</TabsTrigger>
          <TabsTrigger value="pie">Pie</TabsTrigger>
        </TabsList>

        <TabsContent value="area" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Area Chart</CardTitle>
              <CardDescription>Graphique en aires pour les tendances</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bar">
          <Card>
            <CardHeader>
              <CardTitle>Bar Chart</CardTitle>
              <CardDescription>Graphique en barres pour les comparaisons</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="line">
          <Card>
            <CardHeader>
              <CardTitle>Line Chart</CardTitle>
              <CardDescription>Graphique linéaire pour les évolutions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pie">
          <Card>
            <CardHeader>
              <CardTitle>Pie Chart</CardTitle>
              <CardDescription>Graphique circulaire pour les proportions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  ),
};
