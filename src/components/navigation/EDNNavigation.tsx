import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Brain, 
  FileText, 
  Music, 
  Target, 
  Stethoscope,
  GraduationCap,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  Star,
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Play,
  Bookmark,
  Share2,
  Download,
  Eye,
  Heart,
  MessageSquare,
  BarChart3,
  Layers,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

interface EDNNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const EDNNavigation = ({ activeTab = "items", onTabChange }: EDNNavigationProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const ednModules = [
    {
      id: "items",
      title: "Items EDN",
      description: "367 items de connaissances médicaux",
      icon: BookOpen,
      color: "bg-blue-500",
      count: 367,
      subModules: [
        { id: "browse", name: "Naviguer", icon: Search, description: "Explorer tous les items" },
        { id: "favorites", name: "Favoris", icon: Heart, description: "Items marqués" },
        { id: "progress", name: "Progression", icon: TrendingUp, description: "Suivi apprentissage" },
        { id: "statistics", name: "Statistiques", icon: BarChart3, description: "Analytics détaillées" }
      ]
    },
    {
      id: "tableaux",
      title: "Tableaux Rang A/B",
      description: "Connaissances structurées LiSA",
      icon: Layers,
      color: "bg-green-500",
      count: 734,
      subModules: [
        { id: "rang-a", name: "Rang A", icon: Target, description: "Connaissances de base" },
        { id: "rang-b", name: "Rang B", icon: Star, description: "Connaissances expertes" },
        { id: "comparison", name: "Comparaison", icon: Eye, description: "Analyse comparative" },
        { id: "generation", name: "Génération", icon: Sparkles, description: "Créer nouveaux tableaux" }
      ]
    },
    {
      id: "competences",
      title: "Compétences OIC",
      description: "7 compétences d'intégration",
      icon: GraduationCap,
      color: "bg-purple-500",
      count: 7,
      subModules: [
        { id: "list", name: "Liste", icon: List, description: "Toutes les compétences" },
        { id: "mapping", name: "Mapping", icon: Grid, description: "Liens avec items EDN" },
        { id: "assessment", name: "Évaluation", icon: CheckCircle, description: "Tests compétences" },
        { id: "portfolio", name: "Portfolio", icon: Bookmark, description: "Dossier personnel" }
      ]
    },
    {
      id: "interactive",
      title: "Modules Interactifs",
      description: "Apprentissage immersif",
      icon: Brain,
      color: "bg-orange-500",
      count: 150,
      subModules: [
        { id: "scenarios", name: "Scénarios", icon: Play, description: "Cas cliniques interactifs" },
        { id: "quiz", name: "Quiz", icon: MessageSquare, description: "Questions adaptatives" },
        { id: "music", name: "Musicaux", icon: Music, description: "Contenus musicaux" },
        { id: "immersive", name: "Immersif", icon: Eye, description: "Réalité virtuelle" }
      ]
    },
    {
      id: "tools",
      title: "Outils Pédagogiques",
      description: "Supports d'apprentissage",
      icon: FileText,
      color: "bg-indigo-500",
      count: 50,
      subModules: [
        { id: "flashcards", name: "Flashcards", icon: Layers, description: "Cartes mémoire" },
        { id: "mindmaps", name: "Mind Maps", icon: Brain, description: "Cartes conceptuelles" },
        { id: "timelines", name: "Chronologies", icon: Clock, description: "Lignes temporelles" },
        { id: "calculators", name: "Calculateurs", icon: Target, description: "Outils de calcul" }
      ]
    },
    {
      id: "collaboration",
      title: "Collaboration",
      description: "Travail en équipe",
      icon: Users,
      color: "bg-pink-500",
      count: 25,
      subModules: [
        { id: "groups", name: "Groupes", icon: Users, description: "Groupes d'étude" },
        { id: "sharing", name: "Partage", icon: Share2, description: "Partager contenus" },
        { id: "discussions", name: "Discussions", icon: MessageSquare, description: "Forums" },
        { id: "mentoring", name: "Mentorat", icon: GraduationCap, description: "Accompagnement" }
      ]
    }
  ];

  const specialties = [
    { value: "all", label: "Toutes spécialités" },
    { value: "medecine-generale", label: "Médecine générale" },
    { value: "cardiologie", label: "Cardiologie" },
    { value: "neurologie", label: "Neurologie" },
    { value: "psychiatrie", label: "Psychiatrie" },
    { value: "pediatrie", label: "Pédiatrie" },
    { value: "gynecologie", label: "Gynécologie" },
    { value: "chirurgie", label: "Chirurgie" },
    { value: "urgences", label: "Urgences" },
    { value: "oncologie", label: "Oncologie" }
  ];

  const renderModuleCard = (module: any) => (
    <Card key={module.id} className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`h-12 w-12 ${module.color} rounded-lg flex items-center justify-center`}>
            <module.icon className="h-6 w-6 text-white" />
          </div>
          <Badge variant="secondary" className="text-xs">
            {module.count} éléments
          </Badge>
        </div>
        <CardTitle className="text-lg text-gray-900">{module.title}</CardTitle>
        <p className="text-sm text-gray-600">{module.description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {module.subModules.map((subModule: any) => (
            <Link
              key={subModule.id}
              to={`/edn/${module.id}/${subModule.id}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <subModule.icon className="h-4 w-4 text-gray-500 group-hover:text-blue-500" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                  {subModule.name}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header avec recherche et filtres */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Navigation EDN LiSA 2025
            </h2>
            <p className="text-gray-600">
              Accédez à tous les modules d'apprentissage médical
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un module, item ou compétence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
            <SelectTrigger className="w-full lg:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((specialty) => (
                <SelectItem key={specialty.value} value={specialty.value}>
                  {specialty.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtres avancés
          </Button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
          {ednModules.map((module) => (
            <TabsTrigger key={module.id} value={module.id} className="text-xs lg:text-sm">
              <module.icon className="h-4 w-4 mr-1" />
              {module.title.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {ednModules.map((module) => (
          <TabsContent key={module.id} value={module.id} className="mt-6">
            <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {viewMode === "grid" ? (
                renderModuleCard(module)
              ) : (
                <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 ${module.color} rounded-lg flex items-center justify-center`}>
                          <module.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{module.title}</CardTitle>
                          <p className="text-sm text-gray-600">{module.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {module.count} éléments
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {module.subModules.map((subModule: any) => (
                        <Link
                          key={subModule.id}
                          to={`/edn/${module.id}/${subModule.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors group"
                        >
                          <subModule.icon className="h-5 w-5 text-gray-500 group-hover:text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-blue-600 text-sm">
                              {subModule.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {subModule.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">367</div>
            <div className="text-xs text-gray-600">Items EDN</div>
          </CardContent>
        </Card>
        <Card className="text-center bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <Layers className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">734</div>
            <div className="text-xs text-gray-600">Tableaux</div>
          </CardContent>
        </Card>
        <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <GraduationCap className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">7</div>
            <div className="text-xs text-gray-600">Compétences</div>
          </CardContent>
        </Card>
        <Card className="text-center bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <Brain className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">∞</div>
            <div className="text-xs text-gray-600">Interactifs</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};