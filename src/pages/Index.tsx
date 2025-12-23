import React from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { ROUTE_PATHS } from "@/config/routes";
import { motion } from "framer-motion";
import { Brain, Target, Stethoscope, ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "Structurer son raisonnement",
      description: "Apprendre à penser comme un clinicien, pas à réciter des fiches."
    },
    {
      icon: Target,
      title: "Prioriser comme aux urgences",
      description: "Développer les réflexes de hiérarchisation et de décision rapide."
    },
    {
      icon: Stethoscope,
      title: "S'entraîner sur des cas réels",
      description: "Des situations cliniques inspirées du terrain, pas des QCM artificiels."
    }
  ];

  const credentials = [
    "Conçue par une médecin de terrain",
    "Méthode éprouvée en stage et en garde",
    "Approche exigeante et bienveillante"
  ];

  return (
    <>
      <SEOHead
        title="Med-MNG | La plateforme qui aide les externes à penser comme des médecins"
        description="Med-MNG structure ton raisonnement clinique pour les EDN et les ECOS. Conçue par une médecin de terrain, pour les externes D2, D3, D4."
        keywords="raisonnement clinique, EDN, ECOS, externes médecine, D2, D3, D4, préparation médecine, structuration pensée médicale"
        canonical="/"
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          
          <div className="container mx-auto px-4 pt-20 pb-16 relative">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8">
                <GraduationCap className="w-4 h-4" />
                <span className="text-sm font-medium">Pour les externes D2, D3, D4</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                La plateforme qui aide les externes à{" "}
                <span className="text-primary">penser comme des médecins</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                Med-MNG n'est pas une banque de fiches supplémentaire.
                <br className="hidden md:block" />
                C'est un outil de{" "}
                <span className="text-foreground font-medium">structuration du raisonnement clinique</span>,
                inspiré de la pratique réelle de la médecine.
              </p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Button 
                  size="lg"
                  onClick={() => navigate(ROUTE_PATHS.niveaux)}
                  className="text-lg px-8 py-6 h-auto font-semibold group"
                >
                  Choisir mon niveau
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-4">
                Ce que Med-MNG t'apporte
              </h2>
              <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                Une méthode pour structurer ta pensée médicale, applicable aux EDN comme aux ECOS.
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Credibility Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                Une méthode rigoureuse et éprouvée
              </h2>

              <div className="space-y-4 mb-12">
                {credentials.map((credential, index) => (
                  <motion.div
                    key={credential}
                    className="flex items-center justify-center gap-3 text-lg"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{credential}</span>
                  </motion.div>
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
                Med-MNG a été créée pour répondre à un manque : 
                trop d'étudiants arrivent aux examens avec des connaissances, 
                mais sans méthode pour les mobiliser efficacement. 
                Cette plateforme comble ce vide.
              </p>

              {/* Secondary CTA */}
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate(ROUTE_PATHS.niveaux)}
                className="text-lg px-8 py-6 h-auto font-medium group"
              >
                Commencer maintenant
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Footer minimal */}
        <footer className="py-8 border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              Med-MNG — Structurer le raisonnement clinique des futurs médecins
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
