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
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            <TranslatedText text="Écoutez." />{' '}
            <span className="text-primary">
              <TranslatedText text="Apprenez." />
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            <TranslatedText text="Les paroles reprennent les compétences rang A et rang B de l'item. Elles complètent la fiche, sans la remplacer." />
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
          
          <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-2 text-primary">
              <Music className="h-5 w-5" />
              <span className="text-sm font-medium"><TranslatedText text="APERÇU" /></span>
            </div>

            <div className="flex items-start gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-accent to-warning flex items-center justify-center shadow-lg flex-shrink-0">
                <Music className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2 truncate">
                  <TranslatedText text="367 items EDN, Rang A et Rang B" />
                </h3>
                <p className="text-muted-foreground mb-4">
                  <TranslatedText text="Compétences officielles du référentiel UNESS" />
                </p>

                {/* Ni citation de paroles ni barre de lecture ici : le catalogue
                    audio est vide (edn_suno_tracks et generated_music_tracks : 0
                    ligne), et le couplet affiché auparavant sous le libellé
                    « Paroles actuelles » n'existait dans aucun item. */}
                <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground">
                    <TranslatedText text="Chaque item est mis en chanson à la demande, à partir de ses compétences officielles. La génération se lance depuis votre compte." />
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <Link to={ROUTE_PATHS.medMngSignup}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 text-base sm:text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30 w-full sm:w-auto"
                  >
                    <Music className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                    <TranslatedText text="S'inscrire pour écouter" />
                  </Button>
                </motion.div>
              </Link>
              <p className="text-sm text-muted-foreground">
                <TranslatedText text="Créez un compte gratuit pour générer et écouter vos chansons" />
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
            { emoji: '🎧', title: 'Réécoute', desc: 'Réviser en mobilité' },
            { emoji: '📝', title: 'Paroles', desc: 'Basées sur le référentiel' },
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
