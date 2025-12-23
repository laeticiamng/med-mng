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
  AlertTriangle,
  ArrowRight,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NiveauD3 = () => {
  const navigate = useNavigate();

  const appareils = [
    { icon: Heart, nom: "Cardiovasculaire", cas: 12 },
    { icon: Wind, nom: "Pneumologie", cas: 10 },
    { icon: Droplets, nom: "Néphrologie", cas: 8 },
    { icon: Activity, nom: "Gastro-entérologie", cas: 11 },
    { icon: BrainIcon, nom: "Neurologie", cas: 9 },
    { icon: Bone, nom: "Rhumatologie", cas: 7 },
    { icon: Shield, nom: "Infectiologie", cas: 10 },
    { icon: Pill, nom: "Endocrinologie", cas: 8 },
    { icon: Eye, nom: "Ophtalmologie", cas: 5 },
    { icon: Baby, nom: "Pédiatrie", cas: 9 },
  ];

  const methodologie = [
    {
      titre: "1. Hiérarchiser les hypothèses",
      description: "Passer d'une liste de diagnostics possibles à une stratégie ordonnée : le plus grave d'abord, puis le plus probable.",
      points: ["Gravité vs probabilité", "Diagnostics à ne pas manquer", "Raisonnement probabiliste"]
    },
    {
      titre: "2. Identifier les drapeaux rouges",
      description: "Reconnaître les signes d'alerte qui changent la prise en charge. Savoir quand accélérer.",
      points: ["Signes de gravité", "Urgences à reconnaître", "Critères d'hospitalisation"]
    },
    {
      titre: "3. Construire une stratégie d'examens",
      description: "Les examens complémentaires ne sont pas une liste. Ils répondent à une question précise.",
      points: ["Examens de débrouillage", "Examens de confirmation", "Coût-bénéfice"]
    },
    {
      titre: "4. Anticiper les pièges fréquents",
      description: "Connaître les erreurs classiques, les présentations atypiques, les diagnostics trompeurs.",
      points: ["Présentations atypiques", "Biais cognitifs", "Diagnostics différentiels piégeux"]
    }
  ];

  return (
    <>
      <SEOHead
        title="Niveau D3 - Approfondir le raisonnement | Med-MNG"
        description="D3 : Hiérarchise tes hypothèses diagnostiques, identifie les pièges et affine ton jugement clinique. Le niveau de l'approfondissement."
        keywords="D3 médecine, hiérarchisation diagnostique, pièges médicaux, raisonnement clinique avancé"
        canonical="/niveaux/d3"
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
            <Badge variant="secondary" className="font-semibold">D3 - Approfondissement</Badge>
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
                Approfondir et hiérarchiser
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                En D3, tu sais déjà structurer un cas. Maintenant, il faut apprendre à <strong className="text-foreground">prioriser</strong>. 
                Quelles hypothèses explorer en premier ? Quels pièges éviter ? Comment construire une stratégie diagnostique cohérente ?
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>89 situations cliniques</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Scale className="w-4 h-4 text-primary" />
                  <span>Hiérarchisation diagnostique</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  <span>Pièges et drapeaux rouges</span>
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
              Commencer le niveau D3
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default NiveauD3;
