import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Headphones, Music, Brain, Repeat, BookOpen, Target, Sparkles, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { TranslatedText } from '@/components/global/TranslatedText';

const features = [
  {
    id: 'passive', icon: Headphones,
    title: 'Écoute passive', subtitle: 'Ton cerveau fait le travail',
    description: "Dans le métro, en cuisinant, avant de dormir. La musique encode les informations dans ta mémoire sans effort conscient.",
    gradient: 'from-primary to-primary/60', bgGradient: 'from-primary/20 via-primary/5 to-transparent',
  },
  {
    id: 'lyrics', icon: Music,
    title: 'Paroles = Cours', subtitle: '1 chanson = 1 item EDN',
    description: "Chaque mot est pensé pour transmettre l'essentiel. Les paroles SONT le cours. Pas de décor, que du contenu médical précis.",
    gradient: 'from-accent to-accent/60', bgGradient: 'from-accent/20 via-accent/5 to-transparent',
  },
  {
    id: 'refrain', icon: Repeat,
    title: 'Refrain = Essentiel', subtitle: 'Les clés en boucle',
    description: "Le refrain contient les points critiques. Tu l'entends 4 fois par chanson. Impossible d'oublier ce qui compte vraiment.",
    gradient: 'from-success to-success/60', bgGradient: 'from-success/20 via-success/5 to-transparent',
  },
  {
    id: 'memory', icon: Brain,
    title: 'Mémoire x3', subtitle: 'Prouvé par la science',
    description: "La musique active l'hippocampe et l'amygdale simultanément. Rétention 3x supérieure à la lecture passive. C'est neuroscientifique.",
    gradient: 'from-warning to-warning/60', bgGradient: 'from-warning/20 via-warning/5 to-transparent',
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 80 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: index * 0.15 }} className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
      <div className="relative bg-card/40 backdrop-blur-xl border border-border/30 rounded-3xl p-8 h-full transition-all duration-500 group-hover:border-primary/30 group-hover:shadow-2xl group-hover:shadow-primary/10">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6`}>
          <feature.icon className="h-8 w-8 text-primary-foreground" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2"><TranslatedText text={feature.title} /></h3>
        <p className="text-primary font-semibold mb-4"><TranslatedText text={feature.subtitle} /></p>
        <p className="text-muted-foreground leading-relaxed"><TranslatedText text={feature.description} /></p>
        <motion.div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
          <Sparkles className="h-5 w-5 text-primary/50" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export const AppleFeatureShowcase = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-background to-accent/[0.03]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            <TranslatedText text="Pourquoi ça" />{' '}
            <span className="text-primary"><TranslatedText text="fonctionne" /></span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            <TranslatedText text="Ce n'est pas une promesse. C'est de la neuroscience appliquée." />
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.6 }} className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={() => navigate(ROUTE_PATHS.ednComplete)} className="h-14 px-8 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg transition-all hover:scale-105">
              <BookOpen className="h-5 w-5 mr-2" />
              <TranslatedText text="Explorer les 367 items" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate(ROUTE_PATHS.ecosIndex)} className="h-14 px-8 text-lg font-semibold rounded-2xl border-2 transition-all hover:scale-105">
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
