/**
 * Routeur de production pour les composants EDN avancés
 * Intègre tous les composants avec les vraies APIs
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEdnAdvanced, EdnAdvancedItem } from '@/hooks/useEdnAdvanced';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import des composants avancés connectés aux APIs
import { AdvancedSceneImmersive } from './AdvancedSceneImmersive';
import { AdvancedGenerationMusicale } from './AdvancedGenerationMusicale';
import { AdvancedBandeDessinee } from './AdvancedBandeDessinee';
import { AdvancedQuizInteractif } from './AdvancedQuizInteractif';
import { EnhancedTableauDisplay } from './EnhancedTableauDisplay';

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

export const ProductionEdnRouter: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { loadEdnItem, saveProgress, loading, error } = useEdnAdvanced();
  
  const [item, setItem] = useState<EdnAdvancedItem | null>(null);
  const [activeSection, setActiveSection] = useState<SectionType>('tableau-a');
  const [sectionProgress, setSectionProgress] = useState<Record<string, number>>({});
  const [completedSections, setCompletedSections] = useState<Set<SectionType>>(new Set());

  // Chargement de l'item au montage
  useEffect(() => {
    if (slug) {
      loadEdnItem(slug).then(setItem);
    }
  }, [slug, loadEdnItem]);

  // Sauvegarde automatique des progrès
  useEffect(() => {
    if (item && Object.keys(sectionProgress).length > 0) {
      saveProgress(item.id, activeSection, {
        sectionProgress,
        completedSections: Array.from(completedSections),
        lastAccessed: new Date().toISOString()
      });
    }
  }, [item, sectionProgress, completedSections, activeSection, saveProgress]);

  const handleSectionProgress = (section: SectionType, progress: number) => {
    setSectionProgress(prev => ({
      ...prev,
      [section]: progress
    }));

    if (progress >= 100) {
      setCompletedSections(prev => new Set([...prev, section]));
    }
  };

  const getOverallProgress = () => {
    const sections: SectionType[] = ['tableau-a', 'tableau-b', 'scene', 'bd', 'music', 'quiz'];
    const totalProgress = sections.reduce((sum, section) => sum + (sectionProgress[section] || 0), 0);
    return Math.round(totalProgress / sections.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-semibold text-foreground">Chargement de l'item EDN</h2>
          <p className="text-muted-foreground">Connexion aux APIs de production...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-destructive">Erreur de chargement</h2>
          <p className="text-muted-foreground">{error || 'Item non trouvé'}</p>
          <Link to="/edn">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste EDN
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header avec informations item */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link to="/edn">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour EDN
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{item.title}</h1>
                  <p className="text-sm text-muted-foreground">{item.item_code}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="font-medium">
                {getOverallProgress()}% complété
              </Badge>
              <div className="w-32">
                <Progress value={getOverallProgress()} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec navigation par onglets */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as SectionType)}>
          <TabsList className="grid grid-cols-6 w-full max-w-4xl mx-auto mb-8">
            <TabsTrigger value="tableau-a" className="flex items-center space-x-2">
              <span>📊</span>
              <span className="hidden sm:inline">Tableau A</span>
              {completedSections.has('tableau-a') && <span className="text-green-500">✓</span>}
            </TabsTrigger>
            <TabsTrigger value="tableau-b" className="flex items-center space-x-2">
              <span>📈</span>
              <span className="hidden sm:inline">Tableau B</span>
              {completedSections.has('tableau-b') && <span className="text-green-500">✓</span>}
            </TabsTrigger>
            <TabsTrigger value="scene" className="flex items-center space-x-2">
              <span>🎭</span>
              <span className="hidden sm:inline">Scène</span>
              {completedSections.has('scene') && <span className="text-green-500">✓</span>}
            </TabsTrigger>
            <TabsTrigger value="bd" className="flex items-center space-x-2">
              <span>📚</span>
              <span className="hidden sm:inline">BD</span>
              {completedSections.has('bd') && <span className="text-green-500">✓</span>}
            </TabsTrigger>
            <TabsTrigger value="music" className="flex items-center space-x-2">
              <span>🎵</span>
              <span className="hidden sm:inline">Musique</span>
              {completedSections.has('music') && <span className="text-green-500">✓</span>}
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center space-x-2">
              <span>❓</span>
              <span className="hidden sm:inline">Quiz</span>
              {completedSections.has('quiz') && <span className="text-green-500">✓</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tableau-a">
            <EnhancedTableauDisplay 
              item={item} 
              rang="A"
              onProgress={(progress) => handleSectionProgress('tableau-a', progress)}
            />
          </TabsContent>

          <TabsContent value="tableau-b">
            <EnhancedTableauDisplay 
              item={item} 
              rang="B"
              onProgress={(progress) => handleSectionProgress('tableau-b', progress)}
            />
          </TabsContent>

          <TabsContent value="scene">
            <AdvancedSceneImmersive 
              item={item}
              onProgress={(progress) => handleSectionProgress('scene', progress)}
            />
          </TabsContent>

          <TabsContent value="bd">
            <AdvancedBandeDessinee 
              item={item}
              onProgress={(progress) => handleSectionProgress('bd', progress)}
            />
          </TabsContent>

          <TabsContent value="music">
            <AdvancedGenerationMusicale 
              item={item}
              onProgress={(progress) => handleSectionProgress('music', progress)}
            />
          </TabsContent>

          <TabsContent value="quiz">
            <AdvancedQuizInteractif 
              item={item}
              onProgress={(progress) => handleSectionProgress('quiz', progress)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};