import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Play, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { TranslatedText } from '@/components/global/TranslatedText';
import { AudioDemoPlayer } from './AudioDemoPlayer';

export const AppleMusicPlayer = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            <TranslatedText text="Écoute." />{' '}
            <span className="text-primary">
              <TranslatedText text="Apprends." />
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            <TranslatedText text="Chaque chanson est un cours complet. Les paroles contiennent tout ce que tu dois retenir." />
          </p>
        </motion.div>

        {/* Player showcase */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-warning/30 rounded-3xl blur-3xl opacity-50" />
          
          <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-2 text-primary">
              <Music className="h-5 w-5" />
              <span className="text-sm font-medium"><TranslatedText text="APERÇU" /></span>
            </div>

            <div className="flex items-start gap-6 mb-8">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary via-accent to-warning flex items-center justify-center shadow-lg flex-shrink-0">
                <Music className="h-12 w-12 text-primary-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-foreground mb-2 truncate">
                  Item 105 - Épilepsie
                </h3>
                <p className="text-muted-foreground mb-4">
                  <TranslatedText text="Rang A · Neurologie" />
                </p>
                
                <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">🎵 <TranslatedText text="Paroles actuelles :" /></p>
                  <p className="text-foreground font-medium italic">
                    "Trois minutes de crise, c'est le seuil de l'état de mal, Benzos en IV, protocole magistral..."
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-[35%] bg-gradient-to-r from-primary to-accent rounded-full" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1:23</span>
                <span>3:45</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <Link to={ROUTE_PATHS.medMngSignup}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg"
                    className="h-16 px-10 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30"
                  >
                    <Music className="h-6 w-6 mr-2" />
                    <TranslatedText text="S'inscrire pour écouter" />
                  </Button>
                </motion.div>
              </Link>
              <p className="text-sm text-muted-foreground">
                <TranslatedText text="Créez un compte gratuit pour accéder aux 367 chansons médicales" />
              </p>
            </div>

            {/* Waveform */}
            <div className="mt-8 flex items-end justify-center gap-1 h-12">
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t from-primary/40 to-primary rounded-full"
                  animate={{ 
                    height: [
                      `${8 + Math.sin(i * 0.5) * 12 + 8}px`,
                      `${8 + Math.sin(i * 0.5 + 2) * 12 + 12}px`,
                      `${8 + Math.sin(i * 0.5) * 12 + 8}px`,
                    ]
                  }}
                  transition={{ duration: 2 + (i % 3) * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
                />
              ))}
            </div>

            {/* Real audio demo player */}
            <AudioDemoPlayer />
          </div>
        </motion.div>

        {/* Feature callouts */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid sm:grid-cols-3 gap-8 text-center"
        >
          {[
            { emoji: '🎧', title: 'Écoute passive', desc: 'Ton cerveau travaille' },
            { emoji: '📝', title: 'Paroles = cours', desc: 'Contenu 100% médical' },
            { emoji: '🔁', title: 'Refrain = clés', desc: "L'essentiel en boucle" },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
            >
              <div className="text-4xl mb-3">{item.emoji}</div>
              <h4 className="font-semibold text-foreground mb-1"><TranslatedText text={item.title} /></h4>
              <p className="text-sm text-muted-foreground"><TranslatedText text={item.desc} /></p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
