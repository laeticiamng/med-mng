import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { 
  Search, 
  Stethoscope, 
  Clock, 
  User, 
  AlertCircle,
  Heart,
  Users,
  Star,
  Play,
  BookOpen,
  Target,
  TrendingUp,
  Award
} from "lucide-react";

// Données ECOS simulées
const ecosScenarios = [
  {
    id: "1",
    slug: "consultation-cardiologie",
    title: "Consultation de cardiologie - Douleur thoracique",
    specialty: "Cardiologie",
    type: "Consultation",
    difficulty: "Intermédiaire",
    duration: "20 min",
    patient: "Homme, 55 ans",
    setting: "Cabinet libéral",
    objectives: ["Interrogatoire", "Examen clinique", "Diagnostic différentiel", "Prescription"],
    views: 1890,
    rating: 4.7,
    description: "Patient consultant pour des douleurs thoraciques atypiques. Évaluation du risque cardiovasculaire.",
    skills: ["Communication", "Diagnostic", "Prescription"],
    lastUpdated: "2024-01-15"
  },
  {
    id: "2", 
    slug: "urgence-dyspnee-aigue",
    title: "Urgence - Dyspnée aiguë",
    specialty: "Médecine d'urgence",
    type: "Urgence",
    difficulty: "Avancé",
    duration: "15 min",
    patient: "Femme, 72 ans",
    setting: "Service d'urgences",
    objectives: ["Triage", "Examen d'urgence", "Diagnostic", "Prise en charge immédiate"],
    views: 2456,
    rating: 4.9,
    description: "Patiente âgée se présentant aux urgences pour une dyspnée aiguë d'apparition brutale.",
    skills: ["Urgence", "Diagnostic rapide", "Gestion du stress"],
    lastUpdated: "2024-01-14"
  },
  {
    id: "3",
    slug: "consultation-pediatrie",
    title: "Consultation de pédiatrie - Fièvre chez l'enfant",
    specialty: "Pédiatrie",
    type: "Consultation",
    difficulty: "Facile",
    duration: "25 min",
    patient: "Enfant, 3 ans",
    setting: "Cabinet de pédiatrie",
    objectives: ["Anamnèse pédiatrique", "Examen clinique", "Relation parents-enfant", "Conseils"],
    views: 1234,
    rating: 4.5,
    description: "Enfant de 3 ans amené par ses parents pour une fièvre évoluant depuis 2 jours.",
    skills: ["Pédiatrie", "Communication familiale", "Examen enfant"],
    lastUpdated: "2024-01-13"
  },
  {
    id: "4",
    slug: "consultation-psychiatrie",
    title: "Consultation de psychiatrie - Épisode dépressif",
    specialty: "Psychiatrie",
    type: "Consultation",
    difficulty: "Avancé",
    duration: "30 min",
    patient: "Femme, 35 ans",
    setting: "Consultation spécialisée",
    objectives: ["Entretien psychiatrique", "Évaluation risque suicidaire", "Diagnostic", "Plan thérapeutique"],
    views: 1567,
    rating: 4.8,
    description: "Patiente adressée par son médecin traitant pour suspicion d'épisode dépressif majeur.",
    skills: ["Entretien psychiatrique", "Évaluation du risque", "Empathie"],
    lastUpdated: "2024-01-12"
  },
  {
    id: "5",
    slug: "urgence-traumatologie",
    title: "Urgence - Traumatisme du genou",
    specialty: "Traumatologie",
    type: "Urgence",
    difficulty: "Intermédiaire",
    duration: "18 min",
    patient: "Homme, 28 ans",
    setting: "Service d'urgences",
    objectives: ["Examen traumatologique", "Imagerie", "Diagnostic", "Prise en charge"],
    views: 1789,
    rating: 4.6,
    description: "Sportif consultant aux urgences après chute avec traumatisme du genou droit.",
    skills: ["Traumatologie", "Examen orthopédique", "Gestion douleur"],
    lastUpdated: "2024-01-11"
  },
  {
    id: "6",
    slug: "consultation-dermatologie",
    title: "Consultation de dermatologie - Lésion cutanée",
    specialty: "Dermatologie",
    type: "Consultation",
    difficulty: "Intermédiaire",
    duration: "15 min",
    patient: "Homme, 45 ans",
    setting: "Cabinet de dermatologie",
    objectives: ["Examen dermatologique", "Dermoscopie", "Diagnostic différentiel", "Conduite à tenir"],
    views: 987,
    rating: 4.4,
    description: "Patient consultant pour une lésion cutanée pigmentée apparue récemment.",
    skills: ["Examen cutané", "Dermoscopie", "Diagnostic différentiel"],
    lastUpdated: "2024-01-10"
  }
];

const specialties = ["Toutes", "Cardiologie", "Médecine d'urgence", "Pédiatrie", "Psychiatrie", "Traumatologie", "Dermatologie"];
const types = ["Tous", "Consultation", "Urgence"];
const difficulties = ["Toutes", "Facile", "Intermédiaire", "Avancé"];

