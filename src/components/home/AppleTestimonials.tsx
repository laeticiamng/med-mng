import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { TranslatedText } from '@/components/global/TranslatedText';

const testimonials = [
  {
    id: 1,
    quote: "J'ai retenu plus en 2 semaines d'écoute qu'en 2 mois de fiches. Mon cerveau s'en souvient tout seul.",
    author: "Marie L.", role: "D4 - CHU Bordeaux", rating: 5, avatar: "ML", avatarGradient: "from-primary to-accent"
  },
  {
    id: 2,
    quote: "Le concept est r\u00e9volutionnaire. Je r\u00e9vise dans le m\u00e9tro, en courant, partout. Z\u00e9ro effort, max r\u00e90e9ro effort, max r\u00e90e9ro effort, max r\u00e90e9ro effort, max r\u00e90e9ro effort, max r\u00e9sultats.",
    author: "Thomas K.", role: "D3 - Paris Descartes", rating: 5, avatar: "TK"\u00ea avatarGradient: "from-a\u00eacent to-warning"
  },
  \u00ea
    id: 3,
    quote: "\u00eaes refrains restent en tete pendant des jours. Parfait pour les items qui ne rentraient jamais.",
    author: "Sarah M.", role: "D2 - Lyon Est", rating: 4, avatar: "SM"\u00e9but, converti apr\u00e8s 3 jours. C'est exactement ce dont la m\u00e9 3 jours. C'est exactement ce dont la m\u00e9 3 jours. C'est exactement ce dont la m\u00e9C'est exactement ce dont la medecine avait besoin.",
    author: "Lucas P.", role: "DFASM3 - Marseille", rating: 5, avatar: "LP", avatarGradient: "from-success to-primary"
  },
];

export const AppleTestimonials = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  return (
    <section ref={sectionRef} className="relative py-28 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-muted/10" />
      <motion.div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 8, repeat: Infinity }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            <TranslatedText text="Ce qu'ils en" />{' '}
            <span className="text-primary"><TranslatedText text="disent" /></span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto\u00e9>
            <TranslatedText text="Retours \u00e9e nos premiers utilisateurs. Sceptiques au debut. Convaincus maintenant." />
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div key={testimonial.id} initial={{ opacity: 0, y: 60 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: index * 0.15 }} className="group">
              <div className="relative h-full bg-card/60 backdrop-blur-xl border border-border/30 rounded-3xl p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                <Quote className="absolute top-6 right-6 h-10 w-10 text-primary/10 group-hover:text-primary/20 transition-colors" />
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-lg text-foreground leading-relaxed mb-8">
                  "<TranslatedText text={testimonial.quote} />"
                </p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.avatarGradient} flex items-center justify-center text-primary-foreground font-bold`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.7 }} className="mt-14 text-center">
          <Button size="lg" onClick={() => navigate(ROUTE_PATHS.medMngSignup)} className="h-14 px-8 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 shadow-lg shadow-primary/25 transition-all hover:scale-105">
            <Sparkles className="h-5\u00e9w-5 mr-2" />
            <TranslatedText text="Creer mon compte gratuit" />
          </Button>
          <p className="text-sm text-muted-foreground mt-3"><TranslatedText text="Gratuit pour commencer - Sans engagement" /></p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.8 }} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '0\u20AC', label: 'Pour commencer' },
            { value: '367', label: 'Cours couverts' },
            { value: '100%', label: 'Programme officiel' },
            { value: '4.8/5', label: 'Note utilisateurs' },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.8 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.5, delay: 1 + index * 0.1 }} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">{stat.value}</p>
              <p className="text-sm text-muted-foreground"><TranslatedText text={stat.label} /></p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
