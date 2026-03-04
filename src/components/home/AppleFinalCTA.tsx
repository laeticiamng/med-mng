import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Play, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { TranslatedText } from '@/components/global/TranslatedText';

export const AppleFinalCTA = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl" animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/20 blur-3xl" animate={{ x: [0, -100, 0], y: [0, -50, 0], scale: [1.3, 1, 1.3] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 bg-warning/10 backdrop-blur-sm border border-warning/20 rounded-full px-4 py-2 mb-8">
          <Sparkles className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium text-warning"><TranslatedText text="Gratuit pour commencer" /></span>
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
          <span className="text-foreground"><TranslatedText text="Prêt à" /></span>
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-warning bg-clip-text text-transparent">
            <TranslatedText text="tout retenir ?" />
          </span>
        </motion.h2>

        <motion.p initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.4 }} className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
          <TranslatedText text="Arrête de t'épuiser sur des fiches." />
          <br />
          <span className="text-foreground font-semibold"><TranslatedText text="Écoute. Retiens. Réussis." /></span>
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button size="lg" onClick={() => navigate(ROUTE_PATHS.medMngSignup)} className="h-16 px-10 text-xl font-bold rounded-2xl bg-gradient-to-r from-primary via-primary-hover to-accent hover:opacity-90 shadow-xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-2xl">
            <Play className="h-6 w-6 mr-3" />
            <TranslatedText text="Créer mon compte gratuit" />
            <ArrowRight className="h-6 w-6 ml-3" />
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.8, delay: 0.8 }}>
          <button onClick={() => navigate(ROUTE_PATHS.ednComplete)} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
            <BookOpen className="h-5 w-5" />
            <span><TranslatedText text="Ou explore les items EDN d'abord" /></span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 1 }} className="mt-16 flex flex-wrap justify-center gap-8 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span><TranslatedText text="Aucune carte requise" /></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span><TranslatedText text="Accès instantané" /></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span><TranslatedText text="Annulation libre" /></span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