const EcosIndex = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Toutes");
  const [selectedType, setSelectedType] = useState("Tous");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Toutes");
  const [sortBy, setSortBy] = useState("popular");

  const filteredScenarios = useMemo(() => {
    let filtered = ecosScenarios.filter(scenario => {
      const matchesSearch = scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scenario.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scenario.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSpecialty = selectedSpecialty === "Toutes" || scenario.specialty === selectedSpecialty;
      const matchesType = selectedType === "Tous" || scenario.type === selectedType;
      const matchesDifficulty = selectedDifficulty === "Toutes" || scenario.difficulty === selectedDifficulty;

      return matchesSearch && matchesSpecialty && matchesType && matchesDifficulty;
    });

    // Tri
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b.views - a.views);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "recent":
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case "duration":
        filtered.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
        break;
    }

    return filtered;
  }, [searchTerm, selectedSpecialty, selectedType, selectedDifficulty, sortBy]);

  const stats = {
    total: ecosScenarios.length,
    consultations: ecosScenarios.filter(s => s.type === "Consultation").length,
    urgences: ecosScenarios.filter(s => s.type === "Urgence").length,
    avgRating: (ecosScenarios.reduce((sum, s) => sum + s.rating, 0) / ecosScenarios.length).toFixed(1)
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Facile": return "border-success text-success";
      case "Intermédiaire": return "border-warning text-warning";
      case "Avancé": return "border-destructive text-destructive";
      default: return "border-border text-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "Urgence" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary";
  };

  return (
    <>
      <Helmet>
        <title>Scénarios ECOS - MED-MNG | Entraînement aux examens cliniques</title>
        <meta name="description" content="Préparez vos ECOS avec nos scénarios interactifs. Consultations, urgences, toutes spécialités médicales avec MED-MNG." />
        <meta name="keywords" content="ECOS, examens cliniques, scénarios médicaux, formation pratique, simulation" />
      </Helmet>

      <main className="min-h-screen py-8">
        <div className="medical-container">
          {/* En-tête */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Stethoscope className="w-4 h-4 mr-2" />
              {ecosScenarios.length} scénarios disponibles
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Scénarios ECOS
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent block">
                interactifs
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Entraînez-vous aux examens cliniques avec nos scénarios immersifs. 
              Consultations, urgences, toutes spécialités.
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="medical-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary mb-1">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Scénarios</div>
              </CardContent>
            </Card>
            <Card className="medical-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-accent mb-1">{stats.consultations}</div>
                <div className="text-sm text-muted-foreground">Consultations</div>
              </CardContent>
            </Card>
            <Card className="medical-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-destructive mb-1">{stats.urgences}</div>
                <div className="text-sm text-muted-foreground">Urgences</div>
              </CardContent>
            </Card>
            <Card className="medical-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-success mb-1">{stats.avgRating}</div>
                <div className="text-sm text-muted-foreground">Note moyenne</div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres et Recherche */}
          <Card className="medical-card mb-8">
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
                {/* Recherche */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Rechercher un scénario..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 medical-input"
                    />
                  </div>
                </div>

                {/* Filtres */}
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="medical-input">
                    <SelectValue placeholder="Spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="medical-input">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="medical-input">
                    <SelectValue placeholder="Difficulté" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Options d'affichage */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {filteredScenarios.length} résultat{filteredScenarios.length > 1 ? 's' : ''}
                  </span>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Plus populaires</SelectItem>
                    <SelectItem value="rating">Mieux notés</SelectItem>
                    <SelectItem value="recent">Plus récents</SelectItem>
                    <SelectItem value="duration">Durée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste des scénarios */}
          <div className="medical-grid grid-cols-1 lg:grid-cols-2">
            {filteredScenarios.map((scenario) => (
              <Card key={scenario.id} className="medical-card-premium group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getTypeColor(scenario.type)}>
                        {scenario.type === "Urgence" ? (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <User className="w-3 h-3 mr-1" />
                        )}
                        {scenario.type}
                      </Badge>
                      <Badge variant="outline">{scenario.specialty}</Badge>
                      <Badge variant="outline" className={getDifficultyColor(scenario.difficulty)}>
                        {scenario.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{scenario.rating}</span>
                    </div>
                  </div>

                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {scenario.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {scenario.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Informations patient */}
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Patient :</span>
                        <span>{scenario.patient}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Contexte :</span>
                        <span>{scenario.setting}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Durée :</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{scenario.duration}</span>
                        </span>
                      </div>
                    </div>

                    {/* Objectifs */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Objectifs pédagogiques :</h4>
                      <div className="flex flex-wrap gap-1">
                        {scenario.objectives.slice(0, 3).map((objective) => (
                          <Badge key={objective} variant="secondary" className="text-xs">
                            {objective}
                          </Badge>
                        ))}
                        {scenario.objectives.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{scenario.objectives.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Compétences */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Compétences évaluées :</h4>
                      <div className="flex flex-wrap gap-1">
                        {scenario.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Métadonnées */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{scenario.views} vues</span>
                      </span>
                      <span>Mis à jour le {new Date(scenario.lastUpdated).toLocaleDateString('fr-FR')}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button asChild className="flex-1 medical-btn-primary">
                        <Link to={`/ecos/${scenario.slug}`}>
                          <Play className="w-4 h-4 mr-2" />
                          Commencer
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="flex-1">
                        <Link to={`/ecos/${scenario.slug}?mode=preview`}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Aperçu
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* État vide */}
          {filteredScenarios.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun scénario trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSpecialty("Toutes");
                  setSelectedType("Tous");
                  setSelectedDifficulty("Toutes");
                }}
                variant="outline"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}

          {/* Call to action */}
          <div className="text-center mt-12 pt-8 border-t border-border">
            <h3 className="text-2xl font-bold mb-4">
              Prêt à exceller aux ECOS ?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Entraînez-vous avec nos scénarios réalistes et améliorez vos compétences cliniques
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="medical-btn-primary">
                <Link to="/med-mng/signup">
                  <Award className="w-5 h-5 mr-2" />
                  Créer mon compte
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/platform">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Découvrir la plateforme
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default EcosIndex;