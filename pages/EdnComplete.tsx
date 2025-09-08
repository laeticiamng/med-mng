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
  BookOpen, 
  Music, 
  Play, 
  Clock, 
  Tag, 
  Filter,
  Grid3X3,
  List,
  Star,
  TrendingUp,
  Users,
  Target
} from "lucide-react";

// Données EDN simulées
const ednItems = [
  {
    id: "1",
    slug: "insuffisance-cardiaque-aigue",
    title: "Insuffisance cardiaque aiguë",
    category: "Cardiologie",
    rank: "A",
    difficulty: "Intermédiaire",
    duration: "15 min",
    hasMusic: true,
    views: 1250,
    likes: 89,
    description: "Diagnostic, prise en charge et traitement de l'insuffisance cardiaque aiguë",
    tags: ["cardiologie", "urgence", "dyspnée", "œdème"],
    lastUpdated: "2024-01-15"
  },
  {
    id: "2",
    slug: "pneumonie-communautaire",
    title: "Pneumonie communautaire",
    category: "Pneumologie",
    rank: "A",
    difficulty: "Facile",
    duration: "12 min",
    hasMusic: true,
    views: 980,
    likes: 67,
    description: "Diagnostic et prise en charge des pneumonies communautaires",
    tags: ["pneumologie", "infection", "antibiotique"],
    lastUpdated: "2024-01-14"
  },
  {
    id: "3",
    slug: "diabete-type-2",
    title: "Diabète de type 2",
    category: "Endocrinologie",
    rank: "A",
    difficulty: "Intermédiaire",
    duration: "18 min",
    hasMusic: true,
    views: 1456,
    likes: 124,
    description: "Diagnostic, suivi et complications du diabète de type 2",
    tags: ["endocrinologie", "métabolisme", "glycémie"],
    lastUpdated: "2024-01-13"
  },
  {
    id: "4",
    slug: "avc-ischemique",
    title: "AVC ischémique",
    category: "Neurologie",
    rank: "A",
    difficulty: "Avancé",
    duration: "20 min",
    hasMusic: false,
    views: 2100,
    likes: 178,
    description: "Prise en charge en urgence et traitement de l'AVC ischémique",
    tags: ["neurologie", "urgence", "thrombolyse"],
    lastUpdated: "2024-01-12"
  },
  {
    id: "5",
    slug: "hypertension-arterielle",
    title: "Hypertension artérielle",
    category: "Cardiologie",
    rank: "A",
    difficulty: "Facile",
    duration: "14 min",
    hasMusic: true,
    views: 890,
    likes: 56,
    description: "Diagnostic et prise en charge de l'hypertension artérielle",
    tags: ["cardiologie", "prévention", "traitement"],
    lastUpdated: "2024-01-11"
  },
  {
    id: "6",
    slug: "depression-majeure",
    title: "Dépression majeure",
    category: "Psychiatrie",
    rank: "B",
    difficulty: "Intermédiaire",
    duration: "16 min",
    hasMusic: true,
    views: 1120,
    likes: 92,
    description: "Diagnostic et prise en charge de la dépression majeure",
    tags: ["psychiatrie", "dépression", "antidépresseur"],
    lastUpdated: "2024-01-10"
  }
];

const categories = ["Toutes", "Cardiologie", "Pneumologie", "Endocrinologie", "Neurologie", "Psychiatrie"];
const difficulties = ["Toutes", "Facile", "Intermédiaire", "Avancé"];
const ranks = ["Tous", "A", "B"];

