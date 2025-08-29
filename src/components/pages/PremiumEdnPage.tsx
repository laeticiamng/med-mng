import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Filter, Music, Brain, Zap, CheckCircle, Award, 
  TrendingUp, BookOpen, Stethoscope, GraduationCap,
  Play, Heart, Star, Clock, Users, BarChart3
} from 'lucide-react';
import { useEdnItemsPaginated, useEdnStats, EdnItemLight } from '@/hooks/useEdnItemsPaginated';
import { useBreakpoints } from "@/hooks/useBreakpoints";
import { cn } from '@/lib/utils';

export const PremiumEdnPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { isMobile } = useBreakpoints();
  
  const itemsPerPage = isMobile ? 8 : 20;
  const { items, totalCount, loading, totalPages } = useEdnItemsPaginated(currentPage, itemsPerPage);
  const { stats, loading: statsLoading } = useEdnStats();

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    if (!items) return [];
    
    return items.filter(item => {
      const matchesSearch = !searchTerm || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.specialite && item.specialite.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchesSearch) return false;
      
      switch (selectedCategory) {
        case 'complete':
          return (item.completeness_score || 0) >= 100;
        case 'withMusic':
          return item.has_music;
        case 'validated':
          return item.is_validated;
        case 'highPriority':
          return (item.completeness_score || 0) < 50;
        default:
          return true;
      }
    });
  }, [items, searchTerm, selectedCategory]);

  const handleItemClick = (item: EdnItemLight) => {
    navigate(`/edn/${item.slug}`);
  };

  const categories = [
    { id: 'all', label: 'Tous les items', count: totalCount },
    { id: 'withMusic', label: 'Avec musique', count: stats?.withMusic || 0 },
    { id: 'complete', label: 'Complétés', count: stats?.complete || 0 },
    { id: 'validated', label: 'Validés', count: stats?.validated || 0 },
    { id: 'highPriority', label: 'Priorité haute', count: stats?.highPriority || 0 }
  ];

  return (
    <div className="space-y-8">
      {/* Header Premium */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-3 glass-medical px-6 py-3 rounded-full">
          <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="heading-premium text-lg font-semibold">Items EDN Premium</span>
          <Badge className="status-success">367 Items</Badge>
        </div>
        
        <div className="space-y-4">
          <h1 className="heading-premium text-4xl md:text-5xl font-bold">
            Maîtrisez tous les items EDN
            <br />
            <span className="bg-gradient-premium bg-clip-text text-transparent">
              avec l'IA musicale
            </span>
          </h1>
          
          <p className="text-premium text-lg max-w-3xl mx-auto leading-relaxed">
            Transformez chaque item EDN en chanson mémorable. Notre IA crée des 
            contenus musicaux personnalisés pour une mémorisation exceptionnelle.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-glass text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Items total</div>
            </CardContent>
          </Card>
          
          <Card className="card-glass text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent">{stats.withMusic}</div>
              <div className="text-sm text-muted-foreground">Avec musique</div>
            </CardContent>
          </Card>
          
          <Card className="card-glass text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500">{stats.complete}</div>
              <div className="text-sm text-muted-foreground">Complétés</div>
            </CardContent>
          </Card>
          
          <Card className="card-glass text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-500">
                {Math.round((stats.complete / stats.total) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Progression</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un item EDN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="medical-input pl-10"
              />
            </div>
            
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "transition-all duration-200",
                    selectedCategory === category.id 
                      ? "medical-btn-primary shadow-glow" 
                      : "medical-btn-outline"
                  )}
                >
                  {category.label}
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="premium-skeleton h-64" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="card-glass text-center p-12">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="heading-premium text-xl font-semibold">
                Aucun item trouvé
              </h3>
              <p className="text-premium">
                {searchTerm 
                  ? `Aucun résultat pour "${searchTerm}"` 
                  : 'Aucun item ne correspond aux filtres sélectionnés'
                }
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        </Card>
      ) : (
        <div className="medical-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => {
            const completionPercentage = item.completeness_score || 0;
            const competencies_count = item.competencies_count || 0;

            return (
              <Card 
                key={item.id}
                className="card-glass premium-hover cursor-pointer group h-full"
                onClick={() => handleItemClick(item)}
              >
                <CardHeader className="space-y-4">
                  {/* Header with Code and Progress */}
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className="bg-primary/10 text-primary border-primary/20 font-semibold"
                    >
                      {item.item_code}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-muted rounded-full h-2">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {completionPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <CardTitle className="heading-premium text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </CardTitle>

                  {/* Specialty */}
                  {item.specialite && (
                    <p className="text-premium text-sm opacity-80">
                      {item.specialite}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Content Indicators */}
                  <div className="flex items-center gap-3">
                    {item.has_music && (
                      <div className="flex items-center gap-1.5 text-accent">
                        <Music className="h-4 w-4" />
                        <span className="text-xs font-medium">Musique IA</span>
                      </div>
                    )}
                    {item.has_scene_analysis && (
                      <div className="flex items-center gap-1.5 text-primary">
                        <Brain className="h-4 w-4" />
                        <span className="text-xs font-medium">Analyse</span>
                      </div>
                    )}
                    {item.has_quiz && (
                      <div className="flex items-center gap-1.5 text-purple-500">
                        <Zap className="h-4 w-4" />
                        <span className="text-xs font-medium">Quiz</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    {item.is_validated && (
                      <Badge className="status-success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Validé
                      </Badge>
                    )}
                    
                    {competencies_count > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          {competencies_count} compétences
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="medical-btn-outline"
          >
            Précédent
          </Button>
          
          <div className="glass-medical px-4 py-2 rounded-lg">
            <span className="text-sm font-semibold text-primary">
              Page {currentPage} sur {totalPages}
            </span>
          </div>
          
          <Button
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="medical-btn-outline"
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="card-glass premium-hover cursor-pointer"
          onClick={() => navigate('/generator')}
        >
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto">
              <Music className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="heading-premium font-semibold mb-2">Créer une chanson</h3>
              <p className="text-premium text-sm">
                Transformez n'importe quel item en chanson mémorable
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="card-glass premium-hover cursor-pointer"
          onClick={() => navigate('/chat')}
        >
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="heading-premium font-semibold mb-2">Assistant IA</h3>
              <p className="text-premium text-sm">
                Posez vos questions sur les items EDN
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="card-glass premium-hover cursor-pointer"
          onClick={() => navigate('/analytics')}
        >
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="heading-premium font-semibold mb-2">Analytics</h3>
              <p className="text-premium text-sm">
                Analysez vos progrès d'apprentissage
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};