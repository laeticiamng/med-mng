// ==========================================
// MED-MNG STATISTICS DISPLAY - Affichage des statistiques avancées
// ==========================================

import React, { memo, useState, useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  Trophy, 
  Heart, 
  TrendingUp, 
  Clock, 
  Star, 
  Target,
  Zap,
  Globe,
  Brain,
  Music,
  GraduationCap,
  Stethoscope,
  Award,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Animation Hook for counting numbers
const useCountAnimation = (end: number, duration = 2000) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = count.set(end);
    const unsubscribe = rounded.onChange((v) => setDisplayValue(v));
    
    return () => {
      unsubscribe();
    };
  }, [count, end, rounded]);

  return displayValue;
};

// Animated Counter Component
const AnimatedCounter = memo(({ 
  value, 
  suffix = "", 
  prefix = "",
  duration = 2000 
}: { 
  value: number; 
  suffix?: string; 
  prefix?: string;
  duration?: number;
}) => {
  const count = useCountAnimation(value, duration);
  
  return (
    <span>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
});

// Individual Stat Card Component
const StatCard = memo(({ 
  stat, 
  index, 
  isInView 
}: { 
  stat: any; 
  index: number; 
  isInView: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        scale: 1 
      } : { 
        opacity: 0, 
        y: 30, 
        scale: 0.9 
      }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      className="group"
    >
      <Card className={cn(
        "medical-card h-full relative overflow-hidden transition-all duration-500",
        "group-hover:shadow-xl group-hover:-translate-y-2"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardContent className="p-6 text-center relative z-10">
          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={cn(
              "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center",
              "transition-all duration-300 group-hover:shadow-lg",
              stat.color
            )}
          >
            <stat.icon className="w-8 h-8 text-white" />
          </motion.div>

          {/* Value */}
          <div className="text-3xl md:text-4xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
            {isInView ? (
              <AnimatedCounter 
                value={stat.rawValue} 
                suffix={stat.suffix}
                prefix={stat.prefix}
              />
            ) : (
              stat.value
            )}
          </div>

          {/* Label */}
          <div className="font-medium text-muted-foreground mb-3 group-hover:text-foreground transition-colors duration-300">
            {stat.label}
          </div>

          {/* Description */}
          <div className="text-sm text-muted-foreground">
            {stat.description}
          </div>

          {/* Progress Bar for certain stats */}
          {stat.progress && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Objectif</span>
                <span>{stat.progress}%</span>
              </div>
              <Progress value={isInView ? stat.progress : 0} className="w-full h-2" />
            </div>
          )}

          {/* Badge for featured stats */}
          {stat.featured && (
            <Badge className="absolute top-3 right-3 bg-accent/20 text-accent">
              <Star className="w-3 h-3 mr-1" />
              Top
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Real-time metrics component
const RealTimeMetrics = memo(({ isInView }: { isInView: boolean }) => {
  const [liveStats, setLiveStats] = useState({
    currentUsers: 1247,
    generationsToday: 5832,
    successRate: 98.7
  });

  // Simulate real-time updates
  useEffect(() => {
    if (!isInView) return;
    
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        currentUsers: prev.currentUsers + Math.floor(Math.random() * 5 - 2),
        generationsToday: prev.generationsToday + Math.floor(Math.random() * 10),
        successRate: Math.min(99.9, prev.successRate + (Math.random() * 0.2 - 0.1))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-3 h-3 bg-success rounded-full"
        />
        <h3 className="text-lg font-bold text-foreground">Métriques en Temps Réel</h3>
        <Badge className="bg-success/20 text-success text-xs">LIVE</Badge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            <AnimatedCounter value={liveStats.currentUsers} />
          </div>
          <div className="text-sm text-muted-foreground">Utilisateurs actifs</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-accent">
            <AnimatedCounter value={liveStats.generationsToday} />
          </div>
          <div className="text-sm text-muted-foreground">Générations aujourd'hui</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-success">
            <AnimatedCounter value={liveStats.successRate} suffix="%" />
          </div>
          <div className="text-sm text-muted-foreground">Taux de réussite</div>
        </div>
      </div>
    </motion.div>
  );
});

// Main Statistics Display Component
const StatisticsDisplay: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  // Statistics data
  const mainStats = [
    {
      icon: Users,
      value: "50K+",
      rawValue: 50000,
      label: "Étudiants Actifs",
      description: "Dans le monde entier",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      featured: true
    },
    {
      icon: BookOpen,
      value: "500+",
      rawValue: 500,
      label: "Items ECN Couverts",
      description: "Programme complet",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      progress: 95
    },
    {
      icon: Trophy,
      value: "95%",
      rawValue: 95,
      suffix: "%",
      label: "Taux de Réussite",
      description: "Aux examens ECN",
      color: "bg-gradient-to-br from-yellow-500 to-orange-500",
      progress: 95,
      featured: true
    },
    {
      icon: Heart,
      value: "4.9/5",
      rawValue: 4.9,
      label: "Satisfaction",
      description: "Note moyenne utilisateurs",
      color: "bg-gradient-to-br from-pink-500 to-red-500"
    }
  ];

  const secondaryStats = [
    {
      icon: Music,
      value: "1M+",
      rawValue: 1000000,
      label: "Musiques Générées",
      description: "Par notre IA",
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      icon: Brain,
      value: "2.5M+",
      rawValue: 2500000,
      label: "Concepts Appris",
      description: "Mémorisés efficacement",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600"
    },
    {
      icon: Clock,
      value: "30%",
      rawValue: 30,
      suffix: "%",
      label: "Gain de Temps",
      description: "Vs méthodes classiques",
      color: "bg-gradient-to-br from-teal-500 to-teal-600",
      progress: 75
    },
    {
      icon: Globe,
      value: "50+",
      rawValue: 50,
      label: "Pays",
      description: "Utilisent MED-MNG",
      color: "bg-gradient-to-br from-cyan-500 to-cyan-600"
    }
  ];

  const achievements = [
    {
      icon: Award,
      title: "Prix Innovation EdTech 2024",
      description: "Meilleure plateforme d'apprentissage médical"
    },
    {
      icon: Stethoscope,
      title: "Validation Médicale",
      description: "Approuvé par 200+ professionnels de santé"
    },
    {
      icon: GraduationCap,
      title: "Partenariats Académiques",
      description: "Utilisé dans 50+ facultés de médecine"
    },
    {
      icon: CheckCircle,
      title: "Certification Qualité",
      description: "Conforme aux standards pédagogiques"
    }
  ];

  return (
    <motion.section 
      ref={ref}
      className="medical-section bg-gradient-to-b from-muted/5 to-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="medical-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Badge className="mb-6 bg-primary/10 text-primary">
            <TrendingUp className="w-4 h-4 mr-2" />
            Statistiques Impressionnantes
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Des Résultats qui Parlent
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez l'impact de MED-MNG sur l'apprentissage médical à travers le monde
          </p>
        </motion.div>

        {/* Real-time Metrics */}
        <div className="mb-16">
          <RealTimeMetrics isInView={isInView} />
        </div>

        {/* Main Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {mainStats.map((stat, index) => (
            <StatCard 
              key={stat.label} 
              stat={stat} 
              index={index} 
              isInView={isInView} 
            />
          ))}
        </div>

        {/* Secondary Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {secondaryStats.map((stat, index) => (
            <StatCard 
              key={stat.label} 
              stat={stat} 
              index={index + 4} 
              isInView={isInView} 
            />
          ))}
        </div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-gradient-to-r from-card via-card/50 to-card border border-border rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Reconnaissances & Certifications
            </h3>
            <p className="text-muted-foreground">
              MED-MNG est reconnu et approuvé par la communauté médicale internationale
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className="text-center p-4 rounded-lg hover:bg-muted/30 transition-colors duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <achievement.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{achievement.title}</h4>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Growth Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center"
        >
          <h3 className="text-xl font-bold text-foreground mb-4">
            Croissance Exponentielle
          </h3>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span>+300% d'utilisateurs en 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded-full" />
              <span>+500% de contenu généré</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full" />
              <span>+200% de partenariats</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default memo(StatisticsDisplay);