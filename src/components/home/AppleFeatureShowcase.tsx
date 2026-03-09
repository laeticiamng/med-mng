import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Headphones, Music, Brain, Repeat, BookOpen, Target, Sparkles, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { TranslatedText } from '@/components/global/TranslatedText';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { GlowingCard } from '@/components/ui/glowing-card';

const features = [
  {
    id: 'passive', icon: Headphones,
    title: 'Écoute passive', subtitle: 'Ton cerveau fait le travail',
    description: "Dans le métro, en cuisinant, avant de dormir. La musique encode les informations dans ta mémoire sans effort conscient.",
    gradient: 'from-primary to-primary/60', bgGradient: 'from-primary/20 via-primary/5 to-transparent',
    colSpan: 2 as const,
  },
  {
    id: 'lyrics', icon: Music,
    title: 'Paroles = Cours', subtitle: '1 chanson = 1 item EDN',
    description: "Chaque mot est pensé pour transmettre l'essentiel. Les paroles SONT le cours. Pas de décor, que du contenu médical précis.",
    gradient: 'from-accent to-accent/60', bgGradient: 'from-accent/20 via-accent/5 to-transparent',
    colSpan: 1 as const,
  },
  {
    id: 'refrain', icon: Repeat,
    title: 'Refrain = Essentiel', subtitle: 'Les clés en boucle',
    description: "Le refrain contient les points critiques. Tu l'entends 4 fois par chanson. Impossible d'oublier ce qui compte vraiment.",
    gradient: 'from-success to-success/60', bgGradient: 'from-success/20 via-success/5 to-transparent',
    colSpan: 1 as const,
  },
  {
    id: 'memory', icon: Brain,
    title: 'Mémoire renforcée', subtitle: 'Appuyé par les neurosciences',
    description: "La musique active l'hippocampe et l'amygdale simultanément. Des études montrent une rétention significativement supérieure à la lecture passive (Wallace, 1994 ; Rainey & Larsen, 2002).",
    gradient: 'from-warning to-warning/60', bgGradient: 'from-warning/20 via-warning/5 to-transparent',
    colSpan: 2 as const,
  },
];

export const AppleFeatureShowcase = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-background to-accent/[0.03]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            <TranslatedText text="Pourquoi ça" />{' '}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent text-gradient-animated">
              <TranslatedText text="fonctionne" />
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            <TranslatedText text="Ce n'est pas une promesse. C'est de la neuroscience appliquée." />
          </p>
        </motion.div>

        <BentoGrid className="mb-16">
          {features.map((feature, index) => (
            <BentoCard key={feature.id} colSpan={feature.colSpan} index={index}>
              <GlowingCard className="h-full">
                <div className="p-5 sm:p-6 md:p-8 h-full">
                  {/* Gradient bg on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10`} />
                  
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}>
                    <feature.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    <TranslatedText text={feature.title} />
                  </h3>
                  <p className="text-primary font-semibold text-sm mb-3">
                    <TranslatedText text={feature.subtitle} />
                  </p>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    <TranslatedText text={feature.description} />
                  </p>
                  
                  {/* Sparkle on hover */}
                  <motion.div
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Sparkles className="h-5 w-5 text-primary/40" />
                  </motion.div>
                </div>
              </GlowingCard>
            </BentoCard>
          ))}
        </BentoGrid>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.6 }} className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={() => navigate(ROUTE_PATHS.ednComplete)} className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg glow-pulse transition-all hover:scale-105 w-full sm:w-auto">
              <BookOpen className="h-5 w-5 mr-2" />
              <TranslatedText text="Explorer les 367 items" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate(ROUTE_PATHS.ecosIndex)} className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold rounded-2xl border-2 transition-all hover:scale-105 w-full sm:w-auto">
              <Target className="h-5 w-5 mr-2" />
              <TranslatedText text="Simulations ECOS" />
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
