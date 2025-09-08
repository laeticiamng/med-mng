import React from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Music, 
  Brain, 
  Stethoscope, 
  BookOpen, 
  Users, 
  Award,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Smartphone,
  Globe
} from "lucide-react";

const PlatformOverview = () => {
  return (
    <>
      <Helmet>
        <title>Plateforme MED-MNG - Aperçu complet | Apprentissage médical innovant</title>
        <meta name="description" content="Découvrez toutes les fonctionnalités de MED-MNG : génération musicale IA, contenu EDN/ECOS, communauté active et outils d'apprentissage révolutionnaires." />
        <meta name="keywords" content="plateforme médicale, IA musicale, EDN, ECOS, apprentissage médical, révisions" />
      </Helmet>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10 py-20 lg:py-32">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="medical-container relative">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-6 animate-fade-in-up">
                <Stethoscope className="w-4 h-4 mr-2" />
                Plateforme complète
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Une plateforme révolutionnaire pour
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent block">
                  l'apprentissage médical
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                MED-MNG combine intelligence artificielle, neurosciences et pédagogie médicale 
                pour créer l'expérience d'apprentissage la plus efficace au monde.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <Button asChild size="lg" className="medical-btn-primary group">
                  <Link to="/med-mng/signup">
                    Essayer gratuitement
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="medical-btn-outline">
                  <Link to="/generator">
                    Voir le générateur
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="medical-section">
          <div className="medical-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Fonctionnalités principales
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Tout ce dont vous avez besoin pour révolutionner votre apprentissage médical
              </p>
            </div>

            <div className="medical-grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Génération Musicale IA */}
              <Card className="medical-card-premium group lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Music className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Génération Musicale IA</CardTitle>
                      <CardDescription className="text-lg">
                        Transformez vos cours en chansons personnalisées avec notre IA de pointe
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-lg">Fonctionnalités avancées :</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                          Génération automatique de paroles médicales
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                          15+ styles musicaux (pop, rap, classique...)
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                          Synchronisation avec contenus EDN/ECOS
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                          Personnalisation selon votre niveau
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-lg">Impact sur l'apprentissage :</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                          <span className="text-sm font-medium">Mémorisation</span>
                          <span className="text-success font-bold">+40%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                          <span className="text-sm font-medium">Engagement</span>
                          <span className="text-primary font-bold">+65%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                          <span className="text-sm font-medium">Rétention</span>
                          <span className="text-accent font-bold">+50%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contenu Médical */}
              <Card className="medical-card-premium group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <BookOpen className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle>Contenu Médical Complet</CardTitle>
                  <CardDescription>
                    Tous les référentiels officiels dans une interface moderne
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Items EDN</span>
                      <Badge variant="secondary">367 items</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Scénarios ECOS</span>
                      <Badge variant="secondary">200+</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mise à jour</span>
                      <Badge variant="outline">Continue</Badge>
                    </div>
                    <div className="pt-2">
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/edn">Explorer EDN</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chat IA */}
              <Card className="medical-card-premium group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center mb-4 group-hover:bg-info/20 transition-colors">
                    <Brain className="w-6 h-6 text-info" />
                  </div>
                  <CardTitle>Assistant IA Médical</CardTitle>
                  <CardDescription>
                    Chat intelligent spécialisé en médecine avec sources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Réponses avec sources EDN/ECOS
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Suggestions personnalisées
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-success mr-2" />
                        Historique des conversations
                      </li>
                    </ul>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/chat">Essayer le chat</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Technical Excellence */}
        <section className="medical-section bg-muted/30">
          <div className="medical-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Excellence technique
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Une plateforme construite avec les meilleures technologies
              </p>
            </div>

            <div className="medical-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <Card className="medical-card text-center">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Performance</CardTitle>
                  <CardDescription>
                    Temps de chargement ultra-rapide
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-1">&lt;2s</div>
                  <div className="text-sm text-muted-foreground">Premier chargement</div>
                </CardContent>
              </Card>

              <Card className="medical-card text-center">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-success" />
                  </div>
                  <CardTitle className="text-lg">Sécurité</CardTitle>
                  <CardDescription>
                    Protection des données médicales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success mb-1">RGPD</div>
                  <div className="text-sm text-muted-foreground">Conforme</div>
                </CardContent>
              </Card>

              <Card className="medical-card text-center">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Responsive</CardTitle>
                  <CardDescription>
                    Parfait sur tous les appareils
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent mb-1">100%</div>
                  <div className="text-sm text-muted-foreground">Compatible</div>
                </CardContent>
              </Card>

              <Card className="medical-card text-center">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-6 h-6 text-info" />
                  </div>
                  <CardTitle className="text-lg">Disponibilité</CardTitle>
                  <CardDescription>
                    Service disponible 24h/24
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-info mb-1">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="medical-section">
          <div className="medical-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ce que disent nos étudiants
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Plus de 10,000 étudiants font confiance à MED-MNG
              </p>
            </div>

            <div className="medical-grid grid-cols-1 md:grid-cols-3">
              <Card className="medical-card">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription>
                    "MED-MNG a révolutionné ma façon d'apprendre. Je retiens 3x plus facilement grâce aux chansons générées par l'IA."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">ML</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Marie L.</div>
                      <div className="text-xs text-muted-foreground">Externe 6e année</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="medical-card">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription>
                    "Les EDN musicaux sont géniaux ! J'ai enfin réussi à mémoriser la pharmacologie grâce aux raps générés."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-accent">TD</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Thomas D.</div>
                      <div className="text-xs text-muted-foreground">DFASM1</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="medical-card">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription>
                    "Interface intuitive, contenu de qualité, IA performante. MED-MNG est l'outil indispensable de l'étudiant moderne."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-success">SB</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Sarah B.</div>
                      <div className="text-xs text-muted-foreground">DFASM2</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-gradient-to-r from-primary via-accent to-primary py-20">
          <div className="medical-container text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Rejoignez la révolution de l'apprentissage médical
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Commencez dès aujourd'hui et découvrez pourquoi MED-MNG est devenu l'outil préféré de milliers d'étudiants en médecine
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="group">
                <Link to="/med-mng/signup">
                  Créer mon compte gratuit
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                <Link to="/med-mng/pricing">
                  Voir les abonnements
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default PlatformOverview;