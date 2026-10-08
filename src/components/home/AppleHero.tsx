import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Play, 
  Sparkles, 
  Music, 
  Brain,
  Zap,
  Wand2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import { TranslatedText } from '@/components/global/TranslatedText';
import { ShineBorder } from '@/components/ui/shine-border';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { lienCreerMusique } from '@/lib/cheminSuivant';

export const AppleHero = () => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <div ref={containerRef} className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden pt-8 md:pt-0">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/10" />
      
      {/* Floating orbs */}
      <motion.div 
        className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/20 blur-3xl hidden md:block"
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/20 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-warning/10 blur-3xl hidden md:block"
        animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Main content */}
      <motion.div 
        style={{ y, opacity, scale, position: 'relative' }}
        className="z-10 text-center px-4 max-w-5xl mx-auto"
      >
        {/* Badge with shine border */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block mb-8"
        >
          <ShineBorder borderRadius={50} borderWidth={1} duration={6}>
            <div className="flex items-center gap-2 px-5 py-2.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                <TranslatedText text="Pour préparer les EDN · conçu par une médecin" />
              </span>
            </div>
          </ShineBorder>
        </motion.div>

        {/* Main headline with animated gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="text-foreground"><TranslatedText text="Apprenez la médecine" /></span>
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-warning bg-clip-text text-transparent text-gradient-animated">
            <TranslatedText text="en musique." />
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          <TranslatedText text="Les 367 items EDN, avec leurs compétences officielles rang A et rang B." />{' '}
          <br className="hidden sm:block" />
          <TranslatedText text="Chaque item peut être mis en" /> <span className="text-foreground font-semibold"><TranslatedText text="chanson à la demande" /></span>.
        </motion.p>

        {/* Deux portes d'entrée (décision CEO du 08.10.2026) : réviser les 367 items
            EDN, ou créer sa propre musique (Med MNG Create). De vrais liens
            (ouvrables dans un onglet, annoncés comme liens), pas des boutons à onClick. */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col items-center gap-4 mb-12 w-full max-w-xl mx-auto sm:max-w-none"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center w-full">
            <Button
              asChild
              size="lg"
              className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 shadow-lg shadow-primary/25 transition-all hover:scale-105 glow-pulse w-full sm:w-auto"
            >
              <Link to={ROUTE_PATHS.medMngSignup}>
                <Sparkles className="h-5 w-5 mr-2" aria-hidden="true" />
                <TranslatedText text="Créer un compte gratuit" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold rounded-2xl border-2 hover:bg-secondary/50 transition-all hover:scale-105 w-full sm:w-auto"
            >
              <Link to={ROUTE_PATHS.ednComplete}>
                <Play className="h-5 w-5 mr-2" aria-hidden="true" />
                <TranslatedText text="Voir les 367 items" />
              </Link>
            </Button>
          </div>

          {/* Med MNG Create : visiteur → inscription gratuite puis retour sur Create. */}
          <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-bold rounded-2xl bg-foreground text-background shadow-lg shadow-foreground/20 hover:bg-foreground/90 transition-all hover:scale-105 w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Link
                to={lienCreerMusique(Boolean(user))}
                aria-describedby="hero-aide-create"
                data-testid="hero-creer-musique"
              >
                <Wand2 className="h-5 w-5 mr-2 text-warning" aria-hidden="true" />
                <TranslatedText text="Créer une musique" />
              </Link>
            </Button>
            <p id="hero-aide-create" className="text-sm sm:text-base text-muted-foreground max-w-md">
              <span className="font-semibold text-foreground">Med MNG Create</span>
              {' : '}
              <TranslatedText text="transformez un item EDN en chanson, dans le style de votre choix (génération audio avec Premium)." />
            </p>
          </div>
        </motion.div>

        {/* Feature pills with shine effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {[
            { icon: Music, label: "Paroles tirées du référentiel" },
            { icon: Brain, label: "Quiz par item" },
            { icon: Zap, label: "En mobilité" }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              className="relative overflow-hidden flex items-center gap-2 bg-card/60 backdrop-blur-sm border border-border/50 rounded-full px-5 py-2.5"
            >
              {/* Shine sweep */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 3, delay: 2 + index * 0.3, repeat: Infinity, repeatDelay: 5 }}
              />
              <item.icon className="h-4 w-4 text-primary" />
              <span className="text-sm sm:text-base font-medium text-foreground"><TranslatedText text={item.label} /></span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

    </div>
  );
};
