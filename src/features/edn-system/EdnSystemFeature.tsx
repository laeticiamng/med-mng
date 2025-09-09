// ============================================================================
// FEATURE: EDN SYSTEM - Fonctionnalité complète (autonome)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Clock, 
  Target, 
  Star,
  TrendingUp,
  CheckCircle,
  Play,
  Bookmark,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// Hooks et services (à créer)
import { useEdnController } from './hooks/useEdnController';
import { EdnItemCard } from './components/EdnItemCard';
import { EdnProgressChart } from './components/EdnProgressChart';
import { EdnSearchFilters } from './components/EdnSearchFilters';

// Types
import { EDNCategory, DifficultyLevel } from '@med-mng/types';

// ============================================================================
// FEATURE COMPONENT PRINCIPAL
// ============================================================================

export const EdnSystemFeature: React.FC = () => {
  // Controller pour orchestrer la logique
  const {
    items,
    userProgress,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    loading,
    error,
    startItem,
    bookmarkItem,
    getRecommendations,
    getProgressStats
  } = useEdnController();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Stats dérivées
  const progressStats = getProgressStats();
  const recommendations = getRecommendations();

  // ============================================================================
  // RENDU
  // ============================================================================

  return (
    <>
      <Helmet>
        <title>Items EDN - Système d'apprentissage médical</title>
        <meta name="description" content="Parcourez et maîtrisez les 367 items EDN avec notre système d'apprentissage adaptatif" />
      </Helmet>

      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        
        {/* Header avec statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Système EDN
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Maîtrisez les 367 items EDN avec notre approche personnalisée et adaptative
            </p>
          </div>

          {/* Statistiques de progression */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Progression globale</p>
                    <p className="text-2xl font-bold">{progressStats.completionRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={progressStats.completionRate} className="mt-3" />
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Items complétés</p>
                    <p className="text-2xl font-bold">{progressStats.completedItems}/{progressStats.totalItems}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Temps d'étude</p>
                    <p className="text-2xl font-bold">{Math.floor(progressStats.totalTimeSpent / 60)}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-gold">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Items maîtrisés</p>
                    <p className="text-2xl font-bold">{progressStats.masteredItems}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Section recommandations */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recommandations personnalisées
              </CardTitle>
              <CardDescription>
                Items suggérés selon votre progression et votre niveau
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.slice(0, 6).map((item) => (
                  <EdnItemCard
                    key={item.id}
                    item={item}
                    progress={userProgress.find(p => p.itemId === item.id)}
                    onStart={() => startItem(item.id)}
                    onBookmark={() => bookmarkItem(item.id)}
                    variant="compact"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recherche et filtres */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Explorer les items EDN
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
                <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grille</SelectItem>
                    <SelectItem value="list">Liste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un item EDN (titre, mots-clés, numéro)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres avancés */}
            {showFilters && (
              <EdnSearchFilters
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedDifficulty={selectedDifficulty}
                onDifficultyChange={setSelectedDifficulty}
              />
            )}

            {/* Résultats */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">Erreur lors du chargement des items EDN</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Réessayer
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {items.map((item) => (
                  <EdnItemCard
                    key={item.id}
                    item={item}
                    progress={userProgress.find(p => p.itemId === item.id)}
                    onStart={() => startItem(item.id)}
                    onBookmark={() => bookmarkItem(item.id)}
                    variant={viewMode === 'grid' ? 'full' : 'list'}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {items.length === 0 && !loading && (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun item trouvé avec ces critères</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(undefined);
                    setSelectedDifficulty(undefined);
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Graphique de progression */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analyse de progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EdnProgressChart userProgress={userProgress} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EdnSystemFeature;