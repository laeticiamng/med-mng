import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Brain, 
  Camera, 
  Music, 
  HelpCircle,
  CheckCircle,
  Clock,
  Target,
  Star,
  Award
} from 'lucide-react';

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

interface SectionProgress {
  sectionId: SectionType;
  completed: boolean;
  timeSpent: number;
  interactions: number;
  score?: number;
}

interface AdvancedEdnNavigationProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  competences: string[];
  itemTitle: string;
  progress?: SectionProgress[];
}

export const AdvancedEdnNavigation = ({
  activeSection,
  onSectionChange,
  competences,
  itemTitle,
  progress = []
}: AdvancedEdnNavigationProps) => {
  
  const sections = [
    {
      id: 'tableau-a' as SectionType,
      title: 'Compétences Rang A',
      description: 'Concepts fondamentaux et diagnostics',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      competenceType: 'Diagnostic'
    },
    {
      id: 'tableau-b' as SectionType,
      title: 'Compétences Rang B',
      description: 'Prise en charge et thérapeutique',
      icon: Target,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      competenceType: 'Thérapeutique'
    },
    {
      id: 'scene' as SectionType,
      title: 'Scène Immersive',
      description: 'Simulation clinique interactive',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      competenceType: 'Simulation'
    },
    {
      id: 'bd' as SectionType,
      title: 'Bande Dessinée',
      description: 'Apprentissage visuel et narratif',
      icon: Camera,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      competenceType: 'Visuel'
    },
    {
      id: 'music' as SectionType,
      title: 'Génération Musicale',
      description: 'Mémorisation par la musique',
      icon: Music,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      competenceType: 'Auditif'
    },
    {
      id: 'quiz' as SectionType,
      title: 'Quiz Interactif',
      description: 'Évaluation des connaissances',
      icon: HelpCircle,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      competenceType: 'Évaluation'
    }
  ];

  const getSectionProgress = (sectionId: SectionType) => {
    return progress.find(p => p.sectionId === sectionId);
  };

  const getTotalProgress = () => {
    if (progress.length === 0) return 0;
    const completedSections = progress.filter(p => p.completed).length;
    return (completedSections / sections.length) * 100;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* En-tête de progression globale */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{itemTitle}</h2>
              <p className="text-muted-foreground">Parcours d'apprentissage interactif</p>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">{Math.round(getTotalProgress())}%</span>
            </div>
          </div>
          
          <Progress value={getTotalProgress()} className="h-2" />
          
          <div className="flex flex-wrap gap-1">
            {competences.slice(0, 4).map((competence) => (
              <Badge key={competence} variant="secondary" className="text-xs">
                {competence}
              </Badge>
            ))}
            {competences.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{competences.length - 4}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Navigation des sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => {
          const sectionProgress = getSectionProgress(section.id);
          const isActive = activeSection === section.id;
          const isCompleted = sectionProgress?.completed || false;
          const IconComponent = section.icon;
          
          return (
            <motion.div
              key={section.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`p-4 cursor-pointer transition-all duration-300 ${
                  isActive 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:shadow-md'
                } ${isCompleted ? 'bg-green-50 dark:bg-green-900/10' : ''}`}
                onClick={() => onSectionChange(section.id)}
              >
                <div className="space-y-3">
                  {/* En-tête de section */}
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${section.bgColor}`}>
                      <div className={`w-8 h-8 rounded bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {isCompleted && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {isActive && (
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Contenu de section */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm leading-tight">
                      {section.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {section.description}
                    </p>
                    
                    <Badge variant="outline" className="text-xs">
                      {section.competenceType}
                    </Badge>
                  </div>

                  {/* Statistiques de progression */}
                  {sectionProgress && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(sectionProgress.timeSpent)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>{sectionProgress.interactions}</span>
                        </div>
                      </div>
                      
                      {sectionProgress.score !== undefined && (
                        <div className="text-xs">
                          <div className="flex justify-between items-center">
                            <span>Score</span>
                            <span className="font-semibold">{sectionProgress.score}%</span>
                          </div>
                          <Progress 
                            value={sectionProgress.score} 
                            className="h-1 mt-1" 
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recommandations d'apprentissage */}
      <Card className="p-4">
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Recommandations personnalisées
          </h3>
          
          <div className="text-xs text-muted-foreground space-y-1">
            {getTotalProgress() === 0 && (
              <p>💡 Commencez par les compétences Rang A pour établir les bases</p>
            )}
            {getTotalProgress() > 0 && getTotalProgress() < 50 && (
              <p>📚 Continuez avec la scène immersive pour approfondir vos connaissances</p>
            )}
            {getTotalProgress() >= 50 && getTotalProgress() < 80 && (
              <p>🎯 Testez vos connaissances avec le quiz interactif</p>
            )}
            {getTotalProgress() >= 80 && (
              <p>🎉 Excellent progrès ! Consolidez avec la génération musicale</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};