import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle,
  Search,
  Book,
  Video,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Star,
  ThumbsUp,
  ThumbsDown,
  Check,
  Clock,
  Users,
  Zap,
  PlayCircle,
  FileText,
  Download,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ImmersiveLayout } from '@/components/immersive/ImmersiveLayout';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  type: 'video' | 'text' | 'interactive';
  category: string;
}

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'Comment créer ma première chanson mnémotechnique ?',
      answer: 'Pour créer votre première chanson, allez dans l\'onglet "Générateur", sélectionnez un item EDN, choisissez le style musical qui vous convient, puis cliquez sur "Générer". L\'IA créera automatiquement les paroles et la mélodie adaptées à vos besoins d\'apprentissage.',
      category: 'creation',
      helpful: 45,
      notHelpful: 2
    },
    {
      id: '2',
      question: 'Pourquoi certains items n\'ont pas de musique disponible ?',
      answer: 'Tous les items EDN ne disposent pas encore de contenu musical. Notre équipe travaille constamment pour enrichir la base de données. Vous pouvez créer votre propre musique pour ces items ou nous signaler les items prioritaires.',
      category: 'content',
      helpful: 32,
      notHelpful: 5
    },
    {
      id: '3',
      question: 'Comment synchroniser mes progrès entre appareils ?',
      answer: 'Vos progrès sont automatiquement sauvegardés dans le cloud dès que vous êtes connecté. Assurez-vous d\'utiliser le même compte sur tous vos appareils. La synchronisation se fait en temps réel.',
      category: 'account',
      helpful: 28,
      notHelpful: 1
    },
    {
      id: '4',
      question: 'Puis-je utiliser MED MNG hors ligne ?',
      answer: 'Une partie des fonctionnalités est disponible hors ligne, notamment la lecture de musiques déjà téléchargées et la consultation des contenus mis en cache. Pour créer de nouvelles musiques, une connexion internet est nécessaire.',
      category: 'technical',
      helpful: 19,
      notHelpful: 3
    },
    {
      id: '5',
      question: 'Comment modifier les paramètres de qualité audio ?',
      answer: 'Allez dans Paramètres > Audio pour ajuster la qualité d\'écoute, le volume par défaut, et activer/désactiver les fonctionnalités comme le crossfade automatique.',
      category: 'settings',
      helpful: 15,
      notHelpful: 0
    }
  ];

  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Premiers pas avec MED MNG',
      description: 'Découvrez les fonctionnalités principales et créez votre premier contenu d\'apprentissage',
      duration: '10 min',
      difficulty: 'Débutant',
      type: 'video',
      category: 'getting-started'
    },
    {
      id: '2',
      title: 'Optimiser vos techniques de mémorisation',
      description: 'Apprenez à utiliser efficacement les mnémotechniques musicales pour retenir les informations',
      duration: '15 min',
      difficulty: 'Intermédiaire',
      type: 'interactive',
      category: 'learning'
    },
    {
      id: '3',
      title: 'Personnaliser votre générateur musical',
      description: 'Configurez le générateur pour créer des musiques parfaitement adaptées à votre style d\'apprentissage',
      duration: '8 min',
      difficulty: 'Intermédiaire',
      type: 'video',
      category: 'creation'
    },
    {
      id: '4',
      title: 'Analyser vos performances',
      description: 'Utilisez les analytics pour optimiser votre parcours d\'apprentissage',
      duration: '12 min',
      difficulty: 'Avancé',
      type: 'text',
      category: 'analytics'
    }
  ];

  const quickActions = [
    {
      title: 'Contacter le Support',
      description: 'Besoin d\'aide ? Notre équipe est là pour vous',
      icon: MessageCircle,
      color: 'from-blue-500 to-indigo-600',
      action: () => navigate('/contact')
    },
    {
      title: 'Signaler un Bug',
      description: 'Aidez-nous à améliorer la plateforme',
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-600',
      action: () => navigate('/bug-report')
    },
    {
      title: 'Demander une Fonctionnalité',
      description: 'Partagez vos idées d\'amélioration',
      icon: Lightbulb,
      color: 'from-yellow-500 to-orange-600',
      action: () => navigate('/feature-request')
    },
    {
      title: 'Communauté',
      description: 'Rejoignez notre forum d\'entraide',
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      action: () => window.open('https://community.medmng.com', '_blank')
    }
  ];

  const filteredFAQ = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: Tutorial['difficulty']) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-500/20 text-green-300';
      case 'Intermédiaire': return 'bg-yellow-500/20 text-yellow-300';
      case 'Avancé': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getTypeIcon = (type: Tutorial['type']) => {
    switch (type) {
      case 'video': return PlayCircle;
      case 'text': return FileText;
      case 'interactive': return Zap;
      default: return Book;
    }
  };

  return (
    <ImmersiveLayout
      variant="learning"
      header={{
        title: "Centre d'Aide",
        subtitle: "Trouvez des réponses à vos questions et apprenez à utiliser MED MNG",
        icon: <HelpCircle className="h-6 w-6" />,
        backTo: "/dashboard",
        actions: (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/contact')}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('/docs', '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Documentation
            </Button>
          </div>
        )
      }}
    >
      <div className="space-y-6">
        {/* Recherche globale */}
        <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher dans l'aide... (ex: création de musique, synchronisation, bugs)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer" onClick={action.action}>
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-medium text-sm mb-1">{action.title}</h3>
                <p className="text-gray-400 text-xs">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="bg-black/20 border border-white/10">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Tutoriels
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Vidéos
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Contact
            </TabsTrigger>
          </TabsList>

          {/* FAQ */}
          <TabsContent value="faq" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Questions Fréquentes</CardTitle>
                <CardDescription className="text-gray-400">
                  Trouvez rapidement des réponses aux questions les plus courantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFAQ.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-white font-medium mb-2">Aucune FAQ trouvée</p>
                    <p className="text-gray-400 text-sm">Essayez avec d'autres mots-clés ou contactez notre support</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="space-y-2">
                    {filteredFAQ.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id} className="border border-white/10 rounded-lg bg-white/5">
                        <AccordionTrigger className="px-4 py-3 text-white hover:text-gray-200 text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-3">
                          <p className="text-gray-300 mb-4">{faq.answer}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>Cette réponse vous a-t-elle été utile ?</span>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  {faq.helpful}
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  <ThumbsDown className="h-3 w-3 mr-1" />
                                  {faq.notHelpful}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tutoriels */}
          <TabsContent value="tutorials" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTutorials.map((tutorial) => {
                const IconComponent = getTypeIcon(tutorial.type);
                return (
                  <Card key={tutorial.id} className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium mb-2">{tutorial.title}</h3>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{tutorial.description}</p>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getDifficultyColor(tutorial.difficulty)}>
                              {tutorial.difficulty}
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-300">
                              <Clock className="h-3 w-3 mr-1" />
                              {tutorial.duration}
                            </Badge>
                          </div>
                          <Button size="sm" className="w-full">
                            Commencer
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Vidéos */}
          <TabsContent value="videos" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((video) => (
                <Card key={video} className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="relative mb-4">
                      <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <PlayCircle className="h-12 w-12 text-white" />
                      </div>
                      <Badge className="absolute top-2 right-2 bg-black/60 text-white text-xs">
                        5:23
                      </Badge>
                    </div>
                    <h3 className="text-white font-medium text-sm mb-2">
                      Comment créer sa première chanson mnémotechnique
                    </h3>
                    <p className="text-gray-400 text-xs mb-3">
                      Découvrez étape par étape le processus de création d'une chanson d'apprentissage
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-400">4.8 (124)</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Regarder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contact */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Support par Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400">
                    Envoyez-nous un email détaillé et nous vous répondrons dans les 24h
                  </p>
                  <Button className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    support@medmng.com
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Chat en Direct
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400">
                    Discutez directement avec notre équipe support (9h-18h, Lun-Ven)
                  </p>
                  <Button className="w-full" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Ouvrir le Chat
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Autres moyens de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Phone className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <h3 className="text-white font-medium mb-1">Téléphone</h3>
                    <p className="text-gray-400 text-sm">+33 1 23 45 67 89</p>
                    <p className="text-gray-500 text-xs">9h-18h, Lun-Ven</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <h3 className="text-white font-medium mb-1">Forum</h3>
                    <p className="text-gray-400 text-sm">community.medmng.com</p>
                    <p className="text-gray-500 text-xs">24h/24, 7j/7</p>
                  </div>
                  <div className="text-center">
                    <ExternalLink className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <h3 className="text-white font-medium mb-1">Documentation</h3>
                    <p className="text-gray-400 text-sm">docs.medmng.com</p>
                    <p className="text-gray-500 text-xs">Guides détaillés</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ImmersiveLayout>
  );
}