import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  Award, 
  Music, 
  Brain, 
  Gamepad2, 
  Image,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Tag,
  Users
} from 'lucide-react';
import { TableauCompetencesOICWithRealData } from '@/components/edn/tableau/TableauCompetencesOICWithRealData';
import { SceneImmersive } from '@/components/edn/SceneImmersive';
import { ParolesMusicales } from '@/components/edn/ParolesMusicales';
import { EnhancedQuizFinal } from '@/components/edn/EnhancedQuizFinal';
import { EnhancedBandeDessinee } from '@/components/edn/EnhancedBandeDessinee';
import { useEdnItemComplete } from '@/hooks/useEdnItemsComplete';

interface EdnItemDetailHybridProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Section {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  available: boolean;
  component: React.ReactNode;
  progress?: number;
}

export const EdnItemDetailHybrid: React.FC<EdnItemDetailHybridProps> = ({
  slug,
  isOpen,
  onClose
}) => {
  const { item, loading, error } = useEdnItemComplete(slug);
  const [activeSection, setActiveSection] = useState('competences-a');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCompletenessColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletenessText = (score?: number) => {
    if (!score) return 'Non évalué';
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Bon';
    return 'À améliorer';
  };

  if (!item) return null;

  const sections: Section[] = [
    {
      id: 'competences-a',
      label: 'Compétences Rang A',
      icon: Award,
      available: true,
      component: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Compétences fondamentales - Rang A
            </h3>
            <p className="text-blue-600 dark:text-blue-300 text-sm">
              Données en temps réel depuis la base OIC
            </p>
          </div>
          <TableauCompetencesOICWithRealData 
            itemCode={item.item_code} 
            rang="A" 
          />
        </div>
      )
    },
    {
      id: 'competences-b',
      label: 'Compétences Rang B',
      icon: Award,
      available: true,
      component: (
        <div className="space-y-4">
          <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
              Compétences avancées - Rang B
            </h3>
            <p className="text-purple-600 dark:text-purple-300 text-sm">
              Données en temps réel depuis la base OIC
            </p>
          </div>
          <TableauCompetencesOICWithRealData 
            itemCode={item.item_code} 
            rang="B" 
          />
        </div>
      )
    },
    {
      id: 'scene',
      label: 'Scène Immersive',
      icon: Brain,
      available: !!item.scene_immersive,
      component: item.scene_immersive ? (
        <SceneImmersive data={item.scene_immersive} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Scène immersive en cours de développement</p>
        </div>
      )
    },
    {
      id: 'bd',
      label: 'Bande Dessinée',
      icon: Image,
      available: !!(item.tableau_rang_a || item.tableau_rang_b),
      component: (
        <EnhancedBandeDessinee 
          itemData={{
            title: item.title,
            subtitle: item.subtitle || '',
            slug: item.slug,
            item_code: item.item_code,
            tableau_rang_a: item.tableau_rang_a,
            tableau_rang_b: item.tableau_rang_b
          }}
        />
      )
    },
    {
      id: 'music',
      label: 'Paroles Musicales',
      icon: Music,
      available: !!(item.paroles_musicales?.length),
      component: (
        <ParolesMusicales 
          paroles={item.paroles_musicales} 
          paroles_rang_a={undefined}
          paroles_rang_b={undefined}
          paroles_rang_ab={undefined}
          itemCode={item.item_code}
          tableauRangA={item.tableau_rang_a}
          tableauRangB={item.tableau_rang_b}
        />
      )
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: Gamepad2,
      available: !!item.quiz_questions,
      component: item.quiz_questions ? (
        <EnhancedQuizFinal 
          questions={item.quiz_questions} 
          itemCode={item.item_code}
          itemTitle={item.title}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Quiz en cours de développement</p>
        </div>
      )
    }
  ];

  const availableSections = sections.filter(s => s.available);
  const currentSectionIndex = availableSections.findIndex(s => s.id === activeSection);
  const currentSection = availableSections[currentSectionIndex];

  const goToPrevious = () => {
    if (currentSectionIndex > 0) {
      setActiveSection(availableSections[currentSectionIndex - 1].id);
    }
  };

  const goToNext = () => {
    if (currentSectionIndex < availableSections.length - 1) {
      setActiveSection(availableSections[currentSectionIndex + 1].id);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !item) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-12">
            <p className="text-destructive">Erreur lors du chargement de l'item</p>
            <Button onClick={onClose} className="mt-4">Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] max-h-[98vh] w-full h-full overflow-hidden p-0 gap-0 flex flex-col">
        <DialogTitle className="sr-only">{item.title}</DialogTitle>
        
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b">
          <div className="p-3 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                  <Badge variant="outline" className="text-xs md:text-sm px-2 py-1">
                    {item.item_code}
                  </Badge>
                  {item.is_validated && (
                    <Badge variant="default" className="bg-green-500 text-xs md:text-sm">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Validé
                    </Badge>
                  )}
                </div>
                <h1 className="text-lg md:text-2xl font-bold mb-1 line-clamp-2">{item.title}</h1>
                {item.subtitle && (
                  <p className="text-sm md:text-base text-muted-foreground line-clamp-2">{item.subtitle}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1 md:gap-2">
                    <span className={`text-lg md:text-xl font-bold ${getCompletenessColor(item.completeness_score)}`}>
                      {item.completeness_score || 0}%
                    </span>
                    <span className="text-xs md:text-sm text-muted-foreground hidden md:inline">
                      {getCompletenessText(item.completeness_score)}
                    </span>
                  </div>
                  <Progress 
                    value={item.completeness_score || 0} 
                    className="w-16 md:w-24 h-1.5 md:h-2"
                  />
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0"
                >
                  <X className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>

            {/* Métadonnées compactes */}
            <div className="flex items-center gap-3 md:gap-6 mt-3 text-xs md:text-sm text-muted-foreground overflow-x-auto pb-2">
              {item.specialite && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Tag className="h-3 w-3" />
                  <span className="truncate">{item.specialite}</span>
                </div>
              )}
              {item.competences_count_total !== undefined && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Users className="h-3 w-3" />
                  <span>{item.competences_count_total} compétences</span>
                </div>
              )}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Clock className="h-3 w-3" />
                <span className="truncate">{formatDate(item.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Fixed */}
        <div className="flex-shrink-0 px-3 md:px-6 py-2 md:py-3 border-b bg-muted/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                disabled={currentSectionIndex === 0}
                className="hidden md:flex"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                disabled={currentSectionIndex === 0}
                className="md:hidden h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-xs md:text-sm text-muted-foreground px-1 md:px-2 flex-shrink-0">
                {currentSectionIndex + 1} / {availableSections.length}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                disabled={currentSectionIndex === availableSections.length - 1}
                className="hidden md:flex"
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                disabled={currentSectionIndex === availableSections.length - 1}
                className="md:hidden h-8 w-8 p-0"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              {availableSections.map((section, index) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveSection(section.id)}
                  className="flex items-center gap-1 md:gap-2 flex-shrink-0 text-xs md:text-sm"
                >
                  <section.icon className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline truncate max-w-20 md:max-w-none">{section.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu avec scroll corrigé - Flexible */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-3 md:p-6">
            <div className="max-w-none md:max-w-6xl mx-auto">
              {currentSection && (
                <div className="animate-in fade-in-50 duration-300">
                  {currentSection.component}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};