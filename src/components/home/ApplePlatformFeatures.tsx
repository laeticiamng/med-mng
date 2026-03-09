import { motion } from 'framer-motion';
import { BookOpen, Wand2, Brain, GraduationCap, Globe, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TranslatedText } from '@/components/global/TranslatedText';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { ROUTE_PATHS } from '@/config/routes';

const features = [
  {
    icon: BookOpen,
    titleFr: 'Catalogue Médical',
    descFr: '367 cours organisés par spécialité et niveau. Chaque chanson t\'aide à retenir l\'essentiel.',
    tab: 'content',
    colSpan: 2,
    gradient: 'from-primary/20 via-primary/5 to-transparent',
    iconBg: 'bg-primary/15 text-primary',
    comingSoon: false,
  },
  {
    icon: Wand2,
    titleFr: 'Studio Créateur IA',
    descFr: 'Importe ton cours en PDF → l\'IA crée des paroles de chanson adaptées. Tu édites et tu publies.',
    tab: 'creator',
    colSpan: 1,
    gradient: 'from-accent/20 via-accent/5 to-transparent',
    iconBg: 'bg-accent/15 text-accent',
    comingSoon: false,
  },
  {
    icon: Brain,
    titleFr: 'Courbe de Mémoire',
    descFr: 'Visualise ta courbe d\'oubli par sujet. Des rappels intelligents t\'aident à réviser au bon moment.',
    tab: 'memory',
    colSpan: 1,
    gradient: 'from-warning/20 via-warning/5 to-transparent',
    iconBg: 'bg-warning/15 text-warning',
    comingSoon: false,
  },
  {
    icon: GraduationCap,
    titleFr: 'Attestations PDF',
    descFr: 'Suis ta progression et télécharge tes attestations de formation en PDF.',
    tab: 'dpc',
    colSpan: 1,
    gradient: 'from-success/20 via-success/5 to-transparent',
    iconBg: 'bg-success/15 text-success',
    comingSoon: false,
  },
];

export const ApplePlatformFeatures = () => {
  const navigate = useNavigate();
  const { setCurrentLanguage } = useLanguage();

  const { user } = useAuth();

  const handleClick = (tab: string | null, comingSoon: boolean) => {
    if (!tab) return;
    if (comingSoon) {
      // Coming soon features: redirect to signup if anonymous, otherwise go to library
      if (!user) {
        navigate(ROUTE_PATHS.medMngSignup);
      } else {
        navigate(`/library?tab=${tab}`);
      }
    } else {
      // Active features: redirect to signup if anonymous
      if (!user) {
        navigate(ROUTE_PATHS.medMngSignup);
      } else {
        navigate(`/library?tab=${tab}`);
      }
    }
  };

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            <TranslatedText text="Une plateforme complète" />
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            <TranslatedText text="Tout ce dont tu as besoin pour apprendre la médecine en musique, au même endroit." />
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.titleFr}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl
                  transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5
                  ${feat.colSpan === 2 ? 'lg:col-span-2' : ''}`}
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feat.gradient} opacity-60`} />

                {/* Hover shimmer */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>

                <div className="relative p-6 md:p-8 flex flex-col h-full min-h-[220px]">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${feat.iconBg}`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Title */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      <TranslatedText text={feat.titleFr} />
                    </h3>
                    {feat.comingSoon && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning/15 text-warning border border-warning/30">
                        <TranslatedText text="Bientôt" />
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                    <TranslatedText text={feat.descFr} />
                  </p>

                  {/* CTA */}
                  {feat.tab ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="self-start group/btn hover:bg-primary/10"
                      onClick={() => handleClick(feat.tab, feat.comingSoon)}
                    >
                      <TranslatedText text={feat.comingSoon ? "En savoir plus" : "Découvrir"} />
                      <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  ) : (
                    <div className="flex gap-2 self-start">
                      {(['fr', 'en', 'de'] as const).map((lang) => (
                        <Button
                          key={lang}
                          variant="outline"
                          size="sm"
                          className="text-xs px-3 hover:bg-primary/10 border-border/50"
                          onClick={() => setCurrentLanguage(lang as any)}
                          aria-label={lang === 'fr' ? 'Français' : lang === 'en' ? 'English' : 'Deutsch'}
                        >
                          {lang === 'fr' ? '🇫🇷' : lang === 'en' ? '🇬🇧' : '🇩🇪'}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
