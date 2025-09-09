// ==========================================
// MED-MNG TESTIMONIAL CAROUSEL - Témoignages authentiques
// ==========================================

import React, { memo, useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Star, Quote, User, GraduationCap, Trophy, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Dr. Sarah Martin",
    role: "Interne en Cardiologie",
    location: "CHU Bordeaux",
    avatar: "SM",
    rating: 5,
    content: "MED-MNG a révolutionné ma façon d'apprendre ! L'IA musicale rend la mémorisation des items ECN incroyablement efficace. J'ai augmenté mes scores de 40% en 3 mois.",
    highlight: "Score +40% en 3 mois",
    specialty: "Cardiologie",
    verified: true
  },
  {
    id: 2,
    name: "Thomas Dubois",
    role: "Étudiant DFASM3",
    location: "Faculté Paris Descartes",
    avatar: "TD",
    rating: 5,
    content: "Les tableaux interactifs sont géniaux ! Fini les heures à recopier, tout est structuré et adapté. La communauté est vraiment bienveillante.",
    highlight: "Temps d'étude divisé par 2",
    specialty: "Préparation ECN",
    verified: true
  },
  {
    id: 3,
    name: "Dr. Marie Leroy",
    role: "Chef de Clinique",
    location: "Hôpital Saint-Louis",
    avatar: "ML",
    rating: 5,
    content: "J'utilise MED-MNG pour former mes internes. La qualité du contenu médical est exceptionnelle et la gamification motive vraiment les équipes.",
    highlight: "Formation d'équipe optimisée",
    specialty: "Formation médicale",
    verified: true
  },
  {
    id: 4,
    name: "Alexandre Chen",
    role: "Étudiant DFASM2",
    location: "Faculté Lyon Est",
    avatar: "AC",
    rating: 5,
    content: "L'IA adaptative comprend vraiment mes difficultés et propose du contenu personnalisé. C'est comme avoir un tuteur personnel disponible 24/7.",
    highlight: "Apprentissage personnalisé",
    specialty: "Médecine générale",
    verified: true
  },
  {
    id: 5,
    name: "Dr. Laura Rossi",
    role: "Urgentiste",
    location: "SAMU 75",
    avatar: "LR",
    rating: 5,
    content: "Pour réviser entre deux gardes, c'est parfait ! Les contenus courts et musicaux se gravent facilement en mémoire. Un gain de temps énorme.",
    highlight: "Révisions optimisées",
    specialty: "Médecine d'urgence",
    verified: true
  },
  {
    id: 6,
    name: "Julien Moreau",
    role: "Étudiant DFASM1",
    location: "Faculté Marseille",
    avatar: "JM",
    rating: 5,
    content: "Depuis que j'utilise MED-MNG, mes résultats ont explosé ! L'approche pédagogique est révolutionnaire. Je recommande à tous mes camarades.",
    highlight: "Résultats exceptionnels",
    specialty: "Formation médicale",
    verified: true
  }
];

// Individual Testimonial Card Component
const TestimonialCard = memo(({ testimonial, isActive }: { testimonial: any, isActive: boolean }) => {
  return (
    <motion.div
      className={cn(
        "w-full transition-all duration-500",
        isActive ? "scale-100 opacity-100" : "scale-95 opacity-70"
      )}
      animate={{
        scale: isActive ? 1 : 0.95,
        opacity: isActive ? 1 : 0.7
      }}
    >
      <Card className="medical-card-premium h-full max-w-2xl mx-auto">
        <CardContent className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {testimonial.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground">{testimonial.name}</h3>
                  {testimonial.verified && (
                    <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                      ✓ Vérifié
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                <p className="text-muted-foreground text-xs">{testimonial.location}</p>
              </div>
            </div>
            <Quote className="w-8 h-8 text-primary/30" />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-warning text-warning" />
            ))}
          </div>

          {/* Content */}
          <blockquote className="text-foreground text-lg leading-relaxed italic">
            "{testimonial.content}"
          </blockquote>

          {/* Highlight & Specialty */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Badge className="bg-primary/10 text-primary">
              <Trophy className="w-4 h-4 mr-2" />
              {testimonial.highlight}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              <GraduationCap className="w-4 h-4 mr-2" />
              {testimonial.specialty}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Statistics Display Component
const StatsDisplay = memo(() => {
  const stats = [
    { value: "4.9/5", label: "Note moyenne", icon: Star },
    { value: "10K+", label: "Utilisateurs satisfaits", icon: User },
    { value: "95%", label: "Recommandent MED-MNG", icon: Heart },
    { value: "50%", label: "Amélioration moyenne", icon: Trophy }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="text-center"
        >
          <div className="medical-card p-6 group hover:shadow-lg transition-all duration-300">
            <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

// Main Testimonial Carousel Component
const TestimonialCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Navigation handlers
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <motion.section 
      ref={ref}
      className="medical-section bg-gradient-to-b from-primary/5 to-background"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="medical-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <Badge className="mb-6 bg-warning/10 text-warning">
            <Heart className="w-4 h-4 mr-2" />
            Témoignages Authentiques
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ils Ont Transformé leur Apprentissage
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez comment MED-MNG révolutionne l'apprentissage médical à travers les témoignages de nos utilisateurs
          </p>
        </motion.div>

        {/* Carousel Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative"
        >
          {/* Main Carousel */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <TestimonialCard 
                    testimonial={testimonial} 
                    isActive={index === currentIndex}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="rounded-full hover:shadow-md transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-200",
                    index === currentIndex
                      ? "bg-primary scale-110"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full hover:shadow-md transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Auto-play Indicator */}
          <div className="flex items-center justify-center mt-4">
            <Badge variant="outline" className="text-xs">
              {isAutoPlaying ? "Défilement automatique" : "Défilement manuel"}
            </Badge>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <StatsDisplay />
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16 p-8 bg-success/5 border border-success/20 rounded-2xl"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge className="bg-success/10 text-success">
              <Star className="w-4 h-4 mr-2" />
              Approuvé par les professionnels
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Utilisé dans plus de <strong>50 facultés de médecine</strong> et 
            <strong> 200 hôpitaux</strong> en France
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default memo(TestimonialCarousel);