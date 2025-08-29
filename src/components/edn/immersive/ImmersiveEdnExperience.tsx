import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Palette, 
  Music, 
  Gamepad2, 
  ImageIcon, 
  Sparkles,
  Trophy,
  Target,
  Zap,
  Heart,
  Star,
  ArrowRight,
  ArrowLeft,
  Eye,
  Brain
} from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

interface Section {
  id: SectionType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
  glow: string;
  particles: string[];
  experience: string;
  component: React.ReactNode;
}

interface ImmersiveEdnExperienceProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  item: any;
  children: React.ReactNode;
}

export const ImmersiveEdnExperience = ({ 
  activeSection, 
  onSectionChange, 
  item,
  children 
}: ImmersiveEdnExperienceProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<SectionType>>(new Set());
  const [userProgress, setUserProgress] = useState(0);
  const [currentPoints, setCurrentPoints] = useState(0);

  const sections: Section[] = [
    {
      id: 'tableau-a',
      title: 'Compétences Rang A',
      description: 'Maîtrisez les compétences fondamentales avec un tableau interactif',
      icon: BookOpen,
      color: 'from-blue-600 to-purple-600',
      gradient: 'bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20',
      glow: 'shadow-2xl shadow-blue-500/50',
      particles: ['📚', '🎯', '⭐'],
      experience: 'Fondamental',
      component: children
    },
    {
      id: 'tableau-b',
      title: 'Compétences Rang B',
      description: 'Perfectionnez vos compétences avancées avec expertise',
      icon: Target,
      color: 'from-purple-600 to-pink-600',
      gradient: 'bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-500/20',
      glow: 'shadow-2xl shadow-purple-500/50',
      particles: ['🚀', '💎', '🏆'],
      experience: 'Avancé',
      component: children
    },
    {
      id: 'scene',
      title: 'Scène Immersive',
      description: 'Plongez dans un environnement médical réaliste et interactif',
      icon: Eye,
      color: 'from-emerald-600 to-teal-600',
      gradient: 'bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
      glow: 'shadow-2xl shadow-emerald-500/50',
      particles: ['🌟', '✨', '🎭'],
      experience: 'Immersif',
      component: children
    },
    {
      id: 'bd',
      title: 'Bande Dessinée',
      description: 'Découvrez les concepts à travers une narration visuelle captivante',
      icon: ImageIcon,
      color: 'from-orange-600 to-red-600',
      gradient: 'bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20',
      glow: 'shadow-2xl shadow-orange-500/50',
      particles: ['🎨', '📖', '💫'],
      experience: 'Narratif',
      component: children
    },
    {
      id: 'music',
      title: 'Génération Musicale',
      description: 'Créez et écoutez des chansons pédagogiques personnalisées',
      icon: Music,
      color: 'from-violet-600 to-purple-600',
      gradient: 'bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20',
      glow: 'shadow-2xl shadow-violet-500/50',
      particles: ['🎵', '🎶', '🎤'],
      experience: 'Musical',
      component: children
    },
    {
      id: 'quiz',
      title: 'Quiz Interactif',
      description: 'Testez vos connaissances avec des défis gamifiés',
      icon: Gamepad2,
      color: 'from-amber-600 to-yellow-600',
      gradient: 'bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20',
      glow: 'shadow-2xl shadow-amber-500/50',
      particles: ['🎮', '🏅', '⚡'],
      experience: 'Défi',
      component: children
    }
  ];

  const currentSectionData = sections.find(s => s.id === activeSection)!;
  const currentIndex = sections.findIndex(s => s.id === activeSection);

  const handleSectionChange = async (newSection: SectionType) => {
    if (newSection === activeSection || isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Animation de transition
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onSectionChange(newSection);
    
    // Marquer la section précédente comme complétée
    setCompletedSections(prev => new Set([...prev, activeSection]));
    setCurrentPoints(prev => prev + 100);
    
    setIsTransitioning(false);
  };

  const nextSection = () => {
    if (currentIndex < sections.length - 1) {
      handleSectionChange(sections[currentIndex + 1].id);
    }
  };

  const prevSection = () => {
    if (currentIndex > 0) {
      handleSectionChange(sections[currentIndex - 1].id);
    }
  };

  useEffect(() => {
    const progress = (completedSections.size / sections.length) * 100;
    setUserProgress(progress);
  }, [completedSections, sections.length]);

  // Particules animées en arrière-plan
  const ParticleBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl opacity-30"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: 360
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {currentSectionData.particles[i % currentSectionData.particles.length]}
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Arrière-plan dynamique */}
      <motion.div 
        className={`absolute inset-0 ${currentSectionData.gradient}`}
        key={activeSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      
      <ParticleBackground />

      {/* Header immersif */}
      <motion.div 
        className="relative z-10 pt-8 pb-6"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="container mx-auto px-6">
          <Card className="bg-white/10 backdrop-blur-2xl border-white/20 overflow-hidden">
            <div className="p-6">
              {/* Barre de progression et points */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-semibold">{currentPoints} XP</span>
                  </motion.div>
                  
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <span className="text-white/80 text-sm">
                      {completedSections.size}/{sections.length} complétés
                    </span>
                  </div>
                </div>
                
                <Badge 
                  variant="secondary" 
                  className="bg-white/20 text-white border-white/30"
                >
                  {item.item_code}
                </Badge>
              </div>

              {/* Titre et progression */}
              <div className="text-center mb-8">
                <motion.h1 
                  className="text-4xl font-bold text-white mb-2"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  {item.title}
                </motion.h1>
                
                <motion.p 
                  className="text-white/80 text-lg mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {item.subtitle}
                </motion.p>

                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                    <span>Progression générale</span>
                    <span>{Math.round(userProgress)}%</span>
                  </div>
                  <Progress 
                    value={userProgress} 
                    className="h-3 bg-white/20"
                  />
                </div>
              </div>

              {/* Section actuelle */}
              <motion.div 
                className="text-center"
                key={activeSection}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r ${currentSectionData.color} ${currentSectionData.glow} transform transition-all duration-300`}>
                  <currentSectionData.icon className="h-6 w-6 text-white" />
                  <span className="text-white font-semibold text-lg">
                    {currentSectionData.title}
                  </span>
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    {currentSectionData.experience}
                  </Badge>
                </div>
                
                <p className="text-white/80 mt-3 max-w-2xl mx-auto">
                  {currentSectionData.description}
                </p>
              </motion.div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Navigation des sections */}
      <motion.div 
        className="relative z-10 mb-8"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="container mx-auto px-6">
          <Card className="bg-white/10 backdrop-blur-2xl border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  onClick={prevSection}
                  disabled={currentIndex === 0}
                  className="text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>

                <div className="flex items-center gap-2">
                  {sections.map((section, index) => (
                    <motion.div
                      key={section.id}
                      className="relative"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Button
                        variant={activeSection === section.id ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleSectionChange(section.id)}
                        className={`relative overflow-hidden ${
                          activeSection === section.id 
                            ? `bg-gradient-to-r ${section.color} text-white ${section.glow}` 
                            : 'text-white/70 hover:text-white hover:bg-white/20'
                        }`}
                        disabled={isTransitioning}
                      >
                        <section.icon className="h-4 w-4 mr-2" />
                        <span className="hidden md:inline">{section.title}</span>
                        
                        {completedSections.has(section.id) && (
                          <motion.div
                            className="absolute top-0 right-0 -translate-y-1 translate-x-1"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                          >
                            <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                              <Star className="h-2 w-2 text-white" />
                            </div>
                          </motion.div>
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  onClick={nextSection}
                  disabled={currentIndex === sections.length - 1}
                  className="text-white hover:bg-white/20 disabled:opacity-30"
                >
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <motion.div 
        className="relative z-10 pb-20"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="container mx-auto px-6">
          <Card className={`bg-white/95 backdrop-blur-2xl border-white/30 ${currentSectionData.glow} overflow-hidden`}>
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: isTransitioning ? 100 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Floating Action Button pour retour rapide */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <Button
          size="lg"
          className={`rounded-full bg-gradient-to-r ${currentSectionData.color} ${currentSectionData.glow} hover:scale-110 transition-transform duration-300`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Brain className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Overlay de transition */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg font-semibold">
                Transition en cours...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};