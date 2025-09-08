import React from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Music, Brain, Stethoscope, BookOpen, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>MED-MNG - Apprentissage médical par la musique | Plateforme premium</title>
        <meta name="description" content="Révolutionnez votre apprentissage médical avec MED-MNG. Transformez vos cours en musique avec l'IA, mémorisez plus facilement et réussissez vos examens." />
        <meta name="keywords" content="apprentissage médical, musique, IA, médecine, EDN, ECOS, révisions" />
        <link rel="canonical" href="https://med-mng.com" />
        <meta property="og:title" content="MED-MNG - Apprentissage médical par la musique" />
        <meta property="og:description" content="Révolutionnez votre apprentissage médical avec MED-MNG. Transformez vos cours en musique avec l'IA." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://med-mng.com" />
      </Helmet>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10 py-20 lg:py-32">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="medical-container relative">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-6 animate-fade-in-up">
                <Music className="w-4 h-4 mr-2" />
                Révolution de l'apprentissage médical
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Apprenez la médecine<br />
                <span className="text-foreground">comme jamais</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                Transformez vos cours de médecine en musique grâce à l'intelligence artificielle. 
                Mémorisez plus efficacement, révisez en musique, réussissez vos examens.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <Button asChild size="lg" className="medical-btn-primary group">
                  <Link to="/med-mng/signup">
                    Commencer gratuitement
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="medical-btn-outline">
                  <Link to="/platform">
                    Découvrir la plateforme
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                  <div className="text-muted-foreground">Étudiants actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">367</div>
                  <div className="text-muted-foreground">Items EDN couverts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">95%</div>
                  <div className="text-muted-foreground">Taux de réussite</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="medical-section">
          <div className="medical-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pourquoi choisir MED-MNG ?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Une approche révolutionnaire qui combine neurosciences, intelligence artificielle et pédagogie médicale
              </p>
            </div>

            <div className="medical-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Card className="medical-card-premium group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>IA Générative Musicale</CardTitle>
                  <CardDescription>
                    Transformez vos cours en chansons personnalisées avec notre IA avancée
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Génération automatique de paroles médicales</li>
                    <li>• Adaptation au style musical préféré</li>
                    <li>• Synchronisation avec le contenu EDN/ECOS</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="medical-card-premium group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <Stethoscope className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle>Contenu Médical Complet</CardTitle>
                  <CardDescription>
                    Tous les items EDN et scénarios ECOS dans une interface moderne
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 367 items EDN actualisés</li>
                    <li>• Scénarios ECOS interactifs</li>
                    <li>• Mise à jour continue du contenu</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="medical-card-premium group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                    <BookOpen className="w-6 h-6 text-success" />
                  </div>
                  <CardTitle>Mémorisation Facilitée</CardTitle>
                  <CardDescription>
                    La musique améliore la rétention de 40% selon les neurosciences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Mémorisation par association musicale</li>
                    <li>• Révisions ludiques et efficaces</li>
                    <li>• Suivi des progrès personnalisé</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="medical-card-premium group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center mb-4 group-hover:bg-info/20 transition-colors">
                    <Users className="w-6 h-6 text-info" />
                  </div>
                  <CardTitle>Communauté Active</CardTitle>
                  <CardDescription>
                    Échangez avec des milliers d'étudiants en médecine
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Forums de discussion spécialisés</li>
                    <li>• Partage de créations musicales</li>
                    <li>• Entraide et motivation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="medical-card-premium group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center mb-4 group-hover:bg-warning/20 transition-colors">
                    <Music className="w-6 h-6 text-warning" />
                  </div>
                  <CardTitle>Lecteur Musical Avancé</CardTitle>
                  <CardDescription>
                    Interface dédiée pour vos révisions musicales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Playlists personnalisées</li>
                    <li>• Mode révision automatique</li>
                    <li>• Synchronisation multi-appareils</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="medical-card-premium group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-destructive/20 transition-colors">
                    <Award className="w-6 h-6 text-destructive" />
                  </div>
                  <CardTitle>Suivi des Performances</CardTitle>
                  <CardDescription>
                    Analytics détaillées de vos progrès d'apprentissage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Métriques de mémorisation</li>
                    <li>• Rapports de progression</li>
                    <li>• Recommandations personnalisées</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary via-accent to-primary py-20">
          <div className="medical-container text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à révolutionner vos études médicales ?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Rejoignez les milliers d'étudiants qui ont déjà transformé leur apprentissage avec MED-MNG
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="group">
                <Link to="/med-mng/signup">
                  Commencer maintenant
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                <Link to="/med-mng/pricing">
                  Voir les tarifs
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;