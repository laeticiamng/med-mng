import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Music, 
  Brain, 
  TrendingUp, 
  Users, 
  Star,
  Clock,
  Target,
  ArrowRight,
  Play,
  Calendar,
  Award,
  Lightbulb,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModernHomepage = () => {
  const navigate = useNavigate();

  const featuredModules = [
    {
      title: 'Items EDN Complets',
      description: 'Tous les items de connaissances avec tableaux interactifs, rang A et B',
      icon: <BookOpen className="h-8 w-8" />,
      color: 'bg-primary/10 text-primary',
      route: '/edn-complete',
      badge: '367 Items',
      popular: true
    },
    {
      title: 'Génération Musicale',
      description: 'Créez des mnémotechniques musicales personnalisées avec IA',
      icon: <Music className="h-8 w-8" />,
      color: 'bg-accent/10 text-accent',
      route: '/med-mng/create',
      badge: 'IA Avancée',
      popular: true
    },
    {
      title: 'Planificateur d\'Études',
      description: 'Organisez vos révisions avec des objectifs personnalisés',
      icon: <Target className="h-8 w-8" />,
      color: 'bg-success/10 text-success',
      route: '/study-planner',
      badge: 'Nouveau',
      popular: false
    },
    {
      title: 'Hub Communautaire',
      description: 'Échangez avec 2,847 étudiants et professionnels',
      icon: <Users className="h-8 w-8" />,
      color: 'bg-warning/10 text-warning',
      route: '/community',
      badge: '2.8k Membres',
      popular: false
    }
  ];

  const quickStats = [
    { icon: <Users className="h-6 w-6" />, value: '15,847', label: 'Utilisateurs actifs', color: 'text-primary' },
    { icon: <BookOpen className="h-6 w-6" />, value: '367', label: 'Items EDN', color: 'text-success' },
    { icon: <Music className="h-6 w-6" />, value: '8,432', label: 'Musiques générées', color: 'text-accent' },
    { icon: <Award className="h-6 w-6" />, value: '92.3%', label: 'Taux de réussite', color: 'text-warning' }
  ];

  const recentUpdates = [
    {
      title: 'Nouveaux Items de Cardiologie',
      description: 'IC-264 à IC-290 maintenant disponibles avec musiques',
      time: 'Il y a 2 heures',
      type: 'update'
    },
    {
      title: 'Webinaire : Mémorisation Musicale',
      description: 'Inscrivez-vous pour la session du 15 février',
      time: 'Il y a 1 jour',
      type: 'event'
    },
    {
      title: 'Nouvelle Fonctionnalité: Statistiques',
      description: 'Suivez vos progrès avec des analytics avancées',
      time: 'Il y a 3 jours',
      type: 'feature'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Martin',
      specialty: 'Cardiologie',
      text: 'MED-MNG a révolutionné ma façon d\'apprendre. Les musiques mnémotechniques sont incroyablement efficaces !',
      rating: 5
    },
    {
      name: 'Thomas Leroux',
      specialty: 'Étudiant DCEM3',
      text: 'J\'ai validé tous mes items de rang A grâce à cette plateforme. L\'approche multimodale est géniale.',
      rating: 5
    },
    {
      name: 'Prof. Laurent Chen',
      specialty: 'Neurologie',
      text: 'En tant qu\'enseignant, je recommande vivement MED-MNG. L\'innovation pédagogique à son meilleur.',
      rating: 5
    }
  ];

  return (
    <>
      <Helmet>
        <title>MED-MNG | Plateforme d'Apprentissage Médical Innovante</title>
        <meta name="description" content="Révolutionnez votre apprentissage médical avec MED-MNG : items EDN complets, génération musicale IA, communauté active et outils d'étude avancés." />
        <meta name="keywords" content="médecine, EDN, apprentissage, musique mnémotechnique, IA, formation médicale" />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-secondary py-24">
          <div className="container mx-auto px-6">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <Badge className="bg-accent/10 text-accent text-sm px-4 py-2">
                🚀 Plateforme révolutionnaire d'apprentissage médical
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Révolutionnez votre
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {' '}apprentissage médical
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                MED-MNG combine intelligence artificielle, musique mnémotechnique et communauté active 
                pour transformer votre façon d'étudier la médecine.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/edn-complete')}
                  className="flex items-center gap-2 px-8 py-3 text-lg"
                >
                  <Play className="h-5 w-5" />
                  Commencer maintenant
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/community')}
                  className="flex items-center gap-2 px-8 py-3 text-lg"
                >
                  <Users className="h-5 w-5" />
                  Rejoindre la communauté
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
                {quickStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`${stat.color} mb-2 mx-auto w-fit`}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Modules */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground">Modules Principaux</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Découvrez nos outils innovants conçus pour optimiser votre apprentissage médical
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredModules.map((module, index) => (
                <Card 
                  key={index} 
                  className={`transition-all hover:shadow-lg cursor-pointer group ${
                    module.popular ? 'ring-2 ring-purple-200' : ''
                  }`}
                  onClick={() => navigate(module.route)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${module.color}`}>
                        {module.icon}
                      </div>
                      {module.popular && (
                        <Badge className="bg-gradient-to-r from-accent to-primary text-primary-foreground">
                          Populaire
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {module.title}
                    </CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{module.badge}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Updates */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Dernières Nouveautés</h2>
                <div className="space-y-4">
                  {recentUpdates.map((update, index) => (
                    <Card key={index} className="transition-all hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            update.type === 'update' ? 'bg-primary/10 text-primary' :
                            update.type === 'event' ? 'bg-success/10 text-success' :
                            'bg-accent/10 text-accent'
                          }`}>
                            {update.type === 'update' && <TrendingUp className="h-4 w-4" />}
                            {update.type === 'event' && <Calendar className="h-4 w-4" />}
                            {update.type === 'feature' && <Lightbulb className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">{update.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{update.description}</p>
                            <p className="text-xs text-muted-foreground">{update.time}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Témoignages</h2>
                <div className="space-y-6">
                  {testimonials.map((testimonial, index) => (
                    <Card key={index} className="transition-all hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current text-warning" />
                          ))}
                        </div>
                        <p className="text-foreground mb-4 italic">"{testimonial.text}"</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.specialty}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-accent to-primary">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-4xl font-bold text-primary-foreground">
                Prêt à transformer votre apprentissage ?
              </h2>
              <p className="text-xl text-primary-foreground/80">
                Rejoignez plus de 15,000 étudiants et professionnels qui ont déjà révolutionné 
                leur façon d'apprendre la médecine avec MED-MNG.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate('/med-mng/signup')}
                  className="flex items-center gap-2 px-8 py-3 text-lg"
                >
                  <Heart className="h-5 w-5" />
                  Créer un compte gratuit
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/statistics')}
                  className="flex items-center gap-2 px-8 py-3 text-lg border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-accent"
                >
                  <TrendingUp className="h-5 w-5" />
                  Voir les statistiques
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ModernHomepage;