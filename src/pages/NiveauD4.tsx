import React from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { ROUTE_PATHS } from "@/config/routes";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Heart, 
  Activity, 
  Brain as BrainIcon, 
  Bone, 
  Droplets,
  Wind,
  Eye,
  Baby,
  Shield,
  Pill,
  BookOpen,
  Timer,
  Mic,
  ArrowRight,
  Award,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NiveauD4 = () => {
  const navigate = useNavigate();

  const appareils = [
    { icon: Heart, nom: "Cardiovasculaire", cas: 15 },
    { icon: Wind, nom: "Pneumologie", cas: 12 },
    { icon: Droplets, nom: "Néphrologie", cas: 10 },
    { icon: Activity, nom: "Gastro-entérologie", cas: 14 },
    { icon: BrainIcon, nom: "Neurologie", cas: 11 },
    { icon: Bone, nom: "Rhumatologie", cas: 9 },
    { icon: Shield, nom: "Infectiologie", cas: 13 },
    { icon: Pill, nom: "Endocrinologie", cas: 10 },
    { icon: Eye, nom: "Ophtalmologie", cas: 6 },
    { icon: Baby, nom: "Pédiatrie", cas: 11 },
  ];

  const methodologie = [
    {
      titre: "1. Raisonner sous contrainte de temps",
      description: "Les EDN et ECOS imposent un rythme. Apprendre à être efficace sans sacrifier la rigueur.",
      points: ["Gestion du temps", "Priorisation rapide", "Synthèse en temps réel"]
    },
    {
      titre: "2. Formuler à l'oral avec précision",
      description: "L'ECOS exige une formulation claire et structurée. Chaque mot compte.",
      points: ["Structure SOAP", "Vocabulaire médical précis", "Présentation fluide"]
    },
    {
      titre: "3. Automatiser les réflexes",
      description: "Certaines situations doivent déclencher des réflexes immédiats. Les reconnaître, agir.",
      points: ["Urgences vitales", "Gestes réflexes", "Prises en charge codifiées"]
    },
    {
      titre: "4. Synthétiser pour convaincre",
      description: "À l'examen comme en pratique : savoir résumer un cas en 30 secondes, sans rien oublier d'essentiel.",
      points: ["Pitch clinique", "Justification des choix", "Communication inter-professionnelle"]
    }
  ];

  return (
    <>
      <SEOHead
        title="Niveau D4 - Viser l'excellence | Med-MNG"
        description="D4 : Raisonnement optimisé pour les EDN et ECOS. Priorisation, formulation orale, efficacité maximale. Le niveau de l'excellence."
        keywords="D4 médecine, préparation EDN, préparation ECOS, raisonnement clinique expert, excellence médicale"
        canonical="/niveaux/d4"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(ROUTE_PATHS.niveaux)}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Niveaux
            </Button>
            <Badge variant="secondary" className="font-semibold">D4 - Excellence</Badge>
          </div>
        </header>

        {/* Hero */}
        <section className="py-12 border-b border-border bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Viser l'excellence
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                En D4, tu maîtrises le raisonnement. Maintenant, il faut <strong className="text-foreground">performer sous pression</strong>. 
                Temps limité, formulation orale, synthèse immédiate : ce niveau te prépare aux conditions réelles des EDN et ECOS.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>111 situations cliniques</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Timer className="w-4 h-4 text-primary" />
                  <span>Entraînement chronométré</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mic className="w-4 h-4 text-primary" />
                  <span>Formulation orale ECOS</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="appareils" className="max-w-5xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="appareils">Par appareil</TabsTrigger>
                <TabsTrigger value="methodologie">Méthodologie</TabsTrigger>
              </TabsList>

              <TabsContent value="appareils">
                <motion.div 
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {appareils.map((appareil, index) => (
                    <motion.div
                      key={appareil.nom}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="hover:border-primary/50 transition-all cursor-pointer group">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <appareil.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{appareil.nom}</p>
                            <p className="text-sm text-muted-foreground">{appareil.cas} cas cliniques</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="methodologie">
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {methodologie.map((etape, index) => (
                    <motion.div
                      key={etape.titre}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{etape.titre}</CardTitle>
                          <CardDescription className="text-base">
                            {etape.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {etape.points.map((point) => (
                              <Badge key={point} variant="outline" className="font-normal">
                                {point}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Special D4 Features */}
        <section className="py-12 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
                Fonctionnalités spécifiques D4
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Timer className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Mode chronométré</h3>
                    <p className="text-sm text-muted-foreground">Entraîne-toi dans les conditions réelles de l'examen</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Mic className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Simulation ECOS</h3>
                    <p className="text-sm text-muted-foreground">Pratique la formulation orale structurée</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Cas complexes</h3>
                    <p className="text-sm text-muted-foreground">Situations multi-pathologies et intriquées</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <Button size="lg" className="gap-2">
              Commencer le niveau D4
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default NiveauD4;