const EdnComplete = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Toutes");
  const [selectedRank, setSelectedRank] = useState("Tous");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("popular");

  const filteredItems = useMemo(() => {
    let filtered = ednItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "Toutes" || item.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "Toutes" || item.difficulty === selectedDifficulty;
      const matchesRank = selectedRank === "Tous" || item.rank === selectedRank;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesRank;
    });

    // Tri
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b.views - a.views);
        break;
      case "recent":
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "duration":
        filtered.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
        break;
    }

    return filtered;
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedRank, sortBy]);

  const stats = {
    total: ednItems.length,
    withMusic: ednItems.filter(item => item.hasMusic).length,
    totalViews: ednItems.reduce((sum, item) => sum + item.views, 0),
    totalLikes: ednItems.reduce((sum, item) => sum + item.likes, 0)
  };

  return (
    <>
      <Helmet>
        <title>EDN Complet - MED-MNG | 367 items médicaux avec musique IA</title>
        <meta name="description" content="Accédez à tous les items EDN dans une interface moderne. Transformez vos révisions en musique avec l'IA de MED-MNG." />
        <meta name="keywords" content="EDN, items médicaux, révisions médecine, apprentissage musical, IA médicale" />
      </Helmet>

      <main className="min-h-screen py-8">
        <div className="medical-container">
          {/* En-tête */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <BookOpen className="w-4 h-4 mr-2" />
              367 items EDN disponibles
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Items EDN
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent block">
                avec musique IA
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tous les items EDN dans une interface moderne. Transformez vos révisions en expérience musicale.
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="medical-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary mb-1">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Items total</div>
              </CardContent>
            </Card>
            <Card className="medical-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-accent mb-1">{stats.withMusic}</div>
                <div className="text-sm text-muted-foreground">Avec musique</div>
              </CardContent>
            </Card>
            <Card className="medical-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-success mb-1">{(stats.totalViews / 1000).toFixed(1)}k</div>
                <div className="text-sm text-muted-foreground">Vues totales</div>
              </CardContent>
            </Card>
            <Card className="medical-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-info mb-1">{stats.totalLikes}</div>
                <div className="text-sm text-muted-foreground">J'aime</div>
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
                      placeholder="Rechercher un item EDN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 medical-input"
                    />
                  </div>
                </div>

                {/* Filtres */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="medical-input">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
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

                <Select value={selectedRank} onValueChange={setSelectedRank}>
                  <SelectTrigger className="medical-input">
                    <SelectValue placeholder="Rang" />
                  </SelectTrigger>
                  <SelectContent>
                    {ranks.map((rank) => (
                      <SelectItem key={rank} value={rank}>
                        Rang {rank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Options d'affichage */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {filteredItems.length} résultat{filteredItems.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Plus populaires</SelectItem>
                      <SelectItem value="recent">Plus récents</SelectItem>
                      <SelectItem value="alphabetical">Alphabétique</SelectItem>
                      <SelectItem value="duration">Durée</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des items */}
          <div className={`medical-grid ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {filteredItems.map((item) => (
              <Card key={item.id} className="medical-card-premium group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={item.rank === "A" ? "default" : "secondary"}>
                          Rang {item.rank}
                        </Badge>
                        <Badge variant="outline">{item.category}</Badge>
                        {item.hasMusic && (
                          <Badge variant="secondary" className="bg-accent/10 text-accent">
                            <Music className="w-3 h-3 mr-1" />
                            Musique
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Métadonnées */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.duration}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{item.views}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>{item.likes}</span>
                        </span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${
                        item.difficulty === "Facile" ? "border-success text-success" :
                        item.difficulty === "Intermédiaire" ? "border-warning text-warning" :
                        "border-destructive text-destructive"
                      }`}>
                        {item.difficulty}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button asChild className="flex-1 medical-btn-primary">
                        <Link to={`/edn/${item.slug}`}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Étudier
                        </Link>
                      </Button>
                      {item.hasMusic && (
                        <Button asChild variant="outline" className="flex-1">
                          <Link to={`/edn/${item.slug}?mode=music`}>
                            <Play className="w-4 h-4 mr-2" />
                            Écouter
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* État vide */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun résultat trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("Toutes");
                  setSelectedDifficulty("Toutes");
                  setSelectedRank("Tous");
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
              Transformez vos révisions en musique
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Créez des chansons personnalisées à partir de n'importe quel item EDN avec notre générateur IA
            </p>
            <Button asChild className="medical-btn-primary">
              <Link to="/generator">
                <Music className="w-5 h-5 mr-2" />
                Essayer le générateur
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};

export default EdnComplete;