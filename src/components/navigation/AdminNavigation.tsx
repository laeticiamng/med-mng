import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Database, 
  Users, 
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  Activity,
  Server,
  Lock,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  HardDrive,
  Cpu,
  Wifi,
  Globe,
  Mail,
  Bell,
  UserCheck,
  FileText,
  Layers,
  GitBranch,
  Code,
  Bug,
  Wrench,
  Archive,
  Key,
  CreditCard,
  Smartphone,
  Monitor,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { Link } from "react-router-dom";

export const AdminNavigation = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const adminModules = [
    {
      id: "dashboard",
      title: "Tableau de Bord",
      description: "Vue d'ensemble système",
      icon: BarChart3,
      color: "bg-blue-500",
      subModules: [
        { id: "overview", name: "Vue générale", icon: Eye, alerts: 0 },
        { id: "metrics", name: "Métriques", icon: TrendingUp, alerts: 0 },
        { id: "alerts", name: "Alertes", icon: Bell, alerts: 3 },
        { id: "reports", name: "Rapports", icon: FileText, alerts: 0 }
      ]
    },
    {
      id: "users",
      title: "Gestion Utilisateurs",
      description: "Comptes et permissions",
      icon: Users,
      color: "bg-green-500",
      subModules: [
        { id: "accounts", name: "Comptes", icon: UserCheck, alerts: 0 },
        { id: "roles", name: "Rôles", icon: Shield, alerts: 0 },
        { id: "sessions", name: "Sessions", icon: Activity, alerts: 2 },
        { id: "analytics", name: "Analytics", icon: BarChart3, alerts: 0 }
      ]
    },
    {
      id: "content",
      title: "Gestion Contenu",
      description: "EDN, ECOS, Données",
      icon: Database,
      color: "bg-purple-500",
      subModules: [
        { id: "edn", name: "Items EDN", icon: FileText, alerts: 1 },
        { id: "ecos", name: "Scénarios ECOS", icon: Activity, alerts: 0 },
        { id: "import", name: "Import/Export", icon: Upload, alerts: 0 },
        { id: "quality", name: "Qualité", icon: CheckCircle, alerts: 5 }
      ]
    },
    {
      id: "system",
      title: "Système",
      description: "Performance et sécurité",
      icon: Server,
      color: "bg-orange-500",
      subModules: [
        { id: "health", name: "Santé", icon: Activity, alerts: 0 },
        { id: "security", name: "Sécurité", icon: Lock, alerts: 2 },
        { id: "backup", name: "Sauvegardes", icon: Archive, alerts: 0 },
        { id: "logs", name: "Logs", icon: FileText, alerts: 0 }
      ]
    },
    {
      id: "integrations",
      title: "Intégrations",
      description: "APIs et services externes",
      icon: Globe,
      color: "bg-indigo-500",
      subModules: [
        { id: "apis", name: "APIs", icon: Code, alerts: 0 },
        { id: "webhooks", name: "Webhooks", icon: GitBranch, alerts: 0 },
        { id: "payments", name: "Paiements", icon: CreditCard, alerts: 1 },
        { id: "notifications", name: "Notifications", icon: Mail, alerts: 0 }
      ]
    },
    {
      id: "settings",
      title: "Configuration",
      description: "Paramètres globaux",
      icon: Settings,
      color: "bg-gray-500",
      subModules: [
        { id: "general", name: "Général", icon: Settings, alerts: 0 },
        { id: "features", name: "Fonctionnalités", icon: Zap, alerts: 0 },
        { id: "maintenance", name: "Maintenance", icon: Wrench, alerts: 0 },
        { id: "advanced", name: "Avancé", icon: Code, alerts: 0 }
      ]
    }
  ];

  const systemMetrics = [
    { name: "CPU", value: 65, status: "normal", icon: Cpu, color: "text-blue-600" },
    { name: "Mémoire", value: 78, status: "warning", icon: HardDrive, color: "text-yellow-600" },
    { name: "Stockage", value: 45, status: "normal", icon: Database, color: "text-green-600" },
    { name: "Réseau", value: 92, status: "excellent", icon: Wifi, color: "text-purple-600" }
  ];

  const recentActivities = [
    { 
      id: 1, 
      action: "Nouveau utilisateur inscrit", 
      user: "marie.dubois@medecine.fr", 
      time: "Il y a 5 min",
      type: "user",
      icon: UserCheck 
    },
    { 
      id: 2, 
      action: "Sauvegarde automatique terminée", 
      user: "Système", 
      time: "Il y a 15 min",
      type: "system",
      icon: CheckCircle 
    },
    { 
      id: 3, 
      action: "Import EDN items effectué", 
      user: "admin@lisa.fr", 
      time: "Il y a 1h",
      type: "content",
      icon: Upload 
    },
    { 
      id: 4, 
      action: "Alerte sécurité résolue", 
      user: "Système", 
      time: "Il y a 2h",
      type: "security",
      icon: Shield 
    }
  ];

  const quickStats = [
    { name: "Utilisateurs actifs", value: "2,547", change: "+12%", trend: "up" },
    { name: "Sessions EDN", value: "18,329", change: "+8%", trend: "up" },
    { name: "Taux d'erreur", value: "0.2%", change: "-50%", trend: "down" },
    { name: "Temps de réponse", value: "145ms", change: "-5%", trend: "down" }
  ];

  const getTotalAlerts = () => {
    return adminModules.reduce((total, module) => {
      return total + module.subModules.reduce((subtotal, sub) => subtotal + sub.alerts, 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header Admin */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Administration LiSA
            </h2>
            <p className="text-gray-600">
              Gestion complète de la plateforme EDN
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={getTotalAlerts() > 0 ? "destructive" : "default"} className="text-sm">
              {getTotalAlerts()} alertes
            </Badge>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.name}</div>
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation par modules */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
          {adminModules.map((module) => (
            <TabsTrigger key={module.id} value={module.id} className="text-xs lg:text-sm relative">
              <module.icon className="h-4 w-4 mr-1" />
              {module.title.split(' ')[0]}
              {module.subModules.some(sub => sub.alerts > 0) && (
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></div>  
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {adminModules.map((module) => (
          <TabsContent key={module.id} value={module.id} className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {module.subModules.map((subModule) => (
                <Link key={subModule.id} to={`/admin/${module.id}/${subModule.id}`}>
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`h-10 w-10 ${module.color} rounded-lg flex items-center justify-center`}>
                          <subModule.icon className="h-5 w-5 text-white" />
                        </div>
                        {subModule.alerts > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {subModule.alerts}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base text-gray-900">{subModule.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Gérer</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Métriques système */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Métriques Système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemMetrics.map((metric) => (
                <div key={metric.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{metric.value}%</span>
                      <Badge 
                        variant={
                          metric.status === 'excellent' ? 'default' :
                          metric.status === 'normal' ? 'secondary' :
                          metric.status === 'warning' ? 'destructive' : 'outline'
                        }
                        className="text-xs"
                      >
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Activité Récente
              </CardTitle>
              <Button size="sm" variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'system' ? 'bg-green-100 text-green-600' :
                    activity.type === 'content' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{activity.action}</div>
                    <div className="text-xs text-gray-600">par {activity.user}</div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};