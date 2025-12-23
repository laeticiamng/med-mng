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
  Target,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NiveauD2 = () => {
  const navigate = useNavigate();

  const appareils = [
    { icon: Heart, nom: "Cardiovasculaire", cas: 8 },
    { icon: Wind, nom: "Pneumologie", cas: 7 },
    { icon: Droplets, nom: "Néphrologie", cas: 5 },
    { icon: Activity, nom: "Gastro-entérologie", cas: 9 },
    { icon: BrainIcon, nom: "Neurologie", cas: 6 },
    { icon: Bone, nom: "Rhumatologie", cas: 5 },
    { icon: Shield, nom: "Infectiologie", cas: 8 },
    { icon: Pill, nom: "Endocrinologie", cas: 6 },
    { icon: Eye, nom: "Ophtalmologie", cas: 4 },
    { icon: Baby, nom: "Pédiatrie", cas: 7 },
  ];

  const methodologie = [
    {
      titre: "1. Observer systématiquement",
      description: "Apprendre à regarder un patient avant de poser des questions. L'inspection est le premier temps de l'examen.",
      points: ["État général", "Signes visibles", "Comportement"]
    },
    {
      titre: "2. Interroger avec méthode",
      description: "Structurer l'anamnèse : ATCD, HDM, signes fonctionnels. Ne rien oublier sans réciter.",
      points: ["Chronologie des symptômes", "Facteurs déclenchants", "Retentissement"]
    },
    {
      titre: "3. Examiner de façon orientée",
      description: "L'examen physique n'est pas une liste à cocher. Il répond à des hypothèses.",
      points: ["Examen ciblé", "Signes recherchés", "Confirmation/infirmation"]
    },
    {
      titre: "4. Synthétiser et conclure",
      description: "Formuler une synthèse claire : qui est le patient, quel est le problème, quelle orientation.",
      points: ["Résumé structuré", "Hypothèses hiérarchisées", "Conduite à tenir"]
    }
  ];

  return (
    <>
      <SEOHead
        title="Niveau D2 - Poser les fondations | Med-MNG"
        description="D2 : Apprends à structurer un cas clinique et comprendre la logique du raisonnement médical. Les fondamentaux du raisonnement clinique."
        keywords="D2 médecine, raisonnement clinique débutant, cas cliniques D2, fondamentaux médecine"
        canonical="/niveaux/d2"
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
            <Badge variant="secondary" className="font-semibold">D2 - Fondamentaux</Badge>
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
                Poser les fondations du raisonnement
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                En D2, l'objectif n'est pas de tout savoir, mais de comprendre <strong className="text-foreground">comment réfléchir</strong>. 
                Tu vas apprendre à structurer un cas clinique, à observer méthodiquement, et à poser les bases d'un raisonnement solide.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>65 situations cliniques</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="w-4 h-4 text-primary" />
                  <span>Méthodologie explicite</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <span>Approche pas à pas</span>
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

        {/* CTA */}
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <Button size="lg" className="gap-2">
              Commencer le niveau D2
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default NiveauD2;
