import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Play, Sparkles, ArrowRight, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Button } from '@/components/ui/button';

export const AppleFinalCTA = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-40 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl"
        animate={{ 
          x: [0, 100, 0], 
          y: [0, 50, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/20 blur-3xl"
        animate={{ 
          x: [0, -100, 0], 
          y: [0, -50, 0],
          scale: [1.3, 1, 1.3]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-warning/10 backdrop-blur-sm border border-warning/20 rounded-full px-4 py-2 mb-8"
        >
          <Sparkles className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium text-warning">Gratuit pour commencer</span>
        </motion.div>

        {/* Main headline */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8"
        >
          <span className="text-foreground">Prêt à</span>
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-warning bg-clip-text text-transparent">
            tout retenir ?
          </span>
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Arrête de t'épuiser sur des fiches.
          <br />
          <span className="text-foreground font-semibold">Écoute. Retiens. Réussis.</span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Button 
            size="lg"
            onClick={() => navigate(ROUTE_PATHS.medMngItemsLibrary)}
            className="h-16 px-10 text-xl font-bold rounded-2xl bg-gradient-to-r from-primary via-primary-hover to-accent hover:opacity-90 shadow-xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-2xl"
          >
            <Play className="h-6 w-6 mr-3" />
            Commencer maintenant
            <ArrowRight className="h-6 w-6 ml-3" />
          </Button>
        </motion.div>

        {/* Secondary action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <button
            onClick={() => navigate(ROUTE_PATHS.generator)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <Headphones className="h-5 w-5" />
            <span>Ou écoute d'abord un extrait</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-muted-foreground text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>Aucune carte requise</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>Accès instantané</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>Annulation libre</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
