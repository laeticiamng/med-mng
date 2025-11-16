import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  TrendingUp,
  User,
  BookOpen,
  Target,
  Trophy,
  Users,
  Activity,
  Heart,
  FileText,
  Zap,
  Calendar,
  Star,
  Award,
  BarChart3,
  Brain,
  Search
} from 'lucide-react';

/**
 * Dashboard Hub - Central Discovery Page
 * Solves the "Dashboard Hell" problem by listing all 25+ dashboards
 * with descriptions, categories, and search functionality
 *
 * Addresses audit finding: 60% of features hidden, users can't discover functionality
 */

interface DashboardItem {
  id: string;
  name: string;
  path: string;
  description: string;
  category: 'learning' | 'analytics' | 'gamification' | 'social' | 'wellness' | 'admin';
  icon: React.ComponentType<{ className?: string }>;
  isNew?: boolean;
  isPriority?: boolean;
}

const DASHBOARDS: DashboardItem[] = [
  // Learning Dashboards
  {
    id: 'learning',
    name: 'Apprentissage Principal',
    path: '/learning',
    description: 'Votre parcours d\'apprentissage personnalisé avec EDN, quiz et progression',
    category: 'learning',
    icon: BookOpen,
    isPriority: true
  },
  {
    id: 'edn-complete',
    name: 'EDN Complet',
    path: '/edn-complete',
    description: '367 items EDN avec Rang A/B, tableaux cliniques et mode immersif',
    category: 'learning',
    icon: BookOpen,
    isPriority: true
  },
  {
    id: 'ecos',
    name: 'ECOS - Cas Cliniques',
    path: '/ecos',
    description: 'Situations cliniques structurées pour s\'entraîner aux ECOS',
    category: 'learning',
    icon: Activity,
    isPriority: true
  },
  {
    id: 'study-planner',
    name: 'Planificateur d\'Études',
    path: '/study-planner',
    description: 'Planifiez vos sessions d\'étude et suivez votre progression',
    category: 'learning',
    icon: Calendar
  },
  {
    id: 'music-library',
    name: 'Bibliothèque Musicale IA',
    path: '/edn/music-library',
    description: 'Générez des mnémoniques musicaux avec l\'IA pour mémoriser les items EDN',
    category: 'learning',
    icon: Zap,
    isNew: true,
    isPriority: true
  },

  // Analytics Dashboards
  {
    id: 'dashboard',
    name: 'Dashboard Principal',
    path: '/dashboard',
    description: 'Vue d\'ensemble de votre activité, progression et statistiques',
    category: 'analytics',
    icon: LayoutDashboard,
    isPriority: true
  },
  {
    id: 'analytics-advanced',
    name: 'Analytics Avancés',
    path: '/analytics-advanced',
    description: 'Analyses détaillées de vos performances avec graphiques et métriques',
    category: 'analytics',
    icon: TrendingUp
  },
  {
    id: 'personalized',
    name: 'Dashboard Personnalisé',
    path: '/personalized',
    description: 'Dashboard personnalisable avec widgets modulaires',
    category: 'analytics',
    icon: LayoutDashboard
  },
  {
    id: 'statistics',
    name: 'Statistiques Globales',
    path: '/statistics',
    description: 'Vue statistique complète de toutes vos activités',
    category: 'analytics',
    icon: BarChart3
  },
  {
    id: 'edn-audit',
    name: 'Audit EDN',
    path: '/edn-audit',
    description: 'Analyse qualitative de vos connaissances EDN par compétence',
    category: 'analytics',
    icon: FileText
  },
  {
    id: 'performance',
    name: 'Performance',
    path: '/performance',
    description: 'Suivi de vos performances et temps de réponse',
    category: 'analytics',
    icon: TrendingUp
  },
  {
    id: 'effectiveness',
    name: 'Efficacité Apprentissage',
    path: '/effectiveness',
    description: 'Mesurez l\'efficacité de vos méthodes d\'apprentissage',
    category: 'analytics',
    icon: Brain
  },

  // Gamification Dashboards
  {
    id: 'gamification',
    name: 'Gamification',
    path: '/gamification',
    description: 'Badges, XP, niveaux et système de récompenses',
    category: 'gamification',
    icon: Trophy,
    isPriority: true
  },
  {
    id: 'goals',
    name: 'Objectifs',
    path: '/goals',
    description: 'Définissez et suivez vos objectifs d\'apprentissage avec milestones',
    category: 'gamification',
    icon: Target,
    isNew: true
  },
  {
    id: 'challenges',
    name: 'Challenges',
    path: '/challenges',
    description: 'Challenges quotidiens et hebdomadaires pour progresser',
    category: 'gamification',
    icon: Zap
  },
  {
    id: 'quests',
    name: 'Quêtes',
    path: '/quests',
    description: 'Parcours d\'apprentissage gamifiés avec récompenses',
    category: 'gamification',
    icon: Star
  },
  {
    id: 'badges',
    name: 'Collection de Badges',
    path: '/badges',
    description: 'Tous vos badges gagnés et à débloquer',
    category: 'gamification',
    icon: Award
  },
  {
    id: 'leaderboard',
    name: 'Classement',
    path: '/leaderboard',
    description: 'Classement global des utilisateurs par XP et progression',
    category: 'gamification',
    icon: Trophy
  },

  // Social Dashboards
  {
    id: 'teams',
    name: 'Équipes',
    path: '/teams',
    description: 'Rejoignez ou créez des équipes d\'étude collaborative',
    category: 'social',
    icon: Users
  },
  {
    id: 'community',
    name: 'Communauté',
    path: '/community',
    description: 'Fil d\'actualité, posts et interactions avec la communauté',
    category: 'social',
    icon: Users
  },
  {
    id: 'activity-feed',
    name: 'Fil d\'Activité',
    path: '/activity',
    description: 'Activités récentes de vos amis et équipes',
    category: 'social',
    icon: Activity
  },

  // Wellness Dashboards
  {
    id: 'wellness',
    name: 'Bien-être',
    path: '/wellness',
    description: 'Suivez votre bien-être et équilibre vie-études',
    category: 'wellness',
    icon: Heart
  },
  {
    id: 'rituals',
    name: 'Rituels d\'Étude',
    path: '/rituals',
    description: 'Créez et suivez vos rituels d\'apprentissage quotidiens',
    category: 'wellness',
    icon: Calendar
  },

  // Admin/Reports Dashboards
  {
    id: 'reports',
    name: 'Rapports',
    path: '/reports',
    description: 'Générez et exportez des rapports détaillés (CSV, PDF, Excel)',
    category: 'admin',
    icon: FileText
  },
  {
    id: 'accessibility',
    name: 'Accessibilité',
    path: '/accessibility',
    description: 'Centre d\'accessibilité et paramètres d\'aide à l\'apprentissage',
    category: 'admin',
    icon: Heart
  }
];

