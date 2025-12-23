import React from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { ROUTE_PATHS } from "@/config/routes";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, Target, Award, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NiveauCardProps {
  niveau: string;
  titre: string;
  description: string;
  objectifs: string[];
  badge: string;
  route: string;
  delay: number;
}

const NiveauCard: React.FC<NiveauCardProps> = ({ 
  niveau, 
  titre, 
  description, 
  objectifs, 
  badge,
  route,
  delay 
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card 
        className="h-full border-2 hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:shadow-xl"
        onClick={() => navigate(route)}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-sm font-semibold">
              {niveau}
            </Badge>
            <span className="text-xs text-muted-foreground">{badge}</span>
          </div>
          <CardTitle className="text-2xl group-hover:text-primary transition-colors">
            {titre}
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {objectifs.map((objectif, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">{objectif}</span>
              </div>
            ))}
          </div>
          <Button 
            variant="ghost" 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all mt-4"
          >
            Accéder au niveau
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Niveaux = () => {
  const navigate = useNavigate();

  const niveaux = [
    {
      niveau: "D2",
      titre: "Poser les fondations",
      description: "Apprendre à structurer un cas clinique et comprendre la logique médicale. Le point de départ de tout raisonnement.",
      objectifs: [
        "Structurer un cas clinique de manière systématique",
        "Comprendre la logique du raisonnement médical",
        "Acquérir les réflexes d'observation et d'interrogatoire",
        "Poser les bases de l'examen clinique orienté"
      ],
      badge: "Fondamentaux",
      route: ROUTE_PATHS.niveauD2,
    },
    {
      niveau: "D3",
      titre: "Approfondir le raisonnement",
      description: "Hiérarchiser les hypothèses diagnostiques, identifier les pièges fréquents et affiner ton jugement clinique.",
      objectifs: [
        "Hiérarchiser les hypothèses diagnostiques",
        "Identifier les drapeaux rouges et les pièges",
        "Construire une stratégie d'examens complémentaires",
        "Développer le sens de la priorisation"
      ],
      badge: "Approfondissement",
      route: ROUTE_PATHS.niveauD3,
    },
    {
      niveau: "D4",
      titre: "Viser l'excellence",
      description: "Raisonnement optimisé pour les EDN et ECOS. Priorisation, formulation orale, efficacité maximale.",
      objectifs: [
        "Maîtriser le raisonnement orienté EDN/ECOS",
        "Optimiser la formulation orale structurée",
        "Prioriser en situation d'urgence simulée",
        "Automatiser les réflexes de synthèse"
      ],
      badge: "Excellence",
      route: ROUTE_PATHS.niveauD4,
    },
  ];

  return (
    <>
      <SEOHead
        title="Choisis ton niveau | Med-MNG"
        description="D2, D3 ou D4 : choisis le niveau adapté à ton avancement. Chaque parcours est conçu pour structurer ton raisonnement clinique progressivement."
        keywords="D2 médecine, D3 médecine, D4 médecine, externes, raisonnement clinique, EDN, ECOS"
        canonical="/niveaux"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(ROUTE_PATHS.home)}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </Button>
          </div>
        </header>

        {/* Hero */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-3xl mx-auto text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Choisis ton niveau
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Chaque parcours est conçu pour t'accompagner dans la structuration de ton raisonnement clinique. 
                Pas de jugement, juste une progression adaptée à ton avancement.
              </p>
            </motion.div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {niveaux.map((niveau, index) => (
                <NiveauCard 
                  key={niveau.niveau}
                  {...niveau}
                  delay={0.1 * (index + 1)}
                />
              ))}
            </div>

            {/* Reassurance */}
            <motion.div 
              className="max-w-2xl mx-auto text-center mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="text-sm text-muted-foreground">
                Tu peux changer de niveau à tout moment. L'important est de commencer là où tu te sens à l'aise.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Niveaux;
