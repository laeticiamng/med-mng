import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Search, BookOpen, MessageCircle, Video, FileText, 
  ExternalLink, ArrowRight, Star, Clock, User,
  HelpCircle, Lightbulb, AlertCircle, CheckCircle
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  helpful: number;
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  type: 'article' | 'video' | 'interactive';
  category: string;
  url: string;
}

/**
 * Centre d'aide complet avec FAQ, guides et support
 */
export const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'Comment commencer à utiliser le générateur musical ?',
      answer: 'Pour utiliser le générateur musical, rendez-vous dans la section "Générateur", saisissez votre prompt descriptif et sélectionnez vos préférences. L\'IA générera ensuite un contenu musical éducatif personnalisé.',
      category: 'Générateur',
      keywords: ['générateur', 'musique', 'commencer', 'démarrage'],
      helpful: 45
    },
    {
      id: '2',
      question: 'Où puis-je retrouver mes contenus sauvegardés ?',
      answer: 'Tous vos contenus sauvegardés sont disponibles dans votre bibliothèque personnelle accessible via le menu "Ma Bibliothèque" ou en cliquant sur l\'icône cœur dans la navigation.',
      category: 'Bibliothèque',
      keywords: ['bibliothèque', 'sauvegarde', 'contenus', 'retrouver'],
      helpful: 32
    },
    {
      id: '3',
      question: 'Comment fonctionne le système de badges ?',
      answer: 'Le système de badges récompense vos actions sur la plateforme : création de contenus, complétion de formations, participation communautaire. Consultez la page Achievements pour voir vos progrès.',
      category: 'Gamification',
      keywords: ['badges', 'achievements', 'récompenses', 'gamification'],
      helpful: 28
    },
    {
      id: '4',
      question: 'Puis-je utiliser MED-MNG hors ligne ?',
      answer: 'Certaines fonctionnalités de base sont disponibles hors ligne grâce à notre PWA. Cependant, la génération IA et la synchronisation nécessitent une connexion internet.',
      category: 'Technique',
      keywords: ['hors ligne', 'offline', 'connexion', 'PWA'],
      helpful: 19
    },
    {
      id: '5',
      question: 'Comment contacter le support technique ?',
      answer: 'Vous pouvez nous contacter via le chat intégré, par email à support@med-mng.fr, ou en utilisant le formulaire de contact dans les paramètres.',
      category: 'Support',
      keywords: ['support', 'contact', 'aide', 'assistance'],
      helpful: 41
    }
  ];

  const guides: GuideItem[] = [
    {
      id: 'guide-1',
      title: 'Guide de démarrage rapide',
      description: 'Découvrez les fonctionnalités essentielles de MED-MNG en 10 minutes',
      duration: '10 min',
      difficulty: 'Débutant',
      type: 'interactive',
      category: 'Démarrage',
      url: '/help/quick-start'
    },
    {
      id: 'guide-2',
      title: 'Maîtriser le générateur musical',
      description: 'Apprenez à créer des contenus musicaux éducatifs efficaces',
      duration: '15 min',
      difficulty: 'Intermédiaire',
      type: 'video',
      category: 'Générateur',
      url: '/help/generator-mastery'
    },
    {
      id: 'guide-3',
      title: 'Optimiser ses révisions avec les ECOS',
      description: 'Stratégies pour maximiser votre préparation aux examens',
      duration: '20 min',
      difficulty: 'Avancé',
      type: 'article',
      category: 'Formation',
      url: '/help/ecos-optimization'
    },
    {
      id: 'guide-4',
      title: 'Analytics et suivi de progression',
      description: 'Comprendre et utiliser les données de votre dashboard',
      duration: '12 min',
      difficulty: 'Intermédiaire',
      type: 'video',
      category: 'Analytics',
      url: '/help/analytics-guide'
    }
  ];

  const categories = ['all', 'Générateur', 'Bibliothèque', 'Formation', 'Support', 'Technique'];

  const filteredFAQ = faqItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-success/10 text-success';
      case 'Intermédiaire': return 'bg-warning/10 text-warning-foreground';
      case 'Avancé': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'interactive': return HelpCircle;
      case 'article': return FileText;
      default: return BookOpen;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="medical-container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Centre d'Aide MED-MNG
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trouvez rapidement les réponses à vos questions et apprenez à maîtriser la plateforme
          </p>
        </div>

        {/* Recherche */}
        <div className="relative mb-8 max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher dans l'aide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        <Tabs defaultValue="faq" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 lg:w-fit mx-auto">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="status" className="hidden lg:flex">Statut</TabsTrigger>
          </TabsList>

          {/* FAQ */}
          <TabsContent value="faq" className="space-y-6">
            {/* Filtres de catégorie */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'Toutes' : category}
                </Button>
              ))}
            </div>

            {/* Questions fréquentes */}
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFAQ.map((item) => (
                  <AccordionItem 
                    key={item.id} 
                    value={item.id}
                    className="medical-card px-6"
                  >
                    <AccordionTrigger className="text-left">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <span>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="pl-8">
                        <p className="text-muted-foreground mb-4">
                          {item.answer}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Star className="w-3 h-3" />
                            {item.helpful} personnes trouvent cela utile
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFAQ.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Aucun résultat trouvé</p>
                  <p className="text-muted-foreground">
                    Essayez de modifier votre recherche ou contactez notre support
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Guides */}
          <TabsContent value="guides" className="space-y-6">
            <div className="medical-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => {
                const IconComponent = getTypeIcon(guide.type);
                return (
                  <Card key={guide.id} className="medical-card group">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <IconComponent className="w-6 h-6 text-primary" />
                        <Badge 
                          variant="secondary" 
                          className={getDifficultyColor(guide.difficulty)}
                        >
                          {guide.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <CardDescription>{guide.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {guide.duration}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {guide.category}
                        </Badge>
                      </div>
                      <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Commencer
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Support */}
          <TabsContent value="support" className="space-y-6">
            <div className="medical-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Card className="medical-card">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Chat en Direct</CardTitle>
                  <CardDescription>
                    Obtenez une aide immédiate via notre chat intégré
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full medical-btn-primary">
                    Démarrer le Chat
                  </Button>
                </CardContent>
              </Card>

              <Card className="medical-card">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <User className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle>Support Expert</CardTitle>
                  <CardDescription>
                    Contactez nos experts médicaux pour une aide spécialisée
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Planifier un Appel
                  </Button>
                </CardContent>
              </Card>

              <Card className="medical-card">
                <CardHeader>
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-success" />
                  </div>
                  <CardTitle>Base de Connaissances</CardTitle>
                  <CardDescription>
                    Documentation complète et articles détaillés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Parcourir
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Statut du Service */}
          <TabsContent value="status" className="space-y-6">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-success" />
                  Statut du Service
                </CardTitle>
                <CardDescription>
                  Tous les systèmes fonctionnent normalement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between py-2">
                    <span>Générateur Musical IA</span>
                    <Badge className="bg-success text-success-foreground">Opérationnel</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>Base de Données EDN</span>
                    <Badge className="bg-success text-success-foreground">Opérationnel</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>Authentification</span>
                    <Badge className="bg-success text-success-foreground">Opérationnel</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>API Externe</span>
                    <Badge className="bg-success text-success-foreground">Opérationnel</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold mb-6">Liens Rapides</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="outline" size="sm">
              <Lightbulb className="w-4 h-4 mr-2" />
              Suggérer une amélioration
            </Button>
            <Button variant="outline" size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              Rejoindre la communauté
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Documentation API
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};