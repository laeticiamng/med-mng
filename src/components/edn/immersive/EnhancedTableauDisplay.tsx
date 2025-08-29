import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Target, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2,
  Eye,
  Zap,
  ArrowRight,
  Star,
  Trophy,
  Brain,
  Sparkles
} from 'lucide-react';
import { TableauCompetencesOICWithRealData } from '@/components/edn/tableau/TableauCompetencesOICWithRealData';

interface EnhancedTableauDisplayProps {
  itemCode: string;
  rang: 'A' | 'B';
  title: string;
}

export const EnhancedTableauDisplay = ({ itemCode, rang, title }: EnhancedTableauDisplayProps) => {
  const [currentCompetence, setCurrentCompetence] = useState(0);
  const [isExploring, setIsExploring] = useState(false);
  const [masteredConcepts, setMasteredConcepts] = useState<Set<number>>(new Set());
  const [userProgress, setUserProgress] = useState(0);
  const [showInsights, setShowInsights] = useState(false);

  const rangConfig = {
    A: {
      title: 'Compétences Fondamentales',
      subtitle: 'Les bases essentielles à maîtriser',
      color: 'from-blue-600 to-purple-600',
      bgGradient: 'from-blue-50 via-purple-50 to-indigo-50',
      icon: BookOpen,
      particles: ['📚', '⭐', '🎯'],
      description: 'Découvrez les compétences fondamentales qui constituent la base de votre expertise médicale.'
    },
    B: {
      title: 'Compétences Avancées',
      subtitle: 'Perfectionnement et expertise',
      color: 'from-purple-600 to-pink-600',
      bgGradient: 'from-purple-50 via-pink-50 to-rose-50',
      icon: Target,
      particles: ['🚀', '💎', '🏆'],
      description: 'Approfondissez vos connaissances avec des compétences de niveau expert.'
    }
  };

  const config = rangConfig[rang];

  // Animation des particules de fond
  const ParticleField = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl opacity-20"
          initial={{ 
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            rotate: 0
          }}
          animate={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            rotate: 360
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {config.particles[i % config.particles.length]}
        </motion.div>
      ))}
    </div>
  );

  // Animations d'entrée séquentielles
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  // Mise à jour de la progression
  useEffect(() => {
    const totalConcepts = 10; // Approximation basée sur les données typiques
    const progress = (masteredConcepts.size / totalConcepts) * 100;
    setUserProgress(progress);
  }, [masteredConcepts]);

  const handleConceptMastery = (conceptIndex: number) => {
    setMasteredConcepts(prev => new Set([...prev, conceptIndex]));
  };

  const toggleExploreMode = () => {
    setIsExploring(!isExploring);
    setShowInsights(true);
  };

  return (
    <motion.div
      className="relative min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Arrière-plan avec dégradé dynamique */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-30`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
      />
      
      <ParticleField />

      <div className="relative z-10 space-y-8">
        {/* Header immersive */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden bg-white/80 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader className={`bg-gradient-to-r ${config.color} text-white relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <motion.div 
                  className="flex items-center justify-between"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      <config.icon className="h-8 w-8" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl font-bold mb-1">
                        {config.title} - Rang {rang}
                      </CardTitle>
                      <p className="text-white/90 text-sm">
                        {config.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-white/20 text-white mb-2">
                      {itemCode}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        {masteredConcepts.size} concepts maîtrisés
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="mt-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-white/90 mb-3">{config.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Progression de maîtrise</span>
                    <span className="text-sm font-bold">{Math.round(userProgress)}%</span>
                  </div>
                  <Progress value={userProgress} className="h-2 bg-white/20 mt-1" />
                </motion.div>
              </div>

              {/* Effets de particules dans le header */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                {config.particles.map((particle, i) => (
                  <motion.div
                    key={i}
                    className={`absolute text-4xl`}
                    style={{
                      left: `${i * 30}%`,
                      top: `${i * 30}%`
                    }}
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5
                    }}
                  >
                    {particle}
                  </motion.div>
                ))}
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Panneau de contrôle interactif */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Mode d'Exploration Intelligent
                </h3>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant={isExploring ? "default" : "outline"}
                    onClick={toggleExploreMode}
                    className={`transition-all duration-300 ${
                      isExploring 
                        ? `bg-gradient-to-r ${config.color} shadow-lg hover:shadow-xl` 
                        : 'hover:scale-105'
                    }`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {isExploring ? 'Mode Actif' : 'Activer'}
                  </Button>
                  
                  <motion.div
                    animate={{ rotate: showInsights ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInsights(!showInsights)}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {showInsights && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <div className="text-center">
                        <motion.div
                          className="text-2xl font-bold text-purple-600 mb-1"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {masteredConcepts.size}
                        </motion.div>
                        <div className="text-sm text-gray-600">Concepts acquis</div>
                      </div>
                      
                      <div className="text-center">
                        <motion.div
                          className="text-2xl font-bold text-green-600 mb-1"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        >
                          {Math.round(userProgress)}%
                        </motion.div>
                        <div className="text-sm text-gray-600">Progression</div>
                      </div>
                      
                      <div className="text-center">
                        <motion.div
                          className="text-2xl font-bold text-amber-600 mb-1"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        >
                          {masteredConcepts.size * 10}
                        </motion.div>
                        <div className="text-sm text-gray-600">Points XP</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tableau principal avec effets immersifs */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-2xl border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <motion.div
                className="relative"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {/* Overlay d'interaction si mode exploration actif */}
                {isExploring && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 z-10 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                
                <div className="p-6">
                  <TableauCompetencesOICWithRealData 
                    itemCode={itemCode} 
                    rang={rang}
                  />
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Panneau de progression et encouragements */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star className="h-6 w-6 text-yellow-500" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-green-800">
                      Excellent travail !
                    </h3>
                    <p className="text-green-600 text-sm">
                      Continuez à explorer les compétences du Rang {rang}
                    </p>
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleConceptMastery(masteredConcepts.size)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marquer comme acquis
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};