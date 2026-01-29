import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export const AppleMusicPlayer = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

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
            Écoute.{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Apprends.
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Chaque chanson est un cours complet. Les paroles contiennent tout ce que tu dois retenir.
          </p>
        </motion.div>

        {/* Player showcase */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative max-w-3xl mx-auto"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-warning/30 rounded-3xl blur-3xl opacity-50" />
          
          {/* Player card */}
          <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl">
            {/* Now playing header */}
            <div className="flex items-center gap-2 text-primary mb-6">
              <Music className="h-5 w-5" />
              <span className="text-sm font-medium">EN LECTURE</span>
            </div>

            {/* Track info */}
            <div className="flex items-start gap-6 mb-8">
              {/* Album art */}
              <motion.div
                animate={isPlaying ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary via-accent to-warning flex items-center justify-center shadow-lg flex-shrink-0"
              >
                <Music className="h-12 w-12 text-primary-foreground" />
              </motion.div>

              {/* Track details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-foreground mb-2 truncate">
                  Item 105 - Épilepsie
                </h3>
                <p className="text-muted-foreground mb-4">
                  Rang A · Neurologie
                </p>
                
                {/* Lyrics preview */}
                <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">🎵 Paroles actuelles :</p>
                  <p className="text-foreground font-medium italic">
                    "Trois minutes de crise, c'est le seuil de l'état de mal,
                    <br />
                    Benzos en IV, protocole magistral..."
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <Slider
                value={[progress]}
                onValueChange={(v) => setProgress(v[0])}
                max={100}
                step={1}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1:23</span>
                <span>3:45</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full">
                <Repeat className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full">
                <SkipBack className="h-6 w-6" />
              </Button>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button 
                  size="icon" 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8 ml-1" />
                  )}
                </Button>
              </motion.div>
              <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full">
                <SkipForward className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>

            {/* Waveform visualization */}
            <div className="mt-8 flex items-end justify-center gap-1 h-12">
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t from-primary/40 to-primary rounded-full"
                  initial={{ height: 8 }}
                  animate={isPlaying ? {
                    height: [8, Math.random() * 40 + 8, 8]
                  } : { height: 8 }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.02,
                  }}
                />
              ))}
            </div>
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
            { emoji: '🔁', title: 'Refrain = clés', desc: 'L\'essentiel en boucle' },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
            >
              <div className="text-4xl mb-3">{item.emoji}</div>
              <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
