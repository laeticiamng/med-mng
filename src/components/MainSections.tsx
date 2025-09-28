
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MessageSquare, Music, Users, ArrowRight, CheckCircle, ExternalLink, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const MainSections = () => {
  const sections = [
    {
      id: "edn",
      title: "Items EDN",
      description: "Items de Connaissance pour l'Examen National Dématérialisé (IC-1 à IC-367)",
      icon: BookOpen,
      color: "bg-blue-500",
      count: "367 items complets",
      status: "Contenus officiels corrigés",
      features: [
        "Contenus Rang A et Rang B",
        "Paroles musicales personnalisées", 
        "Scènes immersives interactives",
        "Quiz d'auto-évaluation"
      ],
      href: "/edn",
      badge: "Complet"
    },
    {
      id: "ecos",
      title: "Simulations ECOS",
      description: "Examens Cliniques Objectifs Structurés pour la pratique clinique",
      icon: Users,
      color: "bg-green-500",
      count: "Situations cliniques",
      status: "En cours de développement",
      features: [
        "Scénarios cliniques réalistes",
        "Évaluation par compétences",
        "Feedback personnalisé",
        "Entraînement progressif"
      ],
      href: "/ecos",
      badge: "Bientôt"
    },
    {
      id: "chat",
      title: "MedChat",
      description: "Chat intelligent pour questions médicales",
      icon: MessageSquare,
      color: "bg-orange-500",
      count: "Assistant IA disponible",
      status: "Réponses instantanées",
      features: [
        "Chat en temps réel",
        "Base de connaissances médicales",
        "Historique des conversations",
        "Support multilingue"
      ],
      href: "/chat",
      badge: "IA Avancée"
    },
    {
      id: "audit",
      title: "Audit Complétude OIC",
      description: "Analyse automatique de la qualité des compétences OIC",
      icon: BarChart3,
      color: "bg-indigo-500",
      count: "Analyse en temps réel",
      status: "Audit automatisé des données",
      features: [
        "Détection des contenus incomplets",
        "Rapport de complétude détaillé",
        "Recommandations d'amélioration",
        "Métriques de qualité"
      ],
      href: "/audit-completeness",
      badge: "Audit"
    },
    {
      id: "music",
      title: "Générateur Musical",
      description: "Génération musicale pour l'apprentissage médical",
      icon: Music,
      color: "bg-pink-500",
      count: "Styles musicaux variés",
      status: "Création musicale personnalisée",
      features: [
        "Paroles médicales adaptées",
        "Multiples styles musicaux",
        "Mémorisation facilitée",
        "Bibliothèque personnelle"
      ],
      href: "/generator",
      badge: "Créatif"
    }
  ];

  const externalLinks = [
    {
      title: "EmotionsCare",
      description: "Plateforme de bien-être émotionnel et musicothérapie",
      url: "https://emotionscare.com",
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          MED MNG - Plateforme Médicale Intelligente
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Votre compagnon d'apprentissage médical avec IA, contenus officiels EDN et génération musicale
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-600 font-medium">
            Tous les contenus EDN ont été corrigés et mis à jour
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Card key={section.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${section.color} text-white`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {section.badge}
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-2">
                    {section.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-primary">{section.count}</span>
                  <span className="text-muted-foreground">{section.status}</span>
                </div>

                <div className="space-y-2">
                  {section.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button asChild className="w-full group-hover:bg-primary/90 transition-colors" disabled={section.id === "ecos"}>
                  <Link to={section.href} className="flex items-center justify-center gap-2">
                    {section.id === "ecos" ? "Bientôt disponible" : "Accéder"}
                    {section.id !== "ecos" && <ArrowRight className="h-4 w-4" />}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Liens externes */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Plateformes partenaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {externalLinks.map((link, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 ${link.color} rounded-lg mx-auto mb-4 flex items-center justify-center`}>
                  <ExternalLink className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{link.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{link.description}</p>
                <Button asChild variant="outline" className="w-full">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    Visiter
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border">
          <h2 className="text-2xl font-bold mb-4">Dernières mises à jour</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-600">Items EDN (IC-1 à IC-367)</h3>
              <p className="text-muted-foreground">
                Correction complète des 367 items de connaissance. Chaque item dispose de son contenu spécifique et authentique selon les référentiels officiels.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-purple-600">Paroles Musicales</h3>
              <p className="text-muted-foreground">
                Ajout de paroles musicales personnalisées pour chaque item EDN, facilitant la mémorisation et l'apprentissage ludique.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-green-600">Générateur Musical IA</h3>
              <p className="text-muted-foreground">
                Nouvel outil de génération musicale avec intelligence artificielle pour transformer les contenus EDN en chansons d'apprentissage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSections;
