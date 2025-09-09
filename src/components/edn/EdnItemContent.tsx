import React, { memo, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Music, 
  Brain, 
  Play, 
  Users, 
  Award,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { useOptimizedAccessibility } from '@/hooks/useOptimizedAccessibility';

// Lazy load des composants pour optimiser le chargement
const TableauRangA = React.lazy(() => import('@/components/edn/tableau/TableauRangA').then(module => ({ default: module.default })));
const TableauRangB = React.lazy(() => import('@/components/edn/tableau/TableauRangB').then(module => ({ default: module.default })));
const SceneImmersive = React.lazy(() => import('@/components/edn/scene/SceneImmersive').then(module => ({ default: module.default })));
const GenerationMusicale = React.lazy(() => import('@/components/edn/music/GenerationMusicale').then(module => ({ default: module.default })));
const QuizInteractif = React.lazy(() => import('@/components/edn/quiz/QuizInteractif').then(module => ({ default: module.default })));
const BandeDessinee = React.lazy(() => import('@/components/edn/comic/BandeDessinee').then(module => ({ default: module.default })));

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

interface EdnItemData {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  paroles_musicales?: string[];
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  scene_immersive?: any;
  quiz_questions?: any[];
  competences_oic_rang_a?: any[];
  competences_oic_rang_b?: any[];
  created_at: string;
  updated_at: string;
}

interface EdnItemContentProps {
  activeSection: SectionType;
  item: EdnItemData;
  onProgress?: (section: SectionType, progress: number) => void;
}

const LoadingFallback = memo(() => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">
        <TranslatedText text="Chargement du contenu..." />
      </p>
    </div>
  </div>
));

const sectionConfigs = {
  'tableau-a': {
    title: 'Compétences Rang A',
    description: 'Objectifs de base et compétences fondamentales',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-600',
    level: 'Fondamental'
  },
  'tableau-b': {
    title: 'Compétences Rang B',
    description: 'Compétences avancées et expertise approfondie',
    icon: Target,
    color: 'from-indigo-500 to-purple-600',
    level: 'Avancé'
  },
  'scene': {
    title: 'Scène Immersive',
    description: 'Simulation interactive et environnement 3D',
    icon: Play,
    color: 'from-green-500 to-emerald-600',
    level: 'Immersif'
  },
  'bd': {
    title: 'Bande Dessinée',
    description: 'Apprentissage narratif et visuel',
    icon: Sparkles,
    color: 'from-orange-500 to-red-600',
    level: 'Créatif'
  },
  'music': {
    title: 'Génération Musicale',
    description: 'Chansons éducatives personnalisées par IA',
    icon: Music,
    color: 'from-purple-500 to-pink-600',
    level: 'Musical'
  },
  'quiz': {
    title: 'Quiz Interactif',
    description: 'Évaluation adaptative et gamifiée',
    icon: Brain,
    color: 'from-amber-500 to-yellow-600',
    level: 'Défi'
  }
};

export const EdnItemContent = memo(({ 
  activeSection, 
  item, 
  onProgress 
}: EdnItemContentProps) => {
  const { announceToScreenReader } = useOptimizedAccessibility();
  const config = sectionConfigs[activeSection];

  const handleProgressUpdate = (progress: number) => {
    onProgress?.(activeSection, progress);
    if (progress === 100) {
      announceToScreenReader(`Section ${config.title} terminée avec succès`, 'polite');
    }
  };

  const renderSectionContent = () => {
    const commonProps = {
      item,
      onProgress: handleProgressUpdate
    };

    switch (activeSection) {
      case 'tableau-a':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <TableauRangA 
              {...commonProps}
              data={item.tableau_rang_a}
              competences={item.competences_oic_rang_a}
            />
          </Suspense>
        );
      
      case 'tableau-b':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <TableauRangB 
              {...commonProps}
              data={item.tableau_rang_b}
              competences={item.competences_oic_rang_b}
            />
          </Suspense>
        );
      
      case 'scene':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <SceneImmersive 
              {...commonProps}
              sceneData={item.scene_immersive}
            />
          </Suspense>
        );
      
      case 'bd':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <BandeDessinee 
              {...commonProps}
              storyData={item}
            />
          </Suspense>
        );
      
      case 'music':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <GenerationMusicale 
              {...commonProps}
              paroles={item.paroles_musicales}
            />
          </Suspense>
        );
      
      case 'quiz':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <QuizInteractif 
              {...commonProps}
              questions={item.quiz_questions}
            />
          </Suspense>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              <TranslatedText text="Section en cours de développement" />
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header de section */}
      <Card className="overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${config.color}`} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                <config.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {config.title}
                </h2>
                <p className="text-muted-foreground">
                  {config.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`bg-gradient-to-r ${config.color} text-white border-0`}
              >
                {config.level}
              </Badge>
              <Badge variant="outline">
                {item.item_code}
              </Badge>
            </div>
          </div>

          {/* Méta-informations */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Mis à jour: {new Date(item.updated_at).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Version collaborative</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Certifié E-LiSA</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Contenu de la section */}
      <Card className="overflow-hidden">
        <div className="p-6">
          {renderSectionContent()}
        </div>
      </Card>
    </div>
  );
});

EdnItemContent.displayName = 'EdnItemContent';