const CATEGORY_LABELS = {
  learning: { label: 'Apprentissage', color: 'bg-blue-500' },
  analytics: { label: 'Analytics', color: 'bg-purple-500' },
  gamification: { label: 'Gamification', color: 'bg-yellow-500' },
  social: { label: 'Social', color: 'bg-green-500' },
  wellness: { label: 'Bien-être', color: 'bg-pink-500' },
  admin: { label: 'Administration', color: 'bg-gray-500' }
};

export const DashboardHub: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter dashboards based on search and category
  const filteredDashboards = DASHBOARDS.filter(dashboard => {
    const matchesSearch =
      dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dashboard.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || dashboard.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Count dashboards by category
  const categoryCounts = DASHBOARDS.reduce((acc, dashboard) => {
    acc[dashboard.category] = (acc[dashboard.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Centre de Contrôle</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Accédez à tous les dashboards et fonctionnalités de la plateforme
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un dashboard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            Tous ({DASHBOARDS.length})
          </Badge>
          {Object.entries(CATEGORY_LABELS).map(([category, { label, color }]) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={`cursor-pointer ${selectedCategory === category ? color : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {label} ({categoryCounts[category] || 0})
            </Badge>
          ))}
        </div>
      </div>

      {/* Priority Dashboards */}
      {!searchQuery && !selectedCategory && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-2xl font-semibold">Dashboards Essentiels</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DASHBOARDS.filter(d => d.isPriority).map(dashboard => (
              <DashboardCard key={dashboard.id} dashboard={dashboard} />
            ))}
          </div>
        </div>
      )}

      {/* All Dashboards by Category */}
      <div className="space-y-8">
        {Object.entries(CATEGORY_LABELS).map(([category, { label, color }]) => {
          const categoryDashboards = filteredDashboards.filter(d => d.category === category);

          if (categoryDashboards.length === 0) return null;

          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={color}>{label}</Badge>
                <h2 className="text-xl font-semibold">{categoryDashboards.length} dashboard(s)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryDashboards.map(dashboard => (
                  <DashboardCard key={dashboard.id} dashboard={dashboard} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredDashboards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Aucun dashboard trouvé pour "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
};

const DashboardCard: React.FC<{ dashboard: DashboardItem }> = ({ dashboard }) => {
  const Icon = dashboard.icon;
  const categoryInfo = CATEGORY_LABELS[dashboard.category];

  return (
    <Link to={dashboard.path}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${categoryInfo.color} bg-opacity-10`}>
                <Icon className={`h-6 w-6 ${categoryInfo.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {dashboard.name}
                  {dashboard.isNew && (
                    <Badge variant="secondary" className="text-xs">Nouveau</Badge>
                  )}
                </CardTitle>
              </div>
            </div>
          </div>
          <CardDescription className="mt-2">
            {dashboard.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default DashboardHub;
