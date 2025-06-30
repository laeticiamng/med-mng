
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Stethoscope, Users, Brain, MessageSquare, Music, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const MainSections = () => {
  const sections = [
    {
      id: "edn",
      title: "Items EDN",
      description: "Items de Connaissance pour l'Examen National Dématérialisé",
      icon: BookOpen,
      color: "bg-blue-500",
      count: "10 items complets",
      status: "Contenus officiels corrigés",
      features: [
        "Contenus Rang A et Rang B",
        "Paroles musicales personnalisées", 
        "Scènes immersives interactives",
        "Quiz d'auto-évaluation"
      ],
      href: "/edn",
      badge: "Mis à jour"
    },
    {
      id: "urgegpt",
      title: "UrgeGPT",
      description: "Assistant IA spécialisé en médecine d'urgence",
      icon: Stethoscope,
      color: "bg-red-500",
      count: "Protocoles actualisés",
      status: "Assistant IA disponible 24h/7j",
      features: [
        "Protocoles d'urgence",
        "Recommandations basées sur les guidelines",
        "Support décisionnel rapide",
        "Sources médicales vérifiées"
      ],
      href: "/urgegpt",
      badge: "IA"
    },
    {
      id: "community",
      title: "Communauté",
      description: "Réseau social pour étudiants et professionnels de santé",
      icon: Users,
      color: "bg-green-500",
      count: "Réseau actif",
      status: "Échanges entre pairs",
      features: [
        "Discussions spécialisées",
        "Partage d'expériences",
        "Groupes d'étude",
        "Mentorat"
      ],
      href: "/community",
      badge: "Social"
    },
    {
      id: "emotionscare",
      title: "EmotionsCare",
      description: "Bien-être émotionnel et musicothérapie",
      icon: Brain,
      color: "bg-purple-500",
      count: "Outils bien-être",
      status: "Support émotionnel personnalisé",
      features: [
        "Analyse émotionnelle IA",
        "Musicothérapie adaptative",
        "Journal personnel",
        "Suivi du bien-être"
      ],
      href: "/emotions",
      badge: "Bien-être"
    },
    {
      id: "chat",
      title: "MedChat",
      description: "Chat intelligent pour questions médicales",
      icon: MessageSquare,
      color: "bg-orange-500",
      count: "Assistant disponible",
      status: "Réponses instantanées",
      features: [
        "Chat en temps réel",
        "Base de connaissances médicales",
        "Historique des conversations",
        "Support multilingue"
      ],
      href: "/chat",
      badge: "Chat IA"
    },
    {
      id: "music",
      title: "MedMusic",
      description: "Génération musicale pour l'apprentissage médical",
      icon: Music,
      color: "bg-pink-500",
      count: "Générateur musical",
      status: "Création musicale personnalisée",
      features: [
        "Paroles médicales adaptées",
        "Styles musicaux variés",
        "Mémorisation facilitée",
        "Bibliothèque personnelle"
      ],
      href: "/music-generator",
      badge: "Créatif"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          MedMng - Plateforme Médicale Intelligente
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Votre compagnon d'apprentissage médical avec IA, contenus officiels et outils innovants
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-600 font-medium">
            Tous les contenus EDN ont été corrigés et mis à jour
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                  <Link to={section.href} className="flex items-center justify-center gap-2">
                    Accéder
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border">
          <h2 className="text-2xl font-bold mb-4">Dernières mises à jour</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-600">Items EDN</h3>
              <p className="text-muted-foreground">
                Correction complète des contenus génériques. Chaque item dispose maintenant de son contenu spécifique et authentique.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-purple-600">Paroles Musicales</h3>
              <p className="text-muted-foreground">
                Ajout de paroles musicales personnalisées pour chaque item EDN, facilitant la mémorisation.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-green-600">Scènes Immersives</h3>
              <p className="text-muted-foreground">
                Nouveaux scénarios interactifs avec dialogues et points d'apprentissage pratiques.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSections;
