
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Brain, Target, Zap, Lightbulb, Shield, Microscope, Headphones } from "lucide-react";

export const MngPresentation = () => {
  return (
    <div className="mb-16">
      <Card className="bg-gradient-medical text-primary-foreground mb-8">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Music className="h-8 w-8" />
            <CardTitle className="text-3xl">Méthode MNG</CardTitle>
          </div>
          <CardDescription className="text-primary-foreground/80 text-lg">
            Music Neuro Learning Generator - Révolutionnez votre apprentissage
          </CardDescription>
          <p className="text-sm text-primary-foreground/70 mt-2">
            Méthode pédagogique innovante développée par Laëticia Motongane
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Objectif */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-accent" />
              <CardTitle className="text-xl">Objectif de la méthode</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              Faciliter l'apprentissage de savoirs complexes par une immersion cognitive, sonore et visuelle, 
              via une génération automatique de contenus éducatifs en chansons personnalisées, en respectant 
              les attendus pédagogiques de chaque discipline diplômante.
            </p>
          </CardContent>
        </Card>

        {/* Fondements scientifiques */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">Fondements scientifiques</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-foreground">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Sciences cognitives de l'apprentissage (effet de redondance, double codage, émotion positive)</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Neuroplasticité favorisée par la musique (rythme, structure, répétition)</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">Mémoire à long terme consolidée par l'ancrage multisensoriel</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Principe de fonctionnement */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-orange-600" />
            <CardTitle className="text-xl">Principe de fonctionnement</CardTitle>
          </div>
          <CardDescription>
            Chaque unité de cours est transformée en un module MNG comprenant :
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-warning/10 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Headphones className="h-5 w-5 text-warning" />
                <h4 className="font-semibold text-warning-foreground">1. Génération automatique</h4>
              </div>
              <p className="text-sm text-foreground">Chanson conforme au cours officiel (texte, tableau, item)</p>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Music className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-primary-foreground">2. Sélection musicale</h4>
              </div>
              <p className="text-sm text-foreground">Style musical par l'apprenant (trap, jazz, lofi, etc.)</p>
            </div>
            <div className="bg-success/10 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="h-5 w-5 text-success" />
                <h4 className="font-semibold text-success-foreground">3. Visuels synchronisés</h4>
              </div>
              <p className="text-sm text-foreground">Tableaux de synthèse, BD récapitulative, animations</p>
            </div>
            <div className="bg-accent/10 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-accent" />
                <h4 className="font-semibold text-accent-foreground">4. Entraînement ciblé</h4>
              </div>
              <p className="text-sm text-foreground">QCM, QROC, QRU basés sur les contenus chantés</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Caractère unique */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-emerald-600" />
            <CardTitle className="text-xl">Caractère unique de la méthode MNG</CardTitle>
          </div>
          <CardDescription>
            Contrairement à une simple chanson éducative ou un podcast musical :
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-success/10 p-4 rounded-lg border-l-4 border-success">
              <p className="text-sm text-foreground">
                <strong>Génération automatique</strong> à la demande à partir de contenus pédagogiques vérifiés 
                (syllabus officiels, item LISA, compétences ECOS, etc.)
              </p>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
              <p className="text-sm text-foreground">
                <strong>Structure musicale optimisée</strong> pour la mémorisation à long terme, 
                adaptant le flow, le rythme et les refrains aux points clés du cours
              </p>
            </div>
            <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
              <p className="text-sm text-foreground">
                <strong>Plan didactique codifié :</strong> introduction → développement → ancrage → répétition ciblée → conclusion
              </p>
            </div>
            <div className="bg-warning/10 p-4 rounded-lg border-l-4 border-warning">
              <p className="text-sm text-foreground">
                <strong>Adaptabilité multisectorielle</strong> : médecine, droit, sciences humaines, économie, ingénierie, etc.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domaine d'application du brevet */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Microscope className="h-6 w-6 text-indigo-600" />
              <CardTitle className="text-xl">Domaine d'application du brevet</CardTitle>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800">Propriété intellectuelle</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-accent mb-3">Le brevet couvre :</h4>
              <div className="space-y-2 text-sm text-foreground">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span>Génération algorithmique de chansons pédagogiques personnalisées</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span>Usage dans un parcours académique diplômant post-bac</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span>Interface immersive interactive (fiches, tableaux, BD, QCM)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span>Adaptabilité multisectorielle (santé, droit, commerce, ingénierie)</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-destructive mb-3">Exemples d'exclusivité à protéger :</h4>
              <div className="space-y-2 text-sm text-foreground">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <span>Générateur de chanson éducative automatisé et personnalisé</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <span>Combinaison chanson + tableau + quiz + visuel animé</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <span>Application dans un contexte diplômant reconnu officiellement</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
