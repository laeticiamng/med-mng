import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Stethoscope, 
  Clock, 
  Users, 
  Target, 
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  BarChart3,
  Calendar,
  Award,
  BookOpen,
  Video,
  Mic,
  Camera,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  Timer,
  Brain,
  Heart,
  Eye,
  Hand,
  Ear,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";

export const ECOSNavigation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const ecosModules = [
    {
      id: "scenarios",
      title: "Scénarios ECOS",
      description: "150+ situations cliniques",
      icon: Stethoscope,
      color: "bg-blue-500",
      count: 156,
      subModules: [
        { id: "cardio", name: "Cardiologie", icon: Heart, count: 25, difficulty: "Intermédiaire" },
        { id: "neuro", name: "Neurologie", icon: Brain, count: 22, difficulty: "Avancé" },
        { id: "ophtalmo", name: "Ophtalmologie", icon: Eye, count: 18, difficulty: "Débutant" },
        { id: "orl", name: "ORL", icon: Ear, count: 15, difficulty: "Intermédiaire" },
        { id: "urgences", name: "Urgences", icon: Activity, count: 28, difficulty: "Avancé" },
        { id: "chirurgie", name: "Chirurgie", icon: Hand, count: 20, difficulty: "Avancé" }
      ]
    },
    {
      id: "evaluation",
      title: "Système d'Évaluation",
      description: "Grilles et critères",
      icon: Target,
      color: "bg-green-500",
      count: 45,
      subModules: [
        { id: "grilles", name: "Grilles d'évaluation", icon: CheckCircle, count: 12 },
        { id: "competences", name: "Compétences", icon: Award, count: 8 },
        { id: "feedback", name: "Feedback", icon: TrendingUp, count: 15 },
        { id: "analytics", name: "Analytics", icon: BarChart3, count: 10 }
      ]
    },
    {
      id: "simulation",
      title: "Simulation Interactive",
      description: "Environnements virtuels",
      icon: Video,
      color: "bg-purple-500",
      count: 75,
      subModules: [
        { id: "3d", name: "Environnements 3D", icon: Video, count: 20 },
        { id: "ar", name: "Réalité Augmentée", icon: Camera, count: 15 },
        { id: "voice", name: "Reconnaissance vocale", icon: Mic, count: 25 },
        { id: "haptic", name: "Retour haptique", icon: Hand, count: 15 }
      ]
    },
    {
      id: "sessions",
      title: "Sessions d'Examen",
      description: "Gestion des examens",
      icon: Calendar,
      color: "bg-orange-500",
      count: 30,
      subModules: [
        { id: "planning", name: "Planification", icon: Calendar, count: 8 },
        { id: "monitoring", name: "Monitoring", icon: Activity, count: 6 },
        { id: "results", name: "Résultats", icon: BarChart3, count: 10 },
        { id: "reports", name: "Rapports", icon: BookOpen, count: 6 }
      ]
    }
  ];

  const difficulties = [
    { value: "all", label: "Tous niveaux" },
    { value: "debutant", label: "Débutant" },
    { value: "intermediaire", label: "Intermédiaire" },
    { value: "avance", label: "Avancé" },
    { value: "expert", label: "Expert" }
  ];

  const specialties = [
    { value: "all", label: "Toutes spécialités" },
    { value: "medecine-generale", label: "Médecine générale" },
    { value: "cardiologie", label: "Cardiologie" },
    { value: "neurologie", label: "Neurologie" },
    { value: "urgences", label: "Urgences" },
    { value: "chirurgie", label: "Chirurgie" },
    { value: "pediatrie", label: "Pédiatrie" }
  ];

  const sampleScenarios = [
    {
      id: "cardio-001",
      title: "Douleur thoracique aux urgences",
      specialty: "Cardiologie",
      difficulty: "Intermédiaire",
      duration: 15,
      completion: 85,
      students: 124,
      rating: 4.6
    },
    {
      id: "neuro-002", 
      title: "AVC ischémique aigu",
      specialty: "Neurologie",
      difficulty: "Avancé",
      duration: 20,
      completion: 72,
      students: 98,
      rating: 4.8
    },
    {
      id: "urg-003",
      title: "Traumatisme crânien",
      specialty: "Urgences", 
      difficulty: "Avancé",
      duration: 25,
      completion: 68,
      students: 156,
      rating: 4.7
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ECOS - Examens Cliniques Objectifs Structurés
            </h2>
            <p className="text-gray-600">
              Pratiquez avec des scénarios cliniques réalistes et interactifs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default">
              <Play className="h-4 w-4 mr-2" />
              Démarrer session
            </Button>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistiques
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un scénario ECOS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
            <SelectTrigger className="w-full lg:w-48">
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
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Modules ECOS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ecosModules.map((module) => (
          <Card key={module.id} className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`h-12 w-12 ${module.color} rounded-lg flex items-center justify-center`}>
                  <module.icon className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {module.count}
                </Badge>
              </div>
              <CardTitle className="text-lg">{module.title}</CardTitle>
              <p className="text-sm text-gray-600">{module.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {module.subModules.map((subModule) => (
                  <Link
                    key={subModule.id}
                    to={`/ecos/${module.id}/${subModule.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <subModule.icon className="h-4 w-4 text-gray-500 group-hover:text-blue-500" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                        {subModule.name}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {subModule.count}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scénarios populaires */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Scénarios Populaires</h3>
          <Button variant="outline" size="sm">
            Voir tous
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleScenarios.map((scenario) => (
            <Card key={scenario.id} className="bg-white border-gray-200 hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-1">{scenario.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Badge variant="outline" className="text-xs">
                        {scenario.specialty}
                      </Badge>
                      <Badge 
                        variant={scenario.difficulty === "Avancé" ? "destructive" : scenario.difficulty === "Intermédiaire" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {scenario.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-yellow-600">
                    <Star className="h-4 w-4 fill-current" />
                    {scenario.rating}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      {scenario.duration} min
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="h-4 w-4" />
                      {scenario.students} étudiants
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taux de réussite</span>
                      <span className="font-medium">{scenario.completion}%</span>
                    </div>
                    <Progress value={scenario.completion} className="h-2" />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-1" />
                      Démarrer
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <Stethoscope className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">156</div>
            <div className="text-xs text-gray-600">Scénarios ECOS</div>
          </CardContent>
        </Card>
        <Card className="text-center bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">2.5K+</div>
            <div className="text-xs text-gray-600">Étudiants actifs</div>
          </CardContent>
        </Card>
        <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <Award className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">78%</div>
            <div className="text-xs text-gray-600">Taux réussite moyen</div>
          </CardContent>
        </Card>
        <Card className="text-center bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">18min</div>
            <div className="text-xs text-gray-600">Durée moyenne</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